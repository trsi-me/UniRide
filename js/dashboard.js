// Enhanced Dashboard Page JavaScript with Live Tracking
document.addEventListener('DOMContentLoaded', function () {
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationDropdown = document.getElementById('notificationDropdown');
    const notificationBadge = document.getElementById('notificationBadge');

    // Live tracking elements
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');
    const timeRemaining = document.getElementById('timeRemaining');
    const routeProgress = document.getElementById('routeProgress');
    const callDriverBtn = document.getElementById('callDriver');
    const messageDriverBtn = document.getElementById('messageDriver');
    const cancelTripBtn = document.getElementById('cancelTrip');

    // Trip simulation data
    let currentTrip = {
        status: 'waiting', // waiting, arriving, arrived, completed
        driverName: 'أحمد محمد العتيبي',
        carType: 'تويوتا كامري',
        plateNumber: 'أ ب ج 1234',
        phone: '',
        pickupTime: '7:30',
        estimatedArrival: '7:35',
        remainingTime: 5,
        progress: 0
    };

    // Initialize dashboard
    initializeDashboard();
    startLiveTracking();

    // Notification dropdown functionality
    notificationBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleNotificationDropdown();
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function (e) {
        if (!notificationBtn.contains(e.target) && !notificationDropdown.contains(e.target)) {
            closeNotificationDropdown();
        }
    });

    // Trip action buttons
    if (callDriverBtn) {
        callDriverBtn.addEventListener('click', function () {
            window.open(`tel:${currentTrip.phone}`, '_self');
        });
    }

    if (messageDriverBtn) {
        messageDriverBtn.addEventListener('click', function () {
            const message = encodeURIComponent('مرحباً، أنا الطالبة فاطمة. متى ستصل؟');
            window.open(`https://wa.me/966${currentTrip.phone.substring(1)}?text=${message}`, '_blank');
        });
    }

    if (cancelTripBtn) {
        cancelTripBtn.addEventListener('click', function () {
            if (confirm('هل أنت متأكدة من إلغاء الرحلة؟')) {
                cancelCurrentTrip();
            }
        });
    }

    // Initialize dashboard data
    function initializeDashboard() {
        loadLiveTripData();
        loadSchedule();
        loadNotifications();
    }

    // Load live trip data
    async function loadLiveTripData() {
        try {
            const response = await StudentAPI.getCurrentTrip();
            
            if (response.success && response.data) {
                const trip = response.data;
                currentTrip = {
                    status: trip.trip_status,
                    driverName: trip.driver_name,
                    carType: trip.car_type,
                    plateNumber: trip.plate_number,
                    phone: trip.driver_phone,
                    pickupTime: trip.pickup_time,
                    estimatedArrival: trip.estimated_arrival || trip.pickup_time,
                    remainingTime: 5,
                    progress: 0
                };
                
                // Update UI
                const driverNameElement = document.getElementById('driverName');
                const carTypeElement = document.getElementById('carType');
                const plateNumberElement = document.getElementById('plateNumber');
                const pickupTimeElement = document.getElementById('pickupTime');
                const estimatedArrivalElement = document.getElementById('estimatedArrival');
                
                if (driverNameElement) driverNameElement.textContent = currentTrip.driverName;
                if (carTypeElement) carTypeElement.textContent = currentTrip.carType;
                if (plateNumberElement) plateNumberElement.textContent = currentTrip.plateNumber;
                if (pickupTimeElement) pickupTimeElement.textContent = currentTrip.pickupTime + ' صباحاً';
                if (estimatedArrivalElement) estimatedArrivalElement.textContent = currentTrip.estimatedArrival + ' صباحاً';
                
                // Update phone link
                const callDriverBtn = document.getElementById('callDriver');
                if (callDriverBtn && currentTrip.phone) {
                    callDriverBtn.onclick = () => window.open(`tel:${currentTrip.phone}`, '_self');
                }
                
                updateTripStatus();
            } else {
                // No current trip - show booking option
                const tripSection = document.querySelector('.live-trip-section');
                if (tripSection) {
                    tripSection.innerHTML = `
                        <div class="trip-header">
                            <h2>لا توجد رحلة حالية</h2>
                        </div>
                        <div class="trip-card">
                            <div class="empty-state">
                                <div class="empty-state-icon"><i class="fas fa-car"></i></div>
                                <h3>لا توجد رحلة مجدولة</h3>
                                <p>يمكنك حجز رحلة جديدة</p>
                                <button class="btn-primary" onclick="bookTrip()">حجز رحلة جديدة</button>
                            </div>
                        </div>
                    `;
                }
            }
        } catch (error) {
            console.error('Error loading trip:', error);
        }
    }

    // Start live tracking simulation
    function startLiveTracking() {
        // Update every 5 seconds
        setInterval(() => {
            updateTripStatus();
            updateTimeRemaining();
            updateRouteProgress();
        }, 5000);

        // Update every second for time
        setInterval(() => {
            updateTimeRemaining();
        }, 1000);
    }

    // Update trip status
    function updateTripStatus() {
        if (!statusIndicator || !statusText) return;

        const statuses = [
            { status: 'waiting', text: 'في انتظار السائق', class: 'waiting' },
            { status: 'arriving', text: 'السائق في الطريق', class: 'arriving' },
            { status: 'arrived', text: 'السائق وصل', class: 'arrived' },
            { status: 'completed', text: 'الرحلة مكتملة', class: 'completed' }
        ];

        const currentStatus = statuses.find(s => s.status === currentTrip.status) || statuses[0];

        statusIndicator.className = `status-indicator ${currentStatus.class}`;
        statusText.textContent = currentStatus.text;
    }

    // Update time remaining
    function updateTimeRemaining() {
        if (!timeRemaining) return;

        if (currentTrip.remainingTime > 0) {
            timeRemaining.textContent = `${currentTrip.remainingTime} دقائق`;
        } else {
            timeRemaining.textContent = 'وصل الآن';
        }
    }

    // Update route progress
    function updateRouteProgress() {
        if (!routeProgress) return;

        const progressPercent = Math.min(currentTrip.progress, 100);
        routeProgress.style.width = `${progressPercent}%`;
    }

    // Simulate trip progression
    function simulateTripProgression() {
        switch (currentTrip.status) {
            case 'waiting':
                if (Math.random() > 0.7) {
                    currentTrip.status = 'arriving';
                    currentTrip.remainingTime = 8;
                    showNotification('السائق في الطريق إليك!', 'info');
                }
                break;
            case 'arriving':
                currentTrip.remainingTime = Math.max(0, currentTrip.remainingTime - 1);
                currentTrip.progress += 2;
                if (currentTrip.remainingTime <= 0) {
                    currentTrip.status = 'arrived';
                    showNotification('السائق وصل!', 'success');
                }
                break;
            case 'arrived':
                if (Math.random() > 0.8) {
                    currentTrip.status = 'completed';
                    showNotification('الرحلة مكتملة! شكراً لك', 'success');
                }
                break;
        }
    }

    // Cancel current trip
    function cancelCurrentTrip() {
        currentTrip.status = 'cancelled';
        showNotification('تم إلغاء الرحلة', 'warning');

        // Hide trip actions
        const tripActions = document.querySelector('.trip-actions');
        if (tripActions) {
            tripActions.style.display = 'none';
        }

        // Update status
        if (statusText) {
            statusText.textContent = 'الرحلة ملغاة';
        }
        if (statusIndicator) {
            statusIndicator.className = 'status-indicator cancelled';
        }
    }

    // Load schedule data
    async function loadSchedule() {
        const scheduleTable = document.querySelector('.schedule-table');
        if (!scheduleTable) return;

        try {
            const response = await StudentAPI.getSchedule();

            if (response.success && response.data && response.data.length > 0) {
                scheduleTable.innerHTML = '';
                response.data.forEach(schedule => {
                    if (schedule.is_active) {
                        const scheduleDay = document.createElement('div');
                        scheduleDay.className = 'schedule-day';
                        scheduleDay.innerHTML = `
                            <div class="day-name">${getDayName(schedule.day_of_week)}</div>
                            <div class="day-times">${schedule.start_time} - ${schedule.end_time}</div>
                            ${schedule.subjects ? `<div class="day-subjects">${schedule.subjects}</div>` : ''}
                        `;
                        scheduleTable.appendChild(scheduleDay);
                    }
                });
            } else {
                scheduleTable.innerHTML = `
                    <div class="empty-state">
                        <p>لا يوجد جدول محدد</p>
                        <button class="btn-secondary" onclick="editSchedule()">إضافة جدول</button>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading schedule:', error);
        }
    }

    function getDayName(day) {
        const days = {
            'sunday': 'الأحد',
            'monday': 'الإثنين',
            'tuesday': 'الثلاثاء',
            'wednesday': 'الأربعاء',
            'thursday': 'الخميس',
            'friday': 'الجمعة',
            'saturday': 'السبت'
        };
        return days[day] || day;
    }

    // Load notifications
    async function loadNotifications() {
        try {
            const response = await StudentAPI.getNotifications(20, false);

            if (response.success && response.data && response.data.notifications) {
                const notificationContainer = notificationDropdown;
                if (!notificationContainer) return;
                
                notificationContainer.innerHTML = '';
                
                if (response.data.notifications.length === 0) {
                    notificationContainer.innerHTML = '<div class="notification-item">لا توجد إشعارات</div>';
                } else {
                    response.data.notifications.forEach(notification => {
                        const item = document.createElement('div');
                        item.className = `notification-item ${notification.is_read ? 'read' : 'unread'}`;
                        item.innerHTML = `
                            <p>${notification.message}</p>
                            <small>${new Date(notification.created_at).toLocaleString('ar-SA')}</small>
                        `;
                        notificationContainer.appendChild(item);
                    });
                }
                
                updateNotificationBadge(response.data.unread_count || 0);
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }

    // Update notification badge
    function updateNotificationBadge(count) {
        if (!notificationBadge) return;
        notificationBadge.textContent = count;
        notificationBadge.style.display = count > 0 ? 'flex' : 'none';
    }

    // Show notification
    function showNotification(message, type = 'info') {
        const notificationDiv = document.createElement('div');
        notificationDiv.className = `notification-popup ${type}`;
        notificationDiv.textContent = message;
        notificationDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: ${type === 'success' ? '#d4edda' : type === 'warning' ? '#fff3cd' : '#d1ecf1'};
            color: ${type === 'success' ? '#155724' : type === 'warning' ? '#856404' : '#0c5460'};
            border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'warning' ? '#ffeaa7' : '#bee5eb'};
            padding: 12px 16px;
            border-radius: 8px;
            font-weight: 500;
            z-index: 1000;
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(notificationDiv);

        setTimeout(() => {
            notificationDiv.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                notificationDiv.remove();
            }, 300);
        }, 3000);
    }

    // Toggle notification dropdown
    function toggleNotificationDropdown() {
        if (notificationDropdown.classList.contains('show')) {
            closeNotificationDropdown();
        } else {
            openNotificationDropdown();
        }
    }

    // Open notification dropdown
    function openNotificationDropdown() {
        notificationDropdown.classList.add('show');
        notificationDropdown.style.display = 'block';
    }

    // Close notification dropdown
    function closeNotificationDropdown() {
        notificationDropdown.classList.remove('show');
        notificationDropdown.style.display = 'none';
    }

    // Edit schedule function
    window.editSchedule = function () {
        showEditScheduleModal();
    };
    
    // Show edit schedule modal
    async function showEditScheduleModal() {
        try {
            const response = await StudentAPI.getSchedule();
            const schedules = response.success ? response.data : [];
            
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.id = 'editScheduleModal';
            
            const days = [
                { value: 'sunday', label: 'الأحد' },
                { value: 'monday', label: 'الإثنين' },
                { value: 'tuesday', label: 'الثلاثاء' },
                { value: 'wednesday', label: 'الأربعاء' },
                { value: 'thursday', label: 'الخميس' },
                { value: 'friday', label: 'الجمعة' },
                { value: 'saturday', label: 'السبت' }
            ];
            
            let scheduleHTML = days.map(day => {
                const schedule = schedules.find(s => s.day_of_week === day.value);
                return `
                    <div class="schedule-day-edit">
                        <label>
                            <input type="checkbox" class="day-checkbox" value="${day.value}" ${schedule && schedule.is_active ? 'checked' : ''}>
                            <span>${day.label}</span>
                        </label>
                        <div class="time-inputs">
                            <input type="time" class="start-time" value="${schedule ? schedule.start_time : '08:00'}" ${schedule && schedule.is_active ? '' : 'disabled'}>
                            <span>إلى</span>
                            <input type="time" class="end-time" value="${schedule ? schedule.end_time : '14:00'}" ${schedule && schedule.is_active ? '' : 'disabled'}>
                        </div>
                        <div class="subjects-input">
                            <input type="text" class="subjects" placeholder="المواد (اختياري)" value="${schedule ? (schedule.subjects || '') : ''}" ${schedule && schedule.is_active ? '' : 'disabled'}>
                        </div>
                    </div>
                `;
            }).join('');
            
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>تعديل الجدول الدراسي</h3>
                        <button class="close-btn" onclick="closeEditScheduleModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="editScheduleForm">
                            ${scheduleHTML}
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="closeEditScheduleModal()">إلغاء</button>
                        <button class="btn-primary" onclick="saveSchedule()">حفظ التغييرات</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            modal.style.display = 'block';
            
            // Add event listeners for checkboxes
            modal.querySelectorAll('.day-checkbox').forEach(checkbox => {
                checkbox.addEventListener('change', function() {
                    const dayEdit = this.closest('.schedule-day-edit');
                    const inputs = dayEdit.querySelectorAll('input[type="time"], input.subjects');
                    inputs.forEach(input => {
                        input.disabled = !this.checked;
                    });
                });
            });
            
        } catch (error) {
            console.error('Error loading schedule:', error);
            alert('حدث خطأ أثناء تحميل الجدول');
        }
    }
    
    // Close edit schedule modal
    window.closeEditScheduleModal = function() {
        const modal = document.getElementById('editScheduleModal');
        if (modal) {
            modal.remove();
        }
    };
    
    // Save schedule
    async function saveSchedule() {
        const form = document.getElementById('editScheduleForm');
        const dayEdits = form.querySelectorAll('.schedule-day-edit');
        
        const schedules = [];
        dayEdits.forEach(dayEdit => {
            const checkbox = dayEdit.querySelector('.day-checkbox');
            const startTime = dayEdit.querySelector('.start-time').value;
            const endTime = dayEdit.querySelector('.end-time').value;
            const subjects = dayEdit.querySelector('.subjects').value;
            
            schedules.push({
                day: checkbox.value,
                startTime: startTime,
                endTime: endTime,
                subjects: subjects,
                is_active: checkbox.checked
            });
        });
        
        try {
            const response = await StudentAPI.updateSchedule(schedules);
            if (response.success) {
                loadSchedule();
                closeEditScheduleModal();
                showNotification('تم تحديث الجدول بنجاح', 'success');
            }
        } catch (error) {
            showNotification('حدث خطأ أثناء تحديث الجدول', 'error');
            console.error('Error updating schedule:', error);
        }
    }
    
    // Add booking trip functionality
    window.bookTrip = async function() {
        const tripDate = prompt('تاريخ الرحلة (YYYY-MM-DD):');
        if (!tripDate) return;
        
        const tripTime = prompt('وقت الرحلة (HH:MM):');
        if (!tripTime) return;
        
        const tripType = confirm('اختر نوع الرحلة:\nموافق = صباحية\nإلغاء = مسائية') ? 'morning' : 'evening';
        
        const notes = prompt('ملاحظات (اختياري):') || '';
        
        try {
            const response = await StudentAPI.bookTrip({
                trip_date: tripDate,
                pickup_time: tripTime,
                trip_type: tripType,
                notes: notes
            });
            
            if (response.success) {
                showNotification('تم إرسال طلب الرحلة بنجاح. سيتم إشعار السائقين المتاحين.', 'success');
                // Refresh current trip after a delay
                setTimeout(() => {
                    loadLiveTripData();
                }, 2000);
            }
        } catch (error) {
            showNotification(error.message || 'حدث خطأ أثناء حجز الرحلة', 'error');
            console.error('Error booking trip:', error);
        }
    };


    // Add CSS for time inputs
    const style = document.createElement('style');
    style.textContent = `
        .time-inputs {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 0.5rem;
        }
        
        .time-inputs input {
            flex: 1;
        }
        
        .time-inputs span {
            color: var(--light-gray);
            font-weight: 500;
        }
        
        .subjects-input input {
            width: 100%;
            margin-top: 0.5rem;
        }
        
        .notification-item.unread {
            background-color: var(--light-yellow);
            border-left: 3px solid var(--dark-green);
        }
        
        .notification-item.read {
            opacity: 0.7;
        }
        
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        .status-indicator.cancelled {
            background-color: #f44336;
        }
    `;
    document.head.appendChild(style);

    // Check authentication
    const userSession = UniRide.utils.getFromStorage('userSession');
    if (!userSession || !userSession.isLoggedIn || userSession.userType !== 'student') {
        window.location.href = 'index.html';
    }

    // Start trip simulation
    setInterval(simulateTripProgression, 10000); // Every 10 seconds

    // Add keyboard shortcuts
    document.addEventListener('keydown', function (e) {
        // Ctrl/Cmd + N to toggle notifications
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            toggleNotificationDropdown();
        }

        // Escape to close modals
        if (e.key === 'Escape') {
            closeNotificationDropdown();
            const modal = document.querySelector('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        }
    });
});