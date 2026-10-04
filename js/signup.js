// Signup Page JavaScript
document.addEventListener('DOMContentLoaded', function () {
    const signupForm = document.getElementById('signupForm');
    const fullNameField = document.getElementById('fullName');
    const phoneField = document.getElementById('phone');
    const emailField = document.getElementById('email');
    const passwordField = document.getElementById('password');
    const confirmPasswordField = document.getElementById('confirmPassword');
    const houseImageField = document.getElementById('houseImage');
    const locationLinkField = document.getElementById('locationLink');

    // Form validation rules
    const validationRules = {
        fullName: {
            required: true,
            minLength: 2,
            maxLength: 50
        },
        phone: {
            required: true,
            phone: true
        },
        email: {
            required: true,
            email: true
        },
        password: {
            required: true,
            minLength: 6
        },
        confirmPassword: {
            required: true
        },
        locationLink: {
            required: true,
            url: true
        }
    };

    // Real-time validation
    fullNameField.addEventListener('blur', function () {
        const errors = UniRide.formValidator.validateField(this, validationRules.fullName);
        UniRide.formValidator.showFieldErrors(this, errors);
    });

    phoneField.addEventListener('blur', function () {
        const errors = UniRide.formValidator.validateField(this, validationRules.phone);
        UniRide.formValidator.showFieldErrors(this, errors);
    });

    emailField.addEventListener('blur', function () {
        const errors = UniRide.formValidator.validateField(this, validationRules.email);
        UniRide.formValidator.showFieldErrors(this, errors);
    });

    passwordField.addEventListener('input', function () {
        updatePasswordStrength(this.value);
    });

    passwordField.addEventListener('blur', function () {
        const errors = UniRide.formValidator.validateField(this, validationRules.password);
        UniRide.formValidator.showFieldErrors(this, errors);
    });

    confirmPasswordField.addEventListener('blur', function () {
        const errors = validateConfirmPassword();
        UniRide.formValidator.showFieldErrors(this, errors);
    });

    locationLinkField.addEventListener('blur', function () {
        const errors = UniRide.formValidator.validateField(this, validationRules.locationLink);
        UniRide.formValidator.showFieldErrors(this, errors);
    });

    // Phone number formatting
    phoneField.addEventListener('input', function () {
        let value = this.value.replace(/\D/g, '');
        if (value.length > 10) {
            value = value.substring(0, 10);
        }
        this.value = value;
    });

    // Image preview
    houseImageField.addEventListener('change', function () {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                showImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    });

    // Form submission
    signupForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Clear previous errors
        clearAllFieldErrors();

        // Validate all fields
        const fullNameErrors = UniRide.formValidator.validateField(fullNameField, validationRules.fullName);
        const phoneErrors = UniRide.formValidator.validateField(phoneField, validationRules.phone);
        const emailErrors = UniRide.formValidator.validateField(emailField, validationRules.email);
        const passwordErrors = UniRide.formValidator.validateField(passwordField, validationRules.password);
        const confirmPasswordErrors = validateConfirmPassword();
        const locationLinkErrors = UniRide.formValidator.validateField(locationLinkField, validationRules.locationLink);

        // Show errors if any
        UniRide.formValidator.showFieldErrors(fullNameField, fullNameErrors);
        UniRide.formValidator.showFieldErrors(phoneField, phoneErrors);
        UniRide.formValidator.showFieldErrors(emailField, emailErrors);
        UniRide.formValidator.showFieldErrors(passwordField, passwordErrors);
        UniRide.formValidator.showFieldErrors(confirmPasswordField, confirmPasswordErrors);
        UniRide.formValidator.showFieldErrors(locationLinkField, locationLinkErrors);

        // If no errors, proceed with signup
        if (fullNameErrors.length === 0 && phoneErrors.length === 0 &&
            emailErrors.length === 0 && passwordErrors.length === 0 &&
            confirmPasswordErrors.length === 0 && locationLinkErrors.length === 0) {
            performSignup();
        }
    });

    // Password strength indicator
    function updatePasswordStrength(password) {
        const strength = UniRide.utils.checkPasswordStrength(password);
        const strengthBar = document.querySelector('.password-strength-bar');

        if (strengthBar) {
            strengthBar.className = `password-strength-bar ${strength.level}`;
        } else {
            createPasswordStrengthIndicator(strength);
        }
    }

    function createPasswordStrengthIndicator(strength) {
        const strengthContainer = document.createElement('div');
        strengthContainer.className = 'password-strength';

        const strengthBar = document.createElement('div');
        strengthBar.className = `password-strength-bar ${strength.level}`;

        strengthContainer.appendChild(strengthBar);
        passwordField.parentNode.appendChild(strengthContainer);
    }

    // Confirm password validation
    function validateConfirmPassword() {
        const errors = [];
        const password = passwordField.value;
        const confirmPassword = confirmPasswordField.value;

        if (!confirmPassword) {
            errors.push('تأكيد كلمة المرور مطلوب');
        } else if (password !== confirmPassword) {
            errors.push('كلمة المرور غير متطابقة');
        }

        return errors;
    }

    // Clear all field errors
    function clearAllFieldErrors() {
        const fields = [fullNameField, phoneField, emailField, passwordField, confirmPasswordField, locationLinkField];
        fields.forEach(field => {
            UniRide.formValidator.clearFieldErrors(field);
        });
    }

    // Show image preview
    function showImagePreview(imageSrc) {
        let previewContainer = document.querySelector('.image-preview');

        if (!previewContainer) {
            previewContainer = document.createElement('div');
            previewContainer.className = 'image-preview';
            houseImageField.parentNode.appendChild(previewContainer);
        }

        previewContainer.innerHTML = `
            <img src="${imageSrc}" alt="معاينة صورة المنزل">
            <p>معاينة صورة واجهة المنزل</p>
        `;
    }

    // Signup function
    function performSignup() {
        const submitBtn = signupForm.querySelector('button[type="submit"]');
        UniRide.utils.showLoading(submitBtn);

        // Simulate API call
        setTimeout(() => {
            const userData = {
                fullName: fullNameField.value.trim(),
                phone: phoneField.value,
                email: emailField.value.trim(),
                password: passwordField.value,
                houseImage: houseImageField.files[0] ? houseImageField.files[0].name : null,
                locationLink: locationLinkField.value.trim(),
                signupDate: new Date().toISOString()
            };

            // Save user data to localStorage (in real app, this would be sent to server)
            const users = UniRide.utils.getFromStorage('users') || [];
            users.push(userData);
            UniRide.utils.saveToStorage('users', users);

            // Create user session
            const userSession = {
                isLoggedIn: true,
                userType: 'student',
                userId: userData.email,
                loginTime: new Date().toISOString()
            };

            UniRide.utils.saveToStorage('userSession', userSession);

            // Show success message
            UniRide.utils.showSuccess('تم إنشاء الحساب بنجاح!', signupForm.parentNode);

            // Redirect to student dashboard
            setTimeout(() => {
                window.location.href = 'student-dashboard.html';
            }, 1500);
        }, 2000);
    }

    // Auto-focus on first field
    fullNameField.focus();

    // Handle Enter key navigation
    const formFields = [fullNameField, phoneField, emailField, passwordField, confirmPasswordField, locationLinkField];

    formFields.forEach((field, index) => {
        field.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (index < formFields.length - 1) {
                    formFields[index + 1].focus();
                } else {
                    signupForm.dispatchEvent(new Event('submit'));
                }
            }
        });
    });

    // Add visual feedback for form interactions
    formFields.forEach(input => {
        input.addEventListener('input', function () {
            if (this.value.trim()) {
                this.classList.add('has-value');
            } else {
                this.classList.remove('has-value');
            }
        });
    });

    // Check if user is already logged in
    const userSession = UniRide.utils.getFromStorage('userSession');
    if (userSession && userSession.isLoggedIn) {
        // Redirect to appropriate dashboard
        if (userSession.userType === 'student') {
            window.location.href = 'student-dashboard.html';
        } else if (userSession.userType === 'driver') {
            window.location.href = 'driver-dashboard.html';
        }
    }
});
