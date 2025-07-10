# 🏥 펫클리닉 웹 프론트엔드

> **AWS 3-Tier 아키텍처 학습을 위한 동물병원 웹사이트 템플릿**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![AWS](https://img.shields.io/badge/AWS-S3%20%7C%20CloudFront%20%7C%20Route53-orange)](https://aws.amazon.com/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-purple)](https://getbootstrap.com/)

## 📌 이 프로젝트는 무엇인가요?

**코딩 지식 없이도** JSON 파일만 수정해서 **나만의 동물병원 웹사이트**를 만들 수 있는 템플릿입니다.

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
# AWS에서 완전한 3-Tier 구조 배포
# 자세한 내용은 아래 가이드 참조:
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

### 🥇 골드: 백엔드 연동 (2시간)
1. Spring Boot 서버 실행
2. API 연결 테스트
3. 데이터 관리 기능 사용
4. 완전한 3-Tier 아키텍처 구축

## ❓ 자주 묻는 질문

**Q: 코딩을 전혀 모르는데 사용할 수 있나요?**  
A: 네! JSON 파일만 수정하면 됩니다. 메모장으로도 충분해요.

**Q: 실제 동물병원에서 사용해도 되나요?**  
A: 네! 다만 이미지와 연락처는 실제 정보로 바꿔주세요.

**Q: 비용이 얼마나 드나요?**  
A: AWS 프리 티어 사용 시 거의 무료, 이후 월 $5-10 정도입니다.

**Q: 문제가 생기면 어떻게 하나요?**  
A: [Issues](https://github.com/ryong-git/petclinic-web/issues)에 올려주시면 도와드릴게요!

## 📚 더 자세한 가이드

- [🚀 빠른 시작 가이드](docs/quick-start-guide.md) - 상세한 시작 방법
- [🎨 커스터마이징 가이드](docs/customization-guide.md) - 디자인 변경 방법
- [☁️ AWS 배포 가이드](docs/aws-deployment-guide.md) - 클라우드 배포 방법
- [🔧 백엔드 연동 가이드](docs/backend-integration-guide.md) - Spring Boot 연결
- [📖 학습 시나리오](docs/learning-scenarios.md) - 단계별 학습 과정

## 🏗️ 3-Tier 아키텍처란?

```
👥 사용자 → 🌐 도메인(Route 53) → ☁️ CloudFront → ⚖️ WEB ALB → 🖥️ WEB (EC2/Nginx) 
                                                     ↓
                                                ⚖️ WAS ALB → 💻 WAS (Petclinic) → 💾 RDS
```

**완전한 3-Tier 구조:**
- **Presentation Tier**: CloudFront + WEB ALB + EC2 (Nginx) - 정적 파일 서빙
- **Application Tier**: WAS ALB + EC2 (Spring Boot) - 비즈니스 로직 처리  
- **Data Tier**: RDS (MySQL/PostgreSQL) - 데이터 저장 및 관리

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
- 📧 이메일: ryong.git@gmail.com

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