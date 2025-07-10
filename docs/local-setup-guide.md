# 🏠 로컬 환경 세팅 가이드

이 가이드는 펫클리닉 웹 프론트엔드를 로컬 환경에서 실행하는 방법을 설명합니다.

## 📋 준비물

### 필수 요구사항
- 💻 웹 브라우저 (Chrome, Firefox, Safari, Edge)
- 📝 텍스트 에디터 (메모장, VS Code, Sublime Text 등)

### 선택사항 (고급 기능용)
- 🔧 Git (버전 관리)
- 🌐 로컬 웹서버 (Python, Node.js, 또는 Live Server)
- ☁️ AWS CLI (클라우드 배포용)

---

## 🚀 빠른 시작 (5분)

### 1단계: 프로젝트 다운로드

#### 방법 A: Git 사용 (권장)
```bash
git clone https://github.com/ryong-git/petclinic-web.git
cd petclinic-web
```

#### 방법 B: ZIP 다운로드
1. GitHub 페이지에서 "Code" → "Download ZIP" 클릭
2. 다운로드된 파일 압축 해제
3. 압축 해제된 폴더로 이동

### 2단계: 파일 확인
```
📁 petclinic-web/
├── 📄 index.html          ← 이 파일을 열면 됩니다!
├── 📁 config/             ← 설정 파일들
├── 📁 templates/          ← 추가 페이지들
└── 📁 assets/             ← CSS, JS, 이미지
```

### 3단계: 웹사이트 열기
`index.html` 파일을 **더블클릭**하면 브라우저에서 열립니다!

---

## 🔧 개발 환경 설정 (선택사항)

### VS Code 사용하기

1. **VS Code 설치**
   - https://code.visualstudio.com/ 에서 다운로드

2. **유용한 확장 프로그램**
   ```
   - Live Server       ← 실시간 미리보기
   - Prettier          ← 코드 정렬
   - Auto Rename Tag   ← HTML 태그 자동 수정
   ```

3. **Live Server로 실행**
   - VS Code에서 `index.html` 우클릭
   - "Open with Live Server" 선택
   - 자동으로 브라우저가 열립니다

### Python 간단 서버

```bash
# Python 3가 설치되어 있다면
cd petclinic-web
python -m http.server 8000

# 브라우저에서 http://localhost:8000 접속
```

### Node.js 간단 서버

```bash
# Node.js가 설치되어 있다면
npm install -g http-server
cd petclinic-web
http-server -p 8000

# 브라우저에서 http://localhost:8000 접속
```

---

## 📂 프로젝트 구조 이해하기

### 🎯 중요한 파일들
- **`index.html`** - 메인 홈페이지
- **`config/clinic-info.json`** - 병원 정보 설정
- **`config/theme-config.json`** - 색상/테마 설정
- **`templates/`** - 추가 페이지들 (소개, 서비스, 연락처)

### 🎨 디자인 파일들
- **`assets/css/main.css`** - 스타일시트
- **`assets/js/main.js`** - 기본 기능
- **`assets/images/`** - 이미지 파일들

---

## 🔍 테스트 체크리스트

웹사이트가 제대로 작동하는지 확인해보세요:

### ✅ 기본 기능
- [ ] 메인 페이지가 정상적으로 로드됨
- [ ] 네비게이션 메뉴가 작동함
- [ ] 모바일에서도 잘 보임 (반응형)
- [ ] 이미지들이 제대로 표시됨

### ✅ 설정 변경
- [ ] `config/clinic-info.json` 수정 후 반영됨
- [ ] `config/theme-config.json` 색상 변경 후 반영됨

### ✅ 추가 페이지
- [ ] About 페이지 접속 가능
- [ ] Services 페이지 접속 가능
- [ ] Contact 페이지 접속 가능

---

## 🆘 문제 해결

### 자주 발생하는 문제들

#### 1. 이미지가 안 보여요
**원인**: 파일 경로 문제
**해결**: 
- 브라우저 개발자 도구(F12) → Console 탭에서 오류 확인
- 이미지 파일이 `assets/images/` 폴더에 있는지 확인

#### 2. JSON 설정이 반영이 안 되요
**원인**: JSON 문법 오류
**해결**:
- JSON 파일을 https://jsonlint.com/ 에서 검사
- 쉼표, 따옴표 누락 확인

#### 3. 모바일에서 레이아웃이 깨져요
**원인**: 뷰포트 설정 문제
**해결**:
- 브라우저 캐시 새로고침 (Ctrl+F5)
- `<meta name="viewport">` 태그 확인

#### 4. 로컬 서버가 필요한 경우
일부 기능은 파일 프로토콜(`file://`)에서 작동하지 않습니다:
- API 호출 기능
- AJAX 요청
- 일부 폰트 로딩

**해결**: 위에서 설명한 로컬 서버 사용

---

## 🎯 다음 단계

로컬 환경 설정이 완료되었다면:

1. **🎨 [스타일 커스터마이징 가이드](style-guide.md)**
2. **⚙️ [JSON 설정 가이드](configuration-guide.md)**
3. **🌐 [Nginx 배포 가이드](nginx-deployment-guide.md)**

---

## 💡 팁과 요령

### 개발 효율성 높이기
- **브라우저 개발자 도구 활용** (F12)
- **실시간 편집 미리보기** (Live Server 사용)
- **Git으로 백업** 관리

### 성능 최적화
- 이미지는 웹용으로 압축 (JPG/PNG → WebP)
- 큰 이미지는 여러 사이즈로 준비
- CSS/JS 파일 최소화

### 접근성 고려사항
- 이미지에 `alt` 태그 추가
- 색상 대비 확인
- 키보드 네비게이션 테스트

---

## 📞 도움이 필요하다면

- 🐛 [GitHub Issues](https://github.com/ryong-git/petclinic-web/issues)
- 💬 [GitHub Discussions](https://github.com/ryong-git/petclinic-web/discussions)
- 📧 이메일: ryong.git@gmail.com

**🎉 로컬 환경 설정이 완료되었습니다!**