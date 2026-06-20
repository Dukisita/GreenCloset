// ==========================================
// 1. STATE & CONSTANTS
// ==========================================

const State = {
    currentUser: null,
    clothes: [],
    uploadedImageBase64: null,
    currentSurveyStep: 1,
    surveyAnswers: {
        styles: [],
        laundryFreq: '자주 (1-2회 착용 후)',
        ecoInterest: '매우 높음',
        materials: []
    }
};

// Material Database with Environmental Burden details
const MATERIAL_DB = {
    'polyester': {
        name: '폴리에스테르',
        grade: 'E',
        score: 15,
        type: 'synthetic',
        tip: '세탁 시 많은 미세플라스틱이 방출됩니다. 세탁망(미세필터형)을 사용하고, 찬물에 액체 세제를 사용하여 탄소 배출량을 크게 줄이세요.'
    },
    'nylon': {
        name: '나일론',
        grade: 'D',
        score: 30,
        type: 'synthetic',
        tip: '견고하고 신축성이 좋은 반면, 썩지 않는 화학 석유 물질입니다. 저온 세탁 후 그늘에서 자연 건조해 미세섬유 탈락을 방지하세요.'
    },
    'acrylic': {
        name: '아크릴',
        grade: 'E',
        score: 18,
        type: 'synthetic',
        tip: '보온성은 높으나 정전기 발생과 함께 많은 양의 미세플라스틱이 탈락됩니다. 찬물에 울 샴푸로 가볍게 손세탁하세요.'
    },
    'cotton': {
        name: '일반 면',
        grade: 'C',
        score: 55,
        type: 'plant',
        tip: '천연 소재이나 재배 시 엄청난 물과 살충제가 쓰입니다. 불필요하게 자주 세탁하지 말고, 가벼운 바람에 털어 입어 세탁 횟수를 조절해 주세요.'
    },
    'organic-cotton': {
        name: '오가닉 코튼',
        grade: 'A',
        score: 92,
        type: 'sustainable',
        tip: '유기농 공법으로 살충제 없이 재배되어 환경 부담이 매우 적습니다. 무형광 세제를 사용하고 자연 건조를 권장합니다.'
    },
    'linen': {
        name: '리넨/마',
        grade: 'A',
        score: 95,
        type: 'plant',
        tip: '아마 식물로 가공 시 유량이 적게 드는 친환경 식물 섬유입니다. 물흡수가 빠르고 항균성이 높아 세탁 횟수를 최소화하기 용이합니다.'
    },
    'wool': {
        name: '울/캐시미어',
        grade: 'C',
        score: 60,
        type: 'animal',
        tip: '보온성이 좋은 동물성 천연 섬유입니다. 항균 탈취 작용이 있어 오염되지 않았다면 바람이 잘 통하는 그늘에 널어두는 것만으로 충분합니다.'
    },
    'silk': {
        name: '실크',
        grade: 'C',
        score: 58,
        type: 'animal',
        tip: '누에고치에서 얻은 자연 섬유입니다. 마찰과 고온에 매우 취약하므로 중성세제로 찬물에 가볍게 조물조물 손세탁하는 것을 제안합니다.'
    },
    'tencel': {
        name: '텐셀/리오셀',
        grade: 'B',
        score: 82,
        type: 'sustainable',
        tip: '나무 펄프를 친환경 유기용제로 녹여낸 섬유로 용제의 99%가 순환 재사용됩니다. 부드러워 마찰을 피하기 위해 세탁망에 넣어 약하게 세탁하십시오.'
    }
};

// Standard preset colors translation for search readability
const COLOR_PRESETS_TRANSLATION = {
    '#40916c': '초록',
    '#1b4332': '진초록',
    '#ffffff': '흰색',
    '#111827': '검은색',
    '#3b82f6': '파란색',
    '#f59e0b': '노란색',
    '#ef4444': '빨간색'
};

