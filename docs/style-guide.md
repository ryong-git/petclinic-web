# 🎨 스타일 커스터마이징 가이드

이 가이드는 CSS를 사용해서 펫클리닉 웹사이트의 디자인을 자유롭게 변경하는 방법을 설명합니다.

## 📋 스타일 파일 구조

```
📁 assets/css/
├── 📄 main.css              ← 메인 스타일시트 (여기서 수정!)
├── 📄 variables.css         ← CSS 변수 정의
└── 📄 components.css        ← 컴포넌트별 스타일
```

---

## 🎨 색상 커스터마이징

### 🌈 CSS 변수 활용

`assets/css/variables.css` 파일에서 색상을 한 번에 변경할 수 있습니다:

```css
:root {
  /* 메인 컬러 팔레트 */
  --primary-color: #2E8B57;      /* 메인 색상 */
  --secondary-color: #4682B4;    /* 보조 색상 */  
  --accent-color: #FF6B6B;       /* 강조 색상 */
  
  /* 상태별 색상 */
  --success-color: #28a745;      /* 성공 */
  --warning-color: #ffc107;      /* 경고 */
  --danger-color: #dc3545;       /* 위험 */
  --info-color: #17a2b8;         /* 정보 */
  
  /* 배경 및 텍스트 */
  --bg-primary: #ffffff;         /* 메인 배경 */
  --bg-secondary: #f8f9fa;       /* 보조 배경 */
  --text-primary: #333333;       /* 메인 텍스트 */
  --text-secondary: #6c757d;     /* 보조 텍스트 */
  --text-muted: #9ca3af;         /* 연한 텍스트 */
}
```

### 🎭 미리 만들어진 색상 테마

#### 🌿 자연 테마
```css
:root {
  --primary-color: #2E8B57;      /* 숲속 초록 */
  --secondary-color: #90EE90;    /* 연한 초록 */
  --accent-color: #FFD700;       /* 황금색 */
  --bg-primary: #F0FFF0;         /* 허니듀 */
}
```

#### 🌊 바다 테마
```css
:root {
  --primary-color: #4682B4;      /* 스틸 블루 */
  --secondary-color: #87CEEB;    /* 스카이 블루 */
  --accent-color: #20B2AA;       /* 라이트 씨 그린 */
  --bg-primary: #F0F8FF;         /* 앨리스 블루 */
}
```

#### 🌸 따뜻함 테마
```css
:root {
  --primary-color: #CD5C5C;      /* 인디언 레드 */
  --secondary-color: #FFB6C1;    /* 라이트 핑크 */
  --accent-color: #FFA500;       /* 오렌지 */
  --bg-primary: #FFF5EE;         /* 씨셸 */
}
```

#### 🌙 다크 테마
```css
:root {
  --primary-color: #6366f1;      /* 인디고 */
  --secondary-color: #8b5cf6;    /* 바이올렛 */
  --accent-color: #06b6d4;       /* 시안 */
  --bg-primary: #1f2937;         /* 다크 그레이 */
  --bg-secondary: #374151;       /* 그레이 */
  --text-primary: #f9fafb;       /* 라이트 그레이 */
  --text-secondary: #d1d5db;     /* 중간 그레이 */
}
```

---

## 🔤 폰트 커스터마이징

### 📝 기본 폰트 설정

```css
:root {
  /* 폰트 패밀리 */
  --font-primary: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-heading: 'Noto Sans KR', Georgia, serif;
  --font-code: 'Fira Code', 'Courier New', monospace;
  
  /* 폰트 크기 */
  --font-size-xs: 0.75rem;       /* 12px */
  --font-size-sm: 0.875rem;      /* 14px */
  --font-size-base: 1rem;        /* 16px */
  --font-size-lg: 1.125rem;      /* 18px */
  --font-size-xl: 1.25rem;       /* 20px */
  --font-size-2xl: 1.5rem;       /* 24px */
  --font-size-3xl: 1.875rem;     /* 30px */
  --font-size-4xl: 2.25rem;      /* 36px */
  
  /* 폰트 굵기 */
  --font-weight-light: 300;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
}
```

### 🌐 웹 폰트 추가

HTML `<head>` 섹션에 추가:

```html
<!-- Google Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet">

<!-- 또는 다른 폰트들 -->
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
```

CSS에서 사용:

