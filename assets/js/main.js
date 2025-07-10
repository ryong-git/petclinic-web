/**
 * Main JavaScript for Petclinic Web
 * 사이트 전반의 상호작용 및 기능 구현
 */

document.addEventListener('DOMContentLoaded', function() {
    // 초기화
    initializeWebsite();
    
    // 스크롤 애니메이션 초기화
    initScrollAnimations();
    
    // 네비게이션 초기화
    initNavigation();
    
    // 부드러운 스크롤 초기화
    initSmoothScroll();
});

/**
 * 웹사이트 초기화
 */
function initializeWebsite() {
    // 로딩 상태 표시
    showLoading();
    
    // 설정 로드 완료 대기
    document.addEventListener('configLoaded', function(event) {
        hideLoading();
        console.log('✅ Website initialized with config:', event.detail);
        
        // 페이지별 초기화
        initPageSpecificFeatures();
    });
    
    // 에러 처리
    window.addEventListener('error', function(event) {
        console.error('❌ Website error:', event.error);
        hideLoading();
    });
}

/**
 * 로딩 표시
 */
function showLoading() {
    // 기존 로딩 인디케이터가 있으면 제거
    const existingLoader = document.getElementById('site-loader');
    if (existingLoader) {
        existingLoader.remove();
    }
    
    // 로딩 인디케이터 생성
    const loader = document.createElement('div');
    loader.id = 'site-loader';
    loader.innerHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            backdrop-filter: blur(2px);
        ">
            <div style="text-align: center;">
                <div class="loading" style="margin: 0 auto 1rem;"></div>
                <p style="color: var(--text-light-color); font-weight: 500;">
                    병원 정보를 불러오는 중...
                </p>
            </div>
        </div>
    `;
    document.body.appendChild(loader);
}

/**
 * 로딩 숨김
 */
function hideLoading() {
    const loader = document.getElementById('site-loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.remove();
        }, 300);
    }
}

/**
 * 스크롤 애니메이션 초기화
 */
function initScrollAnimations() {
    // Intersection Observer를 사용한 스크롤 애니메이션
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                
                // 카드들에 지연 애니메이션 적용
                if (entry.target.classList.contains('animate-cards')) {
                    const cards = entry.target.querySelectorAll('.service-card, .vet-card, .contact-card, .process-card');
                    cards.forEach((card, index) => {
                        setTimeout(() => {
                            card.classList.add('slide-in-left');
                        }, index * 150);
                    });
                }
            }
        });
    }, observerOptions);
    
    // 애니메이션 대상 요소들 관찰
    const animatedSections = document.querySelectorAll('.services, .veterinarians, .contact-info, .service-details');
    animatedSections.forEach(section => {
        section.classList.add('animate-cards');
        observer.observe(section);
    });
}

/**
 * 네비게이션 초기화
 */
function initNavigation() {
    // 현재 페이지에 맞는 네비게이션 활성화
    setActiveNavigation();
    
    // 스크롤 시 헤더 스타일 변경
    initScrollHeader();
    
    // 모바일 메뉴 닫기
    initMobileMenuClose();
}

/**
 * 현재 페이지 네비게이션 활성화
 */
function setActiveNavigation() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        
        const href = link.getAttribute('href');
        if (href) {
            // 현재 페이지와 링크 비교
            if (currentPath.includes(href.replace('../', '').replace('.html', '')) || 
                (currentPath.endsWith('/') && href.includes('index.html'))) {
                link.classList.add('active');
            }
        }
    });
}

/**
 * 스크롤 시 헤더 스타일 변경
 */
function initScrollHeader() {
    const header = document.querySelector('.header');
    if (!header) return;
    
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // 스크롤 다운 시 헤더에 그림자 추가
        if (scrollTop > 50) {
            header.classList.add('scrolled');
            header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
        } else {
            header.classList.remove('scrolled');
            header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        }
        
        lastScrollTop = scrollTop;
    });
}

/**
 * 모바일 메뉴 닫기
 */
function initMobileMenuClose() {
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navbarCollapse.classList.contains('show')) {
                const bsCollapse = new bootstrap.Collapse(navbarCollapse);
                bsCollapse.hide();
            }
        });
    });
}

/**
 * 부드러운 스크롤 초기화
 */
function initSmoothScroll() {
    // 앵커 링크에 부드러운 스크롤 적용
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                e.preventDefault();
                
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * 페이지별 특화 기능 초기화
 */
function initPageSpecificFeatures() {
    const currentPath = window.location.pathname;
    
    // 홈페이지
    if (currentPath.includes('index.html') || currentPath.endsWith('/')) {
        initHomePage();
    }
    
    // 병원소개 페이지
    if (currentPath.includes('about.html')) {
        initAboutPage();
    }
    
    // 진료안내 페이지
    if (currentPath.includes('services.html')) {
        initServicesPage();
    }
    
    // 연락처 페이지
    if (currentPath.includes('contact.html')) {
        initContactPage();
    }
}

/**
 * 홈페이지 특화 기능
 */
function initHomePage() {
    // 히어로 섹션 애니메이션
    const heroContent = document.querySelector('.hero-overlay');
    if (heroContent) {
        setTimeout(() => {
            heroContent.classList.add('fade-in');
        }, 500);
    }
    
    // 통계 카운터 애니메이션 (있는 경우)
    initCounters();
}

/**
 * 병원소개 페이지 특화 기능
 */
function initAboutPage() {
    // 시설 캐러셀 자동 재생
    const carousel = document.getElementById('facilitiesCarousel');
    if (carousel) {
        const bsCarousel = new bootstrap.Carousel(carousel, {
            interval: 5000,
            wrap: true
        });
    }
    
    // 통계 애니메이션
    initCounters();
}

/**
 * 진료안내 페이지 특화 기능
 */
function initServicesPage() {
    // 아코디언 초기화
    const accordionItems = document.querySelectorAll('.accordion-item');
    accordionItems.forEach(item => {
        const button = item.querySelector('.accordion-button');
        button.addEventListener('click', function() {
            // 다른 아코디언 항목들의 아이콘 회전 리셋
            accordionItems.forEach(otherItem => {
                if (otherItem !== item) {
                    const otherButton = otherItem.querySelector('.accordion-button');
                    otherButton.style.transform = 'rotate(0deg)';
                }
            });
            
            // 현재 클릭된 아이콘 회전
            const isExpanded = !this.classList.contains('collapsed');
            this.style.transform = isExpanded ? 'rotate(180deg)' : 'rotate(0deg)';
        });
    });
}

/**
 * 연락처 페이지 특화 기능
 */
function initContactPage() {
    // 문의 폼 초기화
    initContactForm();
    
    // 지도 초기화 (실제 구현 시)
    initMap();
}

/**
 * 문의 폼 초기화
 */
function initContactForm() {
    const contactForm = document.querySelector('.contact-form-card form');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // 폼 유효성 검사
        if (validateContactForm(this)) {
            showFormSuccess();
        } else {
            showFormError();
        }
    });
    
    // 실시간 유효성 검사
    const requiredFields = contactForm.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        field.addEventListener('blur', function() {
            validateField(this);
        });
    });
}

/**
 * 문의 폼 유효성 검사
 */
function validateContactForm(form) {
    const formData = new FormData(form);
    const name = formData.get('name') || form.querySelector('#name').value;
    const phone = formData.get('phone') || form.querySelector('#phone').value;
    const message = formData.get('message') || form.querySelector('#message').value;
    
    // 필수 필드 검사
    if (!name || !phone || !message) {
        return false;
    }
    
    // 전화번호 형식 검사
    const phoneRegex = /^[0-9-+\s()]+$/;
    if (!phoneRegex.test(phone)) {
        return false;
    }
    
    return true;
}

/**
 * 개별 필드 유효성 검사
 */
function validateField(field) {
    const value = field.value.trim();
    const isValid = field.checkValidity() && value !== '';
    
    // 시각적 피드백
    if (isValid) {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
    } else {
        field.classList.remove('is-valid');
        field.classList.add('is-invalid');
    }
    
    return isValid;
}

/**
 * 폼 성공 메시지
 */
function showFormSuccess() {
    showAlert('문의가 성공적으로 전송되었습니다. 빠른 시일 내에 연락드리겠습니다.', 'success');
}

/**
 * 폼 오류 메시지
 */
function showFormError() {
    showAlert('필수 정보를 모두 입력해 주세요.', 'error');
}

/**
 * 알림 메시지 표시
 */
function showAlert(message, type = 'info') {
    // 기존 알림 제거
    const existingAlert = document.querySelector('.custom-alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    // 새 알림 생성
    const alert = document.createElement('div');
    alert.className = `alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'} custom-alert`;
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        min-width: 300px;
        animation: slideInRight 0.3s ease-out;
    `;
    alert.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : type === 'success' ? 'check-circle' : 'info-circle'} me-2"></i>
            <span>${message}</span>
            <button type="button" class="btn-close ms-auto" onclick="this.parentElement.parentElement.remove()"></button>
        </div>
    `;
    
    document.body.appendChild(alert);
    
    // 자동 제거
    setTimeout(() => {
        if (alert.parentElement) {
            alert.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => alert.remove(), 300);
        }
    }, 5000);
}

