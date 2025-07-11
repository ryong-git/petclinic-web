# 🏥 펫클리닉 웹 프론트엔드

> **AWS 3-Tier 아키텍처 학습을 위한 동물병원 웹사이트 템플릿**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![AWS](https://img.shields.io/badge/AWS-S3%20%7C%20CloudFront%20%7C%20Route53-orange)](https://aws.amazon.com/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-purple)](https://getbootstrap.com/)

## 📌 이 프로젝트는 무엇인가요?

**코딩 지식 없이도** JSON 파일만 수정해서 **나만의 동물병원 웹사이트**를 만들 수 있는 템플릿입니다.
주요 목표는 3 Tier 아키텍처를 구성함에 있어서, 펫클리닉 프로젝트를 활용 하면서 WEB 영역에 대해 이해하고 활용 하는 것을 목표로 만들어졌습니다.

- 🎯 **학습 목적**: AWS 클라우드 인프라 3-Tier 아키텍처 이해
- 🚀 **실무 활용**: 실제 동물병원 웹사이트로도 사용 가능
- 📱 **반응형**: 모바일, 태블릿, 데스크톱 완벽 지원
- ☁️ **AWS 배포**: S3 + CloudFront로 전세계 서비스

## 🚀 5분 만에 시작하기

### 1️⃣ 다운로드
```bash
git clone https://github.com/ryong-git/petclinic-web.git
cd petclinic-web
```

### 2️⃣ 병원 정보 수정
`config/clinic-info.json` 파일을 메모장으로 열어서 수정:

```json
{
  "clinic": {
    "name": "우리 동물병원",          ← 병원 이름
    "slogan": "사랑으로 치료합니다",    ← 슬로건  
    "address": "서울시 강남구 xxx",    ← 주소
    "phone": "02-1234-5678",         ← 전화번호
    "email": "info@clinic.com"       ← 이메일
  }
}
```

### 3️⃣ 확인하기
`index.html` 파일을 더블클릭해서 브라우저로 열기

**🎉 완성! 벌써 동물병원 웹사이트가 만들어졌습니다!**

## 🎨 더 예쁘게 꾸미기

### 색상 바꾸기
`config/theme-config.json` 파일 수정:
```json
{
  "theme": {
    "colors": {
      "primary": "#2E8B57",    ← 메인 색상 (초록색)
      "accent": "#FF6B6B"      ← 포인트 색상 (빨간색)
    }
  }
}
```

### 사진 바꾸기
`assets/images/clinic/` 폴더에 새 사진을 넣고 이름을 맞춰주세요:
- `logo.png` - 병원 로고
- `hero.jpg` - 메인 사진
- `interior1.jpg` - 병원 내부 사진

## 🌐 AWS에 올리기 (선택사항)

### 준비물
- AWS 계정 (프리 티어로도 충분)
- AWS CLI 설치

### 업로드하기
```bash
cd aws-deployment
./s3-sync.sh
```

**예상 비용**: 월 $5-10 (프리 티어 사용 시 거의 무료)

## 🔧 Spring Boot 펫클리닉과 연결하기 (고급)

실제 동물병원 관리 시스템과 연결해서 완전한 3-Tier 아키텍처를 구축할 수 있습니다.

### 🚀 빠른 로컬 테스트

```bash
# 1. Spring Boot 펫클리닉 다운로드 & 실행
git clone https://github.com/spring-projects/spring-petclinic.git
cd spring-petclinic
./mvnw spring-boot:run

# 2. 연동 확인
# 브라우저에서 templates/demo.html 열기
```

### ☁️ AWS 완전 배포

**공식 Spring Boot 펫클리닉**: https://github.com/spring-projects/spring-petclinic

```bash
# AWS에서 완전한 3-Tier 구조 자동 배포
./scripts/deploy-full-stack.sh

# 또는 단계별 배포 가이드 따라하기
# 📖 자세한 내용: docs/aws-ec2-nginx-guide.md
```

**사용 가능한 API 엔드포인트:**
- `GET /api/owners` - 보호자 목록
- `GET /api/pets` - 반려동물 목록  
- `GET /api/vets` - 수의사 목록
- `GET /api/visits` - 진료 기록
- `POST /api/owners` - 새 보호자 등록
- `POST /api/pets` - 새 반려동물 등록

## 📁 프로젝트 구조 (간단히)

```
📁 petclinic-web/
├── 📄 index.html              ← 메인 페이지 (여기서 시작!)
├── 📁 config/                 ← 설정 파일 (여기만 수정하면 됨)
│   ├── clinic-info.json      ← 병원 정보
│   └── theme-config.json     ← 색상/테마
├── 📁 templates/              ← 추가 페이지들
│   ├── about.html            ← 병원 소개
│   ├── services.html         ← 진료 안내  
│   ├── contact.html          ← 연락처
│   └── demo.html             ← API 데모
└── 📁 assets/                 ← 디자인 파일들
    ├── css/                  ← 스타일
    ├── js/                   ← 기능
    └── images/               ← 이미지
```

## 🎓 학습 과정 (단계별)

### 🥉 브론즈: 기본 웹사이트 (30분)
1. 프로젝트 다운로드
2. 병원 정보 수정  
3. 색상 변경
4. 사진 교체

### 🥈 실버: AWS 배포 (1시간)
1. AWS 계정 생성
2. S3에 웹사이트 업로드
3. CloudFront CDN 설정
4. 도메인 연결

### 🥇 골드: 완전한 3-Tier 아키텍처 (3시간)
1. AWS 인프라 자동 구축 (`./scripts/deploy-full-stack.sh`)
2. Spring Boot 펫클리닉 WAS 서버 배포
3. CloudFront + 이중 ALB + RDS 연동
4. 아키텍처 완성

## ❓ 자주 묻는 질문

**Q: 코딩을 전혀 모르는데 사용할 수 있나요?**  
A: 네! JSON 파일만 수정하면 됩니다. 메모장으로도 충분해요.

**Q: 실제 동물병원에서 사용해도 되나요?**  
A: 네! 다만 이미지와 연락처는 실제 정보로 바꿔주세요.

**Q: 비용이 얼마나 드나요?**  
A: AWS 프리 티어 사용 시 거의 무료, 이후 월 $5-10 정도입니다.

**Q: 문제가 생기면 어떻게 하나요?**  
A: [Issues](https://github.com/ryong-git/petclinic-web/issues)에 올려주시면 도와드릴게요!

## 📚 학습 가이드

### 🥉 Bronze Level (기초)
- [🏠 로컬 환경 세팅](docs/local-setup-guide.md) - 개발 환경 구성
- [⚙️ JSON 설정 가이드](docs/configuration-guide.md) - 병원 정보 수정
- [🎨 스타일 커스터마이징](docs/style-guide.md) - 디자인 변경

### 🥈 Silver Level (중급)  
- [🌐 Nginx 배포 가이드](docs/nginx-deployment-guide.md) - 전통적 웹서버 배포
- [☁️ AWS 배포 가이드](docs/aws-deployment-guide.md) - 클라우드 배포 방법
- [🔧 백엔드 연동 가이드](docs/backend-integration-guide.md) - Spring Boot 연결
- [📖 학습 시나리오](docs/learning-scenarios.md) - 단계별 학습 과정

### 🥇 Gold Level (고급) - **NEW!**
- [🏗️ AWS EC2 + Nginx + ALB 가이드](docs/aws-ec2-nginx-guide.md) - **완전한 3-Tier 아키텍처**
- [🚀 자동 배포 스크립트](scripts/deploy-full-stack.sh) - **원클릭 인프라 구축**
- [🔗 Spring Boot 펫클리닉 연동](https://github.com/spring-projects/spring-petclinic) - **실제 백엔드 연결**
- [📊 펫클리닉 대시보드](templates/petclinic-dashboard.html) - **실시간 데이터 시각화**

## 📋 새로운 기능들

### 🎯 완전한 3-Tier 아키텍처 구현
```bash
# 배포
./scripts/deploy-full-stack.sh
```

**새로운 아키텍처:**
- **CloudFront CDN** - 글로벌 콘텐츠 전송
- **이중 ALB 구조** - WEB ALB + WAS ALB 분리
- **자동 스케일링** - 트래픽에 따른 자동 확장
- **완전한 보안** - 계층별 보안 그룹 격리

### 🔗 실제 Spring Boot 펫클리닉 연동
```bash
# 공식 펫클리닉과 완전 연동
git clone https://github.com/spring-projects/spring-petclinic.git
```

**사용 가능한 실제 기능:**
- **보호자 관리** - 실제 고객 데이터 CRUD
- **반려동물 등록** - 펫 정보 관리
- **수의사 예약** - 진료 스케줄링  
- **진료 기록** - 의료 데이터 관리
- **📊 실시간 대시보드** - 통계 차트 및 데이터 시각화

### 🛠️ 자동화 도구들
- **`scripts/deploy-full-stack.sh`** - AWS 인프라 자동 구축
- **실시간 헬스체크** - 서비스 상태 모니터링
- **로그 수집** - CloudWatch 통합 모니터링
- **샘플 데이터 로딩** - 한국어 테스트 데이터

## 🏗️ 상세 AWS 3-Tier 아키텍처

```
                           ┌─────────────────────────────────────────────────────────────┐
                           │                    Internet                                   │
                           └─────────────────────────┬───────────────────────────────────┘
                                                     │
                           ┌─────────────────────────▼───────────────────────────────────┐
                           │                Route 53 DNS                                  │
                           │            (petclinic.example.com)                          │
                           └─────────────────────────┬───────────────────────────────────┘
                                                     │
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              🌐 PRESENTATION TIER (CDN)                                │
│                           ┌─────────────────────────────────────────────────────────┐   │
│                           │            CloudFront Distribution                      │   │
│                           │  • Global CDN (Edge Locations)                        │   │
│                           │  • SSL/TLS Termination                                │   │
│                           │  • Static File Caching (CSS, JS, Images)             │   │
│                           │  • API Path Routing (/api/* → ALB)                   │   │
│                           └─────────────────────┬───────────────────────────────────┘   │
└─────────────────────────────────────────────────┼─────────────────────────────────────────┘
                                                   │
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                            🖥️ PRESENTATION TIER (Web Layer)                            │
│    ┌──────────────────────────────────────────────────────────────────────────────────┐ │
│    │                        Application Load Balancer (WEB ALB)                      │ │
│    │  • SSL Termination & Certificate Management                                     │ │
│    │  • Health Check (/health)                                                      │ │
│    │  • Traffic Distribution                                                        │ │
│    │  • Cross-AZ Load Balancing                                                     │ │
│    └──────────────────────────┬─────────────────────┬─────────────────────────────────┘ │
│                               │                     │                                   │
│    ┌─────────────────────────▼─────────────────────▼─────────────────────────────────┐ │
│    │         EC2 Auto Scaling Group (Web Servers)                                   │ │
│    │  ┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐ │ │
│    │  │   EC2 Instance      │    │   EC2 Instance      │    │   EC2 Instance      │ │ │
│    │  │   (AZ-1a)          │    │   (AZ-1b)          │    │   (AZ-1c)          │ │ │
│    │  │  • Nginx Web Server │    │  • Nginx Web Server │    │  • Nginx Web Server │ │ │
│    │  │  • Static Files     │    │  • Static Files     │    │  • Static Files     │ │ │
│    │  │  • Reverse Proxy    │    │  • Reverse Proxy    │    │  • Reverse Proxy    │ │ │
│    │  │  • SSL Offloading   │    │  • SSL Offloading   │    │  • SSL Offloading   │ │ │
│    │  └─────────────────────┘    └─────────────────────┘    └─────────────────────┘ │ │
│    └─────────────────────────┬─────────────────────┬─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────────┘
                               │                     │
                               │   API Requests      │
                               │   (/api/owners,     │
                               │    /api/pets,       │
                               │    /api/vets,       │
                               │    /api/visits)     │
                               │                     │
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           💻 APPLICATION TIER (Business Logic)                         │
│    ┌──────────────────────────────────────────────────────────────────────────────────┐ │
│    │                    Application Load Balancer (WAS ALB)                          │ │
│    │  • Internal Load Balancer (Private Subnets)                                    │ │
│    │  • Health Check (/actuator/health)                                             │ │
│    │  • Session Affinity (if needed)                                                │ │
│    │  • Microservice Routing                                                        │ │
│    └──────────────────────────┬─────────────────────┬─────────────────────────────────┘ │
│                               │                     │                                   │
│    ┌─────────────────────────▼─────────────────────▼─────────────────────────────────┐ │
│    │         EC2 Auto Scaling Group (Application Servers)                           │ │
│    │  ┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐ │ │
│    │  │   EC2 Instance      │    │   EC2 Instance      │    │   EC2 Instance      │ │ │
│    │  │   (AZ-1a)          │    │   (AZ-1b)          │    │   (AZ-1c)          │ │ │
│    │  │ Spring Boot App     │    │ Spring Boot App     │    │ Spring Boot App     │ │ │
│    │  │ ┌─────────────────┐ │    │ ┌─────────────────┐ │    │ ┌─────────────────┐ │ │
│    │  │ │  Petclinic API  │ │    │ │  Petclinic API  │ │    │ │  Petclinic API  │ │ │
│    │  │ │  - Owner CRUD   │ │    │ │  - Owner CRUD   │ │    │ │  - Owner CRUD   │ │ │
│    │  │ │  - Pet CRUD     │ │    │ │  - Pet CRUD     │ │    │ │  - Pet CRUD     │ │ │
│    │  │ │  - Vet Info     │ │    │ │  - Vet Info     │ │    │ │  - Vet Info     │ │ │
│    │  │ │  - Visit Records│ │    │ │  - Visit Records│ │    │ │  - Visit Records│ │ │
│    │  │ └─────────────────┘ │    │ └─────────────────┘ │    │ └─────────────────┘ │ │
│    │  └─────────────────────┘    └─────────────────────┘    └─────────────────────┘ │ │
│    └─────────────────────────┬─────────────────────┬─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────────┘
                               │                     │
                               │   Database Queries  │
                               │   (JPA/Hibernate)   │
                               │                     │
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                             💾 DATA TIER (Persistence Layer)                           │
│    ┌──────────────────────────────────────────────────────────────────────────────────┐ │
│    │                            RDS MySQL Cluster                                    │ │
│    │  ┌─────────────────────────────────────────────────────────────────────────────┐ │ │
│    │  │  Master DB (AZ-1a)                  Read Replica (AZ-1b)                  │ │ │
│    │  │                                                                             │ │ │
│    │  │  Petclinic Database Schema:                                                 │ │ │
│    │  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐            │ │ │
│    │  │  │     owners      │  │      pets       │  │     visits      │            │ │ │
│    │  │  │  - id           │  │  - id           │  │  - id           │            │ │ │
│    │  │  │  - first_name   │  │  - name         │  │  - visit_date   │            │ │ │
│    │  │  │  - last_name    │  │  - birth_date   │  │  - description  │            │ │ │
│    │  │  │  - address      │  │  - type_id  ──┐ │  │  - pet_id   ──┐ │            │ │ │
│    │  │  │  - city         │  │  - owner_id ──┼─┼─▶│              │ │            │ │ │
│    │  │  │  - telephone    │  │               │ │  │              │ │            │ │ │
│    │  │  └─────────────────┘  └─────────────────┘  └─────────────────┘            │ │ │
│    │  │           │                          │                                     │ │ │
│    │  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐            │ │ │
│    │  │  │      types      │  │      vets       │  │  specialties    │            │ │ │
│    │  │  │  - id           │  │  - id           │  │  - id           │            │ │ │
│    │  │  │  - name         │  │  - first_name   │  │  - name         │            │ │ │
│    │  │  │  (강아지,고양이) │  │  - last_name    │  │  (내과,외과)    │            │ │ │
│    │  │  └─────────────────┘  └─────────────────┘  └─────────────────┘            │ │ │
│    │  │                                     │                    │                 │ │ │
│    │  │                       ┌─────────────────────────────────────┐              │ │ │
│    │  │                       │      vet_specialties (N:M)        │              │ │ │
│    │  │                       │  - vet_id                          │              │ │ │
│    │  │                       │  - specialty_id                    │              │ │ │
│    │  │                       └─────────────────────────────────────┘              │ │ │
│    │  └─────────────────────────────────────────────────────────────────────────────┘ │ │
│    │  • Multi-AZ Deployment for High Availability                                   │ │
│    │  • Automated Backups & Point-in-Time Recovery                                  │ │
│    │  • Connection Pooling & SSL Encryption                                         │ │
│    │  • CloudWatch Monitoring & Performance Insights                                │ │
│    └──────────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────────┘

🔒 보안 그룹 및 네트워크 보안:
├── Public Subnets (Web Tier): 인터넷 + ALB 접근만 허용
├── Private Subnets (App Tier): Web Tier에서만 접근 허용
└── Database Subnets (Data Tier): App Tier에서만 접근 허용

📊 모니터링 & 로깅:
├── CloudWatch Metrics & Alarms
├── Application Load Balancer Access Logs
├── VPC Flow Logs
└── RDS Performance Insights
```

**실제 Petclinic 데이터 모델 기반 3-Tier 구조:**
- **Presentation Tier**: 정적 웹 파일 제공 및 사용자 인터페이스
- **Application Tier**: Spring Boot REST API (Owner, Pet, Vet, Visit 비즈니스 로직)  
- **Data Tier**: MySQL 관계형 데이터베이스 (JPA/Hibernate ORM)

**왜 3-Tier인가요?**
- 각 계층을 독립적으로 확장 가능
- 보안성 향상 (계층별 접근 제어)
- 유지보수 용이성
- 실제 기업에서 사용하는 표준 구조

## 🤝 기여하기

이 프로젝트를 더 좋게 만들어주세요!

1. 🍴 Fork하기
2. 🌿 브랜치 만들기 (`git checkout -b feature/awesome-feature`)
3. 💾 커밋하기 (`git commit -m 'Add awesome feature'`)
4. 📤 푸시하기 (`git push origin feature/awesome-feature`)
5. 🔄 Pull Request 보내기

## 📞 도움이 필요하신가요?

- 💬 [GitHub Issues](https://github.com/ryong-git/petclinic-web/issues) - 버그 신고 & 기능 요청
- 💭 [GitHub Discussions](https://github.com/ryong-git/petclinic-web/discussions) - 질문 & 토론

## ⭐ 이 프로젝트가 도움이 되셨다면

**Star ⭐를 눌러주세요!** 여러분의 Star가 더 많은 사람들에게 이 프로젝트를 알릴 수 있습니다.

## 📄 라이선스

MIT License - 자유롭게 사용하세요! 자세한 내용은 [LICENSE](LICENSE) 파일을 확인하세요.

---

<div align="center">

**🐕 Happy Pet Clinic 🐱**

*AWS 3-Tier Architecture Demo for Educational Purpose*

Made with ❤️ for learning AWS

</div>
