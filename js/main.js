// UniRide - Main JavaScript File
// Global variables and utilities

// Mock data for the application - Enhanced Realistic Data
const mockData = {
    students: [
        {
            id: 1,
            name: "فاطمة أحمد محمد",
            phone: "0501234567",
            email: "fatima@example.com",
            houseImage: "assets/house-placeholder.svg",
            locationLink: "https://maps.google.com/?q=24.7136,46.6753",
            address: "القصيم، حي النهضة، شارع الملك فهد",
            pickupTime: "7:30 صباحاً",
            university: "جامعة القصيم",
            major: "هندسة الحاسوب",
            year: "السنة الثالثة",
            emergencyContact: "0509876543",
            notes: "تفضل الجلوس في المقعد الأمامي"
        },
        {
            id: 2,
            name: "سارة عبدالله العتيبي",
            phone: "0502345678",
            email: "sara@example.com",
            houseImage: "assets/house-placeholder.svg",
            locationLink: "https://maps.google.com/?q=24.7136,46.6753",
            address: "الرياض، حي العليا، شارع العليا الرئيسي",
            pickupTime: "8:00 صباحاً",
            university: "جامعة الأميرة نورة",
            major: "الطب",
            year: "السنة الرابعة",
            emergencyContact: "0508765432",
            notes: "تحتاج مساعدة في حمل الكتب"
        },
        {
            id: 3,
            name: "نورا محمد القحطاني",
            phone: "0503456789",
            email: "nora@example.com",
            houseImage: "assets/house-placeholder.svg",
            locationLink: "https://maps.google.com/?q=24.7136,46.6753",
            address: "الرياض، حي الملز، شارع الملك عبدالعزيز",
            pickupTime: "7:45 صباحاً",
            university: "جامعة الإمام محمد بن سعود",
            major: "الشريعة",
            year: "السنة الثانية",
            emergencyContact: "0507654321",
            notes: "تصل متأخرة أحياناً"
        },
        {
            id: 4,
            name: "ريم عبدالرحمن الشمري",
            phone: "0504567890",
            email: "reem@example.com",
            houseImage: "assets/house-placeholder.svg",
            locationLink: "https://maps.google.com/?q=24.7136,46.6753",
            address: "الرياض، حي النخيل، شارع النخيل",
            pickupTime: "8:15 صباحاً",
            university: "جامعة الملك عبدالعزيز",
            major: "الأدب الإنجليزي",
            year: "السنة الثالثة",
            emergencyContact: "0506543210",
            notes: "تحب الاستماع للموسيقى"
        },
        {
            id: 5,
            name: "هند سعد المطيري",
            phone: "0505678901",
            email: "hind@example.com",
            houseImage: "assets/house-placeholder.svg",
            locationLink: "https://maps.google.com/?q=24.7136,46.6753",
            address: "الرياض، حي الورود، شارع الورود",
            pickupTime: "7:15 صباحاً",
            university: "جامعة القصيم",
            major: "التمريض",
            year: "السنة الرابعة",
            emergencyContact: "0505432109",
            notes: "تدرس في المستشفى أحياناً"
        },
        {
            id: 6,
            name: "مريم خالد الغامدي",
            phone: "0506789012",
            email: "mariam@example.com",
            houseImage: "assets/house-placeholder.svg",
            locationLink: "https://maps.google.com/?q=24.7136,46.6753",
            address: "الرياض، حي الصحافة، شارع الصحافة",
            pickupTime: "8:30 صباحاً",
            university: "جامعة الأميرة نورة",
            major: "الصيدلة",
            year: "السنة الثالثة",
            emergencyContact: "0504321098",
            notes: "تحتاج موقف قريب من الباب الرئيسي"
        }
    ],
    drivers: [
        {
            id: 1,
            name: "أحمد محمد العتيبي",
            phone: "0509876543",
            email: "ahmed@example.com",
            carType: "تويوتا كامري",
            plateNumber: "أ ب ج 1234",
            licenseNumber: "1234567890",
            experience: "5 سنوات",
            rating: 4.8,
            totalTrips: 1250,
            currentLocation: {
                lat: 24.7136,
                lng: 46.6753,
                address: "القصيم، حي النهضة"
            },
            status: "متاح",
            workingHours: "6:00 ص - 6:00 م",
            specialties: ["الجامعات", "المستشفيات", "المراكز التجارية"]
        },
        {
            id: 2,
            name: "محمد عبدالله الشمري",
            phone: "0508765432",
            email: "mohammed@example.com",
            carType: "هونداي إلنترا",
            plateNumber: "د هـ و 5678",
            licenseNumber: "0987654321",
            experience: "3 سنوات",
            rating: 4.6,
            totalTrips: 890,
            currentLocation: {
                lat: 24.7136,
                lng: 46.6753,
                address: "الرياض، حي العليا"
            },
            status: "في رحلة",
            workingHours: "7:00 ص - 5:00 م",
            specialties: ["الجامعات", "المدارس"]
        },
        {
            id: 3,
            name: "سعد علي القحطاني",
            phone: "0507654321",
            email: "saad@example.com",
            carType: "نيسان التيما",
            plateNumber: "ز ح ط 9012",
            licenseNumber: "1122334455",
            experience: "7 سنوات",
            rating: 4.9,
            totalTrips: 2100,
            currentLocation: {
                lat: 24.7136,
                lng: 46.6753,
                address: "الرياض، حي الملز"
            },
            status: "متاح",
            workingHours: "5:30 ص - 7:00 م",
            specialties: ["الجامعات", "المستشفيات", "المطارات"]
        }
    ],
    trips: [
        {
            id: 1,
            studentId: 1,
            driverId: 1,
            date: "2024-01-15",
            pickupTime: "7:30",
            dropoffTime: "8:00",
            status: "مكتملة",
            rating: 5,
            notes: "رحلة ممتازة"
        },
        {
            id: 2,
            studentId: 2,
            driverId: 1,
            date: "2024-01-15",
            pickupTime: "8:00",
            dropoffTime: "8:30",
            status: "جارية",
            rating: null,
            notes: ""
        },
        {
            id: 3,
            studentId: 3,
            driverId: 2,
            date: "2024-01-15",
            pickupTime: "7:45",
            dropoffTime: "8:15",
            status: "مجدولة",
            rating: null,
            notes: ""
        }
    ],
    schedule: [
        { day: "الأحد", times: "7:00 ص - 3:00 م", subjects: ["هندسة البرمجيات", "قواعد البيانات", "الذكاء الاصطناعي"] },
        { day: "الاثنين", times: "8:00 ص - 2:00 م", subjects: ["الرياضيات", "الفيزياء", "الكيمياء"] },
        { day: "الثلاثاء", times: "7:30 ص - 4:00 م", subjects: ["التصميم", "التطوير", "الاختبار"] },
        { day: "الأربعاء", times: "8:30 ص - 1:30 م", subjects: ["الإدارة", "المحاسبة", "التسويق"] },
        { day: "الخميس", times: "7:00 ص - 3:30 م", subjects: ["البحث", "التدريب", "المشروع"] }
    ],
    notifications: [
        {
            id: 1,
            message: "تم تأكيد رحلتك غداً مع السائق أحمد",
            time: "منذ 5 دقائق",
            type: "trip_confirmation",
            read: false
        },
        {
            id: 2,
            message: "السائق أحمد سيصل خلال 10 دقائق",
            time: "منذ ساعة",
            type: "driver_arrival",
            read: false
        },
        {
            id: 3,
            message: "تم تحديث جدولك الدراسي",
            time: "منذ يومين",
            type: "schedule_update",
            read: true
        },
        {
            id: 4,
            message: "تقييمك للرحلة الأخيرة يساعدنا في التحسين",
            time: "منذ 3 أيام",
            type: "rating_request",
            read: true
        }
    ],
    universities: [
        { id: 1, name: "جامعة القصيم", location: "القصيم، حي النهضة" },
        { id: 2, name: "جامعة الأميرة نورة", location: "الرياض، حي النرجس" },
        { id: 3, name: "جامعة الإمام محمد بن سعود", location: "الرياض، حي الملز" },
        { id: 4, name: "جامعة الملك عبدالعزيز", location: "جدة" },
        { id: 5, name: "جامعة الملك فهد للبترول والمعادن", location: "الظهران" }
    ],
    routes: [
        {
            id: 1,
            name: "الطريق الشمالي",
            startPoint: "حي النهضة",
            endPoint: "جامعة القصيم",
            distance: "12.5 كم",
            estimatedTime: "25 دقيقة",
            trafficLevel: "متوسط"
        },
        {
            id: 2,
            name: "الطريق الشرقي",
            startPoint: "حي العليا",
            endPoint: "جامعة الأميرة نورة",
            distance: "8.3 كم",
            estimatedTime: "18 دقيقة",
            trafficLevel: "خفيف"
        },
        {
            id: 3,
            name: "الطريق الجنوبي",
            startPoint: "حي الملز",
            endPoint: "جامعة الإمام محمد بن سعود",
            distance: "15.7 كم",
            estimatedTime: "32 دقيقة",
            trafficLevel: "ثقيل"
        }
    ]
};

