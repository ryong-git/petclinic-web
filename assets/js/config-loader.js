/**
 * Configuration Loader for Petclinic Web
 * 설정 파일을 로드하고 웹사이트 콘텐츠를 동적으로 업데이트
 */

class ConfigLoader {
    constructor() {
        this.clinicConfig = null;
        this.themeConfig = null;
        this.awsConfig = null;
        this.isLoaded = false;
        this.basePath = this.getBasePath();
    }

    /**
     * 현재 페이지의 기본 경로를 계산
     */
    getBasePath() {
        const currentPath = window.location.pathname;
        if (currentPath.includes('/templates/')) {
            return '../';
        }
        return './';
    }

    /**
     * 모든 설정 파일을 로드
     */
    async loadAllConfigs() {
        try {
            const [clinicResponse, themeResponse] = await Promise.all([
                fetch(`${this.basePath}config/clinic-info.json`),
                fetch(`${this.basePath}config/theme-config.json`)
            ]);

            if (!clinicResponse.ok || !themeResponse.ok) {
                throw new Error('Failed to load configuration files');
            }

            this.clinicConfig = await clinicResponse.json();
            this.themeConfig = await themeResponse.json();
            
            this.isLoaded = true;
            this.applyConfigurations();
            
            console.log('✅ Configuration loaded successfully');
        } catch (error) {
            console.error('❌ Error loading configuration:', error);
            this.loadFallbackConfig();
        }
    }

    /**
     * 설정 로드 실패 시 기본값 사용
     */
    loadFallbackConfig() {
        this.clinicConfig = {
            clinic: {
                name: "행복한 동물병원",
                slogan: "우리 가족처럼 소중하게",
                description: "신뢰할 수 있는 동물병원입니다.",
                address: "서울시 강남구 테헤란로 123",
                phone: "02-1234-5678",
                email: "info@happypet.kr",
                emergencyPhone: "010-1234-5678"
            }
        };
        
        this.themeConfig = {
            theme: {
                colors: {
                    primary: "#2E8B57"
                }
            },
            images: {
                source: "local",
                basePath: "./assets/images/"
            }
        };
        
        this.isLoaded = true;
        this.applyConfigurations();
        console.warn('⚠️ Using fallback configuration');
    }

    /**
     * 로드된 설정을 웹사이트에 적용
     */
    applyConfigurations() {
        this.applyTheme();
        this.applyClinicInfo();
        this.applyImages();
        this.applySocialLinks();
        this.applyFeatures();
        
        // 설정 적용 완료 이벤트 발생
        document.dispatchEvent(new CustomEvent('configLoaded', {
            detail: {
                clinic: this.clinicConfig,
                theme: this.themeConfig
            }
        }));
    }

