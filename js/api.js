/**
 * UniRide - API Client
 * عميل API للتواصل مع الخادم
 */

const API_BASE_URL = 'api/';

/**
 * دالة عامة لإرسال طلبات API
 */
async function apiRequest(endpoint, options = {}) {
    const defaultOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'same-origin'
    };

    const config = { ...defaultOptions, ...options };

    try {
        const response = await fetch(API_BASE_URL + endpoint, config);

        // قراءة الاستجابة كنص أولاً للتحقق من نوعها
        const textResponse = await response.text();
        let data;

        // التحقق من نوع المحتوى
        const contentType = response.headers.get('content-type');
        const isJson = contentType && contentType.includes('application/json');

        // التحقق إذا كانت الاستجابة HTML (صفحة خطأ)
        if (textResponse.trim().startsWith('<') ||
            textResponse.includes('<html') ||
            textResponse.includes('<!DOCTYPE') ||
            textResponse.includes('<br />')) {
            console.error('HTML response received instead of JSON:', textResponse.substring(0, 200));
            throw new Error(`خطأ في الخادم: تم استلام صفحة HTML بدلاً من JSON. Status: ${response.status}. تحقق من أن ملف API موجود ويعمل بشكل صحيح.`);
        }

        // محاولة تحليل JSON
        if (isJson || textResponse.trim().startsWith('{') || textResponse.trim().startsWith('[')) {
            try {
                data = JSON.parse(textResponse);
            } catch (parseError) {
                console.error('Failed to parse JSON response:', textResponse.substring(0, 200));
                throw new Error(`استجابة غير صالحة من الخادم: ${response.status} ${response.statusText}. السبب: ${parseError.message}`);
            }
        } else {
            // إذا لم يكن JSON ولم يكن HTML، قد يكون نص عادي
            throw new Error(`استجابة غير متوقعة من الخادم: ${response.status} ${response.statusText}`);
        }

        if (!response.ok) {
            throw new Error(data.message || data.error || `حدث خطأ في الاتصال بالخادم: ${response.status} ${response.statusText}`);
        }

        return data;
    } catch (error) {
        console.error('API Request Error:', error);
        // إذا كان الخطأ من نوع TypeError (مثل مشكلة في الشبكة)، أضف رسالة أوضح
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error('فشل الاتصال بالخادم. تحقق من اتصالك بالإنترنت أو أن الخادم يعمل.');
        }
        throw error;
    }
}

/**
 * API للمصادقة
 */