// Utility functions
const utils = {
    // Show loading state
    showLoading: function (element) {
        element.classList.add('loading');
        element.disabled = true;
    },

    // Hide loading state
    hideLoading: function (element) {
        element.classList.remove('loading');
        element.disabled = false;
    },

    // Show success message
    showSuccess: function (message, container) {
        const successDiv = document.createElement('div');
        successDiv.className = 'message message-success';
        successDiv.textContent = message;
        container.insertBefore(successDiv, container.firstChild);

        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    },

    // Show error message
    showError: function (message, container) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'message message-error';
        errorDiv.textContent = message;
        container.insertBefore(errorDiv, container.firstChild);

        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    },

    // Validate email
    validateEmail: function (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Validate phone number (Saudi format)
    validatePhone: function (phone) {
        const phoneRegex = /^05[0-9]{8}$/;
        return phoneRegex.test(phone);
    },

    // Format phone number
    formatPhone: function (phone) {
        return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    },

    // Check password strength
    checkPasswordStrength: function (password) {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        return {
            score: strength,
            level: strength < 2 ? 'weak' : strength < 3 ? 'fair' : strength < 4 ? 'good' : 'strong'
        };
    },

    // Local storage helpers
    saveToStorage: function (key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Error saving to localStorage:', e);
            return false;
        }
    },

    getFromStorage: function (key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Error reading from localStorage:', e);
            return null;
        }
    },

    removeFromStorage: function (key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Error removing from localStorage:', e);
            return false;
        }
    }
};

