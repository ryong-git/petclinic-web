# AWS 배포 가이드

이 가이드는 펫클리닉 웹사이트를 AWS에 배포하는 방법을 단계별로 설명합니다.

## 목차

1. [사전 준비](#사전-준비)
2. [S3 정적 웹사이트 호스팅](#s3-정적-웹사이트-호스팅)
3. [CloudFront 배포](#cloudfront-배포)
4. [Route 53 도메인 연결](#route-53-도메인-연결)
5. [SSL 인증서 설정](#ssl-인증서-설정)
6. [자동 배포 설정](#자동-배포-설정)
7. [모니터링 및 로그](#모니터링-및-로그)

## 사전 준비

### 1. AWS CLI 설치

```bash
# macOS
brew install awscli

# Windows
# AWS CLI 설치 파일 다운로드: https://aws.amazon.com/cli/

# Linux
sudo apt-get install awscli
```

### 2. AWS 자격 증명 설정

```bash
aws configure
```

다음 정보를 입력하세요:
- AWS Access Key ID
- AWS Secret Access Key
- Default region name (예: ap-northeast-2)
- Default output format (json)

### 3. 필요한 도구 설치

```bash
# jq (JSON 처리 도구)
# macOS
brew install jq

# Ubuntu/Debian
sudo apt-get install jq

# Windows
# https://stedolan.github.io/jq/download/
```

## S3 정적 웹사이트 호스팅

### 1. 자동 배포 스크립트 사용

```bash
# 프로젝트 루트에서 실행
cd aws-deployment
./s3-sync.sh
```

### 2. 수동 배포 방법

#### 2.1. S3 버킷 생성

```bash
# 버킷 생성
aws s3api create-bucket \
    --bucket your-clinic-website-bucket \
    --region ap-northeast-2 \
    --create-bucket-configuration LocationConstraint=ap-northeast-2

# 정적 웹사이트 호스팅 설정
aws s3api put-bucket-website \
    --bucket your-clinic-website-bucket \
    --website-configuration file://website-config.json
```

#### 2.2. 버킷 정책 설정

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-clinic-website-bucket/*"
        }
    ]
}
```

#### 2.3. 파일 업로드

```bash
# 파일 동기화
aws s3 sync . s3://your-clinic-website-bucket \
    --exclude "*.md" \
    --exclude ".git/*" \
    --exclude "aws-deployment/*" \
    --delete
```

## CloudFront 배포

### 1. CloudFront 배포 생성

```bash
# CloudFront 배포 생성
aws cloudfront create-distribution \
    --distribution-config file://cloudfront-config.json
```

### 2. 배포 설정 예시

```json
{
    "CallerReference": "petclinic-web-2024",
    "Comment": "Petclinic Website Distribution",
    "DefaultCacheBehavior": {
        "TargetOriginId": "S3-your-clinic-website-bucket",
        "ViewerProtocolPolicy": "redirect-to-https",
        "TrustedSigners": {
            "Enabled": false,
            "Quantity": 0
        },
        "ForwardedValues": {
            "QueryString": false,
            "Cookies": {
                "Forward": "none"
            }
        },
        "MinTTL": 0,
        "DefaultTTL": 86400,
        "MaxTTL": 31536000
    },
    "Origins": {
        "Quantity": 1,
        "Items": [
            {
                "Id": "S3-your-clinic-website-bucket",
                "DomainName": "your-clinic-website-bucket.s3.amazonaws.com",
                "S3OriginConfig": {
                    "OriginAccessIdentity": ""
                }
            }
        ]
    },
    "Enabled": true,
    "PriceClass": "PriceClass_All"
}
```

### 3. 캐시 무효화

```bash
# 캐시 무효화
aws cloudfront create-invalidation \
    --distribution-id YOUR_DISTRIBUTION_ID \
    --paths "/*"
```

## Route 53 도메인 연결

### 1. 호스팅 존 생성

```bash
# 호스팅 존 생성
aws route53 create-hosted-zone \
    --name your-domain.com \
    --caller-reference "petclinic-$(date +%s)"
```

### 2. A 레코드 생성

```bash
# A 레코드 생성 (CloudFront 연결)
aws route53 change-resource-record-sets \
    --hosted-zone-id YOUR_HOSTED_ZONE_ID \
    --change-batch file://route53-change-batch.json
```

### 3. 레코드 설정 예시

```json
{
    "Changes": [
        {
            "Action": "CREATE",
            "ResourceRecordSet": {
                "Name": "your-domain.com",
                "Type": "A",
                "AliasTarget": {
                    "DNSName": "your-cloudfront-domain.cloudfront.net",
                    "EvaluateTargetHealth": false,
                    "HostedZoneId": "Z2FDTNDATAQYW2"
                }
            }
        }
    ]
}
```

## SSL 인증서 설정

### 1. AWS Certificate Manager에서 인증서 요청

```bash
# SSL 인증서 요청
aws acm request-certificate \
    --domain-name your-domain.com \
    --subject-alternative-names "*.your-domain.com" \
    --validation-method DNS \
    --region us-east-1
```

### 2. DNS 검증 설정

```bash
# 검증 레코드 확인
aws acm describe-certificate \
    --certificate-arn YOUR_CERTIFICATE_ARN \
    --region us-east-1
```

## 자동 배포 설정

### 1. GitHub Actions 설정

`.github/workflows/deploy.yml` 파일 생성:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v2
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v1
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ap-northeast-2
    
    - name: Deploy to S3
      run: |
        aws s3 sync . s3://your-clinic-website-bucket \
          --exclude "*.md" \
          --exclude ".git/*" \
          --exclude ".github/*" \
          --delete
    
    - name: Invalidate CloudFront
      run: |
        aws cloudfront create-invalidation \
          --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
          --paths "/*"
```

### 2. 환경 변수 설정

GitHub Repository Settings > Secrets에서 다음 설정:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `CLOUDFRONT_DISTRIBUTION_ID`

## 모니터링 및 로그

### 1. CloudWatch 로그 설정

```bash
# CloudFront 로그 설정
aws cloudfront update-distribution \
    --id YOUR_DISTRIBUTION_ID \
    --distribution-config file://cloudfront-logging-config.json
```

### 2. 비용 모니터링

```bash
# 비용 알림 설정
aws cloudwatch put-metric-alarm \
    --alarm-name "AWS-Billing-Alert" \
    --alarm-description "Alert when AWS charges exceed $10" \
    --metric-name EstimatedCharges \
    --namespace AWS/Billing \
    --statistic Maximum \
    --period 21600 \
    --threshold 10 \
    --comparison-operator GreaterThanThreshold \
    --evaluation-periods 1
```

## 성능 최적화

### 1. 캐시 설정

- HTML 파일: 1시간 캐시
- CSS/JS 파일: 1년 캐시
- 이미지 파일: 1년 캐시
- JSON 설정 파일: 캐시 안 함

### 2. 압축 설정

```json
{
    "Compress": true,
    "ViewerProtocolPolicy": "redirect-to-https"
}
```

## 보안 설정

### 1. WAF 설정

```bash
# WAF 웹 ACL 생성
aws wafv2 create-web-acl \
    --name "PetclinicWebACL" \
    --scope CLOUDFRONT \
    --default-action Allow={} \
    --rules file://waf-rules.json
```

### 2. 보안 헤더 설정

Lambda@Edge를 사용하여 보안 헤더 추가:

```javascript
exports.handler = (event, context, callback) => {
    const response = event.Records[0].cf.response;
    const headers = response.headers;
    
    headers['strict-transport-security'] = [{
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains'
    }];
    
    headers['x-content-type-options'] = [{
        key: 'X-Content-Type-Options',
        value: 'nosniff'
    }];
    
    headers['x-frame-options'] = [{
        key: 'X-Frame-Options',
        value: 'DENY'
    }];
    
    callback(null, response);
};
```

## 문제 해결

### 일반적인 문제들

1. **403 Forbidden 오류**
   - 버킷 정책 확인
   - 파일 권한 확인

2. **배포 느림**
   - CloudFront 캐시 확인
   - 파일 크기 최적화

3. **SSL 인증서 오류**
   - 인증서 리전 확인 (us-east-1)
   - DNS 검증 완료 확인

### 로그 확인

```bash
# CloudFront 로그 확인
aws logs describe-log-groups --log-group-name-prefix "/aws/cloudfront/"

# S3 액세스 로그 확인
aws s3 ls s3://your-log-bucket/
```

## 참고 자료

- [AWS S3 정적 웹사이트 호스팅 가이드](https://docs.aws.amazon.com/AmazonS3/latest/dev/WebsiteHosting.html)
- [CloudFront 개발자 가이드](https://docs.aws.amazon.com/cloudfront/latest/APIReference/)
- [Route 53 개발자 가이드](https://docs.aws.amazon.com/route53/latest/developerguide/)
- [AWS CLI 명령어 참조](https://awscli.amazonaws.com/v2/documentation/api/latest/index.html)