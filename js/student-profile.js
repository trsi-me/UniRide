// Student Profile Page JavaScript
document.addEventListener('DOMContentLoaded', function () {
    // Check authentication first
    checkAuthOnLoad().then(response => {
        if (!response.authenticated) {
            window.location.href = 'index.html';
            return;
        }

        const currentUser = getCurrentUser();
        if (!currentUser) {
            window.location.href = 'index.html';
            return;
        }

        if (currentUser.user_type !== 'student') {
            if (currentUser.user_type === 'driver') {
                window.location.href = 'driver-profile.html';
            } else {
                window.location.href = 'index.html';
            }
            return;
        }

        // Initialize profile after authentication check
        initializeStudentProfile(currentUser);
        loadRecentTrips();
        loadFavoriteDrivers();
    }).catch(error => {
        console.error('Auth check error:', error);
        window.location.href = 'index.html';
    });

    // Initialize student profile
    function initializeStudentProfile(user) {
        if (user) {
            // Load full profile data from API
            StudentAPI.getProfile().then(profileResponse => {
                if (profileResponse.success && profileResponse.data) {
                    const profileData = {
                        ...user,
                        ...profileResponse.data.profile
                    };
                    updateProfileInfo(profileData);
                } else {
                    // Fallback to basic user data
                    updateProfileInfo(user);
                }
            }).catch(error => {
                console.error('Error loading profile:', error);
                // Fallback to basic user data
                updateProfileInfo(user);
            });
        }
    }

    // Update profile information
    function updateProfileInfo(student) {
        // Personal info
        document.getElementById('studentName').textContent = student.name || student.fullName || 'غير محدد';
        document.getElementById('fullName').textContent = student.name || student.fullName || 'غير محدد';
        document.getElementById('phone').textContent = student.phone || 'غير محدد';
        document.getElementById('email').textContent = student.email || 'غير محدد';
        document.getElementById('joinDate').textContent = student.created_at ? formatDate(student.created_at) : 'غير محدد';

        // Academic info
        document.getElementById('university').textContent = student.university || 'غير محدد';
        document.getElementById('major').textContent = student.major || 'غير محدد';
        document.getElementById('year').textContent = student.year || 'غير محدد';
        document.getElementById('gpa').textContent = student.gpa || 'غير محدد';

        // Location info
        document.getElementById('address').textContent = student.address || 'غير محدد';
        document.getElementById('pickupTime').textContent = student.pickupTime || 'غير محدد';
        document.getElementById('emergencyContact').textContent = student.emergencyContact || 'غير محدد';
        document.getElementById('notes').textContent = student.notes || 'لا توجد ملاحظات';

        if (student.houseImage) {
            document.getElementById('houseImage').src = student.houseImage;
        }

        // Statistics
        document.getElementById('totalTrips').textContent = student.totalTrips?.toLocaleString() || '0';
        document.getElementById('averageRating').textContent = student.averageRating || '0.0';
        document.getElementById('totalSpent').textContent = (student.totalSpent || 0).toLocaleString();
        document.getElementById('totalHours').textContent = (student.totalHours || 0).toLocaleString();
    }

    // Load recent trips
    function loadRecentTrips() {
        const recentTripsContainer = document.getElementById('recentTrips');
        if (!recentTripsContainer) return;

        const recentTrips = UniRide.mockData.trips.slice(0, 3); // Show last 3 trips

        if (recentTrips.length === 0) {
            recentTripsContainer.innerHTML = `
                <div class="empty-state">
                    <p>لا توجد رحلات حديثة</p>
                </div>
            `;
            return;
        }

        recentTripsContainer.innerHTML = '';

        recentTrips.forEach(trip => {
            const driver = UniRide.mockData.drivers.find(d => d.id === trip.driverId);
            if (!driver) return;

            const tripItem = document.createElement('div');
            tripItem.className = 'trip-item';
            tripItem.innerHTML = `
                <div class="trip-info">
                    <div class="trip-header">
                        <h4>${driver.name}</h4>
                        <span class="trip-status ${trip.status}">${getStatusText(trip.status)}</span>
                    </div>
                    <div class="trip-details">
                        <span class="trip-date">${formatDate(trip.date)}</span>
                        <span class="trip-time">${trip.pickupTime}</span>
                        <span class="trip-car">${driver.carType}</span>
                    </div>
                </div>
                <div class="trip-rating">
                    ${trip.rating ? '<i class="fas fa-star"></i>'.repeat(trip.rating) : 'لم يتم التقييم بعد'}
                </div>
            `;

            recentTripsContainer.appendChild(tripItem);
        });
    }

    // Load favorite drivers
    function loadFavoriteDrivers() {
        const favoriteDriversContainer = document.getElementById('favoriteDrivers');
        if (!favoriteDriversContainer) return;

        const favoriteDrivers = UniRide.mockData.drivers.slice(0, 2); // Show first 2 drivers as favorites

        if (favoriteDrivers.length === 0) {
            favoriteDriversContainer.innerHTML = `
                <div class="empty-state">
                    <p>لا توجد سائقين مفضلين</p>
                </div>
            `;
            return;
        }

        favoriteDriversContainer.innerHTML = '';

        favoriteDrivers.forEach(driver => {
            const driverItem = document.createElement('div');
            driverItem.className = 'driver-item';
            driverItem.innerHTML = `
                <div class="driver-info">
                    <div class="driver-avatar">
                        <img src="assets/driver-avatar.png" alt="صورة السائق">
                    </div>
                    <div class="driver-details">
                        <h4>${driver.name}</h4>
                        <p class="driver-car">${driver.carType}</p>
                        <div class="driver-rating">
                            <span class="stars">${'<i class="fas fa-star"></i>'.repeat(Math.floor(driver.rating))}</span>
                            <span class="rating-text">${driver.rating} (${driver.totalTrips} رحلة)</span>
                        </div>
                    </div>
                </div>
                <div class="driver-actions">
                    <button class="btn-secondary" onclick="callDriver('${driver.phone}')"><i class="fas fa-phone"></i> اتصال</button>
                    <button class="btn-primary" onclick="bookDriver(${driver.id})"><i class="fas fa-car"></i> حجز</button>
                </div>
            `;

            favoriteDriversContainer.appendChild(driverItem);
        });
    }

    // Get status text in Arabic
    function getStatusText(status) {
        const statusTexts = {
            'pending': 'مجدولة',
            'in-progress': 'جارية',
            'completed': 'مكتملة',
            'cancelled': 'ملغاة'
        };
        return statusTexts[status] || status;
    }

    // Format date
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Edit personal info
    window.editPersonalInfo = function () {
        const modal = document.getElementById('editPersonalModal');
        if (!modal) return;

        // Fill form with current data
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const currentUser = users.find(u => u.userType === 'student');

        if (currentUser) {
            document.getElementById('editFullName').value = currentUser.fullName;
            document.getElementById('editPhone').value = currentUser.phone;
            document.getElementById('editEmail').value = currentUser.email;
        }

        modal.style.display = 'block';
        UniRide.animations.fadeIn(modal);
    };

    // Edit academic info
    window.editAcademicInfo = function () {
        const modal = document.getElementById('editAcademicModal');
        if (!modal) return;

        // Fill form with current data
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const currentUser = users.find(u => u.userType === 'student');

        if (currentUser) {
            document.getElementById('editUniversity').value = currentUser.university || '';
            document.getElementById('editMajor').value = currentUser.major || '';
            document.getElementById('editYear').value = currentUser.year || '';
            document.getElementById('editGpa').value = currentUser.gpa || '';
        }

        modal.style.display = 'block';
        UniRide.animations.fadeIn(modal);
    };

    // Edit location info
    window.editLocationInfo = function () {
        const modal = document.getElementById('editLocationModal');
        if (!modal) return;

        // Fill form with current data
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const currentUser = users.find(u => u.userType === 'student');

        if (currentUser) {
            document.getElementById('editAddress').value = currentUser.address || '';
            document.getElementById('editPickupTime').value = parseTime(currentUser.pickupTime) || '';
            document.getElementById('editEmergencyContact').value = currentUser.emergencyContact || '';
            document.getElementById('editNotes').value = currentUser.notes || '';
        }

        modal.style.display = 'block';
        UniRide.animations.fadeIn(modal);
    };

    // Close edit modal
    window.closeEditModal = function () {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            UniRide.animations.fadeOut(modal, 300);
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        });
    };

    // Save personal info
    window.savePersonalInfo = function () {
        const form = document.getElementById('editPersonalForm');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Validate form
        if (!data.fullName || !data.phone || !data.email) {
            showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
            return;
        }

        // Update user data
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.userType === 'student');

        if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...data };
            localStorage.setItem('users', JSON.stringify(users));

            // Update profile display
            updateProfileInfo(users[userIndex]);

            showNotification('تم حفظ التغييرات بنجاح', 'success');
            closeEditModal();
        }
    };

    // Save academic info
    window.saveAcademicInfo = function () {
        const form = document.getElementById('editAcademicForm');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Validate form
        if (!data.university || !data.major || !data.year) {
            showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
            return;
        }

        // Update user data
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.userType === 'student');

        if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...data };
            localStorage.setItem('users', JSON.stringify(users));

            // Update profile display
            updateProfileInfo(users[userIndex]);

            showNotification('تم حفظ التغييرات بنجاح', 'success');
            closeEditModal();
        }
    };

    // Save location info
    window.saveLocationInfo = function () {
        const form = document.getElementById('editLocationForm');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Validate form
        if (!data.address || !data.pickupTime || !data.emergencyContact) {
            showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
            return;
        }

        // Convert time to display format
        data.pickupTime = formatTime(data.pickupTime);

        // Update user data
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.userType === 'student');

        if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...data };
            localStorage.setItem('users', JSON.stringify(users));

            // Update profile display
            updateProfileInfo(users[userIndex]);

            showNotification('تم حفظ التغييرات بنجاح', 'success');
            closeEditModal();
        }
    };

    // Parse time from display format
    function parseTime(timeDisplay) {
        if (!timeDisplay) return '';
        const [time, period] = timeDisplay.split(' ');
        const [hours, minutes] = time.split(':');
        let hour24 = parseInt(hours);

        if (period === 'م' && hour24 !== 12) {
            hour24 += 12;
        } else if (period === 'ص' && hour24 === 12) {
            hour24 = 0;
        }

        return `${hour24.toString().padStart(2, '0')}:${minutes}`;
    }

    // Format time for display
    function formatTime(time24) {
        const [hours, minutes] = time24.split(':');
        const hour12 = parseInt(hours) % 12 || 12;
        const ampm = parseInt(hours) >= 12 ? 'م' : 'ص';
        return `${hour12}:${minutes} ${ampm}`;
    }

    // Change avatar
    window.changeAvatar = function () {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = function (e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    document.getElementById('studentAvatar').src = e.target.result;
                    showNotification('تم تغيير الصورة بنجاح', 'success');
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    };

    // Change house image
    window.changeHouseImage = function () {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = function (e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    document.getElementById('houseImage').src = e.target.result;
                    showNotification('تم تغيير صورة المنزل بنجاح', 'success');
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    };

    // Change password
    window.changePassword = function () {
        const currentPassword = prompt('أدخل كلمة المرور الحالية:');
        if (!currentPassword) return;

        const newPassword = prompt('أدخل كلمة المرور الجديدة:');
        if (!newPassword) return;

        const confirmPassword = prompt('أعد إدخال كلمة المرور الجديدة:');
        if (newPassword !== confirmPassword) {
            showNotification('كلمة المرور غير متطابقة', 'error');
            return;
        }

        if (newPassword.length < 6) {
            showNotification('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error');
            return;
        }

        // Update password
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.userType === 'student');

        if (userIndex !== -1 && users[userIndex].password === currentPassword) {
            users[userIndex].password = newPassword;
            localStorage.setItem('users', JSON.stringify(users));
            showNotification('تم تغيير كلمة المرور بنجاح', 'success');
        } else {
            showNotification('كلمة المرور الحالية غير صحيحة', 'error');
        }
    };

    // Contact support
    window.contactSupport = function () {
        window.open('tel:920000000', '_self');
    };

    // View all trips
    window.viewAllTrips = function () {
        showNotification('سيتم إضافة صفحة الرحلات قريباً', 'info');
    };

    // Call driver
    window.callDriver = function (phone) {
        window.open(`tel:${phone}`, '_self');
    };

    // Book driver
    window.bookDriver = function (driverId) {
        showNotification('سيتم إضافة نظام الحجز قريباً', 'info');
    };

    // Logout
    window.logout = async function () {
        if (confirm('هل أنت متأكدة من تسجيل الخروج؟')) {
            try {
                await AuthAPI.logout();
                sessionStorage.clear();
                // Redirect to login page with logout parameter
                window.location.href = 'index.html?logout=true';
            } catch (error) {
                console.error('Logout error:', error);
                // Clear session anyway and redirect
                sessionStorage.clear();
                window.location.href = 'index.html?logout=true';
            }
        }
    };

    // Show notification
    function showNotification(message, type = 'info') {
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
        
        .back-btn {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            background-color: var(--light-green);
            color: var(--text-dark);
            border: none;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-family: 'IBM Plex Sans Arabic', sans-serif;
        }
        
        .back-btn:hover {
            background-color: var(--dark-green);
            color: white;
        }
        
        .back-icon {
            font-size: 1.2rem;
        }
        
        .house-image-section {
            margin-top: 1rem;
            text-align: center;
        }
        
        .house-image-section h4 {
            margin-bottom: 1rem;
            color: var(--text-dark);
        }
        
        .house-image {
            max-width: 200px;
            max-height: 150px;
            border-radius: 8px;
            box-shadow: var(--shadow);
            margin-bottom: 1rem;
        }
        
        .change-image-btn {
            padding: 0.5rem 1rem;
            background-color: var(--light-green);
            color: var(--text-dark);
            border: none;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .change-image-btn:hover {
            background-color: var(--dark-green);
            color: white;
        }
        
        .driver-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            background-color: var(--dark-gray);
            border-radius: 8px;
            margin-bottom: 1rem;
        }
        
        .driver-info {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .driver-avatar img {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            object-fit: cover;
        }
        
        .driver-details h4 {
            margin: 0 0 0.25rem 0;
            color: var(--text-dark);
        }
        
        .driver-car {
            margin: 0 0 0.5rem 0;
            color: var(--light-gray);
            font-size: 0.9rem;
        }
        
        .driver-rating {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .stars {
            font-size: 0.9rem;
        }
        
        .rating-text {
            font-size: 0.8rem;
            color: var(--light-gray);
        }
        
        .driver-actions {
            display: flex;
            gap: 0.5rem;
        }
        
        .driver-actions .btn-secondary,
        .driver-actions .btn-primary {
            padding: 0.5rem 1rem;
            font-size: 0.8rem;
        }
    `;
    document.head.appendChild(style);

    // Keyboard shortcuts
    document.addEventListener('keydown', function (e) {
        // Escape to close modals
        if (e.key === 'Escape') {
            closeEditModal();
        }
    });
});