    /**
     * 테마 설정 적용 (CSS Variables)
     */
    applyTheme() {
        if (!this.themeConfig?.theme?.colors) return;

        const colors = this.themeConfig.theme.colors;
        const root = document.documentElement;

        Object.entries(colors).forEach(([key, value]) => {
            const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}-color`;
            root.style.setProperty(cssVar, value);
        });

        // 폰트 설정
        if (this.themeConfig.theme.fonts) {
            const fonts = this.themeConfig.theme.fonts;
            if (fonts.primary) {
                root.style.setProperty('--font-primary', fonts.primary);
            }
        }

        // 레이아웃 설정
        if (this.themeConfig.theme.layout) {
            const layout = this.themeConfig.theme.layout;
            Object.entries(layout).forEach(([key, value]) => {
                const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
                root.style.setProperty(cssVar, value);
            });
        }
    }

    /**
     * 병원 정보 적용
     */
    applyClinicInfo() {
        if (!this.clinicConfig?.clinic) return;

        const clinic = this.clinicConfig.clinic;

        // 기본 정보
        this.updateElements('clinic-name', clinic.name);
        this.updateElements('clinic-slogan', clinic.slogan);
        this.updateElements('clinic-description', clinic.description);
        this.updateElements('clinic-address', clinic.address);
        this.updateElements('clinic-phone', clinic.phone);
        this.updateElements('clinic-email', clinic.email);
        this.updateElements('emergency-phone', clinic.emergencyPhone);

        // 페이지 타이틀 업데이트
        this.updatePageTitle(clinic.name);

        // 전화 링크 설정
        this.updatePhoneLinks();

        // 진료시간 정보
        this.updateClinicHours();

        // 푸터 정보
        this.updateFooterInfo();
    }

    /**
     * 이미지 경로 설정
     */
    applyImages() {
        if (!this.themeConfig?.images) return;

        const imageConfig = this.themeConfig.images;
        let basePath = imageConfig.basePath || './assets/images/';

        // S3 사용 시
        if (imageConfig.source === 's3' && imageConfig.s3Config?.basePath) {
            basePath = imageConfig.s3Config.basePath;
        }

        // 로고 이미지
        if (imageConfig.clinic?.logo) {
            const logoElements = document.querySelectorAll('#clinic-logo');
            logoElements.forEach(element => {
                element.src = basePath + imageConfig.clinic.logo;
                element.onerror = () => {
                    element.src = `${this.basePath}assets/images/clinic/logo-placeholder.png`;
                };
            });
        }

        // 히어로 이미지
        if (imageConfig.clinic?.hero) {
            const heroElement = document.getElementById('hero-image');
            if (heroElement) {
                heroElement.src = basePath + imageConfig.clinic.hero;
                heroElement.onerror = () => {
                    heroElement.src = `${this.basePath}assets/images/clinic/hero-placeholder.jpg`;
                };
            }
        }
    }

    /**
     * 소셜 링크 적용
     */
    applySocialLinks() {
        const socialConfig = this.themeConfig?.social;
        if (!socialConfig) return;

        const socialContainer = document.getElementById('social-links');
        if (!socialContainer) return;

        const socialLinks = [
            { key: 'facebook', icon: 'fab fa-facebook-f', label: 'Facebook' },
            { key: 'instagram', icon: 'fab fa-instagram', label: 'Instagram' },
            { key: 'blog', icon: 'fas fa-blog', label: 'Blog' },
            { key: 'youtube', icon: 'fab fa-youtube', label: 'YouTube' }
        ];

        const linksHtml = socialLinks
            .filter(social => socialConfig[social.key])
            .map(social => `
                <a href="${socialConfig[social.key]}" target="_blank" rel="noopener noreferrer" title="${social.label}">
                    <i class="${social.icon}"></i>
                </a>
            `).join('');

        socialContainer.innerHTML = linksHtml || '<p class="text-muted small">소셜 미디어 링크가 설정되지 않았습니다.</p>';
    }

    /**
     * 기능 설정 적용
     */
    applyFeatures() {
        const features = this.themeConfig?.features;
        if (!features) return;

        // 응급 배너 표시/숨김
        const emergencyBanner = document.getElementById('emergency-banner');
        if (emergencyBanner) {
            if (features.showEmergencyBanner) {
                emergencyBanner.classList.remove('d-none');
            } else {
                emergencyBanner.classList.add('d-none');
            }
        }
    }

    /**
     * 페이지 타이틀 업데이트
     */
    updatePageTitle(clinicName) {
        const titleElement = document.getElementById('page-title');
        if (titleElement) {
            const currentTitle = titleElement.textContent;
            if (currentTitle.includes(' - ')) {
                const pageName = currentTitle.split(' - ')[0];
                titleElement.textContent = `${pageName} - ${clinicName}`;
            } else {
                titleElement.textContent = clinicName;
            }
            document.title = titleElement.textContent;
        }
    }

    /**
     * 전화 링크 업데이트
     */
    updatePhoneLinks() {
        const clinic = this.clinicConfig.clinic;
        
        // 일반 전화
        const phoneLinks = document.querySelectorAll('#phone-link');
        phoneLinks.forEach(link => {
            link.href = `tel:${clinic.phone}`;
        });

        // 응급 전화
        const emergencyLinks = document.querySelectorAll('#emergency-phone-link');
        emergencyLinks.forEach(link => {
            link.href = `tel:${clinic.emergencyPhone}`;
        });

        // 이메일 링크
        const emailLinks = document.querySelectorAll('#email-link');
        emailLinks.forEach(link => {
            link.href = `mailto:${clinic.email}`;
        });
    }

    /**
     * 진료시간 정보 업데이트
     */
    updateClinicHours() {
        const hours = this.clinicConfig.clinic.hours;
        if (!hours) return;

        // 간단한 진료시간 (홈페이지)
        const simpleHours = document.getElementById('clinic-hours');
        if (simpleHours) {
            simpleHours.innerHTML = `
                <p>${hours.weekday}</p>
                <p>${hours.saturday}</p>
            `;
        }

        // 상세 진료시간 (연락처 페이지)
        const detailedHours = document.getElementById('clinic-hours-detailed');
        if (detailedHours) {
            detailedHours.innerHTML = `
                <div class="hours-item">
                    <span class="day">평일</span>
                    <span class="time">${hours.weekday.split(' ')[1]}</span>
                </div>
                <div class="hours-item">
                    <span class="day">토요일</span>
                    <span class="time">${hours.saturday.split(' ')[1]}</span>
                </div>
                <div class="hours-item holiday">
                    <span class="day">일요일</span>
                    <span class="time">휴진</span>
                </div>
                <div class="hours-item holiday">
                    <span class="day">공휴일</span>
                    <span class="time">휴진</span>
                </div>
            `;
        }
    }

    /**
     * 푸터 정보 업데이트
     */
    updateFooterInfo() {
        const clinic = this.clinicConfig.clinic;
        const hours = clinic.hours;

        // 푸터 기본 정보
        this.updateElements('footer-clinic-name', clinic.name);
        this.updateElements('footer-clinic-address', clinic.address);
        this.updateElements('footer-clinic-phone', clinic.phone);
        this.updateElements('footer-clinic-email', clinic.email);
        this.updateElements('copyright-clinic-name', clinic.name);

        // 푸터 진료시간
        const footerHours = document.getElementById('footer-clinic-hours');
        if (footerHours && hours) {
            footerHours.innerHTML = `
                <p>평일: ${hours.weekday.split(' ')[1]}</p>
                <p>토요일: ${hours.saturday.split(' ')[1]}</p>
                <p>일요일: 휴진</p>
            `;
        }
    }

    /**
     * 여러 요소의 텍스트 업데이트 헬퍼 함수
     */
    updateElements(selector, text) {
        const elements = document.querySelectorAll(`#${selector}`);
        elements.forEach(element => {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.value = text;
            } else {
                element.textContent = text;
            }
        });
    }