```css
:root {
  --font-primary: 'Roboto', sans-serif;
  --font-heading: 'Playfair Display', serif;
}
```

---

## 🏗️ 레이아웃 커스터마이징

### 📐 간격 시스템

```css
:root {
  /* 여백 시스템 */
  --spacing-xs: 0.25rem;         /* 4px */
  --spacing-sm: 0.5rem;          /* 8px */
  --spacing-md: 1rem;            /* 16px */
  --spacing-lg: 1.5rem;          /* 24px */
  --spacing-xl: 2rem;            /* 32px */
  --spacing-2xl: 3rem;           /* 48px */
  --spacing-3xl: 4rem;           /* 64px */
  
  /* 컨테이너 최대 너비 */
  --container-sm: 640px;
  --container-md: 768px;
  --container-lg: 1024px;
  --container-xl: 1280px;
}
```

### 📱 반응형 브레이크포인트

```css
/* 모바일 우선 접근법 */
.container {
  width: 100%;
  padding: 0 var(--spacing-md);
}

/* 태블릿 (768px 이상) */
@media (min-width: 768px) {
  .container {
    max-width: var(--container-md);
    margin: 0 auto;
  }
}

/* 데스크톱 (1024px 이상) */
@media (min-width: 1024px) {
  .container {
    max-width: var(--container-lg);
  }
}

/* 대형 화면 (1280px 이상) */
@media (min-width: 1280px) {
  .container {
    max-width: var(--container-xl);
  }
}
```

---

## 🎪 컴포넌트 스타일링

### 🎯 헤더 커스터마이징

```css
/* 헤더 기본 스타일 */
.header {
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* 투명 헤더 */
.header.transparent {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

/* 고정 헤더 */
.header.sticky {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

/* 로고 스타일 */
.navbar-brand {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.logo {
  height: 40px;
  width: auto;
}
```

### 🎨 버튼 스타일링

```css
/* 기본 버튼 */
.btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: 6px;
  font-weight: var(--font-weight-medium);
  text-decoration: none;
  display: inline-block;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
}

/* 메인 버튼 */
.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: color-mix(in srgb, var(--primary-color) 85%, black);
  transform: translateY(-2px);
}

/* 윤곽선 버튼 */
.btn-outline {
  background: transparent;
  color: var(--primary-color);
  border: 2px solid var(--primary-color);
}

.btn-outline:hover {
  background: var(--primary-color);
  color: white;
}

/* 둥근 버튼 */
.btn-rounded {
  border-radius: 50px;
}

/* 큰 버튼 */
.btn-lg {
  padding: var(--spacing-md) var(--spacing-2xl);
  font-size: var(--font-size-lg);
}
```

### 🃏 카드 스타일링

```css
/* 기본 카드 */
.card {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: var(--spacing-lg);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

/* 글래스모피즘 카드 */
.card-glass {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

/* 그라데이션 카드 */
.card-gradient {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
}
```

---

## ✨ 애니메이션 효과

### 🎭 기본 애니메이션

```css
/* 페이드인 효과 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.6s ease-out;
}

/* 스케일 효과 */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.scale-in {
  animation: scaleIn 0.4s ease-out;
}

/* 슬라이드 효과 */
@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.slide-in-left {
  animation: slideInLeft 0.5s ease-out;
}
```

### 🎪 호버 효과

```css
/* 부드러운 확대 */
.hover-scale {
  transition: transform 0.3s ease;
}

.hover-scale:hover {
  transform: scale(1.05);
}

/* 그림자 효과 */
.hover-shadow {
  transition: box-shadow 0.3s ease;
}

.hover-shadow:hover {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

/* 색상 변화 */
.hover-color {
  transition: color 0.3s ease;
}

.hover-color:hover {
  color: var(--accent-color);
}
```

---

## 🌟 고급 스타일링 기법

### 🎨 그라데이션 배경

```css
/* 선형 그라데이션 */
.gradient-bg {
  background: linear-gradient(135deg, 
    var(--primary-color) 0%, 
    var(--secondary-color) 100%);
}

/* 원형 그라데이션 */
.radial-gradient-bg {
  background: radial-gradient(circle at center, 
    var(--primary-color) 0%, 
    var(--secondary-color) 100%);
}

/* 애니메이션 그라데이션 */
.animated-gradient {
  background: linear-gradient(-45deg, 
    var(--primary-color), 
    var(--secondary-color), 
    var(--accent-color), 
    var(--primary-color));
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```

