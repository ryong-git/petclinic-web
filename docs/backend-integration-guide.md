# Spring Boot 백엔드 연동 가이드

이 가이드는 펫클리닉 웹 프론트엔드를 Spring Boot 백엔드와 연동하는 방법을 설명합니다.

## 📋 개요

이 프로젝트는 다음과 같이 구성됩니다:

```
Frontend (이 프로젝트)     Backend (Spring Boot)
┌─────────────────────┐   ┌─────────────────────┐
│ HTML/CSS/JavaScript │◄──┤ Spring Boot REST API│
│ (Static Website)    │   │ (Petclinic Server)  │
└─────────────────────┘   └─────────────────────┘
```

## 🚀 빠른 시작

### 1. Spring Boot 펫클리닉 준비

```bash
# Spring Boot 펫클리닉 클론
git clone https://github.com/spring-projects/spring-petclinic.git
cd spring-petclinic

# 프로필 설정 (MySQL 사용 시)
./mvnw spring-boot:run -Dspring-boot.run.profiles=mysql

# 또는 기본 H2 데이터베이스 사용
./mvnw spring-boot:run
```

### 2. 프론트엔드 설정

```bash
# API 설정 파일 수정
vi config/api-config.json
```

```json
{
  "api": {
    "baseUrl": "http://localhost:8080",
    "endpoints": {
      "owners": "/api/owners",
      "pets": "/api/pets", 
      "vets": "/api/vets",
      "visits": "/api/visits"
    }
  }
}
```

### 3. 연동 테스트

1. 브라우저에서 `templates/demo.html` 열기
2. API 서버 연결 상태 확인
3. 데이터 로드 테스트

## 🔧 상세 설정

### API 엔드포인트 구성

Spring Boot 펫클리닉의 기본 REST API 엔드포인트:

| 기능 | 메서드 | 엔드포인트 | 설명 |
|------|--------|------------|------|
| 보호자 목록 | GET | `/api/owners` | 모든 보호자 조회 |
| 보호자 상세 | GET | `/api/owners/{id}` | 특정 보호자 조회 |
| 보호자 등록 | POST | `/api/owners` | 새 보호자 등록 |
| 보호자 수정 | PUT | `/api/owners/{id}` | 보호자 정보 수정 |
| 수의사 목록 | GET | `/api/vets` | 모든 수의사 조회 |
| 펫 목록 | GET | `/api/pets` | 모든 펫 조회 |
| 방문 기록 | GET | `/api/visits` | 방문 기록 조회 |

### CORS 설정

Spring Boot 애플리케이션에서 CORS를 활성화해야 합니다:

```java
@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
}
```

### 환경별 설정

#### 개발 환경 (localhost)
```json
{
  "environment": {
    "development": {
      "baseUrl": "http://localhost:8080",
      "enableMocks": false,
      "debugMode": true
    }
  }
}
```

#### 스테이징 환경
```json
{
  "environment": {
    "staging": {
      "baseUrl": "https://staging-api.your-domain.com",
      "enableMocks": false,
      "debugMode": true
    }
  }
}
```

#### 프로덕션 환경
```json
{
  "environment": {
    "production": {
      "baseUrl": "https://api.your-domain.com",
      "enableMocks": false,
      "debugMode": false
    }
  }
}
```

## 📚 API 사용 예시

### JavaScript에서 API 호출

```javascript
// API 클라이언트 초기화 대기
document.addEventListener('apiLoaded', async () => {
    try {
        // 보호자 목록 조회
        const owners = await window.petclinicAPI.getAllOwners();
        console.log('보호자 목록:', owners);
        
        // 수의사 목록 조회
        const vets = await window.petclinicAPI.getAllVets();
        console.log('수의사 목록:', vets);
        
    } catch (error) {
        console.error('API 호출 오류:', error);
    }
});
```

### 새 보호자 등록

```javascript
const newOwner = {
    firstName: "김",
    lastName: "철수", 
    address: "서울시 강남구",
    city: "서울",
    telephone: "010-1234-5678"
};

try {
    const result = await window.petclinicAPI.createOwner(newOwner);
    console.log('등록 성공:', result);
} catch (error) {
    console.error('등록 실패:', error);
}
```

## 🎯 Mock 데이터 모드

백엔드 서버에 연결할 수 없을 때 자동으로 Mock 데이터 모드로 전환됩니다.

### Mock 데이터 활성화

```json
{
  "environment": {
    "development": {
      "enableMocks": true
    }
  },
  "mockData": {
    "enabled": true,
    "responseDelay": 1000
  }
}
```

### Mock 데이터 커스터마이징

`assets/js/api-client.js` 파일에서 Mock 데이터를 수정할 수 있습니다:

```javascript
getMockOwners() {
    return [
        {
            id: 1,
            firstName: "김",
            lastName: "철수",
            address: "서울시 강남구",
            city: "서울",
            telephone: "010-1234-5678"
        }
        // 더 많은 Mock 데이터 추가
    ];
}
```

## 🔍 디버깅 가이드

### 연결 문제 해결

1. **CORS 오류**
   ```
   Access to fetch at 'http://localhost:8080/api/owners' from origin 'null' has been blocked by CORS policy
   ```
   → Spring Boot에 CORS 설정 추가

2. **네트워크 오류**
   ```
   Failed to fetch
   ```
   → 백엔드 서버 실행 상태 확인

3. **404 오류**
   ```
   HTTP 404: Not Found
   ```
   → API 엔드포인트 경로 확인

### 디버그 모드 활성화

```json
{
  "environment": {
    "development": {
      "debugMode": true
    }
  }
}
```

디버그 모드에서는 콘솔에 상세한 로그가 출력됩니다:

```
📍 API Base URL: http://localhost:8080
🎭 Mock mode: false
📡 API Request: GET http://localhost:8080/api/owners
📦 Response: [...]
```

## 🌐 AWS 배포 시 고려사항

### ALB 설정

Application Load Balancer를 통한 API 라우팅:

```
Frontend (S3/CloudFront) → ALB → EC2 (Spring Boot)
```

### 보안 그룹 설정

```bash
# EC2 보안 그룹 (백엔드)
aws ec2 authorize-security-group-ingress \
    --group-id sg-backend \
    --protocol tcp \
    --port 8080 \
    --source-group sg-alb

# ALB 보안 그룹
aws ec2 authorize-security-group-ingress \
    --group-id sg-alb \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0
```

### 환경 변수 설정

```bash
# EC2에서 Spring Boot 실행 시
export SPRING_PROFILES_ACTIVE=production
export SPRING_DATASOURCE_URL=jdbc:mysql://rds-endpoint:3306/petclinic
java -jar petclinic.jar
```

## 📊 성능 최적화

### API 캐싱

```javascript
// 브라우저 캐시 활용
const cacheOptions = {
    method: 'GET',
    headers: {
        'Cache-Control': 'max-age=300' // 5분 캐싱
    }
};
```

### 요청 최적화

```javascript
// 병렬 요청 처리
const [owners, vets, pets] = await Promise.all([
    window.petclinicAPI.getAllOwners(),
    window.petclinicAPI.getAllVets(),
    window.petclinicAPI.getAllPets()
]);
```

### 에러 재시도

API 클라이언트에서 자동 재시도가 구현되어 있습니다:

```javascript
// 재시도 설정
{
  "api": {
    "retryAttempts": 3,
    "timeout": 5000
  }
}
```

## 🛠️ 개발 워크플로우

### 1. 백엔드 먼저 개발
```bash
# Spring Boot 애플리케이션 실행
./mvnw spring-boot:run

# API 테스트
curl http://localhost:8080/api/owners
```

### 2. 프론트엔드 연동
```bash
# 브라우저에서 demo.html 열기
open templates/demo.html

# 또는 로컬 서버 실행
python -m http.server 3000
```

### 3. 통합 테스트
```bash
# API 연결 확인
# 데이터 CRUD 테스트
# 에러 처리 확인
```

## 🔐 보안 고려사항

### API 키 관리

프로덕션 환경에서는 API 키 또는 JWT 토큰 사용:

```javascript
// 인증 헤더 추가
{
  "headers": {
    "Authorization": "Bearer your-jwt-token",
    "Content-Type": "application/json"
  }
}
```

### HTTPS 사용

```json
{
  "environment": {
    "production": {
      "baseUrl": "https://api.your-domain.com"
    }
  }
}
```

## 📝 문제 해결 체크리스트

- [ ] Spring Boot 서버가 실행 중인가?
- [ ] CORS 설정이 올바른가?
- [ ] API 엔드포인트 경로가 정확한가?
- [ ] 네트워크 연결에 문제가 없는가?
- [ ] 브라우저 개발자 도구에서 에러를 확인했는가?
- [ ] Mock 모드가 올바르게 동작하는가?

## 📖 추가 자료

- [Spring Boot 펫클리닉 저장소](https://github.com/spring-projects/spring-petclinic)
- [Spring Boot REST API 가이드](https://spring.io/guides/gs/rest-service/)
- [CORS 설정 가이드](https://spring.io/blog/2015/06/08/cors-support-in-spring-framework)
- [JavaScript Fetch API 문서](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

이 가이드를 통해 프론트엔드와 백엔드를 성공적으로 연동할 수 있습니다. 추가 질문이 있으면 GitHub Issues를 통해 문의해 주세요.