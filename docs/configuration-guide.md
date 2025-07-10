# ⚙️ JSON 설정 가이드

이 가이드는 **코딩 지식 없이도** JSON 파일만 수정해서 펫클리닉 웹사이트를 커스터마이징하는 방법을 설명합니다.

## 📋 설정 파일 개요

```
📁 config/
├── 📄 clinic-info.json     ← 병원 기본 정보
├── 📄 theme-config.json    ← 색상 및 테마
└── 📄 api-config.json      ← API 연동 설정
```

---

## 🏥 병원 정보 설정 (`clinic-info.json`)

### 📍 기본 정보 수정

```json
{
  "clinic": {
    "name": "우리 동물병원",
    "slogan": "사랑으로 치료합니다",
    "description": "20년 경력의 전문 수의사가 운영하는 신뢰할 수 있는 동물병원입니다.",
    "established": "2004년",
    "address": "서울시 강남구 테헤란로 123",
    "city": "서울",
    "postalCode": "06234",
    "phone": "02-1234-5678",
    "email": "info@clinic.com",
    "website": "https://clinic.com",
    "hours": {
      "weekdays": "오전 9시 - 오후 7시",
      "saturday": "오전 9시 - 오후 5시", 
      "sunday": "오전 10시 - 오후 4시",
      "holidays": "휴진 (응급시 연락)"
    }
  }
}
```

### 🔧 수정 방법

1. **메모장으로 파일 열기**
   - `config/clinic-info.json` 파일을 메모장에서 열기

2. **원하는 정보로 변경**
   ```json
   "name": "행복한 펫 클리닉",           ← 병원 이름
   "slogan": "반려동물이 행복한 곳",      ← 슬로건
   "phone": "031-9876-5432",           ← 전화번호
   "address": "경기도 성남시 분당구..."   ← 주소
   ```

3. **파일 저장** (Ctrl+S)

4. **브라우저 새로고침** (F5)

### 🏥 진료 서비스 설정

```json
{
  "services": [
    {
      "id": "general",
      "name": "일반 진료",
      "description": "기본적인 건강검진과 질병 치료",
      "icon": "fas fa-stethoscope",
      "price": "30,000원~",
      "duration": "30분"
    },
    {
      "id": "surgery", 
      "name": "외과 수술",
      "description": "전문적인 외과 수술 및 처치",
      "icon": "fas fa-cut",
      "price": "100,000원~",
      "duration": "1-3시간"
    },
    {
      "id": "vaccination",
      "name": "예방접종", 
      "description": "필수 예방접종 및 건강관리",
      "icon": "fas fa-syringe",
      "price": "25,000원~",
      "duration": "15분"
    }
  ]
}
```

### 👨‍⚕️ 수의사 정보 설정

```json
{
  "veterinarians": [
    {
      "id": "dr-kim",
      "name": "김수의",
      "title": "원장",
      "specialties": ["내과", "피부과"],
      "experience": "15년",
      "education": "서울대 수의과대학",
      "image": "assets/images/staff/dr-kim.jpg",
      "bio": "소동물 내과 전문의로 15년간 임상경험을 쌓았습니다."
    },
    {
      "id": "dr-lee", 
      "name": "이동물",
      "title": "부원장",
      "specialties": ["외과", "정형외과"],
      "experience": "12년",
      "education": "건국대 수의과대학", 
      "image": "assets/images/staff/dr-lee.jpg",
      "bio": "동물 외과 수술 전문가입니다."
    }
  ]
}
```

---

## 🎨 테마 및 색상 설정 (`theme-config.json`)

### 🌈 색상 변경

```json
{
  "theme": {
    "colors": {
      "primary": "#2E8B57",        ← 메인 색상 (헤더, 버튼)
      "secondary": "#4682B4",      ← 보조 색상
      "accent": "#FF6B6B",         ← 강조 색상 (링크, 아이콘)
      "success": "#28a745",        ← 성공 메시지
      "warning": "#ffc107",        ← 경고 메시지
      "danger": "#dc3545",         ← 오류 메시지
      "background": "#f8f9fa",     ← 배경색
      "text": "#333333"            ← 기본 텍스트 색상
    },
    "fonts": {
      "primary": "Noto Sans KR",   ← 메인 폰트
      "heading": "Noto Sans KR",   ← 제목 폰트
      "size": {
        "base": "16px",            ← 기본 글자 크기
        "small": "14px",           ← 작은 글자
        "large": "18px"            ← 큰 글자
      }
    }
  }
}
```

### 🎭 미리 만들어진 테마

#### 🌿 자연 테마
```json
{
  "colors": {
    "primary": "#2E8B57",
    "accent": "#90EE90",
    "background": "#F0FFF0"
  }
}
```

#### 🌊 바다 테마  
```json
{
  "colors": {
    "primary": "#4682B4", 
    "accent": "#87CEEB",
    "background": "#F0F8FF"
  }
}
```

#### 🌸 따뜻함 테마
```json
{
  "colors": {
    "primary": "#CD5C5C",
    "accent": "#FFB6C1", 
    "background": "#FFF5EE"
  }
}
```