/**
 * 지도 초기화 (플레이스홀더)
 */
function initMap() {
    const mapPlaceholder = document.querySelector('.map-placeholder');
    if (mapPlaceholder) {
        mapPlaceholder.addEventListener('click', function() {
            showAlert('실제 구현 시 Google Maps 또는 Kakao Map이 여기에 표시됩니다.', 'info');
        });
    }
}

/**
 * 카운터 애니메이션
 */
function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    const animateCounter = (counter) => {
        const target = parseInt(counter.textContent.replace(/[^\d]/g, ''));
        const increment = target / 100;
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                counter.textContent = counter.textContent.replace(/[\d,]+/, target.toLocaleString());
                clearInterval(timer);
            } else {
                counter.textContent = counter.textContent.replace(/[\d,]+/, Math.floor(current).toLocaleString());
            }
        }, 20);
    };
    
    // Intersection Observer로 화면에 보일 때 애니메이션 실행
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    });
    
    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
}

/**
 * 브라우저 호환성 체크
 */
function checkBrowserCompatibility() {
    // ES6 지원 체크
    if (typeof Symbol === 'undefined') {
        showAlert('브라우저가 최신 기능을 지원하지 않습니다. 최신 브라우저 사용을 권장합니다.', 'warning');
        return false;
    }
    
    // Intersection Observer 지원 체크
    if (!('IntersectionObserver' in window)) {
        console.warn('IntersectionObserver not supported, fallback to basic animations');
        // 폴백 로직
        const animatedElements = document.querySelectorAll('.service-card, .vet-card, .contact-card');
        animatedElements.forEach(element => {
            element.classList.add('fade-in');
        });
        return false;
    }
    
    return true;
}

/**
 * 유틸리티 함수들
 */
const Utils = {
    // 디바운스 함수
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // 스크롤 위치 확인
    isInViewport: function(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },
    
    // 모바일 여부 확인
    isMobile: function() {
        return window.innerWidth <= 768;
    }
};

// 전역 함수로 내보내기
window.PetclinicWeb = {
    showAlert,
    Utils,
    initContactForm,
    validateContactForm
};

// 브라우저 호환성 체크
checkBrowserCompatibility();