    /**
     * 서비스 목록 로드
     */
    loadServices() {
        const services = this.clinicConfig?.services;
        if (!services) return;

        const servicesContainer = document.getElementById('services-container');
        if (!servicesContainer) return;

        const servicesHtml = services.map(service => `
            <div class="col-lg-4 col-md-6 mb-4">
                <div class="service-card">
                    <div class="service-icon">
                        <i class="fas ${service.icon || 'fa-stethoscope'}"></i>
                    </div>
                    <h4>${service.name}</h4>
                    <p>${service.description}</p>
                </div>
            </div>
        `).join('');

        servicesContainer.innerHTML = servicesHtml;
    }

    /**
     * 수의사 정보 로드
     */
    loadVeterinarians() {
        const vets = this.clinicConfig?.veterinarians;
        if (!vets) return;

        const vetsContainer = document.getElementById('vets-container');
        if (!vetsContainer) return;

        const vetsHtml = vets.map(vet => `
            <div class="col-lg-6 mb-4">
                <div class="vet-card">
                    <div class="vet-image">
                        <img src="${this.getImagePath(vet.image, 'vets')}" alt="${vet.name}" 
                             onerror="this.src='${this.basePath}assets/images/vets/placeholder.jpg'">
                    </div>
                    <div class="vet-info">
                        <h3 class="vet-name">${vet.name}</h3>
                        <p class="vet-title">${vet.title}</p>
                        <p class="vet-specialty">전문분야: ${vet.specialty}</p>
                        <div class="vet-experience">경력 ${vet.experience}</div>
                        <p class="text-muted">${vet.education}</p>
                        <p>${vet.description}</p>
                    </div>
                </div>
            </div>
        `).join('');

        vetsContainer.innerHTML = vetsHtml;
    }

    /**
     * 시설 정보 로드
     */
    loadFacilities() {
        const facilities = this.clinicConfig?.facilities;
        if (!facilities) return;

        const facilitiesContainer = document.getElementById('facilities-container');
        if (!facilitiesContainer) return;

        const facilitiesHtml = facilities.map((facility, index) => `
            <div class="col-lg-4 col-md-6 mb-3">
                <div class="facility-item">
                    <div class="facility-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <p>${facility}</p>
                </div>
            </div>
        `).join('');

        facilitiesContainer.innerHTML = facilitiesHtml;
    }

    /**
     * 이미지 경로 생성 헬퍼
     */
    getImagePath(imageName, category) {
        const imageConfig = this.themeConfig?.images;
        if (!imageConfig) return `${this.basePath}assets/images/${category}/${imageName}`;

        let basePath = imageConfig.basePath || `${this.basePath}assets/images/`;
        
        if (imageConfig.source === 's3' && imageConfig.s3Config?.basePath) {
            basePath = imageConfig.s3Config.basePath;
        }

        return `${basePath}${category}/${imageName}`;
    }

    /**
     * 외부에서 설정 정보에 접근할 수 있는 게터
     */
    getClinicConfig() {
        return this.clinicConfig;
    }

    getThemeConfig() {
        return this.themeConfig;
    }

    isConfigLoaded() {
        return this.isLoaded;
    }
}

// 전역 ConfigLoader 인스턴스 생성
window.configLoader = new ConfigLoader();

// 응급 배너 닫기 함수 (전역)
window.closeEmergencyBanner = function() {
    const banner = document.getElementById('emergency-banner');
    if (banner) {
        banner.style.display = 'none';
    }
};

// DOM 로드 완료 시 설정 로드
document.addEventListener('DOMContentLoaded', () => {
    window.configLoader.loadAllConfigs();
});

// 설정 로드 완료 시 추가 콘텐츠 로드
document.addEventListener('configLoaded', () => {
    window.configLoader.loadServices();
    window.configLoader.loadVeterinarians();
    window.configLoader.loadFacilities();
    
    // 모든 요소에 fade-in 애니메이션 적용
    const animatedElements = document.querySelectorAll('.service-card, .vet-card, .contact-card');
    animatedElements.forEach((element, index) => {
        setTimeout(() => {
            element.classList.add('fade-in');
        }, index * 100);
    });
});