// ==========================================
// 2. TOAST SYSTEM
// ==========================================
function showToast(title, desc = '', type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let iconName = 'check-circle';
    if (type === 'error') iconName = 'alert-triangle';
    if (type === 'info') iconName = 'info';

    toast.innerHTML = `
        <i data-lucide="${iconName}" class="toast-icon"></i>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            ${desc ? `<div class="toast-desc">${desc}</div>` : ''}
        </div>
    `;

    container.appendChild(toast);
    lucide.createIcons();

    // Fade out and remove
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3500);
}

// Mock Social Logins Helper
window.mockSocialLogin = function(provider) {
    const mockEmail = `${provider.toLowerCase()}User@nokbit.com`;
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    let user = users.find(u => u.email === mockEmail);
    
    if (!user) {
        user = {
            email: mockEmail,
            password: 'mockedSocialPassword123',
            hasSurvey: false,
            surveyData: null,
            socialProvider: provider
        };
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    // Log user in
    localStorage.setItem('currentUserEmail', mockEmail);
    State.currentUser = user;
    
    showToast(`${provider} 간편 로그인 완료`, `${mockEmail} 계정으로 접속합니다.`, 'success');
    initSession();
};

// ==========================================
// 3. CORE ROUTING & SESSION INITIALIZATION
// ==========================================
function switchView(viewId) {
    // Hide all view sections
    document.querySelectorAll('.view-section').forEach(section => {
        section.classList.remove('active-flex', 'active-grid');
        section.style.display = 'none';
    });
    
    const targetSection = document.getElementById(viewId);
    if (targetSection) {
        // Set basic display styles matching their class layout requirements
        if (viewId === 'view-closet') {
            targetSection.style.display = 'flex'; // active-grid uses display: flex; flex-direction: column;
        } else {
            targetSection.style.display = 'flex'; // active-flex uses display: flex;
        }

        // Reset scroll position on container switch
        targetSection.scrollTop = 0;
        const scrollableElements = targetSection.querySelectorAll('.clothes-grid, .form-card, #add-clothing-form');
        scrollableElements.forEach(el => el.scrollTop = 0);

        // Force a layout reflow (critical for CSS transitions to work when changing display)
        targetSection.offsetHeight;
        
        // Add active classes to trigger CSS transitions (opacity, transform)
        if (viewId === 'view-closet') {
            targetSection.classList.add('active-grid');
        } else {
            targetSection.classList.add('active-flex');
        }
    }

    // Toggle Global Header visibility
    const header = document.getElementById('global-header');
    if (viewId === 'view-auth') {
        header.classList.add('hidden');
    } else {
        header.classList.remove('hidden');
        if (State.currentUser) {
            document.querySelector('#user-display .name-text').textContent = State.currentUser.email.split('@')[0];
        }
    }
    
    // Trigger Lucide icon parsing
    lucide.createIcons();
}

function initSession() {
    const email = localStorage.getItem('currentUserEmail');
    if (!email) {
        State.currentUser = null;
        switchView('view-auth');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email);
    
    if (!user) {
        localStorage.removeItem('currentUserEmail');
        State.currentUser = null;
        switchView('view-auth');
        return;
    }

    State.currentUser = user;

    // Route based on survey completion status
    if (!user.hasSurvey) {
        State.currentSurveyStep = 1;
        resetSurveyUI();
        switchView('view-survey');
    } else {
        loadClosetData();
        switchView('view-closet');
    }
}

// ==========================================
// 4. CAPS LOCK WARNING & AUTH VIEWS LOGIC
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Check session
    initSession();

    // Toggle Login / Signup Tabs
    const tabLogin = document.getElementById('tab-login');
    const tabSignup = document.getElementById('tab-signup');
    const signupConfirmGroup = document.getElementById('signup-confirm-group');
    const btnAuthSubmit = document.getElementById('btn-auth-submit');
    const authForm = document.getElementById('auth-form');

    let currentAuthMode = 'login'; // 'login' or 'signup'

    tabLogin.addEventListener('click', () => {
        currentAuthMode = 'login';
        tabLogin.classList.add('active');
        tabSignup.classList.remove('active');
        signupConfirmGroup.classList.add('hidden');
        btnAuthSubmit.querySelector('span').textContent = '로그인';
        document.getElementById('auth-confirm-password').removeAttribute('required');
    });

    tabSignup.addEventListener('click', () => {
        currentAuthMode = 'signup';
        tabSignup.classList.add('active');
        tabLogin.classList.remove('active');
        signupConfirmGroup.classList.remove('hidden');
        btnAuthSubmit.querySelector('span').textContent = '회원가입';
        document.getElementById('auth-confirm-password').setAttribute('required', 'true');
    });

    // Caps Lock Detection
    const passwordInputs = [
        document.getElementById('auth-password'),
        document.getElementById('auth-confirm-password')
    ];
    const capslockWarning = document.getElementById('capslock-warning');

    passwordInputs.forEach(input => {
        input.addEventListener('keyup', (e) => {
            if (e.getModifierState && e.getModifierState('CapsLock')) {
                capslockWarning.classList.remove('hidden');
            } else {
                capslockWarning.classList.add('hidden');
            }
        });

        // Hide warning when focus out
        input.addEventListener('blur', () => {
            capslockWarning.classList.add('hidden');
        });
    });

    // Social Button actions inside JavaScript to prevent index inline onclick issues
    const googleBtn = document.getElementById('btn-social-google');
    const kakaoBtn = document.getElementById('btn-social-kakao');
    const naverBtn = document.getElementById('btn-social-naver');

    if (googleBtn) googleBtn.addEventListener('click', () => window.mockSocialLogin('Google'));
    if (kakaoBtn) kakaoBtn.addEventListener('click', () => window.mockSocialLogin('카카오'));
    if (naverBtn) naverBtn.addEventListener('click', () => window.mockSocialLogin('네이버'));

    // Auth Form Submission
    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('auth-email').value.trim();
        const password = document.getElementById('auth-password').value;
        const users = JSON.parse(localStorage.getItem('users') || '[]');

        if (currentAuthMode === 'signup') {
            const confirmPassword = document.getElementById('auth-confirm-password').value;
            
            // Validation
            if (password !== confirmPassword) {
                showToast('비밀번호 불일치', '비밀번호 확인이 일치하지 않습니다.', 'error');
                return;
            }

            if (password.length < 6) {
                showToast('비밀번호 오류', '비밀번호는 최소 6자 이상이어야 합니다.', 'error');
                return;
            }

            // Check duplicate
            if (users.some(u => u.email === email)) {
                showToast('등록 불가', '이미 가입된 이메일 주소입니다.', 'error');
                return;
            }

            // Create User
            const newUser = {
                email,
                password,
                hasSurvey: false,
                surveyData: null
            };
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            
            // Login user
            localStorage.setItem('currentUserEmail', email);
            State.currentUser = newUser;
            
            showToast('회원가입 성공', '회원가입이 완료되었습니다! 가입을 환영합니다.', 'success');
            initSession();
        } else {
            // Login mode
            const user = users.find(u => u.email === email && u.password === password);
            if (!user) {
                showToast('로그인 실패', '이메일 또는 비밀번호가 일치하지 않습니다.', 'error');
                return;
            }

            localStorage.setItem('currentUserEmail', email);
            State.currentUser = user;
            
            showToast('로그인 성공', '지구를 지키는 옷장 관리를 시작합니다.', 'success');
            initSession();
        }
    });

    // Global Header Logout
    document.getElementById('btn-logout').addEventListener('click', () => {
        localStorage.removeItem('currentUserEmail');
        State.currentUser = null;
        State.clothes = [];
        showToast('로그아웃 완료', '안전하게 로그아웃되었습니다.', 'info');
        switchView('view-auth');
    });

    // Redo Survey Button action
    document.getElementById('btn-survey-redo').addEventListener('click', () => {
        if (!State.currentUser) return;
        State.currentSurveyStep = 1;
        resetSurveyUI();
        switchView('view-survey');
    });
});

