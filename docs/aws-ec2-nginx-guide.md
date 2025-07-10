# AWS EC2 + Nginx + ALB 배포 가이드

이 가이드는 AWS EC2에서 Nginx를 구성하고 Application Load Balancer(ALB)와 연결하는 완전한 3-Tier 아키텍처를 구축하는 방법을 설명합니다.

## 🏗️ 최종 아키텍처

```
사용자 → 도메인(Route 53) → CloudFront → WEB ALB → WEB (EC2/Nginx) → WAS ALB → WAS (Petclinic) → RDS
  ↓         ↓                 ↓           ↓           ↓               ↓            ↓              ↓
인터넷    DNS 라우팅        CDN 캐싱    SSL 종료   정적파일 서빙   로드밸런싱   비즈니스 로직   데이터 저장
                                     헬스체크    리버스프록시                Spring Boot    MySQL/PostgreSQL

### 3-Tier 구조 설명
- **Presentation Tier**: CloudFront + WEB ALB + EC2 (Nginx)
- **Application Tier**: WAS ALB + EC2 (Spring Boot Petclinic)  
- **Data Tier**: RDS (MySQL/PostgreSQL)
```

## 📋 학습 목표

- CloudFront CDN 구성 및 캐싱 전략
- WEB ALB와 WAS ALB 이중 로드밸런싱 구조
- Nginx를 통한 정적 파일 서빙 및 리버스 프록시
- Spring Boot Petclinic 백엔드 서버 구성
- RDS 데이터베이스 연동
- 완전한 3-Tier 아키텍처 구축
- 각 계층별 Auto Scaling 및 모니터링

---

## 🌐 0단계: CloudFront CDN 설정

### CloudFront Distribution 생성

```bash
# CloudFront distribution 생성
aws cloudfront create-distribution \
    --distribution-config file://cloudfront-config.json
```

### CloudFront 설정 파일 (cloudfront-config.json)

```json
{
    "CallerReference": "petclinic-web-$(date +%s)",
    "Comment": "PetClinic Web CDN Distribution",
    "DefaultRootObject": "index.html",
    "Origins": {
        "Quantity": 1,
        "Items": [
            {
                "Id": "WEB-ALB-Origin",
                "DomainName": "petclinic-web-alb-1234567890.us-west-2.elb.amazonaws.com",
                "CustomOriginConfig": {
                    "HTTPPort": 80,
                    "HTTPSPort": 443,
                    "OriginProtocolPolicy": "https-only",
                    "OriginSslProtocols": {
                        "Quantity": 3,
                        "Items": ["TLSv1", "TLSv1.1", "TLSv1.2"]
                    }
                }
            }
        ]
    },
    "DefaultCacheBehavior": {
        "TargetOriginId": "WEB-ALB-Origin",
        "ViewerProtocolPolicy": "redirect-to-https",
        "TrustedSigners": {
            "Enabled": false,
            "Quantity": 0
        },
        "ForwardedValues": {
            "QueryString": true,
            "Cookies": {
                "Forward": "all"
            },
            "Headers": {
                "Quantity": 1,
                "Items": ["Host"]
            }
        },
        "MinTTL": 0,
        "DefaultTTL": 86400,
        "MaxTTL": 31536000
    },
    "CacheBehaviors": {
        "Quantity": 2,
        "Items": [
            {
                "PathPattern": "/api/*",
                "TargetOriginId": "WEB-ALB-Origin",
                "ViewerProtocolPolicy": "https-only",
                "ForwardedValues": {
                    "QueryString": true,
                    "Cookies": {"Forward": "all"},
                    "Headers": {
                        "Quantity": 3,
                        "Items": ["Host", "Authorization", "Content-Type"]
                    }
                },
                "MinTTL": 0,
                "DefaultTTL": 0,
                "MaxTTL": 0
            },
            {
                "PathPattern": "*.css",
                "TargetOriginId": "WEB-ALB-Origin",
                "ViewerProtocolPolicy": "https-only",
                "ForwardedValues": {
                    "QueryString": false,
                    "Cookies": {"Forward": "none"}
                },
                "MinTTL": 86400,
                "DefaultTTL": 31536000,
                "MaxTTL": 31536000
            }
        ]
    },
    "Enabled": true,
    "PriceClass": "PriceClass_100"
}
```

---

## 🚀 1단계: VPC 및 네트워크 준비

### VPC 및 서브넷 구성

```bash
# VPC 생성
aws ec2 create-vpc \
    --cidr-block 10.0.0.0/16 \
    --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=PetClinic-VPC}]'

# 퍼블릭 서브넷 생성 (다중 AZ)
aws ec2 create-subnet \
    --vpc-id vpc-12345678 \
    --cidr-block 10.0.1.0/24 \
    --availability-zone us-west-2a \
    --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=PetClinic-Public-1a}]'

aws ec2 create-subnet \
    --vpc-id vpc-12345678 \
    --cidr-block 10.0.2.0/24 \
    --availability-zone us-west-2b \
    --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=PetClinic-Public-1b}]'

# 프라이빗 서브넷 생성 (API 서버용)
aws ec2 create-subnet \
    --vpc-id vpc-12345678 \
    --cidr-block 10.0.10.0/24 \
    --availability-zone us-west-2a \
    --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=PetClinic-Private-1a}]'
```

