// Enhanced Driver Dashboard JavaScript

// Driver data
let currentDriver = {
    id: 1,
    name: "أحمد محمد العتيبي",
    status: "available", // available, busy, offline
    totalTrips: 1250,
    rating: 4.8,
    todayEarnings: 450,
    workingHours: 8.5,
    currentLocation: {
        lat: 26.3260,
        lng: 43.9750,
        address: "القصيم، حي النهضة"
    }
};

// Define global variables
let statusIndicator, statusText, statusToggle;

// Flags to prevent multiple simultaneous calls
let isLoadingTrips = false;
let isLoadingRequests = false;
let isLoadingStats = false;

// Cache last loaded data to prevent unnecessary updates
let lastTripsHTML = '';
let lastRequestsHTML = '';
let lastStatusUpdate = 0;
let lastStudentsLocationsHTML = '';

// Flag to prevent any DOM updates during initialization
let isInitializing = true;

// Flag to prevent redirect loop
let redirectInProgress = false;

// Function to safely update innerHTML only if content changed
function safeUpdateHTML(element, newHTML, cacheKey) {
    if (!element) return;

    // تحديث مباشر دائماً (لضمان ظهور المحتوى)
    // يمكن إضافة cache لاحقاً إذا لزم الأمر
    element.innerHTML = newHTML;

    // تحديث cache
    if (cacheKey === 'trips') lastTripsHTML = newHTML;
    else if (cacheKey === 'requests') lastRequestsHTML = newHTML;
    else if (cacheKey === 'locations') lastStudentsLocationsHTML = newHTML;
}

// Define functions on window immediately
window.handleEmergency = async function () {
    const emergencyType = prompt('نوع حالة الطوارئ:\n1- حادث\n2- عطل\n3- طبي\n4- أمني\n5- أخرى\n\nأدخل رقم:');
    const emergencyTypes = {
        '1': 'accident',
        '2': 'breakdown',
        '3': 'medical',
        '4': 'security',
        '5': 'other'
    };

    if (!emergencyType || !emergencyTypes[emergencyType]) {
        return;
    }

    const description = prompt('وصف حالة الطوارئ:');
    if (!description) {
        return;
    }

    if (confirm('هل أنت متأكد من تفعيل حالة الطوارئ؟')) {
        try {
            const response = await DriverAPI.reportEmergency({
                emergency_type: emergencyTypes[emergencyType],
                description: description
            });

            if (response.success) {
                showNotification('تم إرسال إشارة الطوارئ بنجاح. سيتم التواصل معك قريباً.', 'warning');
            }
        } catch (error) {
            showNotification('حدث خطأ أثناء الإبلاغ عن حالة الطوارئ: ' + (error.message || 'خطأ غير معروف'), 'error');
            console.error('Error reporting emergency:', error);
        }
    }
};

window.showFuelReport = async function () {
    const fuelAmount = prompt('أدخل كمية الوقود (لتر):');
    if (!fuelAmount || isNaN(fuelAmount)) return;

    const fuelCost = prompt('أدخل تكلفة الوقود (ريال):');
    if (!fuelCost || isNaN(fuelCost)) return;

    const odometerReading = prompt('أدخل قراءة عداد المسافة:');
    if (!odometerReading || isNaN(odometerReading)) return;

    const fuelStation = prompt('اسم محطة الوقود (اختياري):') || '';

    try {
        const response = await DriverAPI.recordFuel({
            fuel_amount: parseFloat(fuelAmount),
            fuel_cost: parseFloat(fuelCost),
            odometer_reading: parseInt(odometerReading),
            fuel_date: new Date().toISOString().split('T')[0],
            fuel_station: fuelStation
        });

        if (response.success) {
            showNotification(`تم تسجيل ${fuelAmount} لتر وقود بنجاح`, 'success');
        }
    } catch (error) {
        showNotification('حدث خطأ أثناء تسجيل الوقود: ' + (error.message || 'خطأ غير معروف'), 'error');
        console.error('Error recording fuel:', error);
    }
};

window.showMaintenanceReport = async function () {
    const maintenanceType = prompt('نوع الصيانة:\n1- تغيير زيت\n2- تدوير إطارات\n3- خدمة فرامل\n4- فحص عام\n5- إصلاح\n6- أخرى\n\nأدخل رقم:');
    const maintenanceTypes = {
        '1': 'oil_change',
        '2': 'tire_rotation',
        '3': 'brake_service',
        '4': 'general_checkup',
        '5': 'repair',
        '6': 'other'
    };

    if (!maintenanceType || !maintenanceTypes[maintenanceType]) {
        return;
    }

    const description = prompt('وصف الصيانة:');
    if (!description) return;

    const cost = prompt('التكلفة (ريال) - اختياري:') || null;

    try {
        const response = await DriverAPI.recordMaintenance({
            maintenance_type: maintenanceTypes[maintenanceType],
            description: description,
            maintenance_date: new Date().toISOString().split('T')[0],
            cost: cost ? parseFloat(cost) : null
        });

        if (response.success) {
            showNotification('تم تسجيل الصيانة بنجاح', 'success');
        }
    } catch (error) {
        showNotification('حدث خطأ أثناء تسجيل الصيانة: ' + (error.message || 'خطأ غير معروف'), 'error');
        console.error('Error recording maintenance:', error);
    }
};

