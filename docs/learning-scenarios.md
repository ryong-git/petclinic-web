# AWS 3-Tier 아키텍처 학습 시나리오

이 문서는 펫클리닉 웹사이트를 통해 AWS 3-Tier 아키텍처를 학습하기 위한 단계별 시나리오를 제공합니다.

## 학습 목표

1. AWS 3-Tier 아키텍처의 구성 요소 이해
2. 각 계층별 AWS 서비스의 역할과 특징 학습
3. 실제 웹사이트 배포를 통한 실습 경험
4. 클라우드 인프라 운영 및 관리 방법 습득

## 시나리오 1: 기본 정적 웹사이트 배포 (입문)

### 목표
- S3를 이용한 정적 웹사이트 호스팅
- 기본적인 웹 서비스 구축

### 학습 내용
- S3 버킷 생성 및 설정
- 정적 웹사이트 호스팅 기능
- 버킷 정책 및 권한 관리

### 실습 단계

#### 1단계: S3 버킷 생성
```bash
# 버킷 생성
aws s3 mb s3://petclinic-web-[your-name] --region ap-northeast-2

# 정적 웹사이트 호스팅 설정
aws s3 website s3://petclinic-web-[your-name] \
    --index-document index.html \
    --error-document error.html
```

#### 2단계: 파일 업로드
```bash
# 프로젝트 파일을 S3에 업로드
aws s3 sync . s3://petclinic-web-[your-name] \
    --exclude "*.md" --exclude ".git/*" --exclude "aws-deployment/*"
```