// ==========================================
// 5. SURVEY SCREEN LOGIC
// ==========================================
const btnSurveyPrev = document.getElementById('btn-survey-prev');
const btnSurveyNext = document.getElementById('btn-survey-next');
const surveyProgressFill = document.getElementById('survey-progress-fill');
const stepNums = document.querySelectorAll('.progress-steps .step-num');

function resetSurveyUI() {
    // Clear survey checkboxes/radios
    document.querySelectorAll('input[name="style-pref"]').forEach(el => el.checked = false);
    document.querySelectorAll('input[name="material-pref"]').forEach(el => el.checked = false);
    document.querySelector('input[name="laundry-freq"][value="자주 (1-2회 착용 후)"]').checked = true;
    document.querySelector('input[name="eco-interest"][value="매우 높음"]').checked = true;

    updateSurveyStepView();
}

function updateSurveyStepView() {
    // Hide all slides
    document.querySelectorAll('.survey-slide').forEach(slide => {
        slide.classList.remove('active');
    });

    // Show current slide
    const activeSlide = document.querySelector(`.survey-slide[data-step="${State.currentSurveyStep}"]`);
    if (activeSlide) activeSlide.classList.add('active');

    // Update Progress Indicator
    const progressPercent = (State.currentSurveyStep / 3) * 100;
    surveyProgressFill.style.width = `${progressPercent}%`;

    stepNums.forEach((step, idx) => {
        if (idx < State.currentSurveyStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });

    // Prev Button
    if (State.currentSurveyStep === 1) {
        btnSurveyPrev.classList.add('hidden');
    } else {
        btnSurveyPrev.classList.remove('hidden');
    }

    // Next Button text
    if (State.currentSurveyStep === 3) {
        btnSurveyNext.innerHTML = `설문 완료하기 <i data-lucide="check"></i>`;
    } else {
        btnSurveyNext.innerHTML = `다음 <i data-lucide="arrow-right"></i>`;
    }
    
    lucide.createIcons();
}

btnSurveyPrev.addEventListener('click', () => {
    if (State.currentSurveyStep > 1) {
        State.currentSurveyStep--;
        updateSurveyStepView();
    }
});

btnSurveyNext.addEventListener('click', () => {
    if (State.currentSurveyStep === 1) {
        // Collect Styles
        const selectedStyles = Array.from(document.querySelectorAll('input[name="style-pref"]:checked')).map(el => el.value);
        if (selectedStyles.length === 0) {
            showToast('선택 요청', '스타일을 최소 1개 이상 선택해 주세요.', 'info');
            return;
        }
        State.surveyAnswers.styles = selectedStyles;
        
        State.currentSurveyStep++;
        updateSurveyStepView();
    } else if (State.currentSurveyStep === 2) {
        // Collect Habits
        const selectedFreq = document.querySelector('input[name="laundry-freq"]:checked').value;
        const selectedEco = document.querySelector('input[name="eco-interest"]:checked').value;
        
        State.surveyAnswers.laundryFreq = selectedFreq;
        State.surveyAnswers.ecoInterest = selectedEco;

        State.currentSurveyStep++;
        updateSurveyStepView();
    } else if (State.currentSurveyStep === 3) {
        // Collect Materials
        const selectedMaterials = Array.from(document.querySelectorAll('input[name="material-pref"]:checked')).map(el => el.value);
        if (selectedMaterials.length === 0) {
            showToast('선택 요청', '소재를 최소 1개 이상 선택해 주세요.', 'info');
            return;
        }
        State.surveyAnswers.materials = selectedMaterials;

        // Survey Completed - Submit
        submitSurvey();
    }
});

function submitSurvey() {
    if (!State.currentUser) return;

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.email === State.currentUser.email);

    if (userIndex !== -1) {
        users[userIndex].hasSurvey = true;
        users[userIndex].surveyData = { ...State.surveyAnswers };
        
        localStorage.setItem('users', JSON.stringify(users));
        State.currentUser = users[userIndex]; // update current user object
        
        showToast('성향 설문 분석 완료', '취향 분석을 기반으로 대시보드를 생성합니다.', 'success');
        
        // Redirect to closet dashboard
        loadClosetData();
        switchView('view-closet');
    }
}