window.contactSupport = function () {
    window.open('tel:920000000', '_self');
};

// Show add trip modal - تعريف مباشر على window
window.showAddTripModal = async function () {
    const existingModal = document.getElementById('addTripModal');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'addTripModal';

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];

    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h3>إضافة رحلة جديدة</h3>
                <button class="close-btn" onclick="closeAddTripModal()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="addTripForm">
                    <div class="form-group">
                        <label for="studentSelect">اختر الطالبة:</label>
                        <select id="studentSelect" required>
                            <option value="">جاري التحميل...</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="tripDate">تاريخ الرحلة:</label>
                        <input type="date" id="tripDate" min="${today}" required>
                    </div>
                    <div class="form-group">
                        <label for="tripTime">وقت الرحلة:</label>
                        <input type="time" id="tripTime" required>
                    </div>
                    <div class="form-group">
                        <label for="tripType">نوع الرحلة:</label>
                        <select id="tripType" required>
                            <option value="morning">صباحية</option>
                            <option value="evening">مسائية</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="tripNotes">ملاحظات:</label>
                        <textarea id="tripNotes" placeholder="أي ملاحظات إضافية"></textarea>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="closeAddTripModal()">إلغاء</button>
                <button class="btn-primary" onclick="saveNewTrip()">إضافة الرحلة</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'block';

    if (window.UniRide && window.UniRide.animations) {
        UniRide.animations.fadeIn(modal);
    } else {
        modal.style.opacity = '1';
    }

    // Load students list
    try {
        const response = await DriverAPI.getAssignedStudents();
        const studentSelect = document.getElementById('studentSelect');
        if (response.success && response.data && response.data.length > 0) {
            studentSelect.innerHTML = '<option value="">اختر طالبة</option>';
            response.data.forEach(student => {
                const option = document.createElement('option');
                option.value = student.id;
                option.textContent = `${student.name} - ${student.university}`;
                studentSelect.appendChild(option);
            });
        } else {
            studentSelect.innerHTML = '<option value="">لا توجد طالبات متاحة</option>';
        }
    } catch (error) {
        console.error('Error loading students:', error);
        const studentSelect = document.getElementById('studentSelect');
        if (studentSelect) {
            studentSelect.innerHTML = '<option value="">خطأ في التحميل - ' + (error.message || 'خطأ غير معروف') + '</option>';
        }
        if (window.showNotification) {
            window.showNotification('حدث خطأ أثناء تحميل قائمة الطالبات', 'error');
        }
    }
};