### 보안 그룹 생성

```bash
# 웹 서버용 보안 그룹
aws ec2 create-security-group \
    --group-name petclinic-web-sg \
    --description "Security group for web servers" \
    --vpc-id vpc-12345678

# HTTP/HTTPS 허용 (ALB에서만)
aws ec2 authorize-security-group-ingress \
    --group-id sg-web123456 \
    --protocol tcp \
    --port 80 \
    --source-group sg-alb123456

aws ec2 authorize-security-group-ingress \
    --group-id sg-web123456 \
    --protocol tcp \
    --port 443 \
    --source-group sg-alb123456

# SSH 접근 (관리용)
aws ec2 authorize-security-group-ingress \
    --group-id sg-web123456 \
    --protocol tcp \
    --port 22 \
    --cidr 0.0.0.0/0

# ALB용 보안 그룹
aws ec2 create-security-group \
    --group-name petclinic-alb-sg \
    --description "Security group for ALB" \
    --vpc-id vpc-12345678

# 인터넷에서 HTTP/HTTPS 허용
aws ec2 authorize-security-group-ingress \
    --group-id sg-alb123456 \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
    --group-id sg-alb123456 \
    --protocol tcp \
    --port 443 \
    --cidr 0.0.0.0/0
```

### EC2 인스턴스 시작

```bash
# 키 페어 생성
aws ec2 create-key-pair \
    --key-name petclinic-key \
    --query 'KeyMaterial' \
    --output text > petclinic-key.pem

chmod 400 petclinic-key.pem

# EC2 인스턴스 시작
aws ec2 run-instances \
    --image-id ami-0c02fb55956c7d316 \
    --count 2 \
    --instance-type t3.medium \
    --key-name petclinic-key \
    --security-group-ids sg-web123456 \
    --subnet-id subnet-12345678 \
    --associate-public-ip-address \
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=PetClinic-Web-1}]' \
    --user-data file://user-data.sh
```

---

## 🔧 2단계: EC2에서 Nginx 설정

### User Data 스크립트 (자동 설치)

```bash
#!/bin/bash
# user-data.sh

yum update -y
yum install -y nginx git

# Node.js 설치 (필요 시)
curl -sL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# Java 설치 (Spring Boot용)
yum install -y java-17-amazon-corretto

# 프로젝트 클론
cd /opt
git clone https://github.com/ryong-git/petclinic-web.git
chown -R nginx:nginx /opt/petclinic-web

# 웹 파일 복사
cp -r /opt/petclinic-web/* /usr/share/nginx/html/
chown -R nginx:nginx /usr/share/nginx/html

# Nginx 설정
cat > /etc/nginx/nginx.conf << 'EOF'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log;
pid /run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;

    include /etc/nginx/conf.d/*.conf;
}
EOF

# 사이트 설정
cat > /etc/nginx/conf.d/petclinic.conf << 'EOF'
server {
    listen 80;
    server_name _;
    
    root /usr/share/nginx/html;
    index index.html;
    
    # 헬스체크 엔드포인트
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
    
    # 정적 파일 캐싱
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # HTML 파일
    location ~* \.html$ {
        expires 1h;
        add_header Cache-Control "public";
    }
    
    # JSON 설정 파일
    location ~* \.json$ {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
    
    # SPA 라우팅
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API 프록시 (WAS ALB로 연동)
    location /api/ {
        proxy_pass http://petclinic-was-alb-internal.us-west-2.elb.amazonaws.com;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        
        # 타임아웃 설정
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
        
        # WAS ALB 헬스체크 지원
        proxy_set_header X-Forwarded-Health-Check $http_x_forwarded_health_check;
    }
    
    # 보안 헤더
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
EOF

# Nginx 시작
systemctl enable nginx
systemctl start nginx

# CloudWatch 로그 설정
yum install -y awslogs
cat > /etc/awslogs/awslogs.conf << 'EOF'
[general]
state_file = /var/lib/awslogs/agent-state

[/var/log/nginx/access.log]
file = /var/log/nginx/access.log
log_group_name = /aws/ec2/nginx/access
log_stream_name = {instance_id}
datetime_format = %d/%b/%Y:%H:%M:%S %z

[/var/log/nginx/error.log]
file = /var/log/nginx/error.log
log_group_name = /aws/ec2/nginx/error
log_stream_name = {instance_id}
datetime_format = %Y/%m/%d %H:%M:%S
EOF

systemctl enable awslogsd
systemctl start awslogsd
EOF
```

---

## ⚖️ 3단계: WEB ALB 구성 (Presentation Tier)

### WEB ALB 생성

```bash
# WEB ALB 생성 (인터넷 연결)
aws elbv2 create-load-balancer \
    --name petclinic-web-alb \
    --subnets subnet-12345678 subnet-87654321 \
    --security-groups sg-web-alb123456 \
    --scheme internet-facing \
    --type application \
    --ip-address-type ipv4 \
    --tags Key=Name,Value=PetClinic-WEB-ALB Key=Tier,Value=Presentation
```

### 타겟 그룹 생성

```bash
# 웹 서버용 타겟 그룹
aws elbv2 create-target-group \
    --name petclinic-web-tg \
    --protocol HTTP \
    --port 80 \
    --vpc-id vpc-12345678 \
    --health-check-enabled \
    --health-check-path /health \
    --health-check-interval-seconds 30 \
    --health-check-timeout-seconds 5 \
    --healthy-threshold-count 2 \
    --unhealthy-threshold-count 3 \
    --matcher HttpCode=200 \
    --target-type instance \
    --tags Key=Name,Value=PetClinic-Web-TG
```

### 타겟 등록

```bash
# EC2 인스턴스를 타겟 그룹에 등록
aws elbv2 register-targets \
    --target-group-arn arn:aws:elasticloadbalancing:us-west-2:123456789012:targetgroup/petclinic-web-tg/1234567890123456 \
    --targets Id=i-1234567890abcdef0,Port=80 Id=i-0abcdef1234567890,Port=80
```

### 리스너 생성

```bash
# HTTP 리스너 (HTTPS로 리다이렉트)
aws elbv2 create-listener \
    --load-balancer-arn arn:aws:elasticloadbalancing:us-west-2:123456789012:loadbalancer/app/petclinic-alb/1234567890123456 \
    --protocol HTTP \
    --port 80 \
    --default-actions Type=redirect,RedirectConfig='{Protocol=HTTPS,Port=443,StatusCode=HTTP_301}'

# HTTPS 리스너
aws elbv2 create-listener \
    --load-balancer-arn arn:aws:elasticloadbalancing:us-west-2:123456789012:loadbalancer/app/petclinic-alb/1234567890123456 \
    --protocol HTTPS \
    --port 443 \
    --certificates CertificateArn=arn:aws:acm:us-west-2:123456789012:certificate/12345678-1234-1234-1234-123456789012 \
    --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:us-west-2:123456789012:targetgroup/petclinic-web-tg/1234567890123456
```

---

## 🖥️ 3-2단계: WAS ALB 구성 (Application Tier)

### WAS ALB 생성 (Internal)

```bash
# WAS ALB 생성 (내부 전용)
aws elbv2 create-load-balancer \
    --name petclinic-was-alb \
    --subnets subnet-12345678 subnet-87654321 \
    --security-groups sg-was-alb123456 \
    --scheme internal \
    --type application \
    --ip-address-type ipv4 \
    --tags Key=Name,Value=PetClinic-WAS-ALB Key=Tier,Value=Application
```

### WAS 보안 그룹 생성

```bash
# WAS ALB용 보안 그룹
aws ec2 create-security-group \
    --group-name petclinic-was-alb-sg \
    --description "Security group for WAS ALB" \
    --vpc-id vpc-12345678

# WEB ALB에서만 접근 허용
aws ec2 authorize-security-group-ingress \
    --group-id sg-was-alb123456 \
    --protocol tcp \
    --port 8080 \
    --source-group sg-web123456

# WAS 인스턴스용 보안 그룹
aws ec2 create-security-group \
    --group-name petclinic-was-sg \
    --description "Security group for WAS servers" \
    --vpc-id vpc-12345678

# WAS ALB에서만 접근 허용
aws ec2 authorize-security-group-ingress \
    --group-id sg-was123456 \
    --protocol tcp \
    --port 8080 \
    --source-group sg-was-alb123456
```

### WAS 타겟 그룹 생성

```bash
# Spring Boot 서버용 타겟 그룹
aws elbv2 create-target-group \
    --name petclinic-was-tg \
    --protocol HTTP \
    --port 8080 \
    --vpc-id vpc-12345678 \
    --health-check-enabled \
    --health-check-path /actuator/health \
    --health-check-interval-seconds 30 \
    --health-check-timeout-seconds 5 \
    --healthy-threshold-count 2 \
    --unhealthy-threshold-count 3 \
    --matcher HttpCode=200 \
    --target-type instance \
    --tags Key=Name,Value=PetClinic-WAS-TG Key=Tier,Value=Application
```

---

## 💾 3-3단계: RDS 데이터베이스 구성 (Data Tier)

### RDS 서브넷 그룹 생성

