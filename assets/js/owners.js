/**
 * Owners Management JavaScript
 * 보호자 관리 페이지 전용 기능
 */

class OwnersManager {
    constructor() {
        this.owners = [];
        this.filteredOwners = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.apiClient = window.petclinicAPI;
    }

    /**
     * 초기화
     */
    async init() {
        await this.waitForAPI();
        this.setupEventListeners();
        this.showAPIStatus();
        await this.loadOwners();
        this.updateStatistics();
    }

    /**
     * API 클라이언트 로드 대기
     */
    async waitForAPI() {
        return new Promise((resolve) => {
            if (this.apiClient.isLoaded) {
                resolve();
            } else {
                document.addEventListener('apiLoaded', resolve);
            }
        });
    }

    /**
     * API 상태 표시
     */
    showAPIStatus() {
        const banner = document.getElementById('api-status-banner');
        const message = document.getElementById('api-status-message');
        
        if (this.apiClient.mockMode) {
            banner.className = 'alert alert-warning alert-dismissible fade show';
            message.innerHTML = '<i class="fas fa-exclamation-triangle me-2"></i>백엔드 서버에 연결할 수 없어 샘플 데이터로 동작합니다.';
        } else {
            banner.className = 'alert alert-success alert-dismissible fade show';
            message.innerHTML = '<i class="fas fa-check-circle me-2"></i>백엔드 서버에 정상적으로 연결되었습니다.';
        }
        
        banner.classList.remove('d-none');
        
        // 5초 후 자동 숨김
        setTimeout(() => {
            const bsAlert = new bootstrap.Alert(banner);
            bsAlert.close();
        }, 5000);
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 검색 기능
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        
        searchInput.addEventListener('input', this.debounce(() => this.filterOwners(), 300));
        searchBtn.addEventListener('click', () => this.filterOwners());
        
        // Enter 키 검색
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.filterOwners();
            }
        });

        // 보호자 등록 폼
        const addOwnerForm = document.getElementById('addOwnerForm');
        addOwnerForm.addEventListener('submit', (e) => this.handleAddOwner(e));

        // 보호자 수정 폼
        const editOwnerForm = document.getElementById('editOwnerForm');
        editOwnerForm.addEventListener('submit', (e) => this.handleEditOwner(e));

        // 모달 초기화
        const addModal = document.getElementById('addOwnerModal');
        addModal.addEventListener('hidden.bs.modal', () => {
            addOwnerForm.reset();
            this.clearFormValidation(addOwnerForm);
        });

        const editModal = document.getElementById('editOwnerModal');
        editModal.addEventListener('hidden.bs.modal', () => {
            editOwnerForm.reset();
            this.clearFormValidation(editOwnerForm);
        });
    }

    /**
     * 보호자 목록 로드
     */
    async loadOwners() {
        try {
            this.showLoading();
            
            const data = await this.apiClient.getAllOwners();
            this.owners = Array.isArray(data) ? data : [];
            this.filteredOwners = [...this.owners];
            
            this.hideLoading();
            this.renderOwners();
            this.updateStatistics();
            
        } catch (error) {
            this.hideLoading();
            this.showError('보호자 목록을 불러오는 중 오류가 발생했습니다: ' + error.message);
            console.error('Error loading owners:', error);
        }
    }

    /**
     * 로딩 상태 표시
     */
    showLoading() {
        document.getElementById('loading-spinner').classList.remove('d-none');
        document.getElementById('owners-table-container').classList.add('d-none');
        document.getElementById('empty-state').classList.add('d-none');
        document.getElementById('error-message').classList.add('d-none');
    }

    /**
     * 로딩 상태 숨김
     */
    hideLoading() {
        document.getElementById('loading-spinner').classList.add('d-none');
    }

    /**
     * 오류 메시지 표시
     */
    showError(message) {
        document.getElementById('error-text').textContent = message;
        document.getElementById('error-message').classList.remove('d-none');
        document.getElementById('owners-table-container').classList.add('d-none');
        document.getElementById('empty-state').classList.add('d-none');
    }

    /**
     * 보호자 목록 렌더링
     */
    renderOwners() {
        const container = document.getElementById('owners-table-container');
        const emptyState = document.getElementById('empty-state');
        const tableBody = document.getElementById('owners-table-body');

        if (this.filteredOwners.length === 0) {
            container.classList.add('d-none');
            emptyState.classList.remove('d-none');
            return;
        }

        container.classList.remove('d-none');
        emptyState.classList.add('d-none');

        // 페이지네이션 계산
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageOwners = this.filteredOwners.slice(startIndex, endIndex);

        // 테이블 렌더링
        tableBody.innerHTML = pageOwners.map(owner => this.renderOwnerRow(owner)).join('');

        // 페이지네이션 렌더링
        this.renderPagination();
    }

    /**
     * 보호자 행 렌더링
     */
    renderOwnerRow(owner) {
        const petCount = owner.pets ? owner.pets.length : 0;
        const petNames = owner.pets ? owner.pets.map(pet => pet.name).join(', ') : '없음';
        const lastVisit = this.getLastVisitDate(owner);

        return `
            <tr>
                <td>
                    <strong>${owner.lastName} ${owner.firstName}</strong>
                </td>
                <td>
                    <i class="fas fa-phone text-primary me-2"></i>
                    ${owner.telephone}
                </td>
                <td>
                    <i class="fas fa-map-marker-alt text-secondary me-2"></i>
                    ${owner.address}, ${owner.city}
                </td>
                <td>
                    <span class="badge bg-info">${petCount}마리</span>
                    <small class="text-muted d-block">${petNames}</small>
                </td>
                <td>
                    <small class="text-muted">${lastVisit}</small>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="ownersManager.showOwnerDetails(${owner.id})" title="상세보기">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline-secondary" onclick="ownersManager.editOwner(${owner.id})" title="수정">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="ownersManager.deleteOwner(${owner.id})" title="삭제">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    /**
     * 마지막 방문 날짜 계산
     */
    getLastVisitDate(owner) {
        if (!owner.pets || owner.pets.length === 0) return '방문 기록 없음';
        
        let lastVisit = null;
        
        owner.pets.forEach(pet => {
            if (pet.visits && pet.visits.length > 0) {
                pet.visits.forEach(visit => {
                    const visitDate = new Date(visit.visitDate);
                    if (!lastVisit || visitDate > lastVisit) {
                        lastVisit = visitDate;
                    }
                });
            }
        });
        
        return lastVisit ? this.formatDate(lastVisit) : '방문 기록 없음';
    }

    /**
     * 날짜 포맷팅
     */
    formatDate(date) {
        const now = new Date();
        const diffTime = now - date;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return '오늘';
        if (diffDays === 1) return '어제';
        if (diffDays < 7) return `${diffDays}일 전`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 전`;
        
        return date.toLocaleDateString('ko-KR');
    }

    /**
     * 페이지네이션 렌더링
     */
    renderPagination() {
        const totalPages = Math.ceil(this.filteredOwners.length / this.itemsPerPage);
        const pagination = document.getElementById('pagination');
        
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let paginationHTML = '';
        
        // 이전 페이지
        paginationHTML += `
            <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="ownersManager.goToPage(${this.currentPage - 1})">이전</a>
            </li>
        `;
        
        // 페이지 번호
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                paginationHTML += `
                    <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                        <a class="page-link" href="#" onclick="ownersManager.goToPage(${i})">${i}</a>
                    </li>
                `;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                paginationHTML += '<li class="page-item disabled"><span class="page-link">...</span></li>';
            }
        }
        
        // 다음 페이지
        paginationHTML += `
            <li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="ownersManager.goToPage(${this.currentPage + 1})">다음</a>
            </li>
        `;
        
        pagination.innerHTML = paginationHTML;
    }

    /**
     * 페이지 이동
     */
    goToPage(page) {
        const totalPages = Math.ceil(this.filteredOwners.length / this.itemsPerPage);
        
        if (page < 1 || page > totalPages) return;
        
        this.currentPage = page;
        this.renderOwners();
    }

    /**
     * 보호자 검색/필터링
     */
    filterOwners() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
        
        if (!searchTerm) {
            this.filteredOwners = [...this.owners];
        } else {
            this.filteredOwners = this.owners.filter(owner => {
                const fullName = `${owner.lastName} ${owner.firstName}`.toLowerCase();
                const telephone = owner.telephone.replace(/[^0-9]/g, '');
                const searchNumber = searchTerm.replace(/[^0-9]/g, '');
                
                return fullName.includes(searchTerm) || 
                       telephone.includes(searchNumber) ||
                       owner.address.toLowerCase().includes(searchTerm);
            });
        }
        
        this.currentPage = 1;
        this.renderOwners();
    }

    /**
     * 통계 업데이트
     */
    async updateStatistics() {
        try {
            const totalOwners = this.owners.length;
            const totalPets = this.owners.reduce((sum, owner) => sum + (owner.pets ? owner.pets.length : 0), 0);
            
            // 이번 달 신규 등록 (Mock 데이터에서는 임의로 계산)
            const thisMonth = new Date().getMonth();
            const newRegistrations = Math.floor(totalOwners * 0.1); // 전체의 10%로 가정
            
            // 최근 방문 (Mock 데이터에서는 임의로 계산)
            const recentVisits = Math.floor(totalPets * 0.3); // 전체 펫의 30%가 최근 방문했다고 가정
            
            // 애니메이션과 함께 숫자 업데이트
            this.animateCounter('total-owners', totalOwners);
            this.animateCounter('total-pets', totalPets);
            this.animateCounter('new-registrations', newRegistrations);
            this.animateCounter('recent-visits', recentVisits);
            
        } catch (error) {
            console.error('Error updating statistics:', error);
        }
    }

    /**
     * 카운터 애니메이션
     */
    animateCounter(elementId, targetValue) {
        const element = document.getElementById(elementId);
        const startValue = 0;
        const duration = 1000;
        const increment = targetValue / (duration / 16);
        let currentValue = startValue;
        
        const timer = setInterval(() => {
            currentValue += increment;
            if (currentValue >= targetValue) {
                element.textContent = targetValue;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(currentValue);
            }
        }, 16);
    }

    /**
     * 보호자 등록 처리
     */
    async handleAddOwner(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        
        const ownerData = {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            address: document.getElementById('address').value.trim(),
            city: document.getElementById('city').value.trim(),
            telephone: document.getElementById('telephone').value.trim()
        };
        
        // 유효성 검사
        if (!this.validateOwnerData(ownerData, form)) {
            return;
        }
        
        try {
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            // 로딩 상태
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>등록 중...';
            
            await this.apiClient.createOwner(ownerData);
            
            // 성공 처리
            this.showAlert('보호자가 성공적으로 등록되었습니다.', 'success');
            
            // 모달 닫기
            const modal = bootstrap.Modal.getInstance(document.getElementById('addOwnerModal'));
            modal.hide();
            
            // 목록 새로고침
            await this.loadOwners();
            
        } catch (error) {
            this.showAlert('보호자 등록 중 오류가 발생했습니다: ' + error.message, 'error');
            console.error('Error creating owner:', error);
        } finally {
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save me-2"></i>등록';
        }
    }

    /**
     * 보호자 수정
     */
    async editOwner(id) {
        try {
            const owner = this.owners.find(o => o.id === id);
            if (!owner) {
                this.showAlert('보호자 정보를 찾을 수 없습니다.', 'error');
                return;
            }
            
            // 폼에 데이터 채우기
            document.getElementById('editOwnerId').value = owner.id;
            document.getElementById('editFirstName').value = owner.firstName;
            document.getElementById('editLastName').value = owner.lastName;
            document.getElementById('editAddress').value = owner.address;
            document.getElementById('editCity').value = owner.city;
            document.getElementById('editTelephone').value = owner.telephone;
            
            // 모달 열기
            const modal = new bootstrap.Modal(document.getElementById('editOwnerModal'));
            modal.show();
            
        } catch (error) {
            this.showAlert('보호자 정보를 불러오는 중 오류가 발생했습니다.', 'error');
            console.error('Error loading owner for edit:', error);
        }
    }

    /**
     * 보호자 수정 처리
     */
    async handleEditOwner(event) {
        event.preventDefault();
        
        const form = event.target;
        const id = document.getElementById('editOwnerId').value;
        
        const ownerData = {
            firstName: document.getElementById('editFirstName').value.trim(),
            lastName: document.getElementById('editLastName').value.trim(),
            address: document.getElementById('editAddress').value.trim(),
            city: document.getElementById('editCity').value.trim(),
            telephone: document.getElementById('editTelephone').value.trim()
        };
        
        // 유효성 검사
        if (!this.validateOwnerData(ownerData, form)) {
            return;
        }
        
        try {
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            // 로딩 상태
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>수정 중...';
            
            await this.apiClient.updateOwner(id, ownerData);
            
            // 성공 처리
            this.showAlert('보호자 정보가 성공적으로 수정되었습니다.', 'success');
            
            // 모달 닫기
            const modal = bootstrap.Modal.getInstance(document.getElementById('editOwnerModal'));
            modal.hide();
            
            // 목록 새로고침
            await this.loadOwners();
            
        } catch (error) {
            this.showAlert('보호자 정보 수정 중 오류가 발생했습니다: ' + error.message, 'error');
            console.error('Error updating owner:', error);
        } finally {
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save me-2"></i>수정';
        }
    }

    /**
     * 보호자 삭제
     */
    async deleteOwner(id) {
        const owner = this.owners.find(o => o.id === id);
        if (!owner) return;
        
        const confirmed = confirm(`정말로 "${owner.lastName} ${owner.firstName}" 보호자를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`);
        
        if (!confirmed) return;
        
        try {
            await this.apiClient.delete(`${this.apiClient.endpoints.owners}/${id}`);
            
            this.showAlert('보호자가 성공적으로 삭제되었습니다.', 'success');
            await this.loadOwners();
            
        } catch (error) {
            this.showAlert('보호자 삭제 중 오류가 발생했습니다: ' + error.message, 'error');
            console.error('Error deleting owner:', error);
        }
    }

    /**
     * 보호자 상세 정보 표시
     */
    async showOwnerDetails(id) {
        try {
            const owner = this.owners.find(o => o.id === id);
            if (!owner) {
                this.showAlert('보호자 정보를 찾을 수 없습니다.', 'error');
                return;
            }
            
            const content = document.getElementById('owner-details-content');
            content.innerHTML = this.renderOwnerDetails(owner);
            
            const modal = new bootstrap.Modal(document.getElementById('ownerDetailsModal'));
            modal.show();
            
        } catch (error) {
            this.showAlert('보호자 상세 정보를 불러오는 중 오류가 발생했습니다.', 'error');
            console.error('Error loading owner details:', error);
        }
    }

    /**
     * 보호자 상세 정보 렌더링
     */
    renderOwnerDetails(owner) {
        const pets = owner.pets || [];
        const petCount = pets.length;
        
        return `
            <div class="row">
                <div class="col-md-6">
                    <h6 class="text-primary">기본 정보</h6>
                    <table class="table table-sm">
                        <tr>
                            <th width="30%">이름</th>
                            <td>${owner.lastName} ${owner.firstName}</td>
                        </tr>
                        <tr>
                            <th>연락처</th>
                            <td>${owner.telephone}</td>
                        </tr>
                        <tr>
                            <th>주소</th>
                            <td>${owner.address}, ${owner.city}</td>
                        </tr>
                        <tr>
                            <th>반려동물 수</th>
                            <td><span class="badge bg-info">${petCount}마리</span></td>
                        </tr>
                    </table>
                </div>
                <div class="col-md-6">
                    <h6 class="text-primary">반려동물 목록</h6>
                    ${petCount > 0 ? `
                        <div class="list-group list-group-flush">
                            ${pets.map(pet => `
                                <div class="list-group-item px-0">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 class="mb-1">${pet.name}</h6>
                                            <small class="text-muted">${pet.type?.name || '미지정'} • ${this.calculateAge(pet.birthDate)}</small>
                                        </div>
                                        <small class="text-muted">${this.formatDate(new Date(pet.birthDate))}</small>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p class="text-muted">등록된 반려동물이 없습니다.</p>'}
                </div>
            </div>
        `;
    }

    /**
     * 나이 계산
     */
    calculateAge(birthDate) {
        const birth = new Date(birthDate);
        const today = new Date();
        const ageInMs = today - birth;
        const ageInYears = Math.floor(ageInMs / (1000 * 60 * 60 * 24 * 365));
        const ageInMonths = Math.floor((ageInMs % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
        
        if (ageInYears > 0) {
            return `${ageInYears}세 ${ageInMonths}개월`;
        } else {
            return `${ageInMonths}개월`;
        }
    }

    /**
     * 보호자 데이터 유효성 검사
     */
    validateOwnerData(data, form) {
        const errors = [];
        
        if (!data.firstName) errors.push('성을 입력해주세요.');
        if (!data.lastName) errors.push('이름을 입력해주세요.');
        if (!data.address) errors.push('주소를 입력해주세요.');
        if (!data.city) errors.push('도시를 입력해주세요.');
        if (!data.telephone) errors.push('전화번호를 입력해주세요.');
        
        // 전화번호 형식 검사
        if (data.telephone && !/^[0-9-+\s()]+$/.test(data.telephone)) {
            errors.push('올바른 전화번호 형식이 아닙니다.');
        }
        
        if (errors.length > 0) {
            this.showAlert(errors.join('\n'), 'error');
            return false;
        }
        
        return true;
    }

    /**
     * 폼 유효성 검사 초기화
     */
    clearFormValidation(form) {
        form.querySelectorAll('.is-invalid').forEach(element => {
            element.classList.remove('is-invalid');
        });
        form.querySelectorAll('.invalid-feedback').forEach(element => {
            element.remove();
        });
    }

    /**
     * 알림 메시지 표시
     */
    showAlert(message, type = 'info') {
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
                <span>${message.replace(/\n/g, '<br>')}</span>
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
     * 디바운스 함수
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// 전역 인스턴스 생성
window.ownersManager = new OwnersManager();

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.ownersManager.init();
});

// 전역 함수 (HTML에서 호출용)
window.loadOwners = () => window.ownersManager.loadOwners();