// ==========================================
// 6. CLOSET MANAGEMENT & DRAG AND DROP
// ==========================================

// Drag & Drop Image Handling
const dropzone = document.getElementById('dropzone');
const imageInput = document.getElementById('clothing-image-input');
const dropzoneDefault = document.getElementById('dropzone-default');
const dropzonePreviewWrap = document.getElementById('dropzone-preview-wrap');
const imagePreview = document.getElementById('image-preview');
const btnRemovePreview = document.getElementById('btn-remove-preview');
const btnTriggerUpload = document.getElementById('btn-trigger-upload');

// Trigger file explorer when clicking drag zone
btnTriggerUpload.addEventListener('click', (e) => {
    e.stopPropagation();
    imageInput.click();
});
dropzone.addEventListener('click', (e) => {
    // If clicking remove preview, don't trigger upload
    if (e.target.closest('#btn-remove-preview')) return;
    imageInput.click();
});

// Drag and drop events highlight
['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('dragover');
    }, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('dragover');
    }, false);
});

dropzone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleImageFiles(files);
});

imageInput.addEventListener('change', (e) => {
    const files = e.target.files;
    handleImageFiles(files);
});

btnRemovePreview.addEventListener('click', (e) => {
    e.stopPropagation();
    resetImagePreview();
});