---

## 🔗 API 연동 설정 (`api-config.json`)

### 🖥️ 서버 주소 설정

```json
{
  "api": {
    "environments": {
      "development": {
        "baseUrl": "http://localhost:8080",
        "timeout": 5000,
        "retryAttempts": 3
      },
      "staging": {
        "baseUrl": "https://staging-api.clinic.com", 
        "timeout": 10000,
        "retryAttempts": 2
      },
      "production": {
        "baseUrl": "https://api.clinic.com",
        "timeout": 10000, 
        "retryAttempts": 1
      }
    },
    "currentEnvironment": "development"    ← 현재 사용할 환경
  }
}
```

### 📡 API 엔드포인트 설정

```json
{
  "endpoints": {
    "owners": "/api/owners",
    "pets": "/api/pets", 
    "vets": "/api/vets",
    "visits": "/api/visits",
    "appointments": "/api/appointments"
  },
  "mockData": {
    "enabled": true,                      ← Mock 데이터 사용 여부
    "fallbackOnError": true               ← API 오류시 Mock 데이터로 대체
  }
}
```

---

## ✅ JSON 문법 규칙

### 🔤 기본 규칙
1. **따옴표 사용**: 모든 문자열은 큰따옴표(`"`)로 감싸기
2. **쉼표 사용**: 마지막 항목 제외하고 모든 항목 뒤에 쉼표
3. **중괄호**: 객체는 `{}`, 배열은 `[]` 사용

### ❌ 흔한 실수들

```json
// ❌ 틀린 예시
{
  name: "병원 이름",           // 키에 따옴표 없음
  "phone": '010-1234-5678',   // 작은따옴표 사용 
  "services": [
    "진료",
    "수술",                   // 마지막 항목에 쉼표
  ]
}

// ✅ 올바른 예시  
{
  "name": "병원 이름",
  "phone": "010-1234-5678",
  "services": [
    "진료",
    "수술"
  ]
}
```

### 🔍 JSON 검증 도구
- **온라인 검사**: https://jsonlint.com/
- **VS Code**: JSON 파일 열면 자동으로 오류 표시

---

## 🖼️ 이미지 설정

### 📁 이미지 파일 위치
```
📁 assets/images/
├── 📁 clinic/
│   ├── logo.png            ← 병원 로고
│   ├── hero.jpg            ← 메인 배너 이미지  
│   └── interior1.jpg       ← 병원 내부 사진
├── 📁 staff/
│   ├── dr-kim.jpg          ← 수의사 프로필
│   └── dr-lee.jpg
└── 📁 services/
    ├── general.jpg         ← 서비스 이미지들
    └── surgery.jpg
```

### 🎨 이미지 권장 규격
- **로고**: 200x60px (PNG, 투명배경)
- **메인 배너**: 1920x600px (JPG)
- **프로필**: 300x300px (JPG, 정사각형)
- **서비스**: 400x300px (JPG)

---

## 📱 반응형 설정

### 📐 화면 크기별 설정
```json
{
  "responsive": {
    "breakpoints": {
      "mobile": "768px",
      "tablet": "992px", 
      "desktop": "1200px"
    },
    "navigation": {
      "mobileMenu": true,
      "stickyHeader": true
    }
  }
}
```

---

## 🔍 문제 해결 가이드

### 1. 변경사항이 반영되지 않을 때
- **브라우저 캐시 삭제**: Ctrl+Shift+R (강력 새로고침)
- **파일 저장 확인**: JSON 파일을 저장했는지 확인
- **문법 오류 검사**: JSON 유효성 검사 도구 사용

### 2. 이미지가 표시되지 않을 때  
- **파일 경로 확인**: 대소문자 구분
- **파일 형식 확인**: JPG, PNG 권장
- **파일 크기 확인**: 5MB 이하 권장

### 3. 색상이 변경되지 않을 때
- **색상 코드 형식**: `#RRGGBB` 또는 `#RGB` 형식 사용
- **CSS 캐시**: 브라우저 개발자 도구에서 "Disable cache" 체크

---

## 🎯 실습 과제

### 🥉 Bronze Level
1. 병원 이름을 "우리 반려동물 병원"으로 변경
2. 전화번호를 본인 지역번호로 변경
3. 메인 색상을 파란색(`#4682B4`)으로 변경

### 🥈 Silver Level  
1. 새로운 진료 서비스 추가
2. 수의사 정보 2명 이상 추가
3. 병원 운영시간 실제 정보로 변경

### 🥇 Gold Level
1. 완전히 다른 동물병원으로 리브랜딩
2. 모든 이미지를 새로운 이미지로 교체  
3. 사용자 정의 색상 테마 적용

---

## 📞 도움이 필요하다면

- 🐛 [GitHub Issues](https://github.com/ryong-git/petclinic-web/issues)
- 💬 [GitHub Discussions](https://github.com/ryong-git/petclinic-web/discussions)  
- 📧 이메일: ryong.git@gmail.com

**🎉 JSON 설정을 마스터했습니다!**