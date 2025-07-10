#!/bin/bash

# AWS S3 동기화 스크립트
# 펫클리닉 웹사이트를 S3에 배포하고 CloudFront 캐시를 무효화합니다.

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 설정 파일 경로
CONFIG_FILE="../config/aws-config.json"
EXCLUDE_FILE="./deploy-exclude.txt"

# 기본 설정
DEFAULT_BUCKET="your-clinic-website-bucket"
DEFAULT_REGION="ap-northeast-2"
DEFAULT_PROFILE="default"

# 함수 정의
print_header() {
    echo -e "${BLUE}================================================${NC}"
    echo -e "${BLUE}       펫클리닉 웹사이트 AWS 배포 스크립트${NC}"
    echo -e "${BLUE}================================================${NC}"
    echo
}

print_step() {
    echo -e "${YELLOW}[STEP] $1${NC}"
}

print_success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}"
}

print_error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

print_info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# AWS CLI 설치 확인
check_aws_cli() {
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI가 설치되지 않았습니다."
        print_info "AWS CLI 설치 가이드: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
        exit 1
    fi
    print_success "AWS CLI가 설치되어 있습니다."
}

# jq 설치 확인
check_jq() {
    if ! command -v jq &> /dev/null; then
        print_error "jq가 설치되지 않았습니다."
        print_info "macOS: brew install jq"
        print_info "Ubuntu: sudo apt-get install jq"
        exit 1
    fi
    print_success "jq가 설치되어 있습니다."
}

# 설정 파일 읽기
read_config() {
    if [ -f "$CONFIG_FILE" ]; then
        BUCKET_NAME=$(jq -r '.aws.s3.bucketName' "$CONFIG_FILE")
        REGION=$(jq -r '.aws.region' "$CONFIG_FILE")
        DISTRIBUTION_ID=$(jq -r '.aws.cloudfront.distributionId' "$CONFIG_FILE")
        
        if [ "$BUCKET_NAME" == "null" ] || [ "$BUCKET_NAME" == "" ]; then
            BUCKET_NAME=$DEFAULT_BUCKET
        fi
        
        if [ "$REGION" == "null" ] || [ "$REGION" == "" ]; then
            REGION=$DEFAULT_REGION
        fi
        
        print_info "설정 파일에서 구성을 읽어왔습니다."
    else
        print_error "설정 파일을 찾을 수 없습니다: $CONFIG_FILE"
        print_info "기본 설정을 사용합니다."
        BUCKET_NAME=$DEFAULT_BUCKET
        REGION=$DEFAULT_REGION
        DISTRIBUTION_ID=""
    fi
}

# 사용자 입력 받기
get_user_input() {
    echo
    print_step "배포 설정 확인"
    
    echo -e "현재 설정:"
    echo -e "  버킷명: ${YELLOW}$BUCKET_NAME${NC}"
    echo -e "  리전: ${YELLOW}$REGION${NC}"
    echo -e "  CloudFront 배포 ID: ${YELLOW}${DISTRIBUTION_ID:-'설정되지 않음'}${NC}"
    echo
    
    read -p "이 설정으로 진행하시겠습니까? (y/n): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo
        read -p "S3 버킷명을 입력하세요 [$BUCKET_NAME]: " input_bucket
        read -p "AWS 리전을 입력하세요 [$REGION]: " input_region
        read -p "CloudFront 배포 ID를 입력하세요 (선택사항): " input_distribution
        
        BUCKET_NAME=${input_bucket:-$BUCKET_NAME}
        REGION=${input_region:-$REGION}
        DISTRIBUTION_ID=${input_distribution:-$DISTRIBUTION_ID}
    fi
}

# AWS 자격 증명 확인
check_aws_credentials() {
    print_step "AWS 자격 증명 확인"
    
    if aws sts get-caller-identity &> /dev/null; then
        ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)
        USER_ARN=$(aws sts get-caller-identity --query "Arn" --output text)
        print_success "AWS 자격 증명이 유효합니다."
        print_info "계정 ID: $ACCOUNT_ID"
        print_info "사용자: $USER_ARN"
    else
        print_error "AWS 자격 증명이 유효하지 않습니다."
        print_info "aws configure를 실행하여 자격 증명을 설정하세요."
        exit 1
    fi
}

# S3 버킷 존재 확인
check_bucket() {
    print_step "S3 버킷 확인"
    
    if aws s3api head-bucket --bucket "$BUCKET_NAME" 2>/dev/null; then
        print_success "S3 버킷이 존재합니다: $BUCKET_NAME"
    else
        print_error "S3 버킷이 존재하지 않습니다: $BUCKET_NAME"
        read -p "버킷을 생성하시겠습니까? (y/n): " -n 1 -r
        echo
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            create_bucket
        else
            exit 1
        fi
    fi
}

# S3 버킷 생성
create_bucket() {
    print_step "S3 버킷 생성"
    
    if [ "$REGION" == "us-east-1" ]; then
        aws s3api create-bucket --bucket "$BUCKET_NAME" --region "$REGION"
    else
        aws s3api create-bucket --bucket "$BUCKET_NAME" --region "$REGION" \
            --create-bucket-configuration LocationConstraint="$REGION"
    fi
    
    if [ $? -eq 0 ]; then
        print_success "S3 버킷이 생성되었습니다: $BUCKET_NAME"
        configure_bucket_website
    else
        print_error "S3 버킷 생성에 실패했습니다."
        exit 1
    fi
}

