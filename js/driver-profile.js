// Driver Profile Page JavaScript
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

        if (currentUser.user_type !== 'driver') {
            if (currentUser.user_type === 'student') {
                window.location.href = 'student-profile.html';
            } else {
                window.location.href = 'index.html';
            }
            return;
        }

        // Initialize profile after authentication check
        initializeDriverProfile(currentUser);
        loadRecentTrips();
        loadReviews();
    }).catch(error => {
        console.error('Auth check error:', error);
        window.location.href = 'index.html';
    });

    // Initialize driver profile
    function initializeDriverProfile(user) {
        if (user) {
            // Load full profile data from API
            DriverAPI.getProfile().then(profileResponse => {
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
    function updateProfileInfo(driver) {
        // Personal info
        document.getElementById('driverName').textContent = driver.name || driver.fullName || 'غير محدد';
        document.getElementById('fullName').textContent = driver.name || driver.fullName || 'غير محدد';
        document.getElementById('phone').textContent = driver.phone || 'غير محدد';
        document.getElementById('email').textContent = driver.email || 'غير محدد';
        document.getElementById('joinDate').textContent = driver.created_at ? formatDate(driver.created_at) : 'غير محدد';

        // Vehicle info
        document.getElementById('carType').textContent = driver.carType || 'غير محدد';
        document.getElementById('plateNumber').textContent = driver.plateNumber || 'غير محدد';
        document.getElementById('licenseNumber').textContent = driver.licenseNumber || 'غير محدد';
        document.getElementById('carYear').textContent = driver.carYear || 'غير محدد';
        document.getElementById('carColor').textContent = driver.carColor || 'غير محدد';

        // Statistics
        document.getElementById('totalTrips').textContent = driver.totalTrips?.toLocaleString() || '0';
        document.getElementById('rating').textContent = driver.rating || '0.0';
        document.getElementById('totalEarnings').textContent = (driver.totalEarnings || 0).toLocaleString();
        document.getElementById('totalHours').textContent = (driver.totalHours || 0).toLocaleString();
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
            const student = UniRide.mockData.students.find(s => s.id === trip.studentId);
            if (!student) return;

            const tripItem = document.createElement('div');
            tripItem.className = 'trip-item';
            tripItem.innerHTML = `
                <div class="trip-info">
                    <div class="trip-header">
                        <h4>${student.name}</h4>
                        <span class="trip-status ${trip.status}">${getStatusText(trip.status)}</span>
                    </div>
                    <div class="trip-details">
                        <span class="trip-date">${formatDate(trip.date)}</span>
                        <span class="trip-time">${trip.pickupTime}</span>
                        <span class="trip-university">${student.university}</span>
                    </div>
                </div>
                <div class="trip-rating">
                    ${trip.rating ? '<i class="fas fa-star"></i>'.repeat(trip.rating) : 'لم يتم التقييم بعد'}
                </div>
            `;

            recentTripsContainer.appendChild(tripItem);
        });
    }

    // Load reviews
    function loadReviews() {
        const reviewsContainer = document.getElementById('reviewsList');
        if (!reviewsContainer) return;

        const reviews = [
            {
                studentName: "فاطمة أحمد محمد",
                rating: 5,
                comment: "سائق ممتاز ومهذب، أوصلني في الوقت المحدد",
                date: "2024-01-10"
            },
            {
                studentName: "سارة عبدالله العتيبي",
                rating: 4,
                comment: "رحلة مريحة، شكراً لك",
                date: "2024-01-08"
            },
            {
                studentName: "نورا محمد القحطاني",
                rating: 5,
                comment: "أفضل سائق في التطبيق، أنصح به",
                date: "2024-01-05"
            }
        ];

        reviewsContainer.innerHTML = '';

        reviews.forEach(review => {
            const reviewItem = document.createElement('div');
            reviewItem.className = 'review-item';
            reviewItem.innerHTML = `
                <div class="review-header">
                    <div class="review-student">
                        <span class="student-name">${review.studentName}</span>
                        <div class="review-rating">${'<i class="fas fa-star"></i>'.repeat(review.rating)}</div>
                    </div>
                    <span class="review-date">${formatDate(review.date)}</span>
                </div>
                <p class="review-comment">${review.comment}</p>
            `;

            reviewsContainer.appendChild(reviewItem);
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
        const currentUser = users.find(u => u.userType === 'driver');

        if (currentUser) {
            document.getElementById('editFullName').value = currentUser.fullName;
            document.getElementById('editPhone').value = currentUser.phone;
            document.getElementById('editEmail').value = currentUser.email;
        }

        modal.style.display = 'block';
        UniRide.animations.fadeIn(modal);
    };

    // Edit vehicle info
    window.editVehicleInfo = function () {
        const modal = document.getElementById('editVehicleModal');
        if (!modal) return;

        // Fill form with current data
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const currentUser = users.find(u => u.userType === 'driver');

        if (currentUser) {
            document.getElementById('editCarType').value = currentUser.carType || '';
            document.getElementById('editPlateNumber').value = currentUser.plateNumber || '';
            document.getElementById('editLicenseNumber').value = currentUser.licenseNumber || '';
            document.getElementById('editCarYear').value = currentUser.carYear || '';
            document.getElementById('editCarColor').value = currentUser.carColor || '';
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
        const userIndex = users.findIndex(u => u.userType === 'driver');

        if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...data };
            localStorage.setItem('users', JSON.stringify(users));

            // Update profile display
            updateProfileInfo(users[userIndex]);

            showNotification('تم حفظ التغييرات بنجاح', 'success');
            closeEditModal();
        }
    };

    // Save vehicle info
    window.saveVehicleInfo = function () {
        const form = document.getElementById('editVehicleForm');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Validate form
        if (!data.carType || !data.plateNumber || !data.licenseNumber) {
            showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
            return;
        }

        // Update user data
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.userType === 'driver');

        if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...data };
            localStorage.setItem('users', JSON.stringify(users));

            // Update profile display
            updateProfileInfo(users[userIndex]);

            showNotification('تم حفظ التغييرات بنجاح', 'success');
            closeEditModal();
        }
    };

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
                    document.getElementById('driverAvatar').src = e.target.result;
                    showNotification('تم تغيير الصورة بنجاح', 'success');
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
        const userIndex = users.findIndex(u => u.userType === 'driver');

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

    // Logout
    window.logout = async function () {
        if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
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
