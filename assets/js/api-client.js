/**
 * API Client for Spring Boot Petclinic Backend
 * Spring Boot 펫클리닉 백엔드와의 통신을 담당하는 클라이언트
 */

class PetclinicAPIClient {
    constructor() {
        this.config = null;
        this.baseUrl = 'http://localhost:8080';
        this.endpoints = {};
        this.isLoaded = false;
        this.mockMode = false;
        this.retryAttempts = 3;
        this.timeout = 5000;
    }

    /**
     * API 설정 로드
     */
    async loadConfig() {
        try {
            const configPath = this.getBasePath() + 'config/api-config.json';
            const response = await fetch(configPath);
            
            if (!response.ok) {
                throw new Error('Failed to load API configuration');
            }

            this.config = await response.json();
            this.applyConfig();
            this.isLoaded = true;
            
            console.log('✅ API Client initialized successfully');
        } catch (error) {
            console.error('❌ Error loading API configuration:', error);
            this.loadFallbackConfig();
        }
    }

    /**
     * 기본 경로 계산
     */
    getBasePath() {
        const currentPath = window.location.pathname;
        if (currentPath.includes('/templates/')) {
            return '../';
        }
        return './';
    }

    /**
     * 설정 적용
     */
    applyConfig() {
        const env = this.getEnvironment();
        const envConfig = this.config.environment[env];
        
        this.baseUrl = envConfig.baseUrl || this.config.api.baseUrl;
        this.endpoints = this.config.api.endpoints;
        this.timeout = this.config.api.timeout || 5000;
        this.retryAttempts = this.config.api.retryAttempts || 3;
        this.mockMode = envConfig.enableMocks || false;

        // 디버그 모드 설정
        if (envConfig.debugMode) {
            window.petclinicDebug = true;
            console.log('🔧 Debug mode enabled');
            console.log('📍 API Base URL:', this.baseUrl);
            console.log('🎭 Mock mode:', this.mockMode);
        }
    }