# S3 정적 웹사이트 호스팅 설정
configure_bucket_website() {
    print_step "S3 정적 웹사이트 호스팅 설정"
    
    # 웹사이트 구성 설정
    cat > website-config.json << EOF
{
    "IndexDocument": {
        "Suffix": "index.html"
    },
    "ErrorDocument": {
        "Key": "error.html"
    }
}
EOF
    
    aws s3api put-bucket-website --bucket "$BUCKET_NAME" --website-configuration file://website-config.json
    
    if [ $? -eq 0 ]; then
        print_success "정적 웹사이트 호스팅이 설정되었습니다."
    else
        print_error "정적 웹사이트 호스팅 설정에 실패했습니다."
    fi
    
    # 임시 파일 삭제
    rm -f website-config.json
}

# 버킷 정책 설정
configure_bucket_policy() {
    print_step "S3 버킷 정책 설정"
    
    cat > bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
        }
    ]
}
EOF
    
    aws s3api put-bucket-policy --bucket "$BUCKET_NAME" --policy file://bucket-policy.json
    
    if [ $? -eq 0 ]; then
        print_success "버킷 정책이 설정되었습니다."
    else
        print_error "버킷 정책 설정에 실패했습니다."
    fi
    
    # 임시 파일 삭제
    rm -f bucket-policy.json
}

# 파일 동기화
sync_files() {
    print_step "파일 동기화"
    
    # 프로젝트 루트 디렉토리로 이동
    cd ..
    
    # 제외 파일 목록 생성
    create_exclude_file
    
    # S3 동기화 실행
    print_info "파일을 S3에 업로드합니다..."
    
    aws s3 sync . s3://"$BUCKET_NAME" \
        --region "$REGION" \
        --exclude-from aws-deployment/deploy-exclude.txt \
        --delete \
        --cache-control "max-age=31536000" \
        --exclude "*.html" \
        --exclude "*.json"
    
    # HTML 파일은 캐시 시간을 짧게 설정
    aws s3 sync . s3://"$BUCKET_NAME" \
        --region "$REGION" \
        --include "*.html" \
        --cache-control "max-age=3600"
    
    # JSON 설정 파일은 캐시 안 함
    aws s3 sync config s3://"$BUCKET_NAME"/config \
        --region "$REGION" \
        --include "*.json" \
        --cache-control "no-cache"
    
    if [ $? -eq 0 ]; then
        print_success "파일 동기화가 완료되었습니다."
    else
        print_error "파일 동기화에 실패했습니다."
        exit 1
    fi
    
    # 원래 디렉토리로 돌아가기
    cd aws-deployment
}

# 제외 파일 목록 생성
create_exclude_file() {
    cat > aws-deployment/deploy-exclude.txt << EOF
.git/*
.gitignore
node_modules/*
*.md
aws-deployment/*
.DS_Store
Thumbs.db
*.log
.env
.vscode/*
.idea/*
*.tmp
*.temp
config/aws-config.json
EOF
}

# CloudFront 캐시 무효화
invalidate_cloudfront() {
    if [ -n "$DISTRIBUTION_ID" ] && [ "$DISTRIBUTION_ID" != "null" ]; then
        print_step "CloudFront 캐시 무효화"
        
        INVALIDATION_ID=$(aws cloudfront create-invalidation \
            --distribution-id "$DISTRIBUTION_ID" \
            --paths "/*" \
            --query "Invalidation.Id" \
            --output text)
        
        if [ $? -eq 0 ]; then
            print_success "CloudFront 캐시 무효화가 시작되었습니다."
            print_info "무효화 ID: $INVALIDATION_ID"
            print_info "완료까지 5-10분 소요됩니다."
        else
            print_error "CloudFront 캐시 무효화에 실패했습니다."
        fi
    else
        print_info "CloudFront 배포 ID가 설정되지 않아 캐시 무효화를 건너뜁니다."
    fi
}

# 배포 완료 정보 출력
print_deployment_info() {
    echo
    print_header
    print_success "배포가 완료되었습니다!"
    echo
    echo -e "${BLUE}배포 정보:${NC}"
    echo -e "  S3 버킷: ${YELLOW}$BUCKET_NAME${NC}"
    echo -e "  리전: ${YELLOW}$REGION${NC}"
    echo -e "  웹사이트 URL: ${YELLOW}http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com${NC}"
    
    if [ -n "$DISTRIBUTION_ID" ] && [ "$DISTRIBUTION_ID" != "null" ]; then
        echo -e "  CloudFront 배포: ${YELLOW}$DISTRIBUTION_ID${NC}"
        echo -e "  CloudFront URL: ${YELLOW}https://$(aws cloudfront get-distribution --id $DISTRIBUTION_ID --query 'Distribution.DomainName' --output text)${NC}"
    fi
    
    echo
    echo -e "${GREEN}다음 단계:${NC}"
    echo -e "  1. 웹사이트 접속 확인"
    echo -e "  2. 병원 정보 설정 (config/clinic-info.json)"
    echo -e "  3. 이미지 교체 (assets/images/)"
    echo -e "  4. 도메인 연결 (Route 53)"
    echo
}

# 에러 핸들링
handle_error() {
    print_error "스크립트 실행 중 오류가 발생했습니다."
    exit 1
}

# 메인 실행 함수
main() {
    # 에러 발생 시 핸들링
    trap handle_error ERR
    
    print_header
    
    # 사전 확인
    check_aws_cli
    check_jq
    read_config
    get_user_input
    check_aws_credentials
    check_bucket
    
    # 배포 실행
    configure_bucket_policy
    sync_files
    invalidate_cloudfront
    
    # 완료 정보 출력
    print_deployment_info
}

# 스크립트 실행
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi