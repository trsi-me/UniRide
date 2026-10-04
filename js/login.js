// Login Page JavaScript - Simplified Version
document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    const emailPhoneField = document.getElementById('emailPhone');
    const passwordField = document.getElementById('password');

    // Simple validation function
    function validateField(field, rules) {
        const value = field.value.trim();
        const errors = [];

        if (rules.required && !value) {
            errors.push('هذا الحقل مطلوب');
        }

        if (value && rules.minLength && value.length < rules.minLength) {
            errors.push(`يجب أن يكون على الأقل ${rules.minLength} أحرف`);
        }

        return errors;
    }

    // Show field errors
    function showFieldErrors(field, errors) {
        // Clear previous errors
        field.classList.remove('error', 'success');
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        if (errors.length > 0) {
            field.classList.add('error');
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = errors[0];
            field.parentNode.appendChild(errorDiv);
        } else if (field.value.trim()) {
            field.classList.add('success');
        }
    }

    // Show success message
    function showSuccess(message, container) {
        const successDiv = document.createElement('div');
        successDiv.className = 'message message-success';
        successDiv.textContent = message;
        container.insertBefore(successDiv, container.firstChild);

        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }

    // Show error message
    function showError(message, container) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'message message-error';
        errorDiv.textContent = message;
        container.insertBefore(errorDiv, container.firstChild);

        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }

    // Save to localStorage
    function saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Error saving to localStorage:', e);
            return false;
        }
    }

    // Form validation rules
    const validationRules = {
        emailPhone: {
            required: true,
            minLength: 3
        },
        password: {
            required: true,
            minLength: 6
        }
    };

    // Real-time validation
    emailPhoneField.addEventListener('blur', function () {
        const errors = validateField(this, validationRules.emailPhone);
        showFieldErrors(this, errors);
    });

    passwordField.addEventListener('blur', function () {
        const errors = validateField(this, validationRules.password);
        showFieldErrors(this, errors);
    });

    // Form submission
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Clear previous errors
        showFieldErrors(emailPhoneField, []);
        showFieldErrors(passwordField, []);

        // Validate all fields
        const emailPhoneErrors = validateField(emailPhoneField, validationRules.emailPhone);
        const passwordErrors = validateField(passwordField, validationRules.password);

        // Show errors if any
        showFieldErrors(emailPhoneField, emailPhoneErrors);
        showFieldErrors(passwordField, passwordErrors);

        // If no errors, proceed with login
        if (emailPhoneErrors.length === 0 && passwordErrors.length === 0) {
            performLogin();
        }
    });

    // Login function
    async function performLogin() {
        const submitBtn = loginForm.querySelector('button[type="submit"]');

        // Show loading state
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        try {
            const emailPhone = emailPhoneField.value.trim();
            const password = passwordField.value;

            // استدعاء API لتسجيل الدخول
            const response = await AuthAPI.login(emailPhone, password);

            if (response.success) {
                // حفظ بيانات المستخدم
                sessionStorage.setItem('currentUser', JSON.stringify(response.data.user));
                sessionStorage.setItem('userProfile', JSON.stringify(response.data.profile));

                // Show success message
                showSuccess('تم تسجيل الدخول بنجاح!', loginForm.parentNode);

                // Redirect based on user type
                setTimeout(() => {
                    if (response.data.user.user_type === 'student') {
                        window.location.href = 'student-dashboard.html';
                    } else if (response.data.user.user_type === 'driver') {
                        window.location.href = 'driver-dashboard.html';
                    }
                }, 1000);
            }
        } catch (error) {
            showError(error.message || 'حدث خطأ أثناء تسجيل الدخول', loginForm.parentNode);

            // Hide loading state
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    }

    // Auto-focus on first field
    emailPhoneField.focus();

    // Handle Enter key navigation
    emailPhoneField.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            passwordField.focus();
        }
    });

    passwordField.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            loginForm.dispatchEvent(new Event('submit'));
        }
    });

    // Add visual feedback for form interactions
    const formInputs = loginForm.querySelectorAll('input');
    formInputs.forEach(input => {
        input.addEventListener('input', function () {
            if (this.value.trim()) {
                this.classList.add('has-value');
            } else {
                this.classList.remove('has-value');
            }
        });
    });

    // Check if user is already logged in
    checkAuthOnLoad().then(response => {
        if (response.authenticated) {
            // Redirect to appropriate dashboard
            if (response.user.user_type === 'student') {
                window.location.href = 'student-dashboard.html';
            } else if (response.user.user_type === 'driver') {
                window.location.href = 'driver-dashboard.html';
            }
        }
    });
});