function handleImageFiles(files) {
    if (files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) {
        showToast('업로드 불가', '이미지 파일만 등록할 수 있습니다.', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        // Compress image before saving to Base64 (reduces size dramatically)
        compressImage(e.target.result, 320, 320, (compressedBase64) => {
            State.uploadedImageBase64 = compressedBase64;
            imagePreview.src = compressedBase64;
            dropzoneDefault.classList.add('hidden');
            dropzonePreviewWrap.classList.remove('hidden');
        });
    };
    reader.readAsDataURL(file);
}

function resetImagePreview() {
    State.uploadedImageBase64 = null;
    imageInput.value = '';
    imagePreview.src = '';
    dropzoneDefault.classList.remove('hidden');
    dropzonePreviewWrap.classList.add('hidden');
}

// HTML5 Canvas compression function
function compressImage(base64Source, maxWidth, maxHeight, callback) {
    const img = new Image();
    img.src = base64Source;
    img.onload = function() {
        let width = img.width;
        let height = img.height;

        if (width > height) {
            if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
            }
        } else {
            if (height > maxHeight) {
                width = Math.round((width * maxHeight) / height);
                height = maxHeight;
            }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Quality set to 0.7 for optimal file sizes (~10-15KB)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        callback(compressedBase64);
    };
}

// Preset Colors selection
const colorPresetButtons = document.querySelectorAll('.color-preset-btn');
const actualColorPicker = document.getElementById('clothing-color');
const customColorBtn = document.getElementById('btn-custom-color');

colorPresetButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        if (btn.id === 'btn-custom-color') {
            actualColorPicker.click();
            return;
        }
        
        colorPresetButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const colorVal = btn.getAttribute('data-color');
        actualColorPicker.value = colorVal;
    });
});

actualColorPicker.addEventListener('change', (e) => {
    const colorVal = e.target.value;
    
    // Deactivate previous active preset buttons
    colorPresetButtons.forEach(btn => btn.classList.remove('active'));
    
    // Highlight custom color picker icon
    customColorBtn.classList.add('active');
    customColorBtn.style.color = '#ffffff';
    customColorBtn.style.background = colorVal;
});