// Form validation helper
const formValidator = {
    validateField: function (field, rules) {
        const value = field.value.trim();
        const errors = [];

        if (rules.required && !value) {
            errors.push('هذا الحقل مطلوب');
        }

        if (value && rules.minLength && value.length < rules.minLength) {
            errors.push(`يجب أن يكون على الأقل ${rules.minLength} أحرف`);
        }

        if (value && rules.maxLength && value.length > rules.maxLength) {
            errors.push(`يجب أن يكون أقل من ${rules.maxLength} أحرف`);
        }

        if (value && rules.email && !utils.validateEmail(value)) {
            errors.push('البريد الإلكتروني غير صحيح');
        }

        if (value && rules.phone && !utils.validatePhone(value)) {
            errors.push('رقم الجوال غير صحيح (يجب أن يبدأ بـ 05 ويحتوي على 10 أرقام)');
        }

        if (value && rules.url && !this.isValidUrl(value)) {
            errors.push('الرابط غير صحيح');
        }

        return errors;
    },

    isValidUrl: function (string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    },

    showFieldErrors: function (field, errors) {
        this.clearFieldErrors(field);

        if (errors.length > 0) {
            field.classList.add('error');
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = errors[0];
            field.parentNode.appendChild(errorDiv);
        } else {
            field.classList.add('success');
        }
    },

    clearFieldErrors: function (field) {
        field.classList.remove('error', 'success');
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
    }
};

