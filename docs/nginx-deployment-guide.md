# Nginx 웹 서버 배포 가이드

이 가이드는 펫클리닉 웹사이트를 Nginx 웹 서버에 배포하는 방법을 설명합니다.

## 📋 개요

Nginx를 사용하면 다음과 같은 장점이 있습니다:
- 전통적인 웹 서버 구조 학습
- 로컬 환경에서 실제 웹 서버 경험
- 리버스 프록시 설정 학습
- SSL/TLS 인증서 관리 경험

## 🏗️ 아키텍처 비교

### Traditional Web Server (Nginx)
```
사용자 → Nginx → 정적 파일 (HTML/CSS/JS)
       ↓
    리버스 프록시
       ↓  
  Spring Boot API
```

### Cloud Architecture (S3)
```
사용자 → CloudFront → S3 → 정적 파일
       ↓
     API Gateway
       ↓
   Lambda/EC2 API
```

## 🚀 방법 1: 로컬 Nginx 설정 (학습용)

### 1단계: Nginx 설치

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install nginx
```

#### CentOS/RHEL
```bash
sudo yum install nginx
# 또는 RHEL 8+
sudo dnf install nginx
```

#### macOS
```bash
brew install nginx
```

#### Windows (WSL 사용 권장)
```bash
# WSL Ubuntu에서
sudo apt update && sudo apt install nginx
```

### 2단계: 웹사이트 파일 복사

```bash
# 웹 루트 디렉토리로 파일 복사
sudo cp -r /path/to/petclinic-web/* /var/www/html/

# 권한 설정
sudo chown -R www-data:www-data /var/www/html/
sudo chmod -R 755 /var/www/html/
```

### 3단계: Nginx 설정

#### 기본 설정 파일 생성
```bash
sudo nano /etc/nginx/sites-available/petclinic
```

#### 설정 내용
```nginx
server {
    listen 80;
    server_name localhost petclinic.local;
    
    root /var/www/html;
    index index.html;
    
    # 정적 파일 캐싱
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # HTML 파일은 짧은 캐시
    location ~* \.html$ {
        expires 1h;
        add_header Cache-Control "public";
    }
    
    # JSON 설정 파일은 캐시 안 함
    location ~* \.json$ {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
    
    # SPA 라우팅 지원
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API 프록시 (Spring Boot 연동 시)
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # 보안 헤더
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # Gzip 압축
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;
}
```

### 4단계: 설정 활성화

```bash
# 심볼릭 링크 생성
sudo ln -s /etc/nginx/sites-available/petclinic /etc/nginx/sites-enabled/

# 기본 설정 비활성화 (선택사항)
sudo rm /etc/nginx/sites-enabled/default

# 설정 테스트
sudo nginx -t

# Nginx 재시작
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 5단계: 방화벽 설정

```bash
# Ubuntu
sudo ufw allow 'Nginx Full'

# CentOS/RHEL
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 6단계: 접속 확인

브라우저에서 다음 주소로 접속:
- `http://localhost`
- `http://your-server-ip`

---

## 🌐 방법 2: 프로덕션 Nginx 설정

### 1단계: SSL 인증서 설정

#### Let's Encrypt 사용
```bash
# Certbot 설치
sudo apt install certbot python3-certbot-nginx

# 인증서 발급
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

#### 수동 인증서 사용
```bash
# 인증서 파일 위치
/etc/ssl/certs/your-domain.crt
/etc/ssl/private/your-domain.key
```

### 2단계: SSL Nginx 설정

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL 설정
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # SSL 보안 설정
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;
    
    root /var/www/html;
    index index.html;
    
    # 나머지 설정은 기본 설정과 동일
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API 프록시
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3단계: 성능 최적화

#### Nginx 전역 설정 (`/etc/nginx/nginx.conf`)
```nginx
user www-data;
worker_processes auto;
worker_connections 1024;

http {
    # 기본 설정
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # 로그 설정
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;
    
    # 성능 최적화
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    
    # Gzip 압축
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
        application/json
        image/svg+xml;
    
    # 보안 설정
    server_tokens off;
    
    include /etc/nginx/sites-enabled/*;
}
```

---

## 🔧 고급 설정

### 로드 밸런싱 (여러 백엔드 서버)

```nginx
upstream backend {
    server localhost:8080 weight=3;
    server localhost:8081 weight=1;
    server localhost:8082 backup;
}

server {
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 헬스체크
        proxy_connect_timeout 5s;
        proxy_send_timeout 5s;
        proxy_read_timeout 5s;
    }
}
```

### 캐싱 설정

```nginx
# 캐시 존 설정
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=100m inactive=60m;

server {
    location /api/ {
        proxy_cache api_cache;
        proxy_cache_valid 200 302 10m;
        proxy_cache_valid 404 1m;
        proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
        proxy_cache_revalidate on;
        proxy_cache_lock on;
        
        # 캐시 헤더 추가
        add_header X-Cache-Status $upstream_cache_status;
        
        proxy_pass http://localhost:8080;
    }
}
```

### 모니터링 설정

```nginx
server {
    listen 8080;
    server_name localhost;
    
    location /nginx_status {
        stub_status on;
        access_log off;
        allow 127.0.0.1;
        deny all;
    }
}
```

---

## 🛠️ 자동화 스크립트

### 배포 스크립트 생성

```bash
#!/bin/bash
# nginx-deploy.sh

echo "🚀 Nginx 배포 스크립트 시작"

# 변수 설정
WEB_ROOT="/var/www/html"
NGINX_CONFIG="/etc/nginx/sites-available/petclinic"
PROJECT_DIR="/path/to/petclinic-web"

# 웹 파일 업데이트
echo "📁 웹 파일 복사 중..."
sudo cp -r $PROJECT_DIR/* $WEB_ROOT/
sudo chown -R www-data:www-data $WEB_ROOT/
sudo chmod -R 755 $WEB_ROOT/

# Nginx 설정 테스트
echo "🔧 Nginx 설정 테스트 중..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ 설정 테스트 통과"
    
    # Nginx 재로드
    echo "🔄 Nginx 재로드 중..."
    sudo systemctl reload nginx
    
    echo "🎉 배포 완료!"
    echo "웹사이트: http://$(hostname -I | awk '{print $1}')"
else
    echo "❌ Nginx 설정 오류"
    exit 1
fi
```

### 실행 권한 부여 및 실행

```bash
chmod +x nginx-deploy.sh
./nginx-deploy.sh
```

---

## 📊 모니터링 및 로깅

### 로그 확인

```bash
# 액세스 로그
sudo tail -f /var/log/nginx/access.log

# 에러 로그
sudo tail -f /var/log/nginx/error.log

# 실시간 로그 모니터링
sudo journalctl -u nginx -f
```

### 성능 모니터링

```bash
# Nginx 상태 확인
curl http://localhost:8080/nginx_status

# 프로세스 상태
sudo systemctl status nginx

# 포트 사용 확인
sudo netstat -tlnp | grep nginx
```

---

## 🔍 문제 해결

### 일반적인 문제들

#### 1. 403 Forbidden 오류
```bash
# 권한 확인
ls -la /var/www/html/

# 권한 수정
sudo chown -R www-data:www-data /var/www/html/
sudo chmod -R 755 /var/www/html/
```

#### 2. 502 Bad Gateway (API 연동 시)
```bash
# Spring Boot 서버 실행 확인
curl http://localhost:8080/api/owners

# 방화벽 확인
sudo ufw status
```

#### 3. SSL 인증서 오류
```bash
# 인증서 갱신
sudo certbot renew

# 인증서 유효성 확인
openssl x509 -in /etc/letsencrypt/live/your-domain.com/cert.pem -text -noout
```

### 디버깅 명령어

```bash
# 설정 파일 구문 검사
sudo nginx -t

# 설정 파일 덤프
sudo nginx -T

# 재로드 (다운타임 없음)
sudo nginx -s reload

# 완전 재시작
sudo systemctl restart nginx
```

---

## 🔒 보안 강화

### 추가 보안 설정

```nginx
# /etc/nginx/sites-available/petclinic
server {
    # DDoS 방지
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:8080;
    }
    
    # 숨겨진 파일 차단
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    # 백업 파일 차단
    location ~* \.(bak|backup|old|tmp)$ {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    # 관리자 페이지 IP 제한
    location /admin/ {
        allow 192.168.1.0/24;
        allow 127.0.0.1;
        deny all;
        
        proxy_pass http://localhost:8080;
    }
}
```

### Fail2Ban 설정

```bash
# Fail2Ban 설치
sudo apt install fail2ban

# Nginx 필터 설정
sudo nano /etc/fail2ban/filter.d/nginx-limit-req.conf
```

```ini
[Definition]
failregex = limiting requests, excess: .* by zone .*, client: <HOST>
ignoreregex =
```

```bash
# Jail 설정
sudo nano /etc/fail2ban/jail.local
```

```ini
[nginx-limit-req]
enabled = true
filter = nginx-limit-req
action = iptables-multiport[name=ReqLimit, port="http,https", protocol=tcp]
logpath = /var/log/nginx/error.log
findtime = 600
bantime = 7200
maxretry = 10
```

---

## 📈 성능 최적화

### 시스템 튜닝

```bash
# 파일 디스크립터 제한 증가
echo "* soft nofile 65536" >> /etc/security/limits.conf
echo "* hard nofile 65536" >> /etc/security/limits.conf

# Nginx worker 프로세스 최적화
# worker_processes = CPU 코어 수
grep processor /proc/cpuinfo | wc -l
```

### HTTP/2 활성화

```nginx
server {
    listen 443 ssl http2;
    # ... 나머지 설정
}
```

이 가이드를 통해 학습자들은 전통적인 웹 서버 구성 방법을 배우고, AWS 클라우드 방식과 비교하여 이해할 수 있습니다.