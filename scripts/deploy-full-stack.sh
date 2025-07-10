#!/bin/bash

# 펫클리닉 풀스택 배포 자동화 스크립트
# AWS 3-Tier 아키텍처 완전 배포

set -e

echo "🏥 펫클리닉 풀스택 배포 시작"
echo "================================"

# 설정 변수
REGION="us-west-2"
VPC_CIDR="10.0.0.0/16"
PROJECT_NAME="petclinic"
DB_PASSWORD="YourSecurePassword123!"

# 색상 출력 함수
print_status() {
    echo -e "\033[1;34m[INFO]\033[0m $1"
}

print_success() {
    echo -e "\033[1;32m[SUCCESS]\033[0m $1"
}

print_error() {
    echo -e "\033[1;31m[ERROR]\033[0m $1"
}

# 1. VPC 및 네트워크 생성
print_status "1단계: VPC 및 네트워크 설정 중..."

VPC_ID=$(aws ec2 create-vpc \
    --cidr-block $VPC_CIDR \
    --tag-specifications "ResourceType=vpc,Tags=[{Key=Name,Value=$PROJECT_NAME-VPC}]" \
    --query 'Vpc.VpcId' --output text)

print_success "VPC 생성 완료: $VPC_ID"

# 인터넷 게이트웨이
IGW_ID=$(aws ec2 create-internet-gateway \
    --tag-specifications "ResourceType=internet-gateway,Tags=[{Key=Name,Value=$PROJECT_NAME-IGW}]" \
    --query 'InternetGateway.InternetGatewayId' --output text)

aws ec2 attach-internet-gateway --vpc-id $VPC_ID --internet-gateway-id $IGW_ID

# 서브넷 생성
PUBLIC_SUBNET_1=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block 10.0.1.0/24 \
    --availability-zone ${REGION}a \
    --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=$PROJECT_NAME-Public-1a}]" \
    --query 'Subnet.SubnetId' --output text)

PUBLIC_SUBNET_2=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block 10.0.2.0/24 \
    --availability-zone ${REGION}b \
    --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=$PROJECT_NAME-Public-1b}]" \
    --query 'Subnet.SubnetId' --output text)

PRIVATE_SUBNET_1=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block 10.0.10.0/24 \
    --availability-zone ${REGION}a \
    --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=$PROJECT_NAME-Private-1a}]" \
    --query 'Subnet.SubnetId' --output text)

PRIVATE_SUBNET_2=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block 10.0.11.0/24 \
    --availability-zone ${REGION}b \
    --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=$PROJECT_NAME-Private-1b}]" \
    --query 'Subnet.SubnetId' --output text)

DB_SUBNET_1=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block 10.0.20.0/24 \
    --availability-zone ${REGION}a \
    --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=$PROJECT_NAME-DB-1a}]" \
    --query 'Subnet.SubnetId' --output text)

DB_SUBNET_2=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block 10.0.21.0/24 \
    --availability-zone ${REGION}b \
    --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=$PROJECT_NAME-DB-1b}]" \
    --query 'Subnet.SubnetId' --output text)

print_success "서브넷 생성 완료"

# 2. 보안 그룹 생성
print_status "2단계: 보안 그룹 설정 중..."

# WEB ALB 보안 그룹
WEB_ALB_SG=$(aws ec2 create-security-group \
    --group-name $PROJECT_NAME-web-alb-sg \
    --description "Security group for WEB ALB" \
    --vpc-id $VPC_ID \
    --query 'GroupId' --output text)

aws ec2 authorize-security-group-ingress \
    --group-id $WEB_ALB_SG \
    --protocol tcp --port 80 --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
    --group-id $WEB_ALB_SG \
    --protocol tcp --port 443 --cidr 0.0.0.0/0

# WEB 서버 보안 그룹
WEB_SG=$(aws ec2 create-security-group \
    --group-name $PROJECT_NAME-web-sg \
    --description "Security group for WEB servers" \
    --vpc-id $VPC_ID \
    --query 'GroupId' --output text)

aws ec2 authorize-security-group-ingress \
    --group-id $WEB_SG \
    --protocol tcp --port 80 --source-group $WEB_ALB_SG

aws ec2 authorize-security-group-ingress \
    --group-id $WEB_SG \
    --protocol tcp --port 22 --cidr 0.0.0.0/0

# WAS ALB 보안 그룹
WAS_ALB_SG=$(aws ec2 create-security-group \
    --group-name $PROJECT_NAME-was-alb-sg \
    --description "Security group for WAS ALB" \
    --vpc-id $VPC_ID \
    --query 'GroupId' --output text)

aws ec2 authorize-security-group-ingress \
    --group-id $WAS_ALB_SG \
    --protocol tcp --port 8080 --source-group $WEB_SG

# WAS 서버 보안 그룹
WAS_SG=$(aws ec2 create-security-group \
    --group-name $PROJECT_NAME-was-sg \
    --description "Security group for WAS servers" \
    --vpc-id $VPC_ID \
    --query 'GroupId' --output text)