```bash
# 프라이빗 서브넷 추가 생성 (데이터베이스용)
aws ec2 create-subnet \
    --vpc-id vpc-12345678 \
    --cidr-block 10.0.20.0/24 \
    --availability-zone us-west-2a \
    --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=PetClinic-DB-1a}]'

aws ec2 create-subnet \
    --vpc-id vpc-12345678 \
    --cidr-block 10.0.21.0/24 \
    --availability-zone us-west-2b \
    --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=PetClinic-DB-1b}]'

# RDS 서브넷 그룹 생성
aws rds create-db-subnet-group \
    --db-subnet-group-name petclinic-db-subnet-group \
    --db-subnet-group-description "PetClinic Database Subnet Group" \
    --subnet-ids subnet-db20123456 subnet-db21123456 \
    --tags Key=Name,Value=PetClinic-DB-SubnetGroup
```

### RDS 보안 그룹 생성

```bash
# RDS용 보안 그룹
aws ec2 create-security-group \
    --group-name petclinic-rds-sg \
    --description "Security group for RDS database" \
    --vpc-id vpc-12345678

# WAS 인스턴스에서만 DB 접근 허용
aws ec2 authorize-security-group-ingress \
    --group-id sg-rds123456 \
    --protocol tcp \
    --port 3306 \
    --source-group sg-was123456
```

### RDS MySQL 인스턴스 생성

```bash
# RDS MySQL 인스턴스 생성
aws rds create-db-instance \
    --db-instance-identifier petclinic-mysql \
    --db-instance-class db.t3.micro \
    --engine mysql \
    --engine-version 8.0.35 \
    --master-username petclinic \
    --master-user-password "YourSecurePassword123!" \
    --allocated-storage 20 \
    --storage-type gp2 \
    --storage-encrypted \
    --db-subnet-group-name petclinic-db-subnet-group \
    --vpc-security-group-ids sg-rds123456 \
    --db-name petclinic \
    --backup-retention-period 7 \
    --multi-az \
    --publicly-accessible false \
    --auto-minor-version-upgrade true \
    --deletion-protection \
    --tags Key=Name,Value=PetClinic-MySQL Key=Tier,Value=Data
```

### 데이터베이스 초기화

```bash
# RDS 엔드포인트 확인
aws rds describe-db-instances \
    --db-instance-identifier petclinic-mysql \
    --query 'DBInstances[0].Endpoint.Address'

# Spring Boot application.properties 설정
cat > application-aws.properties << 'EOF'
spring.datasource.url=jdbc:mysql://petclinic-mysql.abc123.us-west-2.rds.amazonaws.com:3306/petclinic
spring.datasource.username=petclinic
spring.datasource.password=YourSecurePassword123!
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# 연결 풀 설정
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=20000
spring.datasource.hikari.idle-timeout=300000
spring.datasource.hikari.max-lifetime=1200000
EOF
```

---

## 🔒 4단계: SSL/TLS 인증서 설정

### AWS Certificate Manager (ACM)

```bash
# SSL 인증서 요청
aws acm request-certificate \
    --domain-name petclinic.your-domain.com \
    --subject-alternative-names "*.petclinic.your-domain.com" \
    --validation-method DNS \
    --key-algorithm RSA_2048 \
    --tags Key=Name,Value=PetClinic-SSL

# 도메인 검증 정보 확인
aws acm describe-certificate \
    --certificate-arn arn:aws:acm:us-west-2:123456789012:certificate/12345678-1234-1234-1234-123456789012
```

### Route 53 DNS 검증

```bash
# 호스팅 존에 검증 레코드 추가
aws route53 change-resource-record-sets \
    --hosted-zone-id Z3M3LMPEXAMPLE \
    --change-batch file://dns-validation.json
```

```json
{
    "Changes": [
        {
            "Action": "CREATE",
            "ResourceRecordSet": {
                "Name": "_acme-challenge.petclinic.your-domain.com",
                "Type": "CNAME",
                "TTL": 300,
                "ResourceRecords": [
                    {
                        "Value": "validation-string.acm-validations.aws."
                    }
                ]
            }
        }
    ]
}
```

---

## 🖥️ 4-2단계: Spring Boot 펫클리닉 WAS 서버 구성

### Spring Boot 펫클리닉 다운로드 및 설정