// Washing Count buttons
const washInput = document.getElementById('clothing-wash-count');
const btnWashMinus = document.getElementById('btn-wash-minus');
const btnWashPlus = document.getElementById('btn-wash-plus');

btnWashMinus.addEventListener('click', () => {
    let val = parseInt(washInput.value) || 0;
    if (val > 0) {
        washInput.value = val - 1;
    }
});

btnWashPlus.addEventListener('click', () => {
    let val = parseInt(washInput.value) || 0;
    washInput.value = val + 1;
});

// Add Clothes Form Submission
const addClothingForm = document.getElementById('add-clothing-form');
addClothingForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!State.currentUser) {
        showToast('인증 오류', '로그인 후 옷 등록이 가능합니다.', 'error');
        return;
    }

    const category = document.getElementById('clothing-category').value;
    const materialKey = document.getElementById('clothing-material').value;
    const color = actualColorPicker.value;
    const purchaseDate = document.getElementById('clothing-purchase-date').value;
    const washCount = parseInt(washInput.value) || 0;

    // Use default leaf SVG placeholder if no image uploaded
    const defaultPlaceholderImage = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%2340916c" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-leaf"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8a7 7 0 0 1-13.9.2"/><path d="M9 22v-4"/></svg>`;
    const clothingImage = State.uploadedImageBase64 || defaultPlaceholderImage;

    const newClothesItem = {
        id: 'cloth_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        userId: State.currentUser.email,
        category,
        materialKey,
        color,
        purchaseDate,
        washCount,
        image: clothingImage,
        createdAt: new Date().toISOString()
    };

    // Save to Database
    const allClothes = JSON.parse(localStorage.getItem('clothes') || '[]');
    allClothes.push(newClothesItem);
    localStorage.setItem('clothes', JSON.stringify(allClothes));

    showToast('의류 등록 완료', `${category} (${MATERIAL_DB[materialKey].name}) 아이템을 옷장에 넣었습니다.`, 'success');

    // Reset Form Fields
    addClothingForm.reset();
    resetImagePreview();
    washInput.value = '0';
    
    // Reset Color presets
    colorPresetButtons.forEach(btn => btn.classList.remove('active'));
    document.querySelector('.color-preset-btn[data-color="#40916c"]').classList.add('active');
    actualColorPicker.value = '#40916c';
    customColorBtn.style.background = '';
    
    // Reload Closet UI
    loadClosetData();
});

// ==========================================
// 7. DASHBOARD DATA LOADING & CALCULATIONS
// ==========================================

function loadClosetData() {
    if (!State.currentUser) return;
    
    const allClothes = JSON.parse(localStorage.getItem('clothes') || '[]');
    // Filter clothes matching current user ID
    State.clothes = allClothes.filter(c => c.userId === State.currentUser.email);
    
    updateDashboardStats();
    renderClothesGrid();
}

