// In createMediaApp function - replace init() with:

function init() {
    const storedKey = localStorage.getItem(getStorageKey());
    const unlockModal = document.getElementById('unlock-modal');
    const unlockPassword = document.getElementById('unlock-password');
    const unlockBtn = document.getElementById('unlock-btn');
    const unlockError = document.getElementById('unlock-error');
    const unlockErrorMsg = document.getElementById('unlock-error-msg');

    galleryGrid = document.getElementById('gallery-grid');
    summaryTotal = document.getElementById('summary-total-count');
    summaryLast = document.getElementById('summary-last-upload');
    pageTitle = document.getElementById('page-title');
    contentDesc = document.getElementById('content-desc');
    fileInput = document.getElementById('file-input');
    dropZone = document.getElementById('drop-zone');
    previewGrid = document.getElementById('file-preview-grid');
    uploadBtn = document.getElementById('upload-btn');
    clearBtn = document.getElementById('clear-btn');
    progressBar = document.getElementById('progress-bar');
    progressText = document.getElementById('progress-text');
    uploadProgressDiv = document.getElementById('upload-progress');
    storeIdDisplay = document.getElementById('store-id-display');
    apiEndpointDisplay = document.getElementById('api-endpoint-display');
    testResult = document.getElementById('test-result');
    clockDay = document.getElementById('clock-day');
    clockHours = document.getElementById('clock-hours');
    clockMinutes = document.getElementById('clock-minutes');
    clockAmpm = document.getElementById('clock-ampm');
    slideshowOverlay = document.getElementById('slideshow-overlay');
    slideshowImg = document.getElementById('slideshow-image');
    slideshowVideo = document.getElementById('slideshow-video');
    slideshowLoader = document.querySelector('.slideshow-loader');
    slideshowCounter = document.getElementById('slideshow-counter');
    modalOverlay = document.getElementById('custom-modal-overlay');
    modalMessage = document.getElementById('modal-message');
    modalButtons = document.getElementById('modal-buttons');
    dropdownRow = document.getElementById('dropdown-row');
    folderUpBtn = document.getElementById('folder-up-btn');
    categoryInput = document.getElementById('upload-category-input');
    saveCategoryBtn = document.getElementById('save-category-btn');
    secretInput = document.getElementById('api-secretkey-input');
    setBtn = document.getElementById('set-secretkey-btn');

    modalHelpers = BlobUtils.createModalHelpers(modalOverlay, modalMessage, modalButtons);

    if (!storedKey) {
        // ✅ NEW: Fetch encrypted key from backend
        AuthModule.fetchEncryptedKey()
            .then(() => {
                showUnlockModal(true);
                unlockBtn.addEventListener('click', attemptUnlock);
                unlockPassword.addEventListener('keydown', e => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        attemptUnlock();
                    }
                });
            })
            .catch(err => {
                console.error('Failed to load auth:', err);
                modalHelpers.showAlert('❌ Failed to load authentication: ' + err.message);
            });
        return;
    }

    mediaDB.configure({ apiSecretKey: storedKey });

    if (secretInput && storedKey) secretInput.value = storedKey;

    if (setBtn) {
        setBtn.addEventListener('click', () => {
            const newKey = secretInput.value.trim();
            if (!newKey) { 
                modalHelpers.showAlert('Please enter a valid secret key.'); 
                return; 
            }
            localStorage.setItem(getStorageKey(), newKey);
            mediaDB.configure({ apiSecretKey: newKey });
            modalHelpers.showAlert('Secret key saved successfully!');
        });
    }

    BlobUtils.updateClock(clockDay, clockHours, clockMinutes, clockAmpm);
    setInterval(() => BlobUtils.updateClock(clockDay, clockHours, clockMinutes, clockAmpm), 1000);

    // ... rest of your init code ...
}

// ✅ UPDATED: attemptUnlock function
function attemptUnlock() {
    const unlockPassword = document.getElementById('unlock-password');
    const unlockBtn = document.getElementById('unlock-btn');
    const unlockError = document.getElementById('unlock-error');
    const unlockErrorMsg = document.getElementById('unlock-error-msg');
    
    const password = unlockPassword.value.trim();
    if (!password) {
        unlockErrorMsg.textContent = 'Please enter a password.';
        unlockError.classList.remove('hidden');
        return;
    }

    unlockBtn.disabled = true;
    unlockBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Unlocking…';
    unlockError.classList.add('hidden');

    // ✅ Use AuthModule to unlock
    AuthModule.unlockWithPassword(password)
        .then(decryptedKey => {
            localStorage.setItem(getStorageKey(), decryptedKey);
            window.location.reload();
        })
        .catch(err => {
            modalHelpers.showAlert('❌ Unlock failed: ' + err.message);
            unlockErrorMsg.textContent = 'Invalid password. Please try again.';
            unlockError.classList.remove('hidden');
            unlockPassword.value = '';
            unlockPassword.focus();
            unlockBtn.disabled = false;
            unlockBtn.innerHTML = '<i class="fa-solid fa-key"></i> Unlock';
        });
}