// Close add trip modal
window.closeAddTripModal = function () {
    const modal = document.getElementById('addTripModal');
    if (modal) {
        if (window.UniRide && window.UniRide.animations) {
            UniRide.animations.fadeOut(modal, 300);
        }
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
};

// Save new trip
window.saveNewTrip = async function () {
    const studentSelect = document.getElementById('studentSelect');
    const tripDate = document.getElementById('tripDate');
    const tripTime = document.getElementById('tripTime');
    const tripType = document.getElementById('tripType');
    const tripNotes = document.getElementById('tripNotes');

    if (!studentSelect || !studentSelect.value || !tripDate || !tripDate.value || !tripTime || !tripTime.value || !tripType || !tripType.value) {
        if (window.showNotification) {
            window.showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
        }
        return;
    }

    try {
        const response = await DriverAPI.addTrip({
            student_id: parseInt(studentSelect.value),
            trip_date: tripDate.value,
            pickup_time: tripTime.value,
            trip_type: tripType.value,
            notes: tripNotes ? tripNotes.value || null : null
        });

        if (response.success) {
            // إعادة تعيين cache لإجبار التحديث
            if (typeof lastTripsHTML !== 'undefined') {
                lastTripsHTML = '';
            }
            if (typeof loadTodaysTrips === 'function') {
                loadTodaysTrips();
            }
            closeAddTripModal();
            if (window.showNotification) {
                window.showNotification('تم إضافة الرحلة بنجاح', 'success');
            }
        }
    } catch (error) {
        if (window.showNotification) {
            window.showNotification(error.message || 'حدث خطأ أثناء إضافة الرحلة', 'error');
        }
        console.error('Error adding trip:', error);
    }
};

// Show notification function - must be available globally
window.showNotification = function (message, type = 'info') {
    const notificationDiv = document.createElement('div');
    notificationDiv.className = `notification-popup ${type}`;
    notificationDiv.textContent = message;
    notificationDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: ${type === 'success' ? '#d4edda' : type === 'warning' ? '#fff3cd' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
        color: ${type === 'success' ? '#155724' : type === 'warning' ? '#856404' : type === 'error' ? '#721c24' : '#0c5460'};
        border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'warning' ? '#ffeaa7' : type === 'error' ? '#f5c6cb' : '#bee5eb'};
        padding: 12px 16px;
        border-radius: 8px;
        font-weight: 500;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        font-family: 'IBM Plex Sans Arabic', sans-serif;
    `;

    document.body.appendChild(notificationDiv);

    setTimeout(() => {
        notificationDiv.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            notificationDiv.remove();
        }, 300);
    }, 3000);
};

document.addEventListener('DOMContentLoaded', function () {
    // منع أي تحديثات أثناء التهيئة
    isInitializing = true;

    // Initialize dashboard
    initializeDriverDashboard();

    // تحميل البيانات دائماً (حتى لو كان هناك redirect flag)
    // لأننا قد نحتاج إلى عرض الرحلات قبل إعادة التوجيه
    loadTodaysTrips();
    loadTripRequests();
    loadStudentsLocations();
    // startLiveUpdates(); // تعطيل التحديث الدوري

    // إنهاء التهيئة بعد 2 ثانية
    setTimeout(() => {
        isInitializing = false;
    }, 2000);

    // Status toggle functionality
    statusToggle = document.getElementById('statusToggle');
    statusIndicator = document.getElementById('statusIndicator');
    statusText = document.getElementById('statusText');

    if (statusToggle) {
        statusToggle.addEventListener('click', function () {
            toggleDriverStatus();
        });
    }

    // Trip controls
    const refreshTripsBtn = document.getElementById('refreshTrips');
    const addTripBtn = document.getElementById('addTrip');

    if (refreshTripsBtn) {
        refreshTripsBtn.addEventListener('click', function () {
            // إعادة تعيين cache لإجبار التحديث
            lastTripsHTML = '';
            loadTodaysTrips();
            showNotification('تم تحديث قائمة الرحلات', 'success');
        });
    }

    if (addTripBtn) {
        addTripBtn.addEventListener('click', function () {
            showAddTripModal();
        });
    }

    // Trip requests refresh button
    const refreshRequestsBtn = document.getElementById('refreshRequests');
    if (refreshRequestsBtn) {
        refreshRequestsBtn.addEventListener('click', function () {
            // إعادة تعيين cache لإجبار التحديث
            lastRequestsHTML = '';
            loadTripRequests();
            showNotification('تم تحديث طلبات الرحلات', 'success');
        });
    }

    // Map controls
    const centerMapBtn = document.getElementById('centerMap');
    const toggleTrafficBtn = document.getElementById('toggleTraffic');

    if (centerMapBtn) {
        centerMapBtn.addEventListener('click', function () {
            centerMap();
        });
    }

    if (toggleTrafficBtn) {
        toggleTrafficBtn.addEventListener('click', function () {
            toggleTraffic();
        });
    }

    // Quick actions - تأكد من الربط بعد تحميل الصفحة
    setTimeout(() => {
        const emergencyBtn = document.getElementById('emergencyBtn');
        const fuelBtn = document.getElementById('fuelBtn');
        const maintenanceBtn = document.getElementById('maintenanceBtn');
        const supportBtn = document.getElementById('supportBtn');

        if (emergencyBtn) {
            emergencyBtn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                handleEmergency();
            });
        } else {
            console.error('emergencyBtn not found');
        }

        if (fuelBtn) {
            fuelBtn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                showFuelReport();
            });
        } else {
            console.error('fuelBtn not found');
        }

        if (maintenanceBtn) {
            maintenanceBtn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                showMaintenanceReport();
            });
        } else {
            console.error('maintenanceBtn not found');
        }

        if (supportBtn) {
            supportBtn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                contactSupport();
            });
        } else {
            console.error('supportBtn not found');
        }
    }, 100);

    // Initialize driver dashboard
    function initializeDriverDashboard() {
        // تم تعطيل التحديث التلقائي للإحصائيات لتجنب التحديث المستمر
        // updateDriverStats(); // معطلة
        updateDriverStatus();

        // تم تعطيل فحص المصادقة التلقائي لتجنب إعادة التوجيه بعد تسجيل الدخول
        // إذا كنت تريد تفعيله، يمكنك إزالة هذا التعليق، لكن تأكد من أن الجلسة محفوظة بشكل صحيح
        /*
        // Check authentication - فقط إذا لم يكن هناك إعادة توجيه قيد التقدم
        if (redirectInProgress) return;

        const userSession = UniRide.utils.getFromStorage('userSession');

        // التحقق من أن المستخدم غير مسجل دخول فعلاً قبل إعادة التوجيه
        if (!userSession || !userSession.isLoggedIn || userSession.userType !== 'driver') {
            // التحقق من أننا لسنا في index.html بالفعل
            if (window.location.pathname.includes('index.html')) {
                return; // لا تفعل شيء إذا كنا في index.html بالفعل
            }

            // التحقق من أن flag redirecting غير موجود (لتجنب الحلقة)
            if (sessionStorage.getItem('redirecting') === 'true') {
                return; // لا تفعل شيء إذا كنا في عملية إعادة توجيه
            }

            // منع إعادة التوجيه المتكررة
            redirectInProgress = true;

            // إضافة flag في sessionStorage لمنع الحلقة
            sessionStorage.setItem('redirecting', 'true');

            // إعادة التوجيه إلى index.html بعد تأخير قصير للسماح بتحميل البيانات
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 100);
            return;
        }

        // إذا كان المستخدم مسجل دخول، تأكد من أن flag غير موجود
        sessionStorage.removeItem('redirecting');
        redirectInProgress = false;
        */

        // تنظيف flag redirecting إذا كان موجوداً
        sessionStorage.removeItem('redirecting');
        redirectInProgress = false;
    }

    // Update driver statistics
    async function updateDriverStats() {
        // Prevent multiple simultaneous calls
        if (isLoadingStats) return;
        isLoadingStats = true;

        try {
            const response = await DriverAPI.getStats();
            if (response.success && response.data) {
                const stats = response.data;
                const totalTripsElement = document.getElementById('totalTrips');
                const driverRatingElement = document.getElementById('driverRating');
                const todayEarningsElement = document.getElementById('todayEarnings');
                const workingHoursElement = document.getElementById('workingHours');

                if (totalTripsElement) {
                    const totalTrips = parseInt(stats.overall?.total_trips) || 0;
                    totalTripsElement.textContent = totalTrips.toLocaleString();
                }
                if (driverRatingElement) {
                    const rating = parseFloat(stats.overall?.rating) || 0;
                    driverRatingElement.textContent = rating.toFixed(1);
                }
                if (todayEarningsElement) {
                    const earnings = parseFloat(stats.today?.today_earnings) || 0;
                    todayEarningsElement.textContent = earnings.toFixed(0);
                }

                // Calculate working hours (simplified)
                const todayTrips = parseInt(stats.today?.today_trips) || 0;
                const estimatedHours = (todayTrips * 0.5).toFixed(1);
                if (workingHoursElement) workingHoursElement.textContent = estimatedHours;
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            isLoadingStats = false;
        }
    }

    // Update driver status - مع تحديث واحد فقط كل ثانية
    function updateDriverStatus() {
        const now = Date.now();
        if (now - lastStatusUpdate < 1000) return; // تحديث واحد فقط كل ثانية
        lastStatusUpdate = now;

        const indicator = document.getElementById('statusIndicator');
        const text = document.getElementById('statusText');
        if (!indicator || !text) return;

        const statusConfig = {
            available: { text: 'متاح', class: '', color: 'var(--dark-green)' },
            busy: { text: 'مشغول', class: 'busy', color: '#ff9800' },
            offline: { text: 'غير متاح', class: 'offline', color: '#f44336' }
        };

        const config = statusConfig[currentDriver.status] || statusConfig.available;

        // تحديث فقط إذا تغيرت القيم
        if (indicator.className !== `status-indicator ${config.class}`) {
            indicator.className = `status-indicator ${config.class}`;
        }
        if (indicator.style.backgroundColor !== config.color) {
            indicator.style.backgroundColor = config.color;
        }
        if (text.textContent !== config.text) {
            text.textContent = config.text;
        }
    }

    // Toggle driver status
    async function toggleDriverStatus() {
        const statuses = ['available', 'busy', 'offline'];
        const currentIndex = statuses.indexOf(currentDriver.status);
        const nextIndex = (currentIndex + 1) % statuses.length;
        const newStatus = statuses[nextIndex];

        try {
            const response = await DriverAPI.updateStatus(newStatus);
            if (response.success) {
                currentDriver.status = newStatus;
                updateDriverStatus();

                const statusMessages = {
                    available: 'أنت متاح الآن للرحلات',
                    busy: 'أنت مشغول حالياً',
                    offline: 'أنت غير متاح للرحلات'
                };

                showNotification(statusMessages[newStatus], 'success');
            }
        } catch (error) {
            showNotification('حدث خطأ أثناء تحديث الحالة', 'error');
            console.error('Error updating status:', error);
        }
    }

    // Load today's trips
    async function loadTodaysTrips() {
        // Prevent multiple simultaneous calls
        if (isLoadingTrips) return;
        isLoadingTrips = true;

        const tripsList = document.getElementById('tripsList');
        if (!tripsList) {
            isLoadingTrips = false;
            return;
        }

        // Set minimum height to prevent layout shift
        tripsList.style.minHeight = '200px';

        try {
            const response = await DriverAPI.getTodayTrips();
            let trips = [];

            // دائماً عرض الرحلات الافتراضية للاختبار
            // يمكنك إزالة هذا الشرط لاحقاً
            const useDefaultTrips = true; // اجعلها true دائماً لعرض الرحلات الافتراضية

            if (!useDefaultTrips && response.success && response.data && response.data.length > 0) {
                trips = response.data;
            } else {
                // عرض رحلات افتراضية إذا لم تكن هناك رحلات حقيقية
                trips = [
                    {
                        id: 1,
                        student_id: 1,
                        student_name: 'فاطمة أحمد محمد',
                        trip_date: new Date().toISOString().split('T')[0],
                        pickup_time: '07:30:00',
                        trip_type: 'morning',
                        trip_status: 'scheduled',
                        university: 'جامعة القصيم',
                        address: 'القصيم، حي النهضة، شارع الملك فهد',
                        location_link: 'https://maps.google.com/?q=26.3260,43.9750',
                        house_image: 'assets/house-placeholder.svg',
                        emergency_contact: '0509876543',
                        student_phone: '0501234567',
                        major: 'هندسة الحاسوب',
                        year: 'السنة الثالثة',
                        notes: 'تفضل الجلوس في المقعد الأمامي'
                    },
                    {
                        id: 2,
                        student_id: 2,
                        student_name: 'سارة عبدالله العتيبي',
                        trip_date: new Date().toISOString().split('T')[0],
                        pickup_time: '08:00:00',
                        trip_type: 'morning',
                        trip_status: 'waiting',
                        university: 'جامعة الأميرة نورة',
                        address: 'الرياض، حي العليا',
                        location_link: 'https://maps.google.com/?q=24.7243,46.6814',
                        house_image: 'assets/house-placeholder.svg',
                        emergency_contact: '0508765432',
                        student_phone: '0502345678',
                        major: 'الطب',
                        year: 'السنة الرابعة',
                        notes: 'تحتاج مساعدة في حمل الكتب'
                    },
                    {
                        id: 3,
                        student_id: 3,
                        student_name: 'نورا محمد القحطاني',
                        trip_date: new Date().toISOString().split('T')[0],
                        pickup_time: '07:45:00',
                        trip_type: 'morning',
                        trip_status: 'in_progress',
                        university: 'جامعة الإمام محمد بن سعود',
                        address: 'الرياض، حي الملز',
                        location_link: 'https://maps.google.com/?q=24.6877,46.7219',
                        house_image: 'assets/house-placeholder.svg',
                        emergency_contact: '0507654321',
                        student_phone: '0503456789',
                        major: 'الشريعة',
                        year: 'السنة الثانية',
                        notes: 'تصل متأخرة أحياناً'
                    }
                ];
            }

            if (trips.length === 0) {
                const emptyHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon"><i class="fas fa-car"></i></div>
                        <h3>لا توجد رحلات اليوم</h3>
                        <p>ستظهر الرحلات المخصصة لك هنا</p>
                    </div>
                `;
                tripsList.innerHTML = emptyHTML;
                lastTripsHTML = emptyHTML;
                isLoadingTrips = false;
                return;
            }

            // بناء HTML أولاً قبل تحديث DOM
            let newHTML = '';
            trips.forEach(trip => {
                newHTML += `
                    <div class="trip-item ${trip.trip_status}">
                        <div class="trip-header">
                            <h3 class="trip-title">${trip.student_name}</h3>
                            <span class="trip-status ${trip.trip_status}">${getStatusText(trip.trip_status)}</span>
                        </div>
                        <div class="trip-details">
                            <div class="trip-detail">
                                <span class="label">وقت الاستلام:</span>
                                <span class="value">${trip.pickup_time}</span>
                            </div>
                            <div class="trip-detail">
                                <span class="label">الجامعة:</span>
                                <span class="value">${trip.university}</span>
                            </div>
                            <div class="trip-detail">
                                <span class="label">العنوان:</span>
                                <span class="value">${trip.address}</span>
                            </div>
                        </div>
                        <div class="trip-actions">
                            <button class="trip-action-btn view" onclick="viewStudentDetails(${trip.student_id}, ${trip.id})"><i class="fas fa-eye"></i> عرض التفاصيل</button>
                            ${trip.trip_status === 'scheduled' ? `<button class="trip-action-btn start" onclick="startTrip(${trip.id})"><i class="fas fa-car"></i> بدء الرحلة</button>` : ''}
                            ${trip.trip_status === 'in_progress' ? `<button class="trip-action-btn complete" onclick="completeTrip(${trip.id})"><i class="fas fa-check"></i> إنهاء الرحلة</button>` : ''}
                        </div>
                    </div>
                `;
            });

            // تحديث مباشر دائماً (لضمان ظهور الرحلات)
            tripsList.innerHTML = newHTML;
            lastTripsHTML = newHTML;
        } catch (error) {
            console.error('Error loading trips:', error);
            const errorHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon"><i class="fas fa-exclamation-triangle"></i></div>
                    <h3>خطأ في تحميل الرحلات</h3>
                    <p>${error.message || 'حدث خطأ غير معروف'}</p>
                </div>
            `;
            tripsList.innerHTML = errorHTML;
            lastTripsHTML = errorHTML;
        } finally {
            isLoadingTrips = false;
        }
    }

    // Get status text in Arabic
    function getStatusText(status) {
        const statusTexts = {
            'scheduled': 'مجدولة',
            'waiting': 'في الانتظار',
            'arriving': 'في الطريق',
            'in_progress': 'جارية',
            'completed': 'مكتملة',
            'cancelled': 'ملغاة'
        };
        return statusTexts[status] || status;
    }

    // Load trip requests
    async function loadTripRequests() {
        // Prevent multiple simultaneous calls
        if (isLoadingRequests) return;
        isLoadingRequests = true;

        const requestsList = document.getElementById('tripRequestsList');
        if (!requestsList) {
            isLoadingRequests = false;
            return;
        }

        // Set minimum height to prevent layout shift
        requestsList.style.minHeight = '200px';

        try {
            const response = await DriverAPI.getTripRequests();
            if (response.success && response.data) {
                const requests = response.data;

                if (requests.length === 0) {
                    const emptyHTML = `
                        <div class="empty-state">
                            <div class="empty-state-icon"><i class="fas fa-bell"></i></div>
                            <h3>لا توجد طلبات رحلات معلقة</h3>
                            <p>ستظهر طلبات الرحلات الجديدة هنا</p>
                        </div>
                    `;
                    requestsList.innerHTML = emptyHTML;
                    lastRequestsHTML = emptyHTML;
                    isLoadingRequests = false;
                    return;
                }

                // بناء HTML أولاً قبل تحديث DOM
                let newHTML = '';
                requests.forEach(request => {
                    newHTML += `
                        <div class="trip-item request-item">
                            <div class="trip-header">
                                <h3 class="trip-title">${request.student_name}</h3>
                                <span class="trip-status pending">طلب جديد</span>
                            </div>
                            <div class="trip-details">
                                <div class="trip-detail">
                                    <span class="label">التاريخ:</span>
                                    <span class="value">${request.trip_date}</span>
                                </div>
                                <div class="trip-detail">
                                    <span class="label">وقت الاستلام:</span>
                                    <span class="value">${request.pickup_time}</span>
                                </div>
                                <div class="trip-detail">
                                    <span class="label">النوع:</span>
                                    <span class="value">${request.trip_type === 'morning' ? 'صباحية' : 'مسائية'}</span>
                                </div>
                                <div class="trip-detail">
                                    <span class="label">الجامعة:</span>
                                    <span class="value">${request.university}</span>
                                </div>
                                <div class="trip-detail">
                                    <span class="label">العنوان:</span>
                                    <span class="value">${request.address}</span>
                                </div>
                                ${request.notes ? `
                                <div class="trip-detail">
                                    <span class="label">ملاحظات:</span>
                                    <span class="value">${request.notes}</span>
                                </div>
                                ` : ''}
                            </div>
                            <div class="trip-actions">
                                <button class="trip-action-btn view" onclick="viewRequestDetails(${request.id}, ${request.student_id})"><i class="fas fa-eye"></i> عرض التفاصيل</button>
                                <button class="trip-action-btn accept" onclick="acceptTripRequest(${request.id})"><i class="fas fa-check"></i> قبول</button>
                                <button class="trip-action-btn reject" onclick="rejectTripRequest(${request.id})"><i class="fas fa-times"></i> رفض</button>
                            </div>
                        </div>
                    `;
                });

                // تحديث مباشر دائماً
                requestsList.innerHTML = newHTML;
                lastRequestsHTML = newHTML;
            }
        } catch (error) {
            console.error('Error loading trip requests:', error);
            const errorHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon"><i class="fas fa-exclamation-triangle"></i></div>
                    <h3>خطأ في تحميل طلبات الرحلات</h3>
                    <p>${error.message || 'حدث خطأ غير معروف'}</p>
                </div>
            `;
            requestsList.innerHTML = errorHTML;
            lastRequestsHTML = errorHTML;
        } finally {
            isLoadingRequests = false;
        }
    }

    // View request details
    window.viewRequestDetails = function (requestId, studentId) {
        viewStudentDetails(studentId, null);
    };

    // Accept trip request
    window.acceptTripRequest = async function (requestId) {
        if (!confirm('هل أنت متأكد من قبول طلب هذه الرحلة؟')) {
            return;
        }

        try {
            const response = await DriverAPI.acceptTripRequest(requestId);
            if (response.success) {
                showNotification('تم قبول طلب الرحلة بنجاح', 'success');
                // إعادة تعيين cache لإجبار التحديث
                lastRequestsHTML = '';
                lastTripsHTML = '';
                loadTripRequests();
                loadTodaysTrips();
            }
        } catch (error) {
            showNotification('حدث خطأ أثناء قبول طلب الرحلة: ' + (error.message || 'خطأ غير معروف'), 'error');
            console.error('Error accepting trip request:', error);
        }
    };

    // Reject trip request
    window.rejectTripRequest = async function (requestId) {
        if (!confirm('هل أنت متأكد من رفض طلب هذه الرحلة؟')) {
            return;
        }

        try {
            const response = await DriverAPI.rejectTripRequest(requestId);
            if (response.success) {
                showNotification('تم رفض طلب الرحلة', 'info');
                // إعادة تعيين cache لإجبار التحديث
                lastRequestsHTML = '';
                loadTripRequests();
            }
        } catch (error) {
            showNotification('حدث خطأ أثناء رفض طلب الرحلة: ' + (error.message || 'خطأ غير معروف'), 'error');
            console.error('Error rejecting trip request:', error);
        }
    };

    // Load students locations
    function loadStudentsLocations() {
        const studentsLocations = document.getElementById('studentsLocations');
        if (!studentsLocations) return;

        // Mock data for students locations
        const students = [
            { name: 'فاطمة أحمد محمد', address: 'القصيم، حي النهضة، شارع الملك فهد' },
            { name: 'سارة عبدالله العتيبي', address: 'الرياض، حي العليا، شارع العليا الرئيسي' },
            { name: 'نورا محمد القحطاني', address: 'الرياض، حي الملز، شارع الملك عبدالعزيز' },
            { name: 'ريم عبدالرحمن الشمري', address: 'الرياض، حي النخيل، شارع النخيل' }
        ];

        // بناء HTML أولاً
        let newHTML = '';
        students.forEach(student => {
            newHTML += `
                <div class="location-item">
                    <div class="location-info">
                        <span class="location-name">${student.name}</span>
                        <span class="location-address">${student.address}</span>
                    </div>
                </div>
            `;
        });

        // تحديث مباشر دائماً
        studentsLocations.innerHTML = newHTML;
        lastStudentsLocationsHTML = newHTML;
    }

    // Start live updates - معطلة لتجنب التحديث المستمر
    function startLiveUpdates() {
        // تم تعطيل التحديث الدوري لتجنب إعادة تحديث الصفحة بشكل مستمر
        // يمكن إعادة تفعيلها لاحقاً إذا لزم الأمر
        /*
        setInterval(() => {
            const overallProgress = document.getElementById('overallProgress');
            if (overallProgress) {
                const progress = Math.min(100, (overallProgress.dataset.progress || 0) * 1.1);
                overallProgress.dataset.progress = progress;
                overallProgress.style.width = `${progress}%`;
            }
        }, 2000);
        */
    }

    // View student details
    window.viewStudentDetails = function (studentId, tripId) {
        // Load student details from API or use trip data
        if (tripId) {
            // Load from trip
            DriverAPI.getTodayTrips().then(response => {
                if (response.success && response.data) {
                    const trip = response.data.find(t => t.id === tripId && t.student_id === studentId);
                    if (trip) {
                        showStudentModal(trip);
                    }
                }
            });
        } else {
            // Load from trip requests
            DriverAPI.getTripRequests().then(response => {
                if (response.success && response.data) {
                    const request = response.data.find(r => r.student_id === studentId);
                    if (request) {
                        showStudentModalFromRequest(request);
                    }
                }
            });
        }
    };

    function showStudentModal(trip) {
        const modal = document.getElementById('studentModal');
        if (!modal) return;

        document.getElementById('modalTitle').textContent = `تفاصيل ${trip.student_name}`;
        document.getElementById('studentName').textContent = trip.student_name || 'غير محدد';
        document.getElementById('studentUniversity').textContent = trip.university || 'غير محدد';
        document.getElementById('studentMajor').textContent = trip.major || 'غير محدد';
        document.getElementById('studentYear').textContent = trip.year || 'غير محدد';
        document.getElementById('studentPhone').href = `tel:${trip.student_phone}`;
        document.getElementById('studentPhone').textContent = trip.student_phone || 'غير محدد';
        document.getElementById('studentTime').textContent = trip.pickup_time || 'غير محدد';
        document.getElementById('studentLocationLink').href = trip.location_link || '#';
        document.getElementById('studentAddress').textContent = trip.address || 'غير محدد';
        document.getElementById('studentNotes').textContent = trip.student_notes || trip.notes || 'لا توجد ملاحظات';
        document.getElementById('emergencyContact').href = `tel:${trip.emergency_contact}`;
        document.getElementById('emergencyContact').textContent = trip.emergency_contact || 'غير محدد';
        if (trip.house_image) {
            document.getElementById('studentHouseImage').src = trip.house_image;
        }

        modal.style.display = 'block';
        if (window.UniRide && window.UniRide.animations) {
            UniRide.animations.fadeIn(modal);
        } else {
            modal.style.opacity = '1';
        }
    }

    function showStudentModalFromRequest(request) {
        const modal = document.getElementById('studentModal');
        if (!modal) return;

        document.getElementById('modalTitle').textContent = `تفاصيل ${request.student_name}`;
        document.getElementById('studentName').textContent = request.student_name || 'غير محدد';
        document.getElementById('studentUniversity').textContent = request.university || 'غير محدد';
        document.getElementById('studentMajor').textContent = request.major || 'غير محدد';
        document.getElementById('studentYear').textContent = request.year || 'غير محدد';
        document.getElementById('studentPhone').href = `tel:${request.student_phone}`;
        document.getElementById('studentPhone').textContent = request.student_phone || 'غير محدد';
        document.getElementById('studentTime').textContent = request.pickup_time || 'غير محدد';
        document.getElementById('studentLocationLink').href = request.location_link || '#';
        document.getElementById('studentAddress').textContent = request.address || 'غير محدد';
        document.getElementById('studentNotes').textContent = request.student_notes || request.notes || 'لا توجد ملاحظات';
        document.getElementById('emergencyContact').href = `tel:${request.emergency_contact}`;
        document.getElementById('emergencyContact').textContent = request.emergency_contact || 'غير محدد';
        if (request.house_image) {
            document.getElementById('studentHouseImage').src = request.house_image;
        }

        modal.style.display = 'block';
        if (window.UniRide && window.UniRide.animations) {
            UniRide.animations.fadeIn(modal);
        } else {
            modal.style.opacity = '1';
        }
    }

    // Close student modal
    window.closeStudentModal = function () {
        const modal = document.getElementById('studentModal');
        if (modal) {
            if (window.UniRide && window.UniRide.animations) {
                UniRide.animations.fadeOut(modal, 300);
            }
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    };

    // Start trip
    window.startTrip = async function (tripId) {
        try {
            const response = await DriverAPI.updateTripStatus(tripId, 'in_progress');
            if (response.success) {
                showNotification('تم بدء الرحلة بنجاح', 'success');
                // إعادة تعيين cache لإجبار التحديث
                lastTripsHTML = '';
                loadTodaysTrips();
            }
        } catch (error) {
            showNotification('حدث خطأ أثناء بدء الرحلة', 'error');
            console.error('Error starting trip:', error);
        }
    };

    // Complete trip
    window.completeTrip = async function (tripId) {
        try {
            const response = await DriverAPI.updateTripStatus(tripId, 'completed');
            if (response.success) {
                showNotification('تم إنهاء الرحلة بنجاح', 'success');
                // إعادة تعيين cache لإجبار التحديث
                lastTripsHTML = '';
                loadTodaysTrips();
            }
        } catch (error) {
            showNotification('حدث خطأ أثناء إنهاء الرحلة', 'error');
            console.error('Error completing trip:', error);
        }
    };

    // Center map
    function centerMap() {
        showNotification('تم تحديث مركز الخريطة', 'info');
    }

    // Toggle traffic
    function toggleTraffic() {
        showNotification('تم تحديث حالة حركة المرور', 'info');
    }

    // Show add trip modal
    window.showAddTripModal = async function () {
        const existingModal = document.getElementById('addTripModal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'addTripModal';

        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];

        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3>إضافة رحلة جديدة</h3>
                    <button class="close-btn" onclick="closeAddTripModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="addTripForm">
                        <div class="form-group">
                            <label for="studentSelect">اختر الطالبة:</label>
                            <select id="studentSelect" required>
                                <option value="">جاري التحميل...</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="tripDate">تاريخ الرحلة:</label>
                            <input type="date" id="tripDate" min="${today}" required>
                        </div>
                        <div class="form-group">
                            <label for="tripTime">وقت الرحلة:</label>
                            <input type="time" id="tripTime" required>
                        </div>
                        <div class="form-group">
                            <label for="tripType">نوع الرحلة:</label>
                            <select id="tripType" required>
                                <option value="morning">صباحية</option>
                                <option value="evening">مسائية</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="tripNotes">ملاحظات:</label>
                            <textarea id="tripNotes" placeholder="أي ملاحظات إضافية"></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="closeAddTripModal()">إلغاء</button>
                    <button class="btn-primary" onclick="saveNewTrip()">إضافة الرحلة</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = 'block';

        if (window.UniRide && window.UniRide.animations) {
            UniRide.animations.fadeIn(modal);
        } else {
            modal.style.opacity = '1';
        }

        // Load students list
        try {
            const response = await DriverAPI.getAssignedStudents();
            const studentSelect = document.getElementById('studentSelect');
            if (response.success && response.data && response.data.length > 0) {
                studentSelect.innerHTML = '<option value="">اختر طالبة</option>';
                response.data.forEach(student => {
                    const option = document.createElement('option');
                    option.value = student.id;
                    option.textContent = `${student.name} - ${student.university}`;
                    studentSelect.appendChild(option);
                });
            } else {
                studentSelect.innerHTML = '<option value="">لا توجد طالبات متاحة</option>';
            }
        } catch (error) {
            console.error('Error loading students:', error);
            const studentSelect = document.getElementById('studentSelect');
            if (studentSelect) {
                studentSelect.innerHTML = '<option value="">خطأ في التحميل - ' + (error.message || 'خطأ غير معروف') + '</option>';
            }
            showNotification('حدث خطأ أثناء تحميل قائمة الطالبات', 'error');
        }
    };

    // Close add trip modal
    window.closeAddTripModal = function () {
        const modal = document.getElementById('addTripModal');
        if (modal) {
            if (window.UniRide && window.UniRide.animations) {
                UniRide.animations.fadeOut(modal, 300);
            }
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
    };

    // Save new trip
    window.saveNewTrip = async function () {
        const studentSelect = document.getElementById('studentSelect');
        const tripDate = document.getElementById('tripDate');
        const tripTime = document.getElementById('tripTime');
        const tripType = document.getElementById('tripType');
        const tripNotes = document.getElementById('tripNotes');

        if (!studentSelect.value || !tripDate.value || !tripTime.value || !tripType.value) {
            showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
            return;
        }

        try {
            const response = await DriverAPI.addTrip({
                student_id: parseInt(studentSelect.value),
                trip_date: tripDate.value,
                pickup_time: tripTime.value,
                trip_type: tripType.value,
                notes: tripNotes.value || null
            });

            if (response.success) {
                // إعادة تعيين cache لإجبار التحديث
                lastTripsHTML = '';
                loadTodaysTrips();
                closeAddTripModal();
                showNotification('تم إضافة الرحلة بنجاح', 'success');
            }
        } catch (error) {
            showNotification(error.message || 'حدث خطأ أثناء إضافة الرحلة', 'error');
            console.error('Error adding trip:', error);
        }
    };

    // Show notification - using window.showNotification defined above
    function showNotification(message, type = 'info') {
        window.showNotification(message, type);
    }

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        .trips-list {
            min-height: 200px;
            transition: none !important;
        }
        
        .trips-list:empty {
            min-height: 200px;
        }
        
        .empty-state {
            text-align: center;
            padding: 3rem 1rem;
            color: var(--light-gray);
            min-height: 200px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            transition: none !important;
        }
        
        .empty-state-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
            opacity: 0.5;
        }
        
        .empty-state h3 {
            margin-bottom: 0.5rem;
            color: var(--text-dark);
        }
        
        .empty-state p {
            margin: 0;
        }
        
        .trip-item {
            transition: none !important;
        }
        
        #tripsList,
        #tripRequestsList {
            min-height: 200px;
            transition: none !important;
        }
    `;
    document.head.appendChild(style);

    // Keyboard shortcuts
    document.addEventListener('keydown', function (e) {
        // Escape to close modals
        if (e.key === 'Escape') {
            closeStudentModal();
            closeAddTripModal();
        }

        // Ctrl/Cmd + R to refresh trips
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            // إعادة تعيين cache لإجبار التحديث
            lastTripsHTML = '';
            lastRequestsHTML = '';
            loadTodaysTrips();
            loadTripRequests();
        }

        // Space to toggle status
        if (e.key === ' ' && !e.target.matches('input, textarea')) {
            e.preventDefault();
            toggleDriverStatus();
        }
    });
}); 