function updateDashboardStats() {
    const totalClothes = State.clothes.length;
    document.getElementById('stat-total-clothes').textContent = `${totalClothes}벌`;

    if (totalClothes === 0) {
        document.getElementById('stat-eco-score').textContent = '--점';
        document.getElementById('stat-synthetic-ratio').textContent = '0%';
        document.getElementById('stat-recommended-cycle').textContent = '--일';
        
        const badge = document.getElementById('closet-eco-badge');
        badge.innerHTML = `🍂 준비 단계`;
        badge.className = 'badge-eco-level';
        return;
    }

    // 1. Eco Score calculation (weighted average)
    let scoreSum = 0;
    let syntheticCount = 0;

    State.clothes.forEach(item => {
        const mat = MATERIAL_DB[item.materialKey];
        if (mat) {
            scoreSum += mat.score;
            if (mat.type === 'synthetic') {
                syntheticCount++;
            }
        }
    });

    const averageScore = Math.round(scoreSum / totalClothes);
    document.getElementById('stat-eco-score').textContent = `${averageScore}점`;

    // 2. Synthetic fiber ratio
    const syntheticRatio = Math.round((syntheticCount / totalClothes) * 100);
    document.getElementById('stat-synthetic-ratio').textContent = `${syntheticRatio}%`;

    // 3. Recommended laundry cycle based on fabric configuration and user preferences
    // Synthetics release microplastics, so longer cycles + washing bags are better.
    // Natural fibers like wool/linen can survive longer without washing.
    // Conventional cotton might need slightly more washing.
    let baseCycleDays = 7;
    if (State.currentUser.surveyData) {
        const userFreq = State.currentUser.surveyData.laundryFreq;
        if (userFreq === '보통 (3-4회 착용 후)') baseCycleDays = 10;
        if (userFreq === '드묾 (계절별/장기 착용)') baseCycleDays = 14;
    }
    
    // Add weights according to materials
    let cycleOffset = 0;
    if (syntheticRatio > 50) {
        cycleOffset += 3; // encourage stretching wash cycles for synthetic garments to reduce microplastics
    }
    const finalCycle = baseCycleDays + cycleOffset;
    document.getElementById('stat-recommended-cycle').textContent = `평균 ${finalCycle}일`;

    // 4. Update Eco Grade Badge
    const badge = document.getElementById('closet-eco-badge');
    badge.className = 'badge-eco-level'; // reset
    if (averageScore >= 80) {
        badge.innerHTML = `🌱 녹빛 숲 등급 (우수)`;
        badge.style.color = '#a7f3d0';
        badge.style.borderColor = '#10b981';
        badge.style.backgroundColor = 'rgba(16, 185, 129, 0.2)';
    } else if (averageScore >= 55) {
        badge.innerHTML = `🌿 새싹 등급 (보통)`;
        badge.style.color = '#fef08a';
        badge.style.borderColor = '#eab308';
        badge.style.backgroundColor = 'rgba(234, 179, 8, 0.2)';
    } else if (averageScore >= 35) {
        badge.innerHTML = `🍂 건조 등급 (주의)`;
        badge.style.color = '#fed7aa';
        badge.style.borderColor = '#f97316';
        badge.style.backgroundColor = 'rgba(249, 115, 22, 0.2)';
    } else {
        badge.innerHTML = `🧱 먼지 등급 (부담 높음)`;
        badge.style.color = '#fca5a5';
        badge.style.borderColor = '#ef4444';
        badge.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
    }
}

// Delete item
window.deleteClothingItem = function(itemId) {
    if (!confirm('이 옷을 옷장에서 삭제하시겠습니까?')) return;

    const allClothes = JSON.parse(localStorage.getItem('clothes') || '[]');
    const updatedClothes = allClothes.filter(c => c.id !== itemId);
    localStorage.setItem('clothes', JSON.stringify(updatedClothes));

    showToast('의류 삭제 완료', '선택한 옷을 옷장에서 비웠습니다.', 'info');
    loadClosetData();
};

// ==========================================
// 8. FILTER & SORTING & GRID RENDER
// ==========================================

const gallerySearch = document.getElementById('gallery-search');
const filterCategory = document.getElementById('filter-category');
const filterEco = document.getElementById('filter-eco');
const sortBy = document.getElementById('sort-by');
const clothesGrid = document.getElementById('clothes-grid');
const emptyState = document.getElementById('gallery-empty-state');

// Listen to filter and sorting changes
[gallerySearch, filterCategory, filterEco, sortBy].forEach(element => {
    element.addEventListener('input', renderClothesGrid);
});

