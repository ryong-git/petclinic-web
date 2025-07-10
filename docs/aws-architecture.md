# AWS 3-Tier 아키텍처 가이드

이 문서는 펫클리닉 웹사이트의 AWS 3-Tier 아키텍처를 설명합니다.

## 아키텍처 개요

```
┌─────────────────────────────────────────────────────────────────┐
│                        사용자 (Internet)                        │
└─────────────────────────┬───────────────────────────────────────┘
                         │
┌─────────────────────────▼───────────────────────────────────────┐
│                 Presentation Tier (웹 계층)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Route 53  │  │ CloudFront  │  │     S3      │             │
│  │    (DNS)    │  │    (CDN)    │  │(Static Web) │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────┬───────────────────────────────────────┘
                         │
┌─────────────────────────▼───────────────────────────────────────┐
│                Application Tier (애플리케이션 계층)               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │    ALB      │  │     EC2     │  │Auto Scaling │             │
│  │(Load Balancer)│ │(Spring Boot)│ │   Group     │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────┬───────────────────────────────────────┘
                         │
┌─────────────────────────▼───────────────────────────────────────┐
│                   Data Tier (데이터 계층)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │     RDS     │  │     S3      │  │ElastiCache  │             │
│  │ (Database)  │  │  (Images)   │  │   (Cache)   │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

## Tier 1: Presentation Tier (웹 계층)

### 구성 요소

1. **Route 53 (DNS)**
   - 도메인 관리
   - 트래픽 라우팅
   - 헬스 체크

2. **CloudFront (CDN)**
   - 전 세계 캐시 배포
   - SSL/TLS 종료
   - 정적 콘텐츠 가속

3. **S3 (정적 웹사이트)**
   - HTML, CSS, JavaScript 호스팅
   - 이미지 및 미디어 파일 저장
   - 웹사이트 호스팅 설정

### 주요 기능

- **고가용성**: 전 세계 분산 인프라
- **확장성**: 자동 트래픽 처리
- **보안**: SSL/TLS 암호화
- **성능**: 엣지 로케이션 캐싱

## Tier 2: Application Tier (애플리케이션 계층)

### 구성 요소

1. **Application Load Balancer (ALB)**
   - 트래픽 분산
   - 헬스 체크
   - SSL 종료

2. **EC2 (컴퓨팅)**
   - Spring Boot 애플리케이션 실행
   - 비즈니스 로직 처리
   - REST API 제공

3. **Auto Scaling Group**
   - 자동 확장/축소
   - 인스턴스 헬스 관리
   - 비용 최적화

### 주요 기능

- **탄력성**: 트래픽에 따른 자동 확장
- **가용성**: 다중 AZ 배포
- **성능**: 로드 밸런싱
- **보안**: 프라이빗 서브넷 배치

## Tier 3: Data Tier (데이터 계층)

### 구성 요소

1. **RDS (관계형 데이터베이스)**
   - 비즈니스 데이터 저장
   - 자동 백업
   - Multi-AZ 배포

2. **S3 (객체 저장소)**
   - 이미지, 파일 저장
   - 버전 관리
   - 라이프사이클 관리

3. **ElastiCache (캐시)**
   - 세션 저장
   - 쿼리 결과 캐싱
   - 성능 최적화

### 주요 기능

- **내구성**: 99.999999999% 내구성
- **확장성**: 스토리지 자동 확장
- **보안**: 암호화 및 접근 제어
- **백업**: 자동 백업 및 복구

## 네트워크 구성

### VPC 설계

```
VPC (10.0.0.0/16)
├── Public Subnet 1 (10.0.1.0/24) - AZ-A
├── Public Subnet 2 (10.0.2.0/24) - AZ-B
├── Private Subnet 1 (10.0.10.0/24) - AZ-A
├── Private Subnet 2 (10.0.20.0/24) - AZ-B
├── DB Subnet 1 (10.0.100.0/24) - AZ-A
└── DB Subnet 2 (10.0.200.0/24) - AZ-B
```

### 보안 그룹 설계

1. **웹 보안 그룹**
   - 80, 443 포트 허용 (인터넷)
   - 22 포트 허용 (관리자 IP)

2. **애플리케이션 보안 그룹**
   - 8080 포트 허용 (ALB만)
   - 22 포트 허용 (베스천 호스트)

3. **데이터베이스 보안 그룹**
   - 3306 포트 허용 (앱 서버만)

## 배포 단계별 가이드

### 1단계: 정적 웹사이트 배포

```bash
# S3 버킷 생성
aws s3 mb s3://petclinic-web-static

# 정적 웹사이트 설정
aws s3 website s3://petclinic-web-static \
    --index-document index.html \
    --error-document error.html

# 파일 업로드
aws s3 sync . s3://petclinic-web-static \
    --exclude "*.md" --exclude ".git/*"
```

### 2단계: CloudFront 배포

```bash
# CloudFront 배포 생성
aws cloudfront create-distribution \
    --distribution-config file://cloudfront-config.json
