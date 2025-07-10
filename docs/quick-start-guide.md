# 빠른 시작 가이드

펫클리닉 웹 프론트엔드 프로젝트를 빠르게 시작하는 방법을 안내합니다.

## 🎯 두 가지 사용 방법

### 1️⃣ 정적 웹사이트만 사용 (추천 - 간단함)
- Spring Boot 백엔드 없이 정적 웹사이트만 사용
- AWS S3 + CloudFront로 배포
- 학습 목적에 완벽

### 2️⃣ 백엔드와 연동하여 사용 (고급)
- Spring Boot 펫클리닉과 연동
- 실제 데이터 CRUD 기능
- 완전한 3-Tier 아키텍처

---

## 🚀 방법 1: 정적 웹사이트 (5분 만에 시작)

### 1단계: 프로젝트 다운로드
```bash
git clone https://github.com/your-username/petclinic-web.git
cd petclinic-web
```

### 2단계: 병원 정보 설정
`config/clinic-info.json` 파일 수정:
```json
{
  "clinic": {
    "name": "YOUR_CLINIC_NAME",
    "slogan": "YOUR_SLOGAN",
    "address": "YOUR_ADDRESS",
    "phone": "YOUR_PHONE"
  }
}
```

### 3단계: 웹사이트 확인
브라우저에서 `index.html` 파일 열기

### 4단계: AWS 배포 (선택사항)
```bash
cd aws-deployment
./s3-sync.sh
```

**✅ 완료! 이것만으로도 완전한 동물병원 웹사이트입니다.**

---

## 🔧 방법 2: 백엔드 연동 (30분 소요)

### 1단계: Spring Boot 펫클리닉 준비
```bash
# 별도 폴더에서 실행
git clone https://github.com/spring-projects/spring-petclinic.git
cd spring-petclinic
./mvnw spring-boot:run
```

### 2단계: API 설정 확인
`config/api-config.json` 파일 확인:
```json
{
  "api": {
    "baseUrl": "http://localhost:8080"
  }
}
```

### 3단계: 연동 테스트
브라우저에서 `templates/demo.html` 열고 API 연결 상태 확인

### 4단계: 전체 기능 테스트
- `templates/owners.html` - 보호자 관리
- 데이터 등록/수정/삭제 테스트

---

## 📁 프로젝트 구조 이해

```
petclinic-web/
├── index.html              # 🏠 메인 페이지 (여기서 시작)
├── config/                 # ⚙️ 설정 파일 (여기만 수정하면 됨)
│   ├── clinic-info.json   # 병원 정보
│   └── theme-config.json  # 색상/테마
├── templates/             # 📄 추가 페이지들
│   ├── about.html         # 병원 소개
│   ├── services.html      # 진료 안내  
│   ├── contact.html       # 연락처
│   └── demo.html          # API 데모 (백엔드 연동시)
└── assets/                # 🎨 디자인 및 기능
    ├── css/               # 스타일시트
    ├── js/                # 기능 구현
    └── images/            # 이미지 파일
```

---

## 🎨 커스터마이징 (5분 안에)

### 병원 정보 변경
`config/clinic-info.json` 수정:
- 병원명, 주소, 전화번호
- 진료시간, 서비스 내용
- 의료진 정보

### 색상 테마 변경  
`config/theme-config.json` 수정:
```json
{
  "theme": {
    "colors": {
      "primary": "#2E8B57",    # 메인 색상
      "secondary": "#F0F8FF"   # 보조 색상
    }
  }
}
```

### 이미지 교체
`assets/images/` 폴더에서:
- `clinic/logo.png` - 병원 로고
- `clinic/hero.jpg` - 메인 배너
- `vets/vet1.jpg` - 수의사 사진

---

## 🌐 AWS 배포 (10분 안에)

### 사전 준비
```bash
# AWS CLI 설치 및 설정
aws configure
```

### 자동 배포
```bash
cd aws-deployment
chmod +x s3-sync.sh
./s3-sync.sh
```

### 결과
- S3 정적 웹사이트: `http://bucket-name.s3-website-region.amazonaws.com`
- CloudFront CDN: `https://distribution-id.cloudfront.net`

---

## ❓ 자주 묻는 질문

### Q: 코딩을 모르는데 사용할 수 있나요?
**A: 네! JSON 파일만 수정하면 됩니다.** 
- `config/clinic-info.json` - 병원 정보
- `config/theme-config.json` - 색상/테마

### Q: 백엔드 없이도 되나요?
**A: 네! 정적 웹사이트로도 충분합니다.**
- 병원 소개, 서비스 안내, 연락처 등 모든 기능 포함
- AWS S3로 쉽게 배포 가능

### Q: 비용이 얼마나 드나요?
**A: AWS 프리 티어 사용시 거의 무료입니다.**
- S3: $1-3/월
- CloudFront: $1-5/월
- 총 $2-8/월 예상

### Q: 실제 동물병원에서 사용해도 되나요?
**A: 네! 하지만 다음을 권장합니다:**
- 이미지를 실제 병원 사진으로 교체
- 연락처 정보 정확히 입력
- SSL 인증서 적용 (HTTPS)

### Q: 문제가 생기면 어떻게 하나요?
**A: 다음 순서로 확인하세요:**
1. `templates/demo.html`에서 연결 상태 확인
2. 브라우저 개발자 도구(F12)에서 에러 확인
3. GitHub Issues에 문의

---

## 🎓 학습 경로

### 입문자 (정적 웹사이트)
1. 프로젝트 다운로드
2. 병원 정보 수정
3. 이미지 교체
4. AWS S3 배포

### 중급자 (백엔드 연동)
1. Spring Boot 펫클리닉 실행
2. API 연동 테스트
3. 데이터 관리 기능 사용
4. AWS 3-Tier 배포

### 고급자 (커스터마이징)
1. HTML/CSS 수정
2. 새로운 기능 추가
3. CI/CD 파이프라인 구축
4. 모니터링 및 로깅

---

## 📚 다음 단계

- [커스터마이징 가이드](customization-guide.md) - 상세한 설정 방법
- [AWS 배포 가이드](aws-deployment-guide.md) - 배포 상세 과정  
- [백엔드 연동 가이드](backend-integration-guide.md) - Spring Boot 연동
- [학습 시나리오](learning-scenarios.md) - 단계별 학습 과정

**🎉 축하합니다! 이제 AWS 클라우드 기반 동물병원 웹사이트를 운영할 수 있습니다.**