function renderClothesGrid() {
    const query = gallerySearch.value.trim().toLowerCase();
    const catFilter = filterCategory.value;
    const ecoFilter = filterEco.value;
    const sortVal = sortBy.value;

    // Filter Items
    let filteredItems = State.clothes.filter(item => {
        const mat = MATERIAL_DB[item.materialKey] || { name: '', grade: 'C', score: 50 };
        
        // 1. Search Query Match (category, material name, preset color, date, grade)
        let matchesSearch = true;
        if (query) {
            const colorName = COLOR_PRESETS_TRANSLATION[item.color] || '';
            const itemText = `${item.category} ${mat.name} ${colorName} ${mat.grade}등급`.toLowerCase();
            matchesSearch = itemText.includes(query);
        }

        // 2. Category Filter
        let matchesCategory = true;
        if (catFilter !== 'all') {
            if (catFilter === '잡화') {
                matchesCategory = ['가방', '모자', '장갑', '스타킹', '신발'].includes(item.category);
            } else {
                matchesCategory = item.category === catFilter;
            }
        }

        // 3. Eco Grade Filter
        let matchesEco = true;
        if (ecoFilter !== 'all') {
            const grade = mat.grade;
            if (ecoFilter === 'low') {
                matchesEco = ['A', 'B'].includes(grade);
            } else if (ecoFilter === 'medium') {
                matchesEco = ['C'].includes(grade);
            } else if (ecoFilter === 'high') {
                matchesEco = ['D', 'E'].includes(grade);
            }
        }

        return matchesSearch && matchesCategory && matchesEco;
    });

    // Sort Items
    filteredItems.sort((a, b) => {
        const matA = MATERIAL_DB[a.materialKey] || { score: 50 };
        const matB = MATERIAL_DB[b.materialKey] || { score: 50 };

        if (sortVal === 'newest') {
            return new Date(b.createdAt) - new Date(a.createdAt);
        } else if (sortVal === 'eco-best') {
            return matB.score - matA.score; // Higher score first
        } else if (sortVal === 'wash-many') {
            return b.washCount - a.washCount; // More washes first
        }
        return 0;
    });

    // Clear grid (preserving empty state element)
    const cards = clothesGrid.querySelectorAll('.clothing-card');
    cards.forEach(card => card.remove());

    if (filteredItems.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        
        filteredItems.forEach(item => {
            const mat = MATERIAL_DB[item.materialKey] || { name: '알 수 없음', grade: 'C', tip: '소재 정보 없음', score: 50 };
            const dateStr = item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short' }) : '미지정';
            
            const card = document.createElement('div');
            card.className = 'clothing-card';
            card.innerHTML = `
                <div class="card-img-wrapper">
                    <img src="${item.image}" alt="${item.category} ${mat.name}">
                    <div class="card-badges">
                        <span class="badge-category">${item.category}</span>
                        <span class="badge-eco-grade grade-${mat.grade.toLowerCase()}">${mat.grade}</span>
                    </div>
                </div>
                
                <div class="card-details">
                    <div class="color-swatch-line">
                        <div class="color-indicator" style="background-color: ${item.color};"></div>
                        <span>색상 코드: ${item.color.toUpperCase()} ${COLOR_PRESETS_TRANSLATION[item.color] ? `(${COLOR_PRESETS_TRANSLATION[item.color]})` : ''}</span>
                    </div>

                    <div class="info-row">
                        <span class="info-label">소재</span>
                        <span class="material-badge-inline">${mat.name}</span>
                    </div>

                    <div class="info-row">
                        <span class="info-label">등록일</span>
                        <span class="info-value">${dateStr}</span>
                    </div>

                    <div class="info-row">
                        <span class="info-label">세탁 횟수</span>
                        <span class="info-value">${item.washCount}회</span>
                    </div>

                    <div class="eco-tip-box">
                        <h5><i data-lucide="info"></i>친환경 관리 팁</h5>
                        <p>${mat.tip}</p>
                    </div>
                </div>
                
                <button type="button" class="btn-delete-card" onclick="deleteClothingItem('${item.id}')" title="삭제">
                    <i data-lucide="trash-2"></i>
                </button>
            `;
            clothesGrid.appendChild(card);
        });

        // Parse newly added icons
        lucide.createIcons();
    }
}
