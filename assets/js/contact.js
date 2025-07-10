/**
 * Contact Page Specific JavaScript
 * 연락처 페이지 전용 기능들
 */

document.addEventListener('DOMContentLoaded', function() {
    initContactPageFeatures();
});

/**
 * 연락처 페이지 기능 초기화
 */
function initContactPageFeatures() {
    initAdvancedContactForm();
    initMapInteractions();
    initDirectionFeatures();
    initContactValidation();
}

/**
 * 고급 문의 폼 기능
 */
function initAdvancedContactForm() {
    const form = document.querySelector('.contact-form-card form');
    if (!form) return;

    // 문의 유형에 따른 동적 필드 표시
    const inquiryTypeSelect = document.getElementById('inquiry-type');
    const messageField = document.getElementById('message');
    
    if (inquiryTypeSelect && messageField) {
        inquiryTypeSelect.addEventListener('change', function() {
            updateMessagePlaceholder(this.value, messageField);
        });
    }

    // 실시간 문자 수 카운터
    if (messageField) {
        addCharacterCounter(messageField);
    }

    // 자동 저장 기능
    initAutoSave(form);

    // 폼 제출 처리
    form.addEventListener('submit', handleFormSubmit);
}

/**
 * 문의 유형에 따른 메시지 플레이스홀더 업데이트
 */
function updateMessagePlaceholder(inquiryType, messageField) {
    const placeholders = {
        'appointment': '예약 희망 날짜와 시간, 반려동물 정보를 자세히 적어주세요.',
        'treatment': '반려동물의 증상, 언제부터 시작되었는지 등을 구체적으로 설명해 주세요.',
        'general': '궁금한 사항을 자세히 적어주세요.',
        'emergency': '응급상황의 경우 즉시 전화 주시기 바랍니다. 상황을 간단히 설명해 주세요.'
    };

    messageField.placeholder = placeholders[inquiryType] || '문의 내용을 자세히 입력해 주세요.';
    
    // 응급상황 선택 시 경고 표시
    if (inquiryType === 'emergency') {
        showEmergencyWarning();
    } else {
        hideEmergencyWarning();
    }
}

/**
 * 응급상황 경고 표시
 */
function showEmergencyWarning() {
    let warning = document.getElementById('emergency-warning');
    if (!warning) {
        warning = document.createElement('div');
        warning.id = 'emergency-warning';
        warning.className = 'alert alert-danger mt-2';
        warning.innerHTML = `
            <i class="fas fa-exclamation-triangle me-2"></i>
            <strong>응급상황</strong>의 경우 문의 폼보다는 즉시 
            <a href="tel:010-1234-5678" class="alert-link">010-1234-5678</a>로 전화 주세요!
        `;
        
        const inquiryTypeField = document.getElementById('inquiry-type').parentNode;
        inquiryTypeField.appendChild(warning);
    }
    warning.style.display = 'block';
}

/**
 * 응급상황 경고 숨김
 */
function hideEmergencyWarning() {
    const warning = document.getElementById('emergency-warning');
    if (warning) {
        warning.style.display = 'none';
    }
}

/**
 * 문자 수 카운터 추가
 */
function addCharacterCounter(textArea) {
    const maxLength = 1000;
    textArea.maxLength = maxLength;

    // 카운터 요소 생성
    const counter = document.createElement('div');
    counter.className = 'character-counter text-muted small mt-1';
    counter.style.textAlign = 'right';
    textArea.parentNode.appendChild(counter);

    // 카운터 업데이트 함수
    const updateCounter = () => {
        const remaining = maxLength - textArea.value.length;
        counter.textContent = `${textArea.value.length}/${maxLength}`;
        
        if (remaining < 100) {
            counter.className = 'character-counter text-warning small mt-1';
        } else if (remaining < 50) {
            counter.className = 'character-counter text-danger small mt-1';
        } else {
            counter.className = 'character-counter text-muted small mt-1';
        }
    };

    // 이벤트 리스너 추가
    textArea.addEventListener('input', updateCounter);
    textArea.addEventListener('paste', () => setTimeout(updateCounter, 10));
    
    // 초기 카운터 설정
    updateCounter();
}

/**
 * 자동 저장 기능
 */
function initAutoSave(form) {
    const STORAGE_KEY = 'petclinic_contact_form';
    
    // 폼 데이터 로드
    loadFormData(form);
    
    // 자동 저장 설정
    const formElements = form.querySelectorAll('input, select, textarea');
    formElements.forEach(element => {
        element.addEventListener('input', Utils.debounce(() => {
            saveFormData(form);
        }, 1000));
    });

    // 폼 제출 시 저장된 데이터 삭제
    form.addEventListener('submit', () => {
        localStorage.removeItem(STORAGE_KEY);
    });
}

/**
 * 폼 데이터 저장
 */