```bash
# WAS 인스턴스에서 실행할 사용자 데이터 스크립트
cat > was-user-data.sh << 'EOF'
#!/bin/bash

# 시스템 업데이트
yum update -y

# Java 17 설치
yum install -y java-17-amazon-corretto git mysql

# Maven 설치
cd /opt
wget https://archive.apache.org/dist/maven/maven-3/3.9.4/binaries/apache-maven-3.9.4-bin.tar.gz
tar xzf apache-maven-3.9.4-bin.tar.gz
ln -s apache-maven-3.9.4 maven
echo 'export PATH=/opt/maven/bin:$PATH' >> /etc/profile
source /etc/profile

# Spring Boot 펫클리닉 클론
cd /opt
git clone https://github.com/spring-projects/spring-petclinic.git
cd spring-petclinic

# AWS RDS용 설정 파일 생성
cat > src/main/resources/application-aws.properties << 'PROPS'
# AWS RDS MySQL 설정
spring.datasource.url=jdbc:mysql://petclinic-mysql.cluster-abc123.us-west-2.rds.amazonaws.com:3306/petclinic?useSSL=false&allowPublicKeyRetrieval=true
spring.datasource.username=petclinic
spring.datasource.password=YourSecurePassword123!
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA/Hibernate 설정
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect

# 연결 풀 설정 (HikariCP)
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=20000
spring.datasource.hikari.idle-timeout=300000
spring.datasource.hikari.max-lifetime=1200000

# 액추에이터 설정 (헬스체크용)
management.endpoints.web.exposure.include=health,info,metrics
management.endpoint.health.show-details=always
management.health.db.enabled=true

# 서버 포트
server.port=8080

# 로깅 설정
logging.level.org.springframework=INFO
logging.level.com.zaxxer.hikari=DEBUG
PROPS

# MySQL JDBC 드라이버 의존성 추가
cat >> pom.xml << 'POM'
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <scope>runtime</scope>
        </dependency>
POM

# Maven 빌드
/opt/maven/bin/mvn clean package -DskipTests

# 시스템 서비스 등록
cat > /etc/systemd/system/petclinic.service << 'SERVICE'
[Unit]
Description=Spring Boot PetClinic Application
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/opt/spring-petclinic
ExecStart=/usr/bin/java -jar -Dspring.profiles.active=aws target/spring-petclinic-*.jar
Restart=always
RestartSec=10

# 환경 변수
Environment="SPRING_PROFILES_ACTIVE=aws"
Environment="JAVA_OPTS=-Xms512m -Xmx1024m"

# 로그 설정
StandardOutput=journal
StandardError=journal
SyslogIdentifier=petclinic

[Install]
WantedBy=multi-user.target
SERVICE

# 서비스 시작
systemctl daemon-reload
systemctl enable petclinic
systemctl start petclinic

# CloudWatch 로그 에이전트 설치
yum install -y awslogs

# CloudWatch 로그 설정
cat > /etc/awslogs/awslogs.conf << 'CWLOGS'
[general]
state_file = /var/lib/awslogs/agent-state

[/var/log/petclinic]
file = /var/log/journal/petclinic.log
log_group_name = /aws/ec2/petclinic
log_stream_name = {instance_id}
datetime_format = %Y-%m-%d %H:%M:%S
CWLOGS

systemctl enable awslogsd
systemctl start awslogsd

EOF
```

### WAS 인스턴스 시작

```bash
# WAS 인스턴스용 키 페어 생성
aws ec2 create-key-pair \
    --key-name petclinic-was-key \
    --query 'KeyMaterial' \
    --output text > petclinic-was-key.pem

chmod 400 petclinic-was-key.pem

# Base64 인코딩
base64 was-user-data.sh > was-user-data-base64.txt

# WAS 인스턴스 시작
aws ec2 run-instances \
    --image-id ami-0c02fb55956c7d316 \
    --count 2 \
    --instance-type t3.medium \
    --key-name petclinic-was-key \
    --security-group-ids sg-was123456 \
    --subnet-id subnet-10123456 \
    --user-data file://was-user-data.sh \
    --iam-instance-profile Name=EC2-RDS-Role \
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=PetClinic-WAS-1},{Key=Tier,Value=Application}]'
```

### WAS 타겟 그룹에 인스턴스 등록

```bash
# WAS 인스턴스를 타겟 그룹에 등록
aws elbv2 register-targets \
    --target-group-arn arn:aws:elasticloadbalancing:us-west-2:123456789012:targetgroup/petclinic-was-tg/1234567890123456 \
    --targets Id=i-was1234567890abcdef,Port=8080 Id=i-was0abcdef1234567890,Port=8080

# 헬스체크 상태 확인
aws elbv2 describe-target-health \
    --target-group-arn arn:aws:elasticloadbalancing:us-west-2:123456789012:targetgroup/petclinic-was-tg/1234567890123456
```

### 펫클리닉 연동 테스트

```bash
# WAS ALB 엔드포인트로 API 테스트
curl http://petclinic-was-alb-internal.us-west-2.elb.amazonaws.com:8080/api/owners

# 헬스체크 테스트  
curl http://petclinic-was-alb-internal.us-west-2.elb.amazonaws.com:8080/actuator/health

# 데이터베이스 연결 테스트
curl http://petclinic-was-alb-internal.us-west-2.elb.amazonaws.com:8080/api/vets
```

---

## 🔗 4-3단계: WEB과 WAS 연동 확인

### Nginx 설정 업데이트

```bash
# WEB 인스턴스에서 Nginx 설정 수정
sudo nano /etc/nginx/conf.d/petclinic.conf

# API 프록시 설정 확인
location /api/ {
    # WAS ALB 내부 도메인으로 연결
    proxy_pass http://petclinic-was-alb-internal.us-west-2.elb.amazonaws.com:8080/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # 커넥션 재사용
    proxy_http_version 1.1;
    proxy_set_header Connection "";
    
    # 타임아웃 설정
    proxy_connect_timeout 30s;
    proxy_send_timeout 30s;
    proxy_read_timeout 30s;
}

# Nginx 재로드
sudo nginx -t && sudo systemctl reload nginx
```

