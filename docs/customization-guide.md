# 커스터마이징 가이드

이 가이드는 펫클리닉 웹사이트를 자신의 동물병원에 맞게 커스터마이징하는 방법을 설명합니다.

## 목차

1. [기본 설정 변경](#기본-설정-변경)
2. [병원 정보 수정](#병원-정보-수정)
3. [테마 및 색상 변경](#테마-및-색상-변경)
4. [이미지 교체](#이미지-교체)
5. [서비스 내용 수정](#서비스-내용-수정)
6. [의료진 정보 변경](#의료진-정보-변경)
7. [소셜 미디어 연결](#소셜-미디어-연결)
8. [고급 커스터마이징](#고급-커스터마이징)

## 기본 설정 변경

### 1. 병원 기본 정보 수정

`config/clinic-info.json` 파일을 수정하세요:

```json
{
  "clinic": {
    "name": "여기에 병원 이름을 입력하세요",
    "slogan": "병원 슬로건을 입력하세요",
    "description": "병원 소개 문구를 입력하세요",
    "address": "병원 주소를 입력하세요",
    "phone": "전화번호를 입력하세요",
    "email": "이메일을 입력하세요",
    "emergencyPhone": "응급 전화번호를 입력하세요"
  }
}
```

### 2. 진료시간 설정

같은 파일에서 진료시간을 수정하세요:

```json
{
  "clinic": {
    "hours": {
      "weekday": "평일 09:00 - 18:00",
      "saturday": "토요일 09:00 - 15:00",
      "sunday": "일요일 휴진",
      "holiday": "공휴일 휴진"
    }
  }
}
```

## 테마 및 색상 변경

### 1. 기본 색상 테마 변경

`config/theme-config.json` 파일을 수정하세요:

```json
{
  "theme": {
    "colors": {
      "primary": "#2E8B57",      // 메인 색상
      "secondary": "#F0F8FF",    // 보조 색상
      "accent": "#FF6B6B",       // 강조 색상
      "background": "#FFFFFF",   // 배경색
      "text": "#333333",         // 텍스트 색상
      "textLight": "#666666"     // 연한 텍스트 색상
    }
  }
}
```

### 2. 색상 테마 예시

#### 파란색 테마
```json
{
  "colors": {
    "primary": "#2563EB",
    "secondary": "#EFF6FF",
    "accent": "#F59E0B",
    "background": "#FFFFFF",
    "text": "#1F2937",
    "textLight": "#6B7280"
  }
}
```

#### 초록색 테마
```json
{
  "colors": {
    "primary": "#059669",
    "secondary": "#ECFDF5",
    "accent": "#DC2626",
    "background": "#FFFFFF",
    "text": "#111827",
    "textLight": "#6B7280"
  }
}
```

#### 보라색 테마
```json
{
  "colors": {
    "primary": "#7C3AED",
    "secondary": "#F3F4F6",
    "accent": "#F59E0B",
    "background": "#FFFFFF",
    "text": "#374151",
    "textLight": "#6B7280"
  }
}
```

## 이미지 교체

### 1. 로고 이미지 교체

1. `assets/images/clinic/` 폴더에 새 로고 이미지를 복사
2. 파일명을 `logo.png`로 변경 (또는 설정에서 파일명 수정)
3. 권장 크기: 200x60px, 투명 배경

### 2. 메인 히어로 이미지 교체

1. `assets/images/clinic/` 폴더에 새 이미지를 복사
2. 파일명을 `hero.jpg`로 변경
3. 권장 크기: 1920x1080px (16:9 비율)

### 3. 병원 내부 사진 교체

1. `assets/images/clinic/` 폴더에 새 이미지들을 복사
2. 파일명을 `interior1.jpg`, `interior2.jpg`, `interior3.jpg`로 변경
3. 권장 크기: 800x600px

### 4. 수의사 프로필 사진 교체

1. `assets/images/vets/` 폴더에 새 사진들을 복사
2. 파일명을 `vet1.jpg`, `vet2.jpg`로 변경
3. 권장 크기: 400x400px (정사각형)

## 서비스 내용 수정

### 1. 진료 서비스 추가/수정

`config/clinic-info.json` 파일에서 서비스 목록을 수정하세요:

```json
{
  "services": [
    {
      "name": "내과 진료",
      "description": "감기, 소화기 질환, 피부병 등 일반적인 질병 진료",
      "icon": "fa-stethoscope"
    },
    {
      "name": "새로운 서비스",
      "description": "서비스 설명을 여기에 입력하세요",
      "icon": "fa-heart"
    }
  ]
}
```

### 2. 사용 가능한 아이콘 목록

Font Awesome 아이콘을 사용할 수 있습니다:

- `fa-stethoscope` (청진기)
- `fa-cut` (수술)
- `fa-heart` (심장)
- `fa-shield-alt` (방패)
- `fa-tooth` (치아)
- `fa-ambulance` (응급차)
- `fa-eye` (눈)
- `fa-paw` (발톱)
- `fa-syringe` (주사기)
- `fa-pills` (약)

## 의료진 정보 변경

### 1. 수의사 정보 수정

`config/clinic-info.json` 파일에서 수의사 정보를 수정하세요:

```json
{
  "veterinarians": [
    {
      "name": "수의사 이름",
      "title": "원장/부원장",
      "specialty": "전문 분야",
      "experience": "경력 년수",
      "education": "학력 정보",
      "description": "소개 문구",
      "image": "vet1.jpg"
    }
  ]
}
```

### 2. 의료진 추가

새로운 의료진을 추가하려면:

1. 배열에 새 객체 추가
2. 해당 이미지 파일을 `assets/images/vets/` 폴더에 추가
3. 파일명을 `image` 필드에 맞게 설정

## 소셜 미디어 연결

### 1. 소셜 미디어 링크 설정

`config/theme-config.json` 파일에서 소셜 미디어 링크를 설정하세요:

```json
{
  "social": {
    "facebook": "https://facebook.com/yourpage",
    "instagram": "https://instagram.com/yourpage",
    "blog": "https://yourblog.com",
    "youtube": "https://youtube.com/yourchannel"
  }
}
```

### 2. 소셜 미디어 표시/숨김

```json
{
  "features": {
    "showSocialLinks": true  // false로 설정하면 숨김
  }
}
```

## 고급 커스터마이징

### 1. 폰트 변경

`config/theme-config.json`에서 폰트를 변경할 수 있습니다:

```json
{
  "theme": {
    "fonts": {
      "primary": "'Noto Sans KR', sans-serif",
      "heading": "'Noto Sans KR', sans-serif"
    }
  }
}
```

### 2. 레이아웃 조정

```json
{
  "theme": {
    "layout": {
      "maxWidth": "1200px",
      "containerPadding": "15px",
      "borderRadius": "8px",
      "boxShadow": "0 2px 10px rgba(0,0,0,0.1)"
    }
  }
}
```

### 3. 응급 배너 설정

```json
{
  "features": {
    "showEmergencyBanner": true,  // 응급 배너 표시 여부
    "showMap": true,             // 지도 표시 여부
    "enableDarkMode": false      // 다크 모드 활성화 여부
  }
}
```

### 4. 시설 정보 수정

```json
{
  "facilities": [
    "최신 디지털 X-ray 장비",
    "초음파 진단 장비",
    "수술실 (무균 시설)",
    "입원실 (24시간 모니터링)",
    "추가 시설 정보"
  ]
}
```

## AWS S3 이미지 사용

### 1. S3 설정

이미지를 AWS S3에 저장하여 사용하려면:

```json
{
  "images": {
    "source": "s3",
    "s3Config": {
      "bucket": "your-bucket-name",
      "region": "ap-northeast-2",
      "basePath": "https://s3.amazonaws.com/your-bucket-name/"
    }
  }
}
```

### 2. 이미지 업로드

```bash
# S3에 이미지 업로드
aws s3 cp assets/images/ s3://your-bucket-name/images/ --recursive
```

## 페이지 내용 수정

### 1. HTML 템플릿 수정

더 세밀한 커스터마이징을 위해 HTML 파일을 직접 수정할 수 있습니다:

- `index.html` - 메인 페이지
- `templates/about.html` - 병원 소개 페이지
- `templates/services.html` - 진료 안내 페이지
- `templates/contact.html` - 연락처 페이지

### 2. CSS 스타일 수정

`assets/css/main.css` 파일을 수정하여 스타일을 변경할 수 있습니다.

### 3. JavaScript 기능 추가

`assets/js/main.js` 파일에서 추가 기능을 구현할 수 있습니다.

## 다국어 지원

### 1. 언어 파일 추가

```json
{
  "ko": {
    "title": "행복한 동물병원",
    "slogan": "우리 가족처럼 소중하게"
  },
  "en": {
    "title": "Happy Pet Clinic",
    "slogan": "Caring for your family"
  }
}
```

### 2. 언어 선택 기능

JavaScript를 통해 언어 전환 기능을 구현할 수 있습니다.

## 모바일 최적화

### 1. 반응형 이미지

```json
{
  "images": {
    "responsive": true,
    "breakpoints": {
      "mobile": "768px",
      "tablet": "1024px",
      "desktop": "1200px"
    }
  }
}
```

### 2. 모바일 메뉴 설정

```json
{
  "mobile": {
    "showEmergencyBanner": true,
    "simplifiedNav": true,
    "touchOptimized": true
  }
}
```

## 성능 최적화

### 1. 이미지 최적화

- 적절한 파일 크기 유지
- WebP 포맷 사용 고려
- 압축률 조정

### 2. 캐싱 설정

```json
{
  "cache": {
    "staticFiles": "1y",
    "html": "1h",
    "json": "no-cache"
  }
}
```

## 문제 해결

### 자주 발생하는 문제들

1. **이미지가 표시되지 않음**
   - 파일 경로 확인
   - 파일 권한 확인
   - 이미지 크기 확인

2. **설정 변경이 반영되지 않음**
   - 브라우저 캐시 클리어
   - JSON 문법 오류 확인
   - 파일 저장 확인

3. **색상 변경이 적용되지 않음**
   - CSS 캐시 클리어
   - 색상 코드 형식 확인
   - 브라우저 개발자 도구 확인

### 디버깅 방법

1. **브라우저 개발자 도구 사용**
   - F12 키로 개발자 도구 열기
   - 콘솔에서 오류 확인
   - 네트워크 탭에서 리소스 로딩 확인

2. **JSON 검증**
   - 온라인 JSON 검증기 사용
   - 콤마, 괄호 확인
   - 따옴표 누락 확인

이 가이드를 참고하여 자신만의 동물병원 웹사이트를 만들어보세요!