function saveFormData(form) {
    const formData = new FormData(form);
    const data = {};
    
    // FormData를 객체로 변환
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    // 추가로 ID로 접근 가능한 요소들 저장
    const additionalFields = ['name', 'phone', 'email', 'pet-name', 'inquiry-type', 'message'];
    additionalFields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            data[fieldId] = element.value;
        }
    });
    
    localStorage.setItem('petclinic_contact_form', JSON.stringify(data));
}

/**
 * 폼 데이터 로드
 */
function loadFormData(form) {
    const savedData = localStorage.getItem('petclinic_contact_form');
    if (!savedData) return;
    
    try {
        const data = JSON.parse(savedData);
        
        Object.keys(data).forEach(key => {
            const element = form.querySelector(`[name="${key}"]`) || document.getElementById(key);
            if (element && data[key]) {
                element.value = data[key];
                
                // 저장된 데이터가 있음을 사용자에게 알림
                if (!document.getElementById('auto-save-notice')) {
                    showAutoSaveNotice();
                }
            }
        });
    } catch (error) {
        console.error('Failed to load saved form data:', error);
    }
}

/**
 * 자동 저장 알림 표시
 */
function showAutoSaveNotice() {
    const notice = document.createElement('div');
    notice.id = 'auto-save-notice';
    notice.className = 'alert alert-info alert-dismissible fade show';
    notice.innerHTML = `
        <i class="fas fa-info-circle me-2"></i>
        이전에 입력하던 내용이 복원되었습니다.
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const form = document.querySelector('.contact-form-card form');
    form.parentNode.insertBefore(notice, form);
    
    // 5초 후 자동 삭제
    setTimeout(() => {
        if (notice.parentNode) {
            const bsAlert = new bootstrap.Alert(notice);
            bsAlert.close();
        }
    }, 5000);
}

/**
 * 고급 폼 유효성 검사
 */
function initContactValidation() {
    const form = document.querySelector('.contact-form-card form');
    if (!form) return;

    // 실시간 유효성 검사
    const fields = {
        name: {
            element: document.getElementById('name'),
            validators: [
                { test: (value) => value.length >= 2, message: '이름은 2글자 이상 입력해주세요.' },
                { test: (value) => /^[가-힣a-zA-Z\s]+$/.test(value), message: '이름은 한글 또는 영문만 입력 가능합니다.' }
            ]
        },
        phone: {
            element: document.getElementById('phone'),
            validators: [
                { test: (value) => /^[0-9-+\s()]+$/.test(value), message: '올바른 전화번호 형식이 아닙니다.' },
                { test: (value) => value.replace(/[^0-9]/g, '').length >= 10, message: '전화번호는 10자리 이상 입력해주세요.' }
            ]
        },
        email: {
            element: document.getElementById('email'),
            validators: [
                { test: (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), message: '올바른 이메일 형식이 아닙니다.' }
            ]
        },
        message: {
            element: document.getElementById('message'),
            validators: [
                { test: (value) => value.length >= 10, message: '문의 내용은 10글자 이상 입력해주세요.' }
            ]
        }
    };

    Object.values(fields).forEach(field => {
        if (field.element) {
            field.element.addEventListener('blur', () => validateSingleField(field));
            field.element.addEventListener('input', Utils.debounce(() => validateSingleField(field), 500));
        }
    });
}

/**
 * 개별 필드 유효성 검사
 */
function validateSingleField(field) {
    const value = field.element.value.trim();
    const isRequired = field.element.hasAttribute('required');
    
    // 필수 필드인데 비어있는 경우
    if (isRequired && !value) {
        showFieldError(field.element, '필수 입력 항목입니다.');
        return false;
    }
    
    // 값이 있는 경우 유효성 검사
    if (value) {
        for (let validator of field.validators) {
            if (!validator.test(value)) {
                showFieldError(field.element, validator.message);
                return false;
            }
        }
    }
    
    showFieldSuccess(field.element);
    return true;
}

/**
 * 필드 오류 표시
 */
function showFieldError(element, message) {
    element.classList.remove('is-valid');
    element.classList.add('is-invalid');
    
    // 기존 오류 메시지 제거
    const existingError = element.parentNode.querySelector('.invalid-feedback');
    if (existingError) {
        existingError.remove();
    }
    
    // 새 오류 메시지 추가
    const errorDiv = document.createElement('div');
    errorDiv.className = 'invalid-feedback';
    errorDiv.textContent = message;
    element.parentNode.appendChild(errorDiv);
}

/**
 * 필드 성공 표시
 */
function showFieldSuccess(element) {
    element.classList.remove('is-invalid');
    element.classList.add('is-valid');
    
    // 오류 메시지 제거
    const errorDiv = element.parentNode.querySelector('.invalid-feedback');
    if (errorDiv) {
        errorDiv.remove();
    }
}

/**
 * 폼 제출 처리
 */
function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // 전체 폼 유효성 검사
    if (!validateEntireForm(form)) {
        showAlert('입력 정보를 확인해 주세요.', 'error');
        return;
    }
    
    // 제출 버튼 비활성화 및 로딩 표시
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>전송 중...';
    
    // 가상의 폼 제출 처리 (실제로는 서버로 전송)
    setTimeout(() => {
        // 성공 처리
        showFormSubmissionSuccess(form);
        
        // 버튼 복원
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        
        // 폼 리셋
        form.reset();
        
        // 저장된 데이터 삭제
        localStorage.removeItem('petclinic_contact_form');
        
    }, 2000);
}

/**
 * 전체 폼 유효성 검사
 */
function validateEntireForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            showFieldError(field, '필수 입력 항목입니다.');
            isValid = false;
        }
    });
    
    return isValid && form.checkValidity();
}

/**
 * 폼 제출 성공 처리
 */
function showFormSubmissionSuccess(form) {
    showAlert('문의가 성공적으로 전송되었습니다. 영업일 기준 1-2일 내에 연락드리겠습니다.', 'success');
    
    // 성공 애니메이션
    form.style.transform = 'scale(0.98)';
    form.style.opacity = '0.7';
    
    setTimeout(() => {
        form.style.transform = 'scale(1)';
        form.style.opacity = '1';
    }, 300);
}

/**
 * 지도 상호작용 초기화
 */
function initMapInteractions() {
    const mapPlaceholder = document.querySelector('.map-placeholder');
    if (!mapPlaceholder) return;
    
    mapPlaceholder.addEventListener('click', function() {
        showMapModal();
    });
    
    // 지도 대체 정보 표시
    mapPlaceholder.style.cursor = 'pointer';
    mapPlaceholder.title = '클릭하시면 상세 위치 정보를 보실 수 있습니다';
}

/**
 * 지도 모달 표시
 */
function showMapModal() {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="fas fa-map-marker-alt me-2"></i>
                        오시는 길 상세 안내
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-6">
                            <h6>주소</h6>
                            <p id="modal-address">서울시 강남구 테헤란로 123</p>
                            
                            <h6>대중교통</h6>
                            <ul class="list-unstyled">
                                <li><i class="fas fa-subway me-2 text-primary"></i>지하철 2호선 강남역 1번 출구 (도보 5분)</li>
                                <li><i class="fas fa-bus me-2 text-success"></i>버스 146, 472, 740번</li>
                            </ul>
                            
                            <h6>주차 안내</h6>
                            <p>건물 지하 1-2층 (2시간 무료)</p>
                        </div>
                        <div class="col-md-6">
                            <div class="map-placeholder-modal" style="height: 250px; background: #f8f9fa; border: 2px dashed #dee2e6; display: flex; align-items: center; justify-content: center;">
                                <div class="text-center text-muted">
                                    <i class="fas fa-map fa-3x mb-3"></i>
                                    <p>실제 지도가 여기에 표시됩니다</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">닫기</button>
                    <a href="https://map.naver.com" target="_blank" class="btn btn-primary">
                        <i class="fas fa-external-link-alt me-2"></i>네이버 지도에서 보기
                    </a>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    
    // 모달 닫힐 때 DOM에서 제거
    modal.addEventListener('hidden.bs.modal', () => {
        modal.remove();
    });
}

/**
 * 찾아오시는 길 기능 초기화
 */
function initDirectionFeatures() {
    // 교통편별 상세 정보 토글
    const directionItems = document.querySelectorAll('.direction-item');
    directionItems.forEach(item => {
        const header = item.querySelector('h6');
        if (header) {
            header.style.cursor = 'pointer';
            header.addEventListener('click', () => {
                const content = item.querySelector('ul');
                if (content) {
                    content.style.display = content.style.display === 'none' ? 'block' : 'none';
                }
            });
        }
    });
    
    // 복사 기능
    addCopyButtons();
}

/**
 * 주소 복사 버튼 추가
 */
function addCopyButtons() {
    const addressElements = document.querySelectorAll('#clinic-address');
    addressElements.forEach(element => {
        if (!element.nextElementSibling || !element.nextElementSibling.classList.contains('copy-btn')) {
            const copyBtn = document.createElement('button');
            copyBtn.className = 'btn btn-sm btn-outline-primary copy-btn mt-2';
            copyBtn.innerHTML = '<i class="fas fa-copy me-1"></i>주소 복사';
            copyBtn.addEventListener('click', () => copyToClipboard(element.textContent));
            element.parentNode.insertBefore(copyBtn, element.nextSibling);
        }
    });
}

/**
 * 클립보드에 텍스트 복사
 */
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showAlert('주소가 클립보드에 복사되었습니다.', 'success');
        }).catch(() => {
            fallbackCopyToClipboard(text);
        });
    } else {
        fallbackCopyToClipboard(text);
    }
}

/**
 * 클립보드 복사 폴백 함수
 */
function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showAlert('주소가 클립보드에 복사되었습니다.', 'success');
    } catch (err) {
        showAlert('복사에 실패했습니다. 주소를 직접 선택해서 복사해 주세요.', 'error');
    }
    
    document.body.removeChild(textArea);
}