### 전체 연동 테스트

```bash
# CloudFront를 통한 전체 경로 테스트
curl https://d1234567890.cloudfront.net/api/owners

# WEB ALB를 통한 테스트
curl https://petclinic-web-alb.us-west-2.elb.amazonaws.com/api/owners

# 정적 파일 테스트 (캐싱 확인)
curl -I https://d1234567890.cloudfront.net/assets/css/main.css
```

---

## 📥 4-4단계: 펫클리닉 샘플 데이터 로딩

### 데이터베이스 초기화 스크립트

```bash
# RDS에 연결하여 샘플 데이터 삽입
cat > init-petclinic-data.sql << 'SQL'
-- 수의사 데이터
INSERT INTO vets (id, first_name, last_name) VALUES 
(1, '김', '수의사'),
(2, '이', '동물박사'),
(3, '박', '펫닥터');

-- 전문분야 데이터  
INSERT INTO specialties (id, name) VALUES
(1, '내과'),
(2, '외과'),
(3, '치과');

-- 수의사-전문분야 연결
INSERT INTO vet_specialties (vet_id, specialty_id) VALUES
(1, 1),
(2, 2),
(3, 3);

-- 펫 타입
INSERT INTO types (id, name) VALUES
(1, '강아지'),
(2, '고양이'),
(3, '햄스터');

-- 보호자 정보
INSERT INTO owners (id, first_name, last_name, address, city, telephone) VALUES
(1, '홍', '길동', '서울시 강남구', '서울', '010-1234-5678'),
(2, '김', '영희', '부산시 해운대구', '부산', '010-8765-4321');

-- 펫 정보
INSERT INTO pets (id, name, birth_date, type_id, owner_id) VALUES
(1, '바둑이', '2020-05-15', 1, 1),
(2, '나비', '2019-08-20', 2, 2);

-- 진료 기록
INSERT INTO visits (id, pet_id, visit_date, description) VALUES
(1, 1, '2024-01-15', '정기 건강검진'),
(2, 2, '2024-01-20', '예방접종');
SQL

# 데이터 삽입 실행 (WAS 인스턴스에서)
mysql -h petclinic-mysql.cluster-abc123.us-west-2.rds.amazonaws.com \
      -u petclinic -p petclinic < init-petclinic-data.sql
```

---

## 📈 5단계: Auto Scaling Group 구성

### Launch Template 생성

```bash
# Launch Template 생성
aws ec2 create-launch-template \
    --launch-template-name petclinic-web-template \
    --version-description "PetClinic Web Server Template" \
    --launch-template-data file://launch-template.json
```

```json
{
    "ImageId": "ami-0c02fb55956c7d316",
    "InstanceType": "t3.medium",
    "KeyName": "petclinic-key",
    "SecurityGroupIds": ["sg-web123456"],
    "UserData": "base64-encoded-user-data-script",
    "IamInstanceProfile": {
        "Name": "EC2-CloudWatch-Role"
    },
    "TagSpecifications": [
        {
            "ResourceType": "instance",
            "Tags": [
                {
                    "Key": "Name",
                    "Value": "PetClinic-Web-ASG"
                },
                {
                    "Key": "Environment",
                    "Value": "Production"
                }
            ]
        }
    ],
    "Monitoring": {
        "Enabled": true
    }
}
```

### Auto Scaling Group 생성

```bash
# Auto Scaling Group 생성
aws autoscaling create-auto-scaling-group \
    --auto-scaling-group-name petclinic-web-asg \
    --launch-template LaunchTemplateName=petclinic-web-template,Version=1 \
    --min-size 2 \
    --max-size 6 \
    --desired-capacity 2 \
    --target-group-arns arn:aws:elasticloadbalancing:us-west-2:123456789012:targetgroup/petclinic-web-tg/1234567890123456 \
    --health-check-type ELB \
    --health-check-grace-period 300 \
    --vpc-zone-identifier "subnet-12345678,subnet-87654321" \
    --tags "Key=Name,Value=PetClinic-Web-ASG,PropagateAtLaunch=true,ResourceId=petclinic-web-asg,ResourceType=auto-scaling-group"
```

### Auto Scaling 정책 설정

```bash
# Scale Out 정책
aws autoscaling put-scaling-policy \
    --policy-name petclinic-scale-out \
    --auto-scaling-group-name petclinic-web-asg \
    --policy-type TargetTrackingScaling \
    --target-tracking-configuration file://scale-out-policy.json

# Scale In 정책
aws autoscaling put-scaling-policy \
    --policy-name petclinic-scale-in \
    --auto-scaling-group-name petclinic-web-asg \
    --policy-type TargetTrackingScaling \
    --target-tracking-configuration file://scale-in-policy.json
```

```json
{
    "TargetValue": 70.0,
    "PredefinedMetricSpecification": {
        "PredefinedMetricType": "ASGAverageCPUUtilization"
    },
    "ScaleOutCooldown": 300,
    "ScaleInCooldown": 300
}
```

---

## 🌐 6단계: Route 53 도메인 연결

### 도메인 레코드 생성

```bash
# A 레코드 (ALB 연결)
aws route53 change-resource-record-sets \
    --hosted-zone-id Z3M3LMPEXAMPLE \
    --change-batch file://route53-records.json
```

```json
{
    "Changes": [
        {
            "Action": "CREATE",
            "ResourceRecordSet": {
                "Name": "petclinic.your-domain.com",
                "Type": "A",
                "AliasTarget": {
                    "DNSName": "petclinic-alb-1234567890.us-west-2.elb.amazonaws.com",
                    "EvaluateTargetHealth": true,
                    "HostedZoneId": "Z1D633PJN98FT9"
                }
            }
        },
        {
            "Action": "CREATE",
            "ResourceRecordSet": {
                "Name": "www.petclinic.your-domain.com",
                "Type": "CNAME",
                "TTL": 300,
                "ResourceRecords": [
                    {
                        "Value": "petclinic.your-domain.com"
                    }
                ]
            }
        }
    ]
}
```

---

## 📊 7단계: 모니터링 및 로깅

### CloudWatch 대시보드 생성

```bash
# 대시보드 생성
aws cloudwatch put-dashboard \
    --dashboard-name PetClinic-Monitoring \
    --dashboard-body file://dashboard.json
```

```json
{
    "widgets": [
        {
            "type": "metric",
            "properties": {
                "metrics": [
                    ["AWS/ApplicationELB", "RequestCount", "LoadBalancer", "app/petclinic-alb/1234567890123456"],
                    ["AWS/ApplicationELB", "TargetResponseTime", "LoadBalancer", "app/petclinic-alb/1234567890123456"],
                    ["AWS/ApplicationELB", "HTTPCode_Target_2XX_Count", "LoadBalancer", "app/petclinic-alb/1234567890123456"]
                ],
                "period": 300,
                "stat": "Average",
                "region": "us-west-2",
                "title": "ALB Metrics"
            }
        },
        {
            "type": "metric", 
            "properties": {
                "metrics": [
                    ["AWS/EC2", "CPUUtilization", "AutoScalingGroupName", "petclinic-web-asg"],
                    ["AWS/EC2", "NetworkIn", "AutoScalingGroupName", "petclinic-web-asg"],
                    ["AWS/EC2", "NetworkOut", "AutoScalingGroupName", "petclinic-web-asg"]
                ],
                "period": 300,
                "stat": "Average",
                "region": "us-west-2",
                "title": "EC2 Metrics"
            }
        }
    ]
}
```

### CloudWatch 알람 설정

```bash
# 높은 CPU 사용률 알람
aws cloudwatch put-metric-alarm \
    --alarm-name "PetClinic-High-CPU" \
    --alarm-description "Alert when CPU exceeds 80%" \
    --metric-name CPUUtilization \
    --namespace AWS/EC2 \
    --statistic Average \
    --period 300 \
    --threshold 80 \
    --comparison-operator GreaterThanThreshold \
    --dimensions Name=AutoScalingGroupName,Value=petclinic-web-asg \
    --evaluation-periods 2 \
    --alarm-actions arn:aws:sns:us-west-2:123456789012:petclinic-alerts

# ALB 5XX 에러 알람
aws cloudwatch put-metric-alarm \
    --alarm-name "PetClinic-ALB-5XX-Errors" \
    --alarm-description "Alert on 5XX errors" \
    --metric-name HTTPCode_Target_5XX_Count \
    --namespace AWS/ApplicationELB \
    --statistic Sum \
    --period 300 \
    --threshold 10 \
    --comparison-operator GreaterThanThreshold \
    --dimensions Name=LoadBalancer,Value=app/petclinic-alb/1234567890123456 \
    --evaluation-periods 2 \
    --alarm-actions arn:aws:sns:us-west-2:123456789012:petclinic-alerts
```

---

## 🔧 8단계: 배포 자동화

### CodeDeploy 설정

```bash
# CodeDeploy 애플리케이션 생성
aws deploy create-application \
    --application-name PetClinic-Web \
    --compute-platform Server

# 배포 그룹 생성
aws deploy create-deployment-group \
    --application-name PetClinic-Web \
    --deployment-group-name Production \
    --service-role-arn arn:aws:iam::123456789012:role/CodeDeployRole \
    --auto-scaling-groups petclinic-web-asg \
    --deployment-config-name CodeDeployDefault.EC2AllAtOneWay
```

### 배포 스크립트 (appspec.yml)

```yaml
version: 0.0
os: linux
files:
  - source: /
    destination: /usr/share/nginx/html
hooks:
  BeforeInstall:
    - location: scripts/stop_nginx.sh
      timeout: 30
      runas: root
  AfterInstall:
    - location: scripts/install_dependencies.sh
      timeout: 300
      runas: root
  ApplicationStart:
    - location: scripts/start_nginx.sh
      timeout: 30
      runas: root
  ApplicationStop:
    - location: scripts/stop_nginx.sh
      timeout: 30
      runas: root
  ValidateService:
    - location: scripts/validate_service.sh
      timeout: 30
      runas: root
```

### 배포 스크립트들

```bash
#!/bin/bash
# scripts/stop_nginx.sh
systemctl stop nginx

#!/bin/bash
# scripts/start_nginx.sh
systemctl start nginx
systemctl enable nginx

#!/bin/bash
# scripts/validate_service.sh
sleep 10
if curl -f http://localhost/health; then
    echo "Service is healthy"
    exit 0
else
    echo "Service health check failed"
    exit 1
fi
```

---

## 🔍 9단계: 문제 해결 및 디버깅

### 일반적인 문제들

#### 1. ALB에서 502 Bad Gateway

```bash
# 타겟 헬스 상태 확인
aws elbv2 describe-target-health \
    --target-group-arn arn:aws:elasticloadbalancing:us-west-2:123456789012:targetgroup/petclinic-web-tg/1234567890123456

# Nginx 상태 확인
sudo systemctl status nginx

# 로그 확인
sudo tail -f /var/log/nginx/error.log
```

#### 2. Auto Scaling이 작동하지 않음

```bash
# ASG 활동 히스토리 확인
aws autoscaling describe-scaling-activities \
    --auto-scaling-group-name petclinic-web-asg

# CloudWatch 메트릭 확인
aws cloudwatch get-metric-statistics \
    --namespace AWS/EC2 \
    --metric-name CPUUtilization \
    --dimensions Name=AutoScalingGroupName,Value=petclinic-web-asg \
    --start-time 2024-01-01T00:00:00Z \
    --end-time 2024-01-01T23:59:59Z \
    --period 300 \
    --statistics Average
```

#### 3. SSL 인증서 문제

```bash
# 인증서 상태 확인
aws acm describe-certificate \
    --certificate-arn arn:aws:acm:us-west-2:123456789012:certificate/12345678-1234-1234-1234-123456789012

# DNS 검증 상태 확인
dig _acme-challenge.petclinic.your-domain.com CNAME
```

### 디버깅 도구

```bash
# ALB 액세스 로그 활성화
aws elbv2 modify-load-balancer-attributes \
    --load-balancer-arn arn:aws:elasticloadbalancing:us-west-2:123456789012:loadbalancer/app/petclinic-alb/1234567890123456 \
    --attributes Key=access_logs.s3.enabled,Value=true Key=access_logs.s3.bucket,Value=my-alb-logs

# VPC Flow Logs 활성화
aws ec2 create-flow-logs \
    --resource-type VPC \
    --resource-ids vpc-12345678 \
    --traffic-type ALL \
    --log-destination-type cloud-watch-logs \
    --log-group-name VPCFlowLogs
```

---

## 💰 10단계: 비용 최적화

### Reserved Instances

```bash
# RI 추천 확인
aws ce get-reservation-purchase-recommendation \
    --service EC2-Instance \
    --account-scope PAYER
```

### Spot Instances 활용

```bash
# Spot Fleet 설정
aws ec2 create-spot-fleet \
    --spot-fleet-request-config file://spot-fleet-config.json
```

### 비용 모니터링

```bash
# 비용 알람 설정
aws cloudwatch put-metric-alarm \
    --alarm-name "Monthly-Cost-Alert" \
    --alarm-description "Alert when monthly costs exceed $100" \
    --metric-name EstimatedCharges \
    --namespace AWS/Billing \
    --statistic Maximum \
    --period 86400 \
    --threshold 100 \
    --comparison-operator GreaterThanThreshold \
    --evaluation-periods 1
```

---

## 📋 체크리스트

### 배포 완료 확인

- [ ] EC2 인스턴스가 정상 실행 중
- [ ] Nginx가 정상 동작 중
- [ ] ALB 헬스체크 통과
- [ ] SSL 인증서 정상 작동
- [ ] Auto Scaling 정책 설정 완료
- [ ] CloudWatch 모니터링 활성화
- [ ] 도메인 접속 확인
- [ ] API 프록시 정상 동작

### 보안 점검

- [ ] 보안 그룹 최소 권한 원칙 적용
- [ ] SSL/TLS 암호화 적용
- [ ] WAF 설정 (선택사항)
- [ ] 접근 로그 수집 활성화
- [ ] 백업 및 스냅샷 설정

이 가이드를 통해 완전한 AWS 3-Tier 아키텍처를 구축하고 운영할 수 있습니다. 각 단계는 실제 운영 환경에서 사용할 수 있도록 설계되었습니다.