```

### 3단계: 백엔드 인프라 구성

```bash
# VPC 생성
aws ec2 create-vpc --cidr-block 10.0.0.0/16

# 서브넷 생성
aws ec2 create-subnet \
    --vpc-id vpc-12345678 \
    --cidr-block 10.0.1.0/24 \
    --availability-zone ap-northeast-2a

# 보안 그룹 생성
aws ec2 create-security-group \
    --group-name petclinic-web-sg \
    --description "Security group for petclinic web"
```

### 4단계: 데이터베이스 설정

```bash
# RDS 서브넷 그룹 생성
aws rds create-db-subnet-group \
    --db-subnet-group-name petclinic-db-subnet-group \
    --db-subnet-group-description "DB subnet group for petclinic" \
    --subnet-ids subnet-12345678 subnet-87654321

# RDS 인스턴스 생성
aws rds create-db-instance \
    --db-instance-identifier petclinic-db \
    --db-instance-class db.t3.micro \
    --engine mysql \
    --master-username admin \
    --master-user-password mypassword \
    --db-subnet-group-name petclinic-db-subnet-group
```

## 모니터링 및 로깅

### CloudWatch 설정

```bash
# 로그 그룹 생성
aws logs create-log-group \
    --log-group-name /aws/ec2/petclinic

# 메트릭 알람 설정
aws cloudwatch put-metric-alarm \
    --alarm-name "HighCPUUtilization" \
    --alarm-description "Alert when CPU exceeds 80%" \
    --metric-name CPUUtilization \
    --namespace AWS/EC2 \
    --statistic Average \
    --period 300 \
    --threshold 80 \
    --comparison-operator GreaterThanThreshold
```

### 주요 모니터링 지표

1. **웹 계층**
   - CloudFront 캐시 히트율
   - S3 요청 수 및 오류율

2. **애플리케이션 계층**
   - EC2 CPU/메모리 사용률
   - ALB 응답 시간 및 오류율

3. **데이터 계층**
   - RDS 연결 수 및 쿼리 성능
   - ElastiCache 히트율

## 보안 구성

### IAM 역할 설정

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject"
            ],
            "Resource": "arn:aws:s3:::petclinic-web-static/*"
        }
    ]
}
```

### 암호화 설정

1. **저장 시 암호화**
   - RDS: AES-256 암호화
   - S3: SSE-S3 암호화
   - EBS: 기본 암호화

2. **전송 중 암호화**
   - CloudFront: SSL/TLS
   - ALB: SSL/TLS
   - RDS: SSL 연결

## 비용 최적화

### 권장 사항

1. **컴퓨팅 비용**
   - Reserved Instances 사용
   - 적절한 인스턴스 타입 선택
   - Auto Scaling 활용

2. **스토리지 비용**
   - S3 라이프사이클 정책
   - 불필요한 데이터 삭제
   - 압축 및 최적화

3. **네트워크 비용**
   - CloudFront 캐싱 최적화
   - 데이터 전송 최소화

### 예상 비용 (월간)

- S3 웹사이트 호스팅: $1-5
- CloudFront: $5-20
- EC2 (t3.micro): $8-15
- RDS (db.t3.micro): $15-25
- **총 예상 비용: $30-70/월**

## 재해 복구 계획

### 백업 전략

1. **자동 백업**
   - RDS 일일 백업
   - S3 버전 관리
   - AMI 주간 백업

2. **교차 리전 복제**
   - S3 교차 리전 복제
   - RDS 스냅샷 복사

### 복구 절차

1. **웹사이트 복구**
   - S3 버킷 복원
   - CloudFront 무효화

2. **데이터베이스 복구**
   - RDS 스냅샷 복원
   - 포인트 인 타임 복구

## 성능 최적화

### 캐싱 전략

1. **브라우저 캐시**
   - 정적 리소스: 1년
   - HTML: 1시간
   - API 응답: 캐시 안 함

2. **CloudFront 캐시**
   - 이미지: 1년
   - CSS/JS: 1년
   - HTML: 1시간

### 최적화 체크리스트

- [ ] 이미지 압축 및 포맷 최적화
- [ ] CSS/JS 압축 및 번들링
- [ ] GZIP 압축 활성화
- [ ] 불필요한 플러그인 제거
- [ ] 데이터베이스 쿼리 최적화
- [ ] 캐싱 전략 구현

## 확장성 고려사항

### 수평 확장

1. **웹 계층**
   - 자동 확장 (CloudFront)
   - 무제한 확장성

2. **애플리케이션 계층**
   - Auto Scaling Group
   - 로드 밸런서 확장

3. **데이터 계층**
   - RDS 읽기 복제본
   - ElastiCache 클러스터

### 수직 확장

1. **인스턴스 타입 업그레이드**
   - t3.micro → t3.small → t3.medium
   - 메모리 및 CPU 증가

2. **스토리지 확장**
   - RDS 자동 확장
   - S3 무제한 확장

이 아키텍처는 교육용으로 설계되었으며, 실제 운영 환경에서는 요구사항에 맞게 조정이 필요합니다.