const AuthAPI = {
    /**
     * تسجيل الدخول
     */
    login: async (emailPhone, password) => {
        return await apiRequest('auth.php?action=login', {
            method: 'POST',
            body: JSON.stringify({ emailPhone, password })
        });
    },

    /**
     * إنشاء حساب جديد
     */
    register: async (userData) => {
        return await apiRequest('auth.php?action=register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },

    /**
     * تسجيل الخروج
     */
    logout: async () => {
        return await apiRequest('auth.php?action=logout', {
            method: 'POST'
        });
    },

    /**
     * التحقق من حالة تسجيل الدخول
     */
    checkAuth: async () => {
        return await apiRequest('auth.php?action=check');
    },

    /**
     * الحصول على بيانات الملف الشخصي
     */
    getProfile: async () => {
        return await apiRequest('auth.php?action=profile');
    }
};

/**
 * API للطالبات
 */
const StudentAPI = {
    /**
     * الحصول على بيانات الطالبة
     */
    getProfile: async () => {
        return await apiRequest('students.php?action=profile');
    },

    /**
     * تحديث بيانات الطالبة
     */
    updateProfile: async (profileData) => {
        return await apiRequest('students.php?action=profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    },

    /**
     * الحصول على الجدول الدراسي
     */
    getSchedule: async () => {
        return await apiRequest('students.php?action=schedule');
    },

    /**
     * تحديث الجدول الدراسي
     */
    updateSchedule: async (schedules) => {
        return await apiRequest('students.php?action=schedule', {
            method: 'POST',
            body: JSON.stringify({ schedules })
        });
    },

    /**
     * الحصول على رحلات الطالبة
     */
    getTrips: async (limit = 10, offset = 0) => {
        return await apiRequest(`students.php?action=trips&limit=${limit}&offset=${offset}`);
    },

    /**
     * الحصول على الرحلة الحالية
     */
    getCurrentTrip: async () => {
        return await apiRequest('students.php?action=current-trip');
    },

    /**
     * الحصول على الإشعارات
     */
    getNotifications: async (limit = 20, unreadOnly = false) => {
        return await apiRequest(`students.php?action=notifications&limit=${limit}&unread=${unreadOnly}`);
    },

    /**
     * تحديد الإشعار كمقروء
     */
    markNotificationRead: async (notificationId = null) => {
        return await apiRequest('students.php?action=notifications', {
            method: 'PUT',
            body: JSON.stringify({ notification_id: notificationId })
        });
    },
    
    /**
     * حجز رحلة جديدة
     */
    bookTrip: async (tripData) => {
        return await apiRequest('students.php?action=book-trip', {
            method: 'POST',
            body: JSON.stringify(tripData)
        });
    }
};

/**
 * API للسائقين
 */
const DriverAPI = {
    /**
     * الحصول على بيانات السائق
     */
    getProfile: async () => {
        return await apiRequest('drivers.php?action=profile');
    },

    /**
     * تحديث بيانات السائق
     */
    updateProfile: async (profileData) => {
        return await apiRequest('drivers.php?action=profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    },

    /**
     * تحديث حالة السائق
     */
    updateStatus: async (status) => {
        return await apiRequest('drivers.php?action=status', {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    },

    /**
     * الحصول على رحلات السائق
     */
    getTrips: async (limit = 10, offset = 0) => {
        return await apiRequest(`drivers.php?action=trips&limit=${limit}&offset=${offset}`);
    },

    /**
     * الحصول على رحلات اليوم
     */
    getTodayTrips: async () => {
        return await apiRequest('drivers.php?action=today-trips');
    },

    /**
     * الحصول على الطالبات المخصصات
     */
    getAssignedStudents: async () => {
        return await apiRequest('drivers.php?action=students');
    },

    /**
     * الحصول على إحصائيات السائق
     */
    getStats: async () => {
        return await apiRequest('drivers.php?action=stats');
    },

    /**
     * تحديث موقع السائق
     */
    updateLocation: async (tripId, latitude, longitude, speed = null, heading = null, accuracy = null) => {
        return await apiRequest('drivers.php?action=update-location', {
            method: 'POST',
            body: JSON.stringify({
                trip_id: tripId,
                latitude,
                longitude,
                speed,
                heading,
                accuracy
            })
        });
    },
    
    /**
     * الحصول على طلبات الرحلات المعلقة
     */
    getTripRequests: async () => {
        return await apiRequest('drivers.php?action=trip-requests');
    },
    
    /**
     * قبول طلب رحلة
     */
    acceptTripRequest: async (requestId) => {
        return await apiRequest('drivers.php?action=accept-trip', {
            method: 'POST',
            body: JSON.stringify({ request_id: requestId })
        });
    },
    
    /**
     * رفض طلب رحلة
     */
    rejectTripRequest: async (requestId) => {
        return await apiRequest('drivers.php?action=reject-trip', {
            method: 'POST',
            body: JSON.stringify({ request_id: requestId })
        });
    },
    
    /**
     * إضافة رحلة جديدة
     */
    addTrip: async (tripData) => {
        return await apiRequest('drivers.php?action=add-trip', {
            method: 'POST',
            body: JSON.stringify(tripData)
        });
    },
    
    /**
     * الإبلاغ عن حالة طوارئ
     */
    reportEmergency: async (emergencyData) => {
        return await apiRequest('drivers.php?action=emergency', {
            method: 'POST',
            body: JSON.stringify(emergencyData)
        });
    },
    
    /**
     * تسجيل وقود
     */
    recordFuel: async (fuelData) => {
        return await apiRequest('drivers.php?action=fuel', {
            method: 'POST',
            body: JSON.stringify(fuelData)
        });
    },
    
    /**
     * تسجيل صيانة
     */
    recordMaintenance: async (maintenanceData) => {
        return await apiRequest('drivers.php?action=maintenance', {
            method: 'POST',
            body: JSON.stringify(maintenanceData)
        });
    }
};

/**
 * دوال مساعدة
 */
const UIHelpers = {
    /**
     * عرض رسالة نجاح
     */
    showSuccess: (message) => {
        const notification = document.createElement('div');
        notification.className = 'notification-popup success';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },

    /**
     * عرض رسالة خطأ
     */
    showError: (message) => {
        const notification = document.createElement('div');
        notification.className = 'notification-popup error';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },

    /**
     * عرض مؤشر التحميل
     */
    showLoading: (element) => {
        if (element) {
            element.classList.add('loading');
            element.disabled = true;
        }
    },

    /**
     * إخفاء مؤشر التحميل
     */
    hideLoading: (element) => {
        if (element) {
            element.classList.remove('loading');
            element.disabled = false;
        }
    },

    /**
     * تنسيق التاريخ
     */
    formatDate: (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    /**
     * تنسيق الوقت
     */
    formatTime: (timeString) => {
        if (!timeString) return '';

        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const period = hour >= 12 ? 'مساءً' : 'صباحاً';
        const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);

        return `${displayHour}:${minutes} ${period}`;
    },

    /**
     * تنسيق المبلغ المالي
     */
    formatCurrency: (amount) => {
        return `${parseFloat(amount).toFixed(2)} ريال`;
    },

    /**
     * حساب الوقت المنقضي
     */
    timeAgo: (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return 'الآن';
        if (seconds < 3600) return `منذ ${Math.floor(seconds / 60)} دقيقة`;
        if (seconds < 86400) return `منذ ${Math.floor(seconds / 3600)} ساعة`;
        if (seconds < 604800) return `منذ ${Math.floor(seconds / 86400)} يوم`;

        return UIHelpers.formatDate(dateString);
    }
};

/**
 * التحقق من تسجيل الدخول عند تحميل الصفحة
 */
async function checkAuthOnLoad() {
    try {
        const response = await AuthAPI.checkAuth();

        if (!response.authenticated) {
            // إعادة التوجيه لصفحة تسجيل الدخول إذا لم يكن مسجلاً
            const currentPage = window.location.pathname;
            const publicPages = ['index.html', 'signup.html', 'start.html'];
            const isPublicPage = publicPages.some(page => currentPage.includes(page));

            if (!isPublicPage) {
                window.location.href = 'index.html';
            }
        } else {
            // حفظ بيانات المستخدم في sessionStorage
            sessionStorage.setItem('currentUser', JSON.stringify(response.user));
        }

        return response;
    } catch (error) {
        console.error('Auth Check Error:', error);
        return { authenticated: false };
    }
}

/**
 * الحصول على المستخدم الحالي من sessionStorage
 */
function getCurrentUser() {
    const userStr = sessionStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

/**
 * تسجيل الخروج
 */
async function logout() {
    try {
        await AuthAPI.logout();
        sessionStorage.clear();
        // Redirect to login page with logout parameter
        window.location.href = 'index.html?logout=true';
    } catch (error) {
        console.error('Logout Error:', error);
        // Clear session anyway and redirect
        sessionStorage.clear();
        window.location.href = 'index.html?logout=true';
    }
}
