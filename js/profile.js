// Profile Page JavaScript
document.addEventListener('DOMContentLoaded', function () {
    const editModal = document.getElementById('editModal');
    const editForm = document.getElementById('editForm');

    // Initialize profile page
    initializeProfile();

    // Load user data
    function initializeProfile() {
        const userSession = UniRide.utils.getFromStorage('userSession');
        if (!userSession || !userSession.isLoggedIn) {
            window.location.href = 'index.html';
            return;
        }

        loadUserProfile();
    }

    // Load user profile data
    function loadUserProfile() {
        const users = UniRide.utils.getFromStorage('users') || [];
        const userSession = UniRide.utils.getFromStorage('userSession');

        // Find current user data
        const currentUser = users.find(user => user.email === userSession.userId);

        if (currentUser) {
            // Update profile display
            updateProfileDisplay(currentUser);

            // Update edit form with current data
            updateEditForm(currentUser);
        } else {
            // Use mock data if no user data found
            const mockUser = {
                fullName: 'فاطمة أحمد محمد',
                phone: '0501234567',
                email: 'fatima@example.com',
                houseImage: 'assets/house-placeholder.jpg',
                locationLink: 'https://maps.google.com/?q=24.7136,46.6753'
            };

            updateProfileDisplay(mockUser);
            updateEditForm(mockUser);
        }
    }

    // Update profile display
    function updateProfileDisplay(user) {
        const fullNameElement = document.getElementById('fullName');
        const phoneElement = document.getElementById('phone');
        const emailElement = document.getElementById('email');
        const houseImageElement = document.getElementById('houseImage');
        const locationLinkElement = document.getElementById('locationLink');

        if (fullNameElement) fullNameElement.textContent = user.fullName;
        if (phoneElement) phoneElement.textContent = user.phone;
        if (emailElement) emailElement.textContent = user.email;
        if (houseImageElement) houseImageElement.src = user.houseImage;
        if (locationLinkElement) locationLinkElement.href = user.locationLink;
    }

    // Update edit form with current data
    function updateEditForm(user) {
        const editFullName = document.getElementById('editFullName');
        const editPhone = document.getElementById('editPhone');
        const editEmail = document.getElementById('editEmail');
        const editLocationLink = document.getElementById('editLocationLink');

        if (editFullName) editFullName.value = user.fullName;
        if (editPhone) editPhone.value = user.phone;
        if (editEmail) editEmail.value = user.email;
        if (editLocationLink) editLocationLink.value = user.locationLink;
    }

    // Edit profile function
    window.editProfile = function () {
        editModal.style.display = 'block';
        UniRide.animations.fadeIn(editModal);

        // Focus on first field
        const firstField = editForm.querySelector('input');
        if (firstField) {
            setTimeout(() => firstField.focus(), 100);
        }
    };

    // Close edit modal
    window.closeEditModal = function () {
        UniRide.animations.fadeOut(editModal, 300);
        setTimeout(() => {
            editModal.style.display = 'none';
        }, 300);
    };

    // Save profile changes
    window.saveProfile = function () {
        const editFullName = document.getElementById('editFullName');
        const editPhone = document.getElementById('editPhone');
        const editEmail = document.getElementById('editEmail');
        const editHouseImage = document.getElementById('editHouseImage');
        const editLocationLink = document.getElementById('editLocationLink');

        // Validate form
        const validationRules = {
            fullName: { required: true, minLength: 2, maxLength: 50 },
            phone: { required: true, phone: true },
            email: { required: true, email: true },
            locationLink: { required: true, url: true }
        };

        // Clear previous errors
        [editFullName, editPhone, editEmail, editLocationLink].forEach(field => {
            UniRide.formValidator.clearFieldErrors(field);
        });

        // Validate fields
        const fullNameErrors = UniRide.formValidator.validateField(editFullName, validationRules.fullName);
        const phoneErrors = UniRide.formValidator.validateField(editPhone, validationRules.phone);
        const emailErrors = UniRide.formValidator.validateField(editEmail, validationRules.email);
        const locationLinkErrors = UniRide.formValidator.validateField(editLocationLink, validationRules.locationLink);

        // Show errors if any
        UniRide.formValidator.showFieldErrors(editFullName, fullNameErrors);
        UniRide.formValidator.showFieldErrors(editPhone, phoneErrors);
        UniRide.formValidator.showFieldErrors(editEmail, emailErrors);
        UniRide.formValidator.showFieldErrors(editLocationLink, locationLinkErrors);

        // If no errors, save changes
        if (fullNameErrors.length === 0 && phoneErrors.length === 0 &&
            emailErrors.length === 0 && locationLinkErrors.length === 0) {

            const saveBtn = editForm.querySelector('.btn-primary');
            UniRide.utils.showLoading(saveBtn);

            // Simulate API call
            setTimeout(() => {
                const updatedUser = {
                    fullName: editFullName.value.trim(),
                    phone: editPhone.value,
                    email: editEmail.value.trim(),
                    locationLink: editLocationLink.value.trim(),
                    houseImage: editHouseImage.files[0] ? editHouseImage.files[0].name : null
                };

                // Update user data in localStorage
                const users = UniRide.utils.getFromStorage('users') || [];
                const userSession = UniRide.utils.getFromStorage('userSession');
                const userIndex = users.findIndex(user => user.email === userSession.userId);

                if (userIndex !== -1) {
                    users[userIndex] = { ...users[userIndex], ...updatedUser };
                    UniRide.utils.saveToStorage('users', users);
                }

                // Update profile display
                updateProfileDisplay(updatedUser);

                // Close modal
                closeEditModal();

                // Show success message
                UniRide.utils.showSuccess('تم تحديث المعلومات بنجاح!', document.querySelector('.profile-container'));

                UniRide.utils.hideLoading(saveBtn);
            }, 1500);
        }
    };

    // Logout function
    window.logout = function () {
        // Show confirmation dialog
        if (confirm('هل أنت متأكدة من تسجيل الخروج؟')) {
            // Clear user session
            UniRide.utils.removeFromStorage('userSession');

            // Show success message
            UniRide.utils.showSuccess('تم تسجيل الخروج بنجاح!', document.querySelector('.profile-container'));

            // Redirect to login page
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
    };

    // Handle image preview in edit form
    const editHouseImage = document.getElementById('editHouseImage');
    if (editHouseImage) {
        editHouseImage.addEventListener('change', function () {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    // Update the main profile image
                    const mainImage = document.getElementById('houseImage');
                    if (mainImage) {
                        mainImage.src = e.target.result;
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Close modal when clicking outside
    editModal.addEventListener('click', function (e) {
        if (e.target === editModal) {
            closeEditModal();
        }
    });

    // Handle Enter key in edit form
    editForm.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveProfile();
        }
    });

    // Add visual feedback for form interactions
    const editInputs = editForm.querySelectorAll('input');
    editInputs.forEach(input => {
        input.addEventListener('input', function () {
            if (this.value.trim()) {
                this.classList.add('has-value');
            } else {
                this.classList.remove('has-value');
            }
        });
    });

    // Phone number formatting in edit form
    const editPhone = document.getElementById('editPhone');
    if (editPhone) {
        editPhone.addEventListener('input', function () {
            let value = this.value.replace(/\D/g, '');
            if (value.length > 10) {
                value = value.substring(0, 10);
            }
            this.value = value;
        });
    }

    // Add keyboard shortcuts
    document.addEventListener('keydown', function (e) {
        // Escape to close modal
        if (e.key === 'Escape') {
            closeEditModal();
        }

        // Ctrl/Cmd + E to edit profile
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            editProfile();
        }
    });

    // Add smooth scrolling for better UX
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});