    /**
     * 환경 감지
     */
    getEnvironment() {
        const hostname = window.location.hostname;
        
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'development';
        } else if (hostname.includes('staging')) {
            return 'staging';
        } else {
            return 'production';
        }
    }

    /**
     * 폴백 설정 로드
     */
    loadFallbackConfig() {
        this.config = {
            api: {
                baseUrl: 'http://localhost:8080',
                endpoints: {
                    owners: '/api/owners',
                    pets: '/api/pets',
                    vets: '/api/vets',
                    visits: '/api/visits'
                }
            },
            environment: {
                development: {
                    enableMocks: true,
                    debugMode: true
                }
            }
        };
        
        this.applyConfig();
        this.isLoaded = true;
        console.warn('⚠️ Using fallback API configuration');
    }

    /**
     * HTTP 요청 실행
     */
    async request(endpoint, options = {}) {
        if (!this.isLoaded) {
            await this.loadConfig();
        }

        const url = this.baseUrl + endpoint;
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...this.config?.api?.headers
            },
            timeout: this.timeout
        };

        const requestOptions = { ...defaultOptions, ...options };

        // Mock 모드인 경우 Mock 데이터 반환
        if (this.mockMode) {
            return this.getMockResponse(endpoint, requestOptions.method);
        }

        let lastError;
        
        // 재시도 로직
        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.timeout);

                const response = await fetch(url, {
                    ...requestOptions,
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                
                if (window.petclinicDebug) {
                    console.log(`📡 API Request: ${requestOptions.method} ${url}`);
                    console.log('📦 Response:', data);
                }

                return data;

            } catch (error) {
                lastError = error;
                
                if (window.petclinicDebug) {
                    console.warn(`🔄 API Request failed (attempt ${attempt}/${this.retryAttempts}):`, error.message);
                }

                // 마지막 시도가 아닌 경우 잠시 대기
                if (attempt < this.retryAttempts) {
                    await this.delay(1000 * attempt);
                }
            }
        }

        // 모든 재시도 실패
        console.error('❌ API Request failed after all retries:', lastError);
        throw lastError;
    }

    /**
     * GET 요청
     */
    async get(endpoint, params = {}) {
        const url = new URL(this.baseUrl + endpoint);
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                url.searchParams.append(key, params[key]);
            }
        });

        return this.request(url.pathname + url.search);
    }

    /**
     * POST 요청
     */
    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * PUT 요청
     */
    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * DELETE 요청
     */
    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }

    /**
     * 지연 함수
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Mock 응답 생성
     */
    async getMockResponse(endpoint, method) {
        // Mock 응답 지연 시뮬레이션
        const delay = this.config?.mockData?.responseDelay || 1000;
        await this.delay(delay);

        console.log('🎭 Mock response for:', method, endpoint);

        // 엔드포인트별 Mock 데이터
        if (endpoint.includes('/api/owners')) {
            return this.getMockOwners();
        } else if (endpoint.includes('/api/pets')) {
            return this.getMockPets();
        } else if (endpoint.includes('/api/vets')) {
            return this.getMockVets();
        } else if (endpoint.includes('/api/visits')) {
            return this.getMockVisits();
        } else if (endpoint.includes('/api/specialties')) {
            return this.getMockSpecialties();
        } else if (endpoint.includes('/api/pettypes')) {
            return this.getMockPetTypes();
        }

        return { data: [], message: 'Mock data not available for this endpoint' };
    }

    /**
     * Mock 데이터 - 보호자
     */
    getMockOwners() {
        return [
            {
                id: 1,
                firstName: "김",
                lastName: "철수",
                address: "서울시 강남구 테헤란로 123",
                city: "서울",
                telephone: "010-1234-5678",
                pets: [
                    { id: 1, name: "멍멍이", type: "강아지", birthDate: "2020-05-15" }
                ]
            },
            {
                id: 2,
                firstName: "이",
                lastName: "영희",
                address: "서울시 서초구 반포대로 456",
                city: "서울", 
                telephone: "010-9876-5432",
                pets: [
                    { id: 2, name: "야옹이", type: "고양이", birthDate: "2019-03-22" }
                ]
            }
        ];
    }

    /**
     * Mock 데이터 - 펫
     */
    getMockPets() {
        return [
            {
                id: 1,
                name: "멍멍이",
                birthDate: "2020-05-15",
                type: { id: 1, name: "강아지" },
                owner: { id: 1, firstName: "김", lastName: "철수" },
                visits: []
            },
            {
                id: 2,
                name: "야옹이", 
                birthDate: "2019-03-22",
                type: { id: 2, name: "고양이" },
                owner: { id: 2, firstName: "이", lastName: "영희" },
                visits: []
            }
        ];
    }

    /**
     * Mock 데이터 - 수의사
     */
    getMockVets() {
        return [
            {
                id: 1,
                firstName: "김",
                lastName: "수의사",
                specialties: [
                    { id: 1, name: "내과" },
                    { id: 2, name: "외과" }
                ]
            },
            {
                id: 2,
                firstName: "박",
                lastName: "수의사", 
                specialties: [
                    { id: 3, name: "피부과" },
                    { id: 4, name: "안과" }
                ]
            }
        ];
    }

    /**
     * Mock 데이터 - 진료 기록
     */
    getMockVisits() {
        return [
            {
                id: 1,
                visitDate: "2024-01-15",
                description: "정기 검진 및 예방접종",
                pet: { id: 1, name: "멍멍이" },
                vet: { id: 1, firstName: "김", lastName: "수의사" }
            },
            {
                id: 2,
                visitDate: "2024-01-10", 
                description: "피부 질환 치료",
                pet: { id: 2, name: "야옹이" },
                vet: { id: 2, firstName: "박", lastName: "수의사" }
            }
        ];
    }

    /**
     * Mock 데이터 - 전문 분야
     */
    getMockSpecialties() {
        return [
            { id: 1, name: "내과" },
            { id: 2, name: "외과" },
            { id: 3, name: "피부과" },
            { id: 4, name: "안과" },
            { id: 5, name: "치과" }
        ];
    }

    /**
     * Mock 데이터 - 펫 종류
     */
    getMockPetTypes() {
        return [
            { id: 1, name: "강아지" },
            { id: 2, name: "고양이" },
            { id: 3, name: "토끼" },
            { id: 4, name: "햄스터" },
            { id: 5, name: "새" }
        ];
    }

    // === 편의 메서드들 ===

    /**
     * 모든 보호자 조회
     */
    async getAllOwners() {
        return this.get(this.endpoints.owners);
    }

    /**
     * 보호자 상세 조회
     */
    async getOwner(id) {
        return this.get(`${this.endpoints.owners}/${id}`);
    }

    /**
     * 보호자 등록
     */
    async createOwner(ownerData) {
        return this.post(this.endpoints.owners, ownerData);
    }

    /**
     * 보호자 수정
     */
    async updateOwner(id, ownerData) {
        return this.put(`${this.endpoints.owners}/${id}`, ownerData);
    }

    /**
     * 모든 펫 조회
     */
    async getAllPets() {
        return this.get(this.endpoints.pets);
    }

    /**
     * 펫 상세 조회
     */
    async getPet(id) {
        return this.get(`${this.endpoints.pets}/${id}`);
    }

    /**
     * 펫 등록
     */
    async createPet(petData) {
        return this.post(this.endpoints.pets, petData);
    }

    /**
     * 모든 수의사 조회
     */
    async getAllVets() {
        return this.get(this.endpoints.vets);
    }

    /**
     * 진료 기록 조회
     */
    async getVisits(petId = null) {
        const params = petId ? { petId } : {};
        return this.get(this.endpoints.visits, params);
    }

    /**
     * 진료 기록 등록
     */
    async createVisit(visitData) {
        return this.post(this.endpoints.visits, visitData);
    }

    /**
     * 전문 분야 조회
     */
    async getSpecialties() {
        return this.get(this.endpoints.specialties);
    }

    /**
     * 펫 종류 조회
     */
    async getPetTypes() {
        return this.get(this.endpoints.petTypes);
    }

    /**
     * 연결 상태 확인
     */
    async healthCheck() {
        try {
            await this.get('/actuator/health');
            return true;
        } catch (error) {
            console.warn('Backend health check failed:', error.message);
            return false;
        }
    }
}

// 전역 API 클라이언트 인스턴스 생성
window.petclinicAPI = new PetclinicAPIClient();

// 초기화
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await window.petclinicAPI.loadConfig();
        
        // API 연결 상태 확인
        const isHealthy = await window.petclinicAPI.healthCheck();
        if (isHealthy) {
            console.log('✅ Backend connection established');
        } else {
            console.log('⚠️ Backend not available, using mock data');
            window.petclinicAPI.mockMode = true;
        }
        
        // API 로드 완료 이벤트 발생
        document.dispatchEvent(new CustomEvent('apiLoaded', {
            detail: { client: window.petclinicAPI }
        }));
        
    } catch (error) {
        console.error('❌ Failed to initialize API client:', error);
    }
});