// Animation helpers
const animations = {
    fadeIn: function (element, duration = 300) {
        element.style.opacity = '0';
        element.style.display = 'block';

        let start = performance.now();

        function animate(currentTime) {
            let elapsed = currentTime - start;
            let progress = Math.min(elapsed / duration, 1);

            element.style.opacity = progress;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }

        requestAnimationFrame(animate);
    },

    fadeOut: function (element, duration = 300) {
        let start = performance.now();
        let initialOpacity = parseFloat(getComputedStyle(element).opacity);

        function animate(currentTime) {
            let elapsed = currentTime - start;
            let progress = Math.min(elapsed / duration, 1);

            element.style.opacity = initialOpacity * (1 - progress);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
            }
        }

        requestAnimationFrame(animate);
    },

    slideDown: function (element, duration = 300) {
        element.style.height = '0';
        element.style.overflow = 'hidden';
        element.style.display = 'block';

        let targetHeight = element.scrollHeight;
        let start = performance.now();

        function animate(currentTime) {
            let elapsed = currentTime - start;
            let progress = Math.min(elapsed / duration, 1);

            element.style.height = (targetHeight * progress) + 'px';

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.style.height = 'auto';
                element.style.overflow = 'visible';
            }
        }

        requestAnimationFrame(animate);
    },

    slideUp: function (element, duration = 300) {
        let startHeight = element.offsetHeight;
        element.style.height = startHeight + 'px';
        element.style.overflow = 'hidden';

        let start = performance.now();

        function animate(currentTime) {
            let elapsed = currentTime - start;
            let progress = Math.min(elapsed / duration, 1);

            element.style.height = (startHeight * (1 - progress)) + 'px';

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
                element.style.height = 'auto';
                element.style.overflow = 'visible';
            }
        }

        requestAnimationFrame(animate);
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    // Add smooth scrolling to all links
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

    // Add loading states to all forms
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function (e) {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                utils.showLoading(submitBtn);
            }
        });
    });

    // Add focus effects to form inputs
    document.querySelectorAll('input, textarea, select').forEach(input => {
        input.addEventListener('focus', function () {
            this.parentNode.classList.add('focused');
        });

        input.addEventListener('blur', function () {
            this.parentNode.classList.remove('focused');
        });
    });

    // Initialize tooltips for better UX
    document.querySelectorAll('[title]').forEach(element => {
        element.addEventListener('mouseenter', function () {
            // Simple tooltip implementation
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = this.getAttribute('title');
            tooltip.style.cssText = `
                position: absolute;
                background: #333;
                color: white;
                padding: 5px 10px;
                border-radius: 4px;
                font-size: 12px;
                z-index: 1000;
                pointer-events: none;
            `;

            document.body.appendChild(tooltip);

            const rect = this.getBoundingClientRect();
            tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
            tooltip.style.top = rect.top - tooltip.offsetHeight - 5 + 'px';

            this.addEventListener('mouseleave', function () {
                tooltip.remove();
            }, { once: true });
        });
    });
});

// Export for use in other files
window.UniRide = {
    mockData,
    utils,
    formValidator,
    animations
};

// Make sure UniRide is available immediately
if (typeof window.UniRide === 'undefined') {
    window.UniRide = {
        mockData: {},
        utils: {},
        formValidator: {},
        animations: {}
    };
}

// Initialize sample users if not exist
document.addEventListener('DOMContentLoaded', function () {
    if (!localStorage.getItem('users')) {
        const sampleUsers = [
            {
                id: 1,
                fullName: "فاطمة أحمد محمد",
                phone: "0501234567",
                email: "student@uniride.com",
                password: "",
                userType: "student",
                houseImage: "assets/house-placeholder.svg",
                locationLink: "https://maps.google.com/?q=24.7136,46.6753",
                address: "القصيم، حي النهضة، شارع الملك فهد",
                pickupTime: "7:30 صباحاً",
                university: "جامعة القصيم",
                major: "هندسة الحاسوب",
                year: "السنة الثالثة",
                emergencyContact: "0509876543",
                notes: "تفضل الجلوس في المقعد الأمامي",
                signupDate: new Date().toISOString()
            },
            {
                id: 2,
                fullName: "أحمد محمد العتيبي",
                phone: "0509876543",
                email: "driver@uniride.com",
                password: "",
                userType: "driver",
                carType: "تويوتا كامري",
                plateNumber: "أ ب ج 1234",
                licenseNumber: "1234567890",
                experience: "5 سنوات",
                rating: 4.8,
                totalTrips: 1250,
                currentLocation: {
                    lat: 24.7136,
                    lng: 46.6753,
                    address: "القصيم، حي النهضة"
                },
                status: "متاح",
                workingHours: "6:00 ص - 6:00 م",
                specialties: ["الجامعات", "المستشفيات", "المراكز التجارية"],
                signupDate: new Date().toISOString()
            }
        ];
        localStorage.setItem('users', JSON.stringify(sampleUsers));
    }
});