aws ec2 authorize-security-group-ingress \
    --group-id $WAS_SG \
    --protocol tcp --port 8080 --source-group $WAS_ALB_SG

aws ec2 authorize-security-group-ingress \
    --group-id $WAS_SG \
    --protocol tcp --port 22 --cidr 0.0.0.0/0

# RDS 보안 그룹
RDS_SG=$(aws ec2 create-security-group \
    --group-name $PROJECT_NAME-rds-sg \
    --description "Security group for RDS" \
    --vpc-id $VPC_ID \
    --query 'GroupId' --output text)

aws ec2 authorize-security-group-ingress \
    --group-id $RDS_SG \
    --protocol tcp --port 3306 --source-group $WAS_SG

print_success "보안 그룹 생성 완료"

# 3. RDS 데이터베이스 생성
print_status "3단계: RDS 데이터베이스 생성 중..."

aws rds create-db-subnet-group \
    --db-subnet-group-name $PROJECT_NAME-db-subnet-group \
    --db-subnet-group-description "DB subnet group for PetClinic" \
    --subnet-ids $DB_SUBNET_1 $DB_SUBNET_2

aws rds create-db-instance \
    --db-instance-identifier $PROJECT_NAME-mysql \
    --db-instance-class db.t3.micro \
    --engine mysql \
    --engine-version 8.0.35 \
    --master-username petclinic \
    --master-user-password "$DB_PASSWORD" \
    --allocated-storage 20 \
    --storage-type gp2 \
    --db-subnet-group-name $PROJECT_NAME-db-subnet-group \
    --vpc-security-group-ids $RDS_SG \
    --db-name petclinic \
    --backup-retention-period 7 \
    --publicly-accessible false \
    --multi-az

print_success "RDS 생성 시작됨 (완료까지 10-15분 소요)"

# 4. Application Load Balancer 생성
print_status "4단계: Load Balancer 생성 중..."

# WEB ALB
WEB_ALB_ARN=$(aws elbv2 create-load-balancer \
    --name $PROJECT_NAME-web-alb \
    --subnets $PUBLIC_SUBNET_1 $PUBLIC_SUBNET_2 \
    --security-groups $WEB_ALB_SG \
    --scheme internet-facing \
    --type application \
    --query 'LoadBalancers[0].LoadBalancerArn' --output text)

# WAS ALB
WAS_ALB_ARN=$(aws elbv2 create-load-balancer \
    --name $PROJECT_NAME-was-alb \
    --subnets $PRIVATE_SUBNET_1 $PRIVATE_SUBNET_2 \
    --security-groups $WAS_ALB_SG \
    --scheme internal \
    --type application \
    --query 'LoadBalancers[0].LoadBalancerArn' --output text)

print_success "Load Balancer 생성 완료"

# 5. 타겟 그룹 생성
print_status "5단계: 타겟 그룹 생성 중..."

WEB_TG_ARN=$(aws elbv2 create-target-group \
    --name $PROJECT_NAME-web-tg \
    --protocol HTTP \
    --port 80 \
    --vpc-id $VPC_ID \
    --health-check-path /health \
    --query 'TargetGroups[0].TargetGroupArn' --output text)

WAS_TG_ARN=$(aws elbv2 create-target-group \
    --name $PROJECT_NAME-was-tg \
    --protocol HTTP \
    --port 8080 \
    --vpc-id $VPC_ID \
    --health-check-path /actuator/health \
    --query 'TargetGroups[0].TargetGroupArn' --output text)

print_success "타겟 그룹 생성 완료"

# 6. 설정 정보 저장
print_status "6단계: 설정 정보 저장 중..."

cat > deployment-info.json << EOF
{
  "vpc_id": "$VPC_ID",
  "web_alb_arn": "$WEB_ALB_ARN",
  "was_alb_arn": "$WAS_ALB_ARN",
  "web_tg_arn": "$WEB_TG_ARN",
  "was_tg_arn": "$WAS_TG_ARN",
  "web_sg": "$WEB_SG",
  "was_sg": "$WAS_SG",
  "rds_sg": "$RDS_SG",
  "public_subnets": ["$PUBLIC_SUBNET_1", "$PUBLIC_SUBNET_2"],
  "private_subnets": ["$PRIVATE_SUBNET_1", "$PRIVATE_SUBNET_2"],
  "db_subnets": ["$DB_SUBNET_1", "$DB_SUBNET_2"]
}
EOF

print_success "배포 정보가 deployment-info.json에 저장되었습니다"

echo ""
echo "🎉 인프라 배포 완료!"
echo "================================"
echo "VPC ID: $VPC_ID"
echo "WEB ALB: $WEB_ALB_ARN"
echo "WAS ALB: $WAS_ALB_ARN"
echo ""
echo "📌 다음 단계:"
echo "1. RDS 생성 완료 대기 (10-15분)"
echo "2. EC2 인스턴스 배포 실행:"
echo "   ./deploy-instances.sh"
echo "3. CloudFront 배포:"
echo "   ./deploy-cloudfront.sh"
echo ""
echo "🔍 상태 확인:"
echo "aws rds describe-db-instances --db-instance-identifier $PROJECT_NAME-mysql"