#### 3단계: 퍼블릭 액세스 설정
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::petclinic-web-[your-name]/*"
        }
    ]
}
```

#### 4단계: 웹사이트 접속 확인
- URL: `http://petclinic-web-[your-name].s3-website-ap-northeast-2.amazonaws.com`

### 학습 점검 질문
1. S3 정적 웹사이트 호스팅의 장점과 단점은?
2. 버킷 정책과 IAM 정책의 차이점은?
3. S3의 가용성과 내구성은 어떻게 보장되는가?

---

## 시나리오 2: CDN을 통한 성능 최적화 (초급)

### 목표
- CloudFront를 이용한 전 세계 콘텐츠 배포
- 캐싱 전략 이해

### 학습 내용
- CloudFront 배포 생성
- 오리진 설정 및 캐시 정책
- 엣지 로케이션의 개념

### 실습 단계

#### 1단계: CloudFront 배포 생성
```bash
# CloudFront 배포 설정 파일 생성
cat > cloudfront-config.json << EOF
{
    "CallerReference": "petclinic-$(date +%s)",
    "Comment": "Petclinic Website Distribution",
    "DefaultCacheBehavior": {
        "TargetOriginId": "S3-petclinic-web",
        "ViewerProtocolPolicy": "redirect-to-https",
        "Compress": true,
        "DefaultTTL": 86400,
        "MaxTTL": 31536000
    },
    "Origins": {
        "Quantity": 1,
        "Items": [
            {
                "Id": "S3-petclinic-web",
                "DomainName": "petclinic-web-[your-name].s3.amazonaws.com",
                "S3OriginConfig": {
                    "OriginAccessIdentity": ""
                }
            }
        ]
    },
    "Enabled": true
}
EOF

# CloudFront 배포 생성
aws cloudfront create-distribution --distribution-config file://cloudfront-config.json
```

#### 2단계: 캐시 정책 설정
- HTML 파일: 1시간 캐시
- CSS/JS/이미지: 1년 캐시
- JSON 설정 파일: 캐시 안 함

#### 3단계: 성능 테스트
```bash
# 다양한 지역에서 접속 속도 테스트
curl -o /dev/null -s -w "%{time_total}\n" https://your-cloudfront-domain.cloudfront.net
```

### 학습 점검 질문
1. CDN의 작동 원리는?
2. 캐시 무효화는 언제 필요한가?
3. CloudFront의 가격 정책은?

---

## 시나리오 3: 도메인 연결 및 SSL 설정 (중급)

### 목표
- 사용자 정의 도메인 연결
- SSL/TLS 인증서 적용

### 학습 내용
- Route 53을 이용한 DNS 관리
- Certificate Manager를 통한 SSL 인증서
- HTTPS 설정

### 실습 단계

#### 1단계: 도메인 구입 (선택사항)
```bash
# Route 53에서 도메인 등록 또는 외부 도메인 연결
aws route53 create-hosted-zone \
    --name your-domain.com \
    --caller-reference "petclinic-$(date +%s)"
```

#### 2단계: SSL 인증서 요청
```bash
# SSL 인증서 요청 (us-east-1 리전에서만 가능)
aws acm request-certificate \
    --domain-name your-domain.com \
    --subject-alternative-names "*.your-domain.com" \
    --validation-method DNS \
    --region us-east-1
```

#### 3단계: DNS 검증 설정
```bash
# 검증용 DNS 레코드 생성
aws route53 change-resource-record-sets \
    --hosted-zone-id YOUR_HOSTED_ZONE_ID \
    --change-batch file://dns-validation.json
```

#### 4단계: CloudFront에 커스텀 도메인 연결
```bash
# CloudFront 배포 업데이트
aws cloudfront update-distribution \
    --id YOUR_DISTRIBUTION_ID \
    --distribution-config file://cloudfront-custom-domain-config.json
```

### 학습 점검 질문
1. DNS 레코드 타입별 용도는?
2. SSL/TLS 인증서가 필요한 이유는?
3. HTTPS와 HTTP의 차이점은?

---

## 시나리오 4: 백엔드 API 서버 구축 (중급)

### 목표
- EC2에 Spring Boot 애플리케이션 배포
- 로드 밸런서를 통한 고가용성 구성

### 학습 내용
- EC2 인스턴스 생성 및 관리
- Application Load Balancer 설정
- Auto Scaling Group 구성

### 실습 단계

#### 1단계: VPC 및 네트워크 구성
```bash
# VPC 생성
aws ec2 create-vpc --cidr-block 10.0.0.0/16

# 서브넷 생성
aws ec2 create-subnet \
    --vpc-id vpc-12345678 \
    --cidr-block 10.0.1.0/24 \
    --availability-zone ap-northeast-2a

aws ec2 create-subnet \
    --vpc-id vpc-12345678 \
    --cidr-block 10.0.2.0/24 \
    --availability-zone ap-northeast-2c
```

#### 2단계: 보안 그룹 설정
```bash
# 웹 서버용 보안 그룹
aws ec2 create-security-group \
    --group-name petclinic-web-sg \
    --description "Security group for web servers"

# 포트 80, 443, 22 열기
aws ec2 authorize-security-group-ingress \
    --group-id sg-12345678 \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0
```

#### 3단계: EC2 인스턴스 시작
```bash
# EC2 인스턴스 시작
aws ec2 run-instances \
    --image-id ami-0c02fb55956c7d316 \
    --count 1 \
    --instance-type t3.micro \
    --key-name your-key-pair \
    --security-group-ids sg-12345678 \
    --subnet-id subnet-12345678
```

#### 4단계: Spring Boot 애플리케이션 배포
```bash
# Spring Boot JAR 파일 복사
scp -i your-key.pem petclinic-api.jar ec2-user@your-ec2-ip:~/

# 애플리케이션 실행
ssh -i your-key.pem ec2-user@your-ec2-ip
sudo java -jar petclinic-api.jar
```

### 학습 점검 질문
1. VPC의 필요성과 구성 요소는?
2. 로드 밸런서의 종류와 특징은?
3. Auto Scaling의 작동 원리는?

---

## 시나리오 5: 데이터베이스 연동 (고급)

### 목표
- RDS를 이용한 관계형 데이터베이스 구축
- 데이터베이스 보안 및 백업 설정

### 학습 내용
- RDS 인스턴스 생성 및 설정
- 데이터베이스 보안 그룹 구성
- 자동 백업 및 스냅샷

### 실습 단계

#### 1단계: DB 서브넷 그룹 생성
```bash
# DB 서브넷 그룹 생성
aws rds create-db-subnet-group \
    --db-subnet-group-name petclinic-db-subnet-group \
    --db-subnet-group-description "DB subnet group for petclinic" \
    --subnet-ids subnet-12345678 subnet-87654321
```

#### 2단계: RDS 인스턴스 생성
```bash
# RDS MySQL 인스턴스 생성
aws rds create-db-instance \
    --db-instance-identifier petclinic-db \
    --db-instance-class db.t3.micro \
    --engine mysql \
    --engine-version 8.0.35 \
    --master-username admin \
    --master-user-password mypassword123 \
    --allocated-storage 20 \
    --storage-type gp2 \
    --db-subnet-group-name petclinic-db-subnet-group \
    --vpc-security-group-ids sg-database-12345678 \
    --backup-retention-period 7 \
    --multi-az
```

#### 3단계: 데이터베이스 연결 설정
```properties
# application.properties
spring.datasource.url=jdbc:mysql://petclinic-db.xxx.ap-northeast-2.rds.amazonaws.com:3306/petclinic
spring.datasource.username=admin
spring.datasource.password=mypassword123
spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect
```

#### 4단계: 초기 데이터 로드
```sql
-- 샘플 데이터 입력
INSERT INTO owners (first_name, last_name, address, city, telephone) 
VALUES ('김', '철수', '서울시 강남구', '서울', '010-1234-5678');
```

### 학습 점검 질문
1. RDS의 Multi-AZ 배포의 장점은?
2. 읽기 전용 복제본의 용도는?
3. 데이터베이스 백업 전략은?

---

## 시나리오 6: 캐싱 및 세션 관리 (고급)

### 목표
- ElastiCache를 이용한 세션 관리
- 애플리케이션 성능 최적화

### 학습 내용
- Redis 클러스터 구성
- 세션 저장소 설정
- 캐싱 전략

### 실습 단계

#### 1단계: ElastiCache 서브넷 그룹 생성
```bash
# 캐시 서브넷 그룹 생성
aws elasticache create-cache-subnet-group \
    --cache-subnet-group-name petclinic-cache-subnet-group \
    --cache-subnet-group-description "Cache subnet group for petclinic" \
    --subnet-ids subnet-12345678 subnet-87654321
```

#### 2단계: Redis 클러스터 생성
```bash
# Redis 클러스터 생성
aws elasticache create-cache-cluster \
    --cache-cluster-id petclinic-redis \
    --cache-node-type cache.t3.micro \
    --engine redis \
    --num-cache-nodes 1 \
    --cache-subnet-group-name petclinic-cache-subnet-group \
    --security-group-ids sg-cache-12345678
```

#### 3단계: Spring Boot에서 Redis 설정
```properties
# Redis 설정
spring.redis.host=petclinic-redis.xxx.cache.amazonaws.com
spring.redis.port=6379
spring.session.store-type=redis
```

### 학습 점검 질문
1. Redis와 Memcached의 차이점은?
2. 캐시 무효화 전략은?
3. 세션 클러스터링의 필요성은?

---

## 시나리오 7: 모니터링 및 로깅 (고급)

### 목표
- CloudWatch를 이용한 시스템 모니터링
- 로그 수집 및 분석

### 학습 내용
- CloudWatch 메트릭 및 알람
- 로그 그룹 및 스트림
- 대시보드 구성

### 실습 단계

#### 1단계: CloudWatch 알람 설정
```bash
# CPU 사용률 알람
aws cloudwatch put-metric-alarm \
    --alarm-name "HighCPUUtilization" \
    --alarm-description "Alert when CPU exceeds 80%" \
    --metric-name CPUUtilization \
    --namespace AWS/EC2 \
    --statistic Average \
    --period 300 \
    --threshold 80 \
    --comparison-operator GreaterThanThreshold \
    --dimensions Name=InstanceId,Value=i-1234567890abcdef0 \
    --evaluation-periods 2
```

#### 2단계: 로그 그룹 생성
```bash
# 애플리케이션 로그 그룹 생성
aws logs create-log-group --log-group-name /aws/ec2/petclinic
```

#### 3단계: 커스텀 메트릭 생성
```bash
# 커스텀 메트릭 전송
aws cloudwatch put-metric-data \
    --namespace "Petclinic/Application" \
    --metric-data MetricName=ActiveUsers,Value=150,Unit=Count
```

### 학습 점검 질문
1. 모니터링해야 할 주요 지표는?
2. 로그 보존 정책은 어떻게 설정하는가?
3. 비용 효율적인 모니터링 방법은?

---

## 종합 실습 프로젝트

### 프로젝트 목표
모든 시나리오를 통합하여 완전한 3-Tier 아키텍처 구축

### 아키텍처 구성
```
Internet Gateway
    ↓
Route 53 → CloudFront → S3 (Static Web)
    ↓
Application Load Balancer
    ↓
EC2 Auto Scaling Group (Spring Boot)
    ↓
RDS (MySQL) + ElastiCache (Redis)
```

### 실습 체크리스트

#### Tier 1: Presentation Layer
- [ ] S3 정적 웹사이트 호스팅 설정
- [ ] CloudFront 배포 생성
- [ ] 커스텀 도메인 연결
- [ ] SSL 인증서 적용
- [ ] 캐시 정책 설정

#### Tier 2: Application Layer
- [ ] VPC 및 서브넷 구성
- [ ] 보안 그룹 설정
- [ ] EC2 인스턴스 시작
- [ ] Application Load Balancer 구성
- [ ] Auto Scaling Group 설정
- [ ] Spring Boot 애플리케이션 배포

#### Tier 3: Data Layer
- [ ] RDS 인스턴스 생성
- [ ] ElastiCache 클러스터 구성
- [ ] 데이터베이스 초기 설정
- [ ] 백업 정책 구성

#### 운영 관리
- [ ] CloudWatch 모니터링 설정
- [ ] 로그 수집 구성
- [ ] 알람 및 알림 설정
- [ ] 비용 모니터링 설정

### 성과 평가

#### 기능적 요구사항
- 웹사이트 정상 접속 (HTTPS)
- API 서버 정상 동작
- 데이터베이스 연동 확인
- 세션 관리 동작 확인

#### 비기능적 요구사항
- 99.9% 가용성
- 5초 이내 응답 시간
- 자동 확장/축소 동작
- 보안 기준 준수

### 비용 예상 (월간)

| 서비스 | 사양 | 예상 비용 |
|--------|------|-----------|
| S3 | 5GB 저장, 10,000 요청 | $1-3 |
| CloudFront | 100GB 전송 | $8-15 |
| EC2 | t3.micro 2대 | $15-30 |
| RDS | db.t3.micro | $15-25 |
| ElastiCache | cache.t3.micro | $10-15 |
| **총 예상 비용** | | **$50-90** |

### 추가 학습 과제

1. **보안 강화**
   - WAF 설정
   - 네트워크 ACL 구성
   - 키 관리 (KMS)

2. **성능 최적화**
   - 데이터베이스 튜닝
   - 캐싱 전략 개선
   - CDN 최적화

3. **운영 자동화**
   - CI/CD 파이프라인
   - Infrastructure as Code
   - 자동 백업 및 복구

4. **비용 최적화**
   - Reserved Instance 활용
   - 스팟 인스턴스 사용
   - 라이프사이클 정책

이 시나리오들을 통해 AWS 3-Tier 아키텍처의 전체적인 이해를 높이고 실무에 적용할 수 있는 경험을 쌓을 수 있습니다.