### 🎭 CSS Grid 레이아웃

```css
/* 서비스 그리드 */
.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
  padding: var(--spacing-xl) 0;
}

/* 수의사 프로필 그리드 */
.vets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
}

/* 갤러리 그리드 */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  grid-auto-rows: 200px;
  gap: var(--spacing-md);
}
```

### 🎪 플렉스박스 레이아웃

```css
/* 중앙 정렬 */
.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 공간 분배 */
.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 반응형 플렉스 */
.flex-responsive {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-lg);
}

.flex-responsive > * {
  flex: 1;
  min-width: 250px;
}
```

---

## 📱 모바일 최적화

### 📲 터치 친화적 디자인

```css
/* 터치 타겟 크기 */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  padding: var(--spacing-sm);
}

/* 모바일 네비게이션 */
@media (max-width: 767px) {
  .mobile-menu {
    position: fixed;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100vh;
    background: var(--bg-primary);
    transition: left 0.3s ease;
    z-index: 9999;
  }
  
  .mobile-menu.active {
    left: 0;
  }
  
  .mobile-menu-item {
    padding: var(--spacing-lg);
    border-bottom: 1px solid var(--border-color);
  }
}
```

### 🎯 성능 최적화

```css
/* GPU 가속 사용 */
.gpu-accelerated {
  transform: translateZ(0);
  will-change: transform;
}

/* 레이아웃 리플로우 방지 */
.no-reflow {
  contain: layout style paint;
}

/* 이미지 최적화 */
.optimized-image {
  object-fit: cover;
  object-position: center;
  loading: lazy;
}
```

---

## 🔍 디버깅 도구

### 🛠️ CSS 디버깅

```css
/* 레이아웃 디버깅 */
.debug * {
  outline: 1px solid red !important;
}

.debug-grid {
  background-image: 
    linear-gradient(rgba(255,0,0,0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,0,0,0.1) 1px, transparent 1px);
  background-size: 20px 20px;
}

/* 접근성 디버깅 */
.debug-a11y *:focus {
  outline: 3px solid #ff6b6b !important;
  outline-offset: 2px !important;
}
```

### 📊 CSS 프로파일링

```css
/* 성능 측정 */
.perf-test {
  will-change: transform;
  transform: translateZ(0);
}

/* 메모리 사용량 최적화 */
.memory-optimized {
  contain: layout style paint;
  content-visibility: auto;
  contain-intrinsic-size: 200px;
}
```

---

## 🎯 실습 과제

### 🥉 Bronze Level
1. 메인 색상을 좋아하는 색으로 변경
2. 헤더에 그림자 효과 추가
3. 버튼에 호버 애니메이션 적용

### 🥈 Silver Level
1. 카드 컴포넌트에 글래스모피즘 효과 적용
2. 그라데이션 배경 섹션 추가
3. 모바일 반응형 네비게이션 구현

### 🥇 Gold Level
1. 완전한 다크 테마 구현
2. CSS Grid를 활용한 복잡한 레이아웃 설계
3. 사용자 정의 애니메이션 효과 제작

---

## 💡 팁과 요령

### 🎨 디자인 원칙
- **일관성**: 색상, 간격, 타이포그래피 일관성 유지
- **대비**: 텍스트 가독성을 위한 충분한 색상 대비
- **계층**: 시각적 계층구조로 정보 우선순위 표현

### 🚀 성능 최적화
- **CSS 변수 활용**: 재사용 가능한 값들을 변수로 정의
- **미디어 쿼리 최적화**: 모바일 우선 접근법 사용
- **애니메이션 최적화**: `transform`과 `opacity` 속성 우선 사용

### 🔧 유지보수
- **모듈화**: 기능별로 CSS 파일 분리
- **명명 규칙**: BEM 방법론 등 일관된 클래스 명명
- **주석 활용**: 복잡한 스타일에 설명 주석 추가

---

## 📞 도움이 필요하다면

- 🐛 [GitHub Issues](https://github.com/ryong-git/petclinic-web/issues)
- 💬 [GitHub Discussions](https://github.com/ryong-git/petclinic-web/discussions)
- 📧 이메일: ryong.git@gmail.com

**🎉 스타일 마스터가 되셨습니다!**