<?php
/**
 * UniRide - Drivers API
 * واجهة برمجة التطبيقات للسائقين
 */

require_once 'config.php';

startSecureSession();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'profile':
        if ($method === 'GET') {
            getDriverProfile();
        } elseif ($method === 'PUT') {
            updateDriverProfile();
        }
        break;
        
    case 'status':
        if ($method === 'PUT') {
            updateDriverStatus();
        }
        break;
        
    case 'trips':
        if ($method === 'GET') {
            getDriverTrips();
        }
        break;
        
    case 'today-trips':
        if ($method === 'GET') {
            getTodayTrips();
        }
        break;
        
    case 'students':
        if ($method === 'GET') {
            getAssignedStudents();
        }
        break;
        
    case 'stats':
        if ($method === 'GET') {
            getDriverStats();
        }
        break;
        
    case 'update-location':
        if ($method === 'POST') {
            updateLocation();
        }
        break;
        
    case 'trip-requests':
        if ($method === 'GET') {
            getTripRequests();
        }
        break;
        
    case 'accept-trip':
        if ($method === 'POST') {
            acceptTripRequest();
        }
        break;
        
    case 'reject-trip':
        if ($method === 'POST') {
            rejectTripRequest();
        }
        break;
        
    case 'add-trip':
        if ($method === 'POST') {
            addTrip();
        }
        break;
        
    case 'emergency':
        if ($method === 'POST') {
            reportEmergency();
        }
        break;
        
    case 'fuel':
        if ($method === 'POST') {
            recordFuel();
        }
        break;
        
    case 'maintenance':
        if ($method === 'POST') {
            recordMaintenance();
        }
        break;
        
    default:
        errorResponse('إجراء غير صالح', 404);
}

/**
 * الحصول على بيانات السائق
 */
function getDriverProfile() {
    $user = requireUserType('driver');
    
    try {
        $db = Database::getInstance()->getConnection();
        
        $stmt = $db->prepare("
            SELECT d.*, u.name, u.email, u.phone
            FROM drivers d
            JOIN users u ON d.user_id = u.id
            WHERE d.user_id = ?
        ");
        $stmt->execute([$user['id']]);
        $driver = $stmt->fetch();
        
        if (!$driver) {
            errorResponse('لم يتم العثور على بيانات السائق', 404);
        }
        
        successResponse('تم جلب البيانات بنجاح', $driver);
        
    } catch (PDOException $e) {
        error_log("Get Driver Profile Error: " . $e->getMessage());
        errorResponse('حدث خطأ أثناء جلب البيانات', 500);
    }
}

/**
 * تحديث بيانات السائق
 */
function updateDriverProfile() {
    $user = requireUserType('driver');
    $data = getJsonInput();
    
    try {
        $db = Database::getInstance()->getConnection();
        
        // تحديث بيانات المستخدم
        if (isset($data['name']) || isset($data['phone'])) {
            $updates = [];
            $params = [];
            
            if (isset($data['name'])) {
                $updates[] = "name = ?";
                $params[] = sanitizeInput($data['name']);
            }
            
            if (isset($data['phone'])) {
                $phone = sanitizeInput($data['phone']);
                if (!validatePhone($phone)) {
                    errorResponse('رقم الجوال غير صالح');
                }
                $updates[] = "phone = ?";
                $params[] = $phone;
            }
            
            $params[] = $user['id'];
            
            $sql = "UPDATE users SET " . implode(', ', $updates) . " WHERE id = ?";
            $stmt = $db->prepare($sql);
            $stmt->execute($params);
        }
        
        // تحديث بيانات السائق
        $updates = [];
        $params = [];
        
        $fields = ['car_type', 'car_model', 'car_year', 'plate_number', 'license_number', 
                   'experience_years', 'working_hours_start', 'working_hours_end'];
        
        foreach ($fields as $field) {
            if (isset($data[$field])) {
                $updates[] = "$field = ?";
                $params[] = sanitizeInput($data[$field]);
            }
        }
        
        if (!empty($updates)) {
            $params[] = $user['id'];
            
            $sql = "UPDATE drivers SET " . implode(', ', $updates) . " WHERE user_id = ?";
            $stmt = $db->prepare($sql);
            $stmt->execute($params);
        }
        
        logActivity($user['id'], 'update_profile', 'تحديث الملف الشخصي');
        
        successResponse('تم تحديث البيانات بنجاح');
        
    } catch (PDOException $e) {
        error_log("Update Driver Profile Error: " . $e->getMessage());
        errorResponse('حدث خطأ أثناء تحديث البيانات', 500);
    }
}

/**
 * تحديث حالة السائق
 */
function updateDriverStatus() {
    $user = requireUserType('driver');
    $data = getJsonInput();
    
    validateRequiredFields($data, ['status']);
    
    $status = sanitizeInput($data['status']);
    
    if (!in_array($status, ['available', 'busy', 'offline'])) {
        errorResponse('حالة السائق غير صالحة');
    }
    
    try {
        $db = Database::getInstance()->getConnection();
        
        $stmt = $db->prepare("
            UPDATE drivers 
            SET driver_status = ? 
            WHERE user_id = ?
        ");
        $stmt->execute([$status, $user['id']]);
        
        logActivity($user['id'], 'update_status', "تغيير الحالة إلى: $status");
        
        successResponse('تم تحديث الحالة بنجاح', ['status' => $status]);
        
    } catch (PDOException $e) {
        error_log("Update Driver Status Error: " . $e->getMessage());
        errorResponse('حدث خطأ أثناء تحديث الحالة', 500);
    }
}

/**
 * الحصول على رحلات السائق
 */
function getDriverTrips() {
    $user = requireUserType('driver');
    
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
    $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
    
    try {
        $db = Database::getInstance()->getConnection();
        
        $stmt = $db->prepare("SELECT id FROM drivers WHERE user_id = ?");
        $stmt->execute([$user['id']]);
        $driver = $stmt->fetch();
        
        if (!$driver) {
            errorResponse('لم يتم العثور على بيانات السائق', 404);
        }
        
        $stmt = $db->prepare("
            SELECT t.*, 
                   u.name as student_name, 
                   u.phone as student_phone,
                   s.address, s.university, s.pickup_time as preferred_time
            FROM trips t
            JOIN students s ON t.student_id = s.id
            JOIN users u ON s.user_id = u.id
            WHERE t.driver_id = ?
            ORDER BY t.trip_date DESC, t.pickup_time DESC
            LIMIT ? OFFSET ?
        ");
        $stmt->execute([$driver['id'], $limit, $offset]);
        $trips = $stmt->fetchAll();
        
        successResponse('تم جلب الرحلات بنجاح', $trips);
        
    } catch (PDOException $e) {
        error_log("Get Driver Trips Error: " . $e->getMessage());
        errorResponse('حدث خطأ أثناء جلب الرحلات', 500);
    }
}

/**
 * الحصول على رحلات اليوم
 */
function getTodayTrips() {
    $user = requireUserType('driver');
    
    try {
        $db = Database::getInstance()->getConnection();
        
        $stmt = $db->prepare("SELECT id FROM drivers WHERE user_id = ?");
        $stmt->execute([$user['id']]);
        $driver = $stmt->fetch();
        
        if (!$driver) {
            errorResponse('لم يتم العثور على بيانات السائق', 404);
        }
        
        $stmt = $db->prepare("
            SELECT t.*, 
                   u.name as student_name, 
                   u.phone as student_phone,
                   s.address, s.university, s.location_lat, s.location_lng,
                   s.location_link, s.house_image, s.emergency_contact, s.notes
            FROM trips t
            JOIN students s ON t.student_id = s.id
            JOIN users u ON s.user_id = u.id
            WHERE t.driver_id = ? AND t.trip_date = CURDATE()
            ORDER BY t.pickup_time ASC
        ");
        $stmt->execute([$driver['id']]);
        $trips = $stmt->fetchAll();
        
        successResponse('تم جلب رحلات اليوم بنجاح', $trips);
        
    } catch (PDOException $e) {
        error_log("Get Today Trips Error: " . $e->getMessage());
        errorResponse('حدث خطأ أثناء جلب رحلات اليوم', 500);
    }
}

/**
 * الحصول على الطالبات المخصصات
 */
function getAssignedStudents() {
    $user = requireUserType('driver');
    
    try {
        $db = Database::getInstance()->getConnection();
        
        $stmt = $db->prepare("SELECT id FROM drivers WHERE user_id = ?");
        $stmt->execute([$user['id']]);
        $driver = $stmt->fetch();
        
        if (!$driver) {
            errorResponse('لم يتم العثور على بيانات السائق', 404);
        }
        
        $stmt = $db->prepare("
            SELECT DISTINCT
                   s.id, s.user_id,
                   u.name, u.phone, u.email,
                   s.university, s.major, s.year, s.address,
                   s.location_lat, s.location_lng, s.location_link,
                   s.house_image, s.pickup_time, s.emergency_contact, s.notes
            FROM students s
            JOIN users u ON s.user_id = u.id
            JOIN trips t ON s.id = t.student_id
            WHERE t.driver_id = ?
            ORDER BY s.pickup_time ASC
        ");
        $stmt->execute([$driver['id']]);
        $students = $stmt->fetchAll();
        
        successResponse('تم جلب الطالبات بنجاح', $students);
        
    } catch (PDOException $e) {
        error_log("Get Assigned Students Error: " . $e->getMessage());
        errorResponse('حدث خطأ أثناء جلب الطالبات', 500);
    }
}

/**
 * الحصول على إحصائيات السائق
 */
function getDriverStats() {
    $user = requireUserType('driver');
    
    try {
        $db = Database::getInstance()->getConnection();
        
        $stmt = $db->prepare("SELECT id FROM drivers WHERE user_id = ?");
        $stmt->execute([$user['id']]);
        $driver = $stmt->fetch();
        
        if (!$driver) {
            errorResponse('لم يتم العثور على بيانات السائق', 404);
        }
        
        // إحصائيات اليوم
        $stmt = $db->prepare("
            SELECT 
                COUNT(*) as today_trips,
                SUM(CASE WHEN trip_status = 'completed' THEN 1 ELSE 0 END) as completed_trips,
                SUM(CASE WHEN trip_status = 'completed' THEN fare ELSE 0 END) as today_earnings
            FROM trips
            WHERE driver_id = ? AND trip_date = CURDATE()
        ");
        $stmt->execute([$driver['id']]);
        $todayStats = $stmt->fetch();
        
        // إحصائيات الشهر
        $stmt = $db->prepare("
            SELECT 
                COUNT(*) as month_trips,
                SUM(CASE WHEN trip_status = 'completed' THEN fare ELSE 0 END) as month_earnings
            FROM trips
            WHERE driver_id = ? 
            AND YEAR(trip_date) = YEAR(CURDATE())
            AND MONTH(trip_date) = MONTH(CURDATE())
        ");
        $stmt->execute([$driver['id']]);
        $monthStats = $stmt->fetch();
        
        // معلومات السائق
        $stmt = $db->prepare("
            SELECT rating, total_trips, total_earnings
            FROM drivers
            WHERE id = ?
        ");
        $stmt->execute([$driver['id']]);
        $driverInfo = $stmt->fetch();
        
        successResponse('تم جلب الإحصائيات بنجاح', [
            'today' => $todayStats,
            'month' => $monthStats,
            'overall' => $driverInfo
        ]);
        
    } catch (PDOException $e) {
        error_log("Get Driver Stats Error: " . $e->getMessage());
        errorResponse('حدث خطأ أثناء جلب الإحصائيات', 500);
    }
}

/**
 * تحديث موقع السائق
 */
function updateLocation() {
    $user = requireUserType('driver');
    $data = getJsonInput();
    
    validateRequiredFields($data, ['trip_id', 'latitude', 'longitude']);
    
    try {
        $db = Database::getInstance()->getConnection();
        
        $stmt = $db->prepare("SELECT id FROM drivers WHERE user_id = ?");
        $stmt->execute([$user['id']]);
        $driver = $stmt->fetch();
        
        if (!$driver) {
            errorResponse('لم يتم العثور على بيانات السائق', 404);
        }
        
        $stmt = $db->prepare("
            INSERT INTO live_locations (trip_id, driver_id, latitude, longitude, speed, heading, accuracy)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $data['trip_id'],
            $driver['id'],
            $data['latitude'],
            $data['longitude'],
            $data['speed'] ?? null,
            $data['heading'] ?? null,
            $data['accuracy'] ?? null
        ]);
        
        successResponse('تم تحديث الموقع بنجاح');
        
    } catch (PDOException $e) {
        error_log("Update Location Error: " . $e->getMessage());
        errorResponse('حدث خطأ أثناء تحديث الموقع', 500);
    }
}

/**
 * الحصول على طلبات الرحلات المعلقة
 */
function getTripRequests() {
    $user = requireUserType('driver');
    
    try {
        $db = Database::getInstance()->getConnection();
        
        $stmt = $db->prepare("SELECT id FROM drivers WHERE user_id = ?");
        $stmt->execute([$user['id']]);
        $driver = $stmt->fetch();
        
        if (!$driver) {
            errorResponse('لم يتم العثور على بيانات السائق', 404);
        }
        
        // جلب طلبات الرحلات المعلقة
        $stmt = $db->prepare("
            SELECT tr.*, 
                   s.id as student_id,
                   u.name as student_name, 
                   u.phone as student_phone,
                   s.address, s.university, s.major, s.year,
                   s.location_lat, s.location_lng,
                   s.location_link, s.house_image, s.emergency_contact, s.notes as student_notes
            FROM trip_requests tr
            JOIN students s ON tr.student_id = s.id
            JOIN users u ON s.user_id = u.id
            WHERE tr.request_status = 'pending'
            AND tr.trip_date >= CURDATE()
            ORDER BY tr.trip_date ASC, tr.pickup_time ASC
        ");
        $stmt->execute();
        $requests = $stmt->fetchAll();
        
        successResponse('تم جلب طلبات الرحلات بنجاح', $requests);
        
    } catch (PDOException $e) {
        error_log("Get Trip Requests Error: " . $e->getMessage());
        errorResponse('حدث خطأ أثناء جلب طلبات الرحلات', 500);
    }
}

/**
 * قبول طلب رحلة
 */
function acceptTripRequest() {
    $user = requireUserType('driver');
    $data = getJsonInput();
    
    validateRequiredFields($data, ['request_id']);
    
    try {
        $db = Database::getInstance()->getConnection();
        
        $stmt = $db->prepare("SELECT id FROM drivers WHERE user_id = ?");
        $stmt->execute([$user['id']]);
        $driver = $stmt->fetch();
        
        if (!$driver) {
            errorResponse('لم يتم العثور على بيانات السائق', 404);
        }
        
        // التحقق من وجود الطلب
        $stmt = $db->prepare("
            SELECT tr.*, s.user_id as student_user_id
            FROM trip_requests tr
            JOIN students s ON tr.student_id = s.id
            WHERE tr.id = ? AND tr.request_status = 'pending'
        ");
        $stmt->execute([$data['request_id']]);
        $request = $stmt->fetch();
        
        if (!$request) {
            errorResponse('الطلب غير موجود أو تم قبوله مسبقاً', 404);
        }
        
        // تحديث حالة الطلب
        $stmt = $db->prepare("
            UPDATE trip_requests 
            SET request_status = 'accepted', driver_id = ?
            WHERE id = ?
        ");
        $stmt->execute([$driver['id'], $data['request_id']]);
        
        // إنشاء رحلة جديدة
        $stmt = $db->prepare("
            INSERT INTO trips (student_id, driver_id, trip_date, pickup_time, trip_type, trip_status, notes)
            VALUES (?, ?, ?, ?, ?, 'scheduled', ?)
        ");
        $stmt->execute([
            $request['student_id'],
            $driver['id'],
            $request['trip_date'],
            $request['pickup_time'],
            $request['trip_type'],
            $request['notes']
        ]);
        
        $tripId = $db->lastInsertId();
        
        // إرسال إشعار للطالبة
        $stmt = $db->prepare("
            INSERT INTO notifications (user_id, title, message, notification_type, related_trip_id)
            VALUES (?, ?, ?, 'trip', ?)
        ");
        $stmt->execute([
            $request['student_user_id'],
            'تم قبول طلب الرحلة',
            "تم قبول طلب رحلتك في تاريخ {$request['trip_date']} في الساعة {$request['pickup_time']}",
            $tripId
        ]);
        
        // رفض جميع الطلبات الأخرى في نفس الوقت للطالبة
        $stmt = $db->prepare("
            UPDATE trip_requests 
            SET request_status = 'rejected'
            WHERE student_id = ? AND trip_date = ? AND pickup_time = ? 
            AND id != ? AND request_status = 'pending'
        ");
        $stmt->execute([
            $request['student_id'],
            $request['trip_date'],
            $request['pickup_time'],
            $data['request_id']
        ]);
        
        logActivity($user['id'], 'accept_trip', "قبول طلب رحلة #{$data['request_id']}");
        
        successResponse('تم قبول طلب الرحلة بنجاح', ['trip_id' => $tripId]);
        
    } catch (PDOException $e) {
        error_log("Accept Trip Request Error: " . $e->getMessage());
        errorResponse('حدث خطأ أثناء قبول طلب الرحلة', 500);
    }
}

/**
 * رفض طلب رحلة
 */
function rejectTripRequest() {
    $user = requireUserType('driver');
    $data = getJsonInput();
    
    validateRequiredFields($data, ['request_id']);
    
    try {
        $db = Database::getInstance()->getConnection();
        
        $stmt = $db->prepare("SELECT id FROM drivers WHERE user_id = ?");
        $stmt->execute([$user['id']]);
        $driver = $stmt->fetch();
        
        if (!$driver) {
            errorResponse('لم يتم العثور على بيانات السائق', 404);
        }
        
        // تحديث حالة الطلب
        $stmt = $db->prepare("
            UPDATE trip_requests 
            SET request_status = 'rejected'
            WHERE id = ? AND request_status = 'pending'
        ");
        $stmt->execute([$data['request_id']]);
        
        if ($stmt->rowCount() === 0) {
            errorResponse('الطلب غير موجود أو تم معالجته مسبقاً', 404);
        }
        
        logActivity($user['id'], 'reject_trip', "رفض طلب رحلة #{$data['request_id']}");
        
        successResponse('تم رفض طلب الرحلة بنجاح');
        
    } catch (PDOException $e) {
        error_log("Reject Trip Request Error: " . $e->getMessage());
        errorResponse('حدث خطأ أثناء رفض طلب الرحلة', 500);
    }
}

/**
 * إضافة رحلة جديدة مباشرة (من السائق)
 */
function addTrip() {
    $user = requireUserType('driver');
    $data = getJsonInput();
    
    validateRequiredFields($data, ['student_id', 'trip_date', 'pickup_time', 'trip_type']);
    
    try {
        $db = Database::getInstance()->getConnection();
        
        $stmt = $db->prepare("SELECT id FROM drivers WHERE user_id = ?");
        $stmt->execute([$user['id']]);
        $driver = $stmt->fetch();
        
        if (!$driver) {
            errorResponse('لم يتم العثور على بيانات السائق', 404);
        }
        
        // التحقق من وجود الطالبة
        $stmt = $db->prepare("SELECT id FROM students WHERE id = ?");
        $stmt->execute([$data['student_id']]);
        $student = $stmt->fetch();
        
        if (!$student) {
            errorResponse('لم يتم العثور على بيانات الطالبة', 404);
        }
        
        // التحقق من عدم وجود رحلة في نفس الوقت
        $stmt = $db->prepare("
            SELECT id FROM trips 
            WHERE driver_id = ? AND trip_date = ? AND pickup_time = ?
            AND trip_status NOT IN ('completed', 'cancelled')
        ");
        $stmt->execute([$driver['id'], $data['trip_date'], $data['pickup_time']]);
        $existingTrip = $stmt->fetch();
        
        if ($existingTrip) {
            errorResponse('لديك رحلة موجودة بالفعل في هذا التاريخ والوقت');
        }
        
        // إنشاء رحلة جديدة
        $stmt = $db->prepare("
            INSERT INTO trips (student_id, driver_id, trip_date, pickup_time, trip_type, trip_status, notes)
            VALUES (?, ?, ?, ?, ?, 'scheduled', ?)
        ");
        $stmt->execute([
            $data['student_id'],
            $driver['id'],
            $data['trip_date'],
            $data['pickup_time'],
            $data['trip_type'],
            $data['notes'] ?? null
        ]);
        
        $tripId = $db->lastInsertId();
        
        // إرسال إشعار للطالبة
        $stmt = $db->prepare("
            SELECT user_id FROM students WHERE id = ?
        ");
        $stmt->execute([$data['student_id']]);
        $studentData = $stmt->fetch();
        
        if ($studentData) {
            $stmt = $db->prepare("
                INSERT INTO notifications (user_id, title, message, notification_type, related_trip_id)
                VALUES (?, ?, ?, 'trip', ?)
            ");
            $stmt->execute([
                $studentData['user_id'],
                'تم إضافة رحلة جديدة',
                "تم إضافة رحلة جديدة لك في تاريخ {$data['trip_date']} في الساعة {$data['pickup_time']}",
                $tripId
            ]);
        }
        
        logActivity($user['id'], 'add_trip', "إضافة رحلة جديدة للطالبة #{$data['student_id']}");
        
        successResponse('تم إضافة الرحلة بنجاح', ['trip_id' => $tripId]);
        
    } catch (PDOException $e) {
        error_log("Add Trip Error: " . $e->getMessage());
        errorResponse('حدث خطأ أثناء إضافة الرحلة', 500);
    }
}

/**
 * الإبلاغ عن حالة طوارئ
 */
function reportEmergency() {
    $user = requireUserType('driver');
    $data = getJsonInput();
    
    validateRequiredFields($data, ['emergency_type', 'description']);
    
    try {
        $db = Database::getInstance()->getConnection();
        
        $stmt = $db->prepare("SELECT id FROM drivers WHERE user_id = ?");
        $stmt->execute([$user['id']]);
        $driver = $stmt->fetch();
        
        if (!$driver) {
            errorResponse('لم يتم العثور على بيانات السائق', 404);
        }
        
        // الحصول على آخر رحلة نشطة
        $stmt = $db->prepare("
            SELECT id FROM trips 
            WHERE driver_id = ? 
            AND trip_status IN ('scheduled', 'waiting', 'arriving', 'in_progress')
            ORDER BY trip_date DESC, pickup_time DESC
            LIMIT 1
        ");
        $stmt->execute([$driver['id']]);
        $trip = $stmt->fetch();
        
        if (!$trip) {
            errorResponse('لا توجد رحلة نشطة للإبلاغ عنها', 404);
        }
        
        // تسجيل حالة الطوارئ
        $stmt = $db->prepare("
            INSERT INTO emergencies (trip_id, reported_by, emergency_type, description, location_lat, location_lng, status)
            VALUES (?, ?, ?, ?, ?, ?, 'reported')
        ");
        $stmt->execute([
            $trip['id'],
            $user['id'],
            $data['emergency_type'],
            sanitizeInput($data['description']),
            $data['location_lat'] ?? null,
            $data['location_lng'] ?? null
        ]);
        
        // إرسال إشعارات للمسؤولين والطالبة
        $stmt = $db->prepare("
            SELECT student_id FROM trips WHERE id = ?
        ");
        $stmt->execute([$trip['id']]);
        $tripData = $stmt->fetch();
        
        if ($tripData) {
            $stmt = $db->prepare("
                SELECT user_id FROM students WHERE id = ?
            ");
            $stmt->execute([$tripData['student_id']]);
            $studentData = $stmt->fetch();
            
            if ($studentData) {
                $stmt = $db->prepare("
                    INSERT INTO notifications (user_id, title, message, notification_type, related_trip_id)
                    VALUES (?, ?, ?, 'emergency', ?)
                ");
                $stmt->execute([
                    $studentData['user_id'],
                    'حالة طوارئ',
                    "تم الإبلاغ عن حالة طوارئ في الرحلة. النوع: {$data['emergency_type']}",
                    $trip['id']
                ]);
            }
        }
        
        logActivity($user['id'], 'report_emergency', "الإبلاغ عن حالة طوارئ: {$data['emergency_type']}");
        
        successResponse('تم الإبلاغ عن حالة الطوارئ بنجاح. سيتم التواصل معك قريباً.');
        
    } catch (PDOException $e) {
        error_log("Report Emergency Error: " . $e->getMessage());
        errorResponse('حدث خطأ أثناء الإبلاغ عن حالة الطوارئ', 500);
    }
}

/**
 * تسجيل وقود
 */
function recordFuel() {
    $user = requireUserType('driver');
    $data = getJsonInput();
    
    validateRequiredFields($data, ['fuel_amount', 'fuel_cost', 'odometer_reading', 'fuel_date']);
    
    try {
        $db = Database::getInstance()->getConnection();
        
        $stmt = $db->prepare("SELECT id FROM drivers WHERE user_id = ?");
        $stmt->execute([$user['id']]);
        $driver = $stmt->fetch();
        
        if (!$driver) {
            errorResponse('لم يتم العثور على بيانات السائق', 404);
        }
        
        // تسجيل الوقود
        $stmt = $db->prepare("
            INSERT INTO fuel_records (driver_id, fuel_amount, fuel_cost, odometer_reading, fuel_station, fuel_date, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $driver['id'],
            $data['fuel_amount'],
            $data['fuel_cost'],
            $data['odometer_reading'],
            sanitizeInput($data['fuel_station'] ?? ''),
            $data['fuel_date'],
            sanitizeInput($data['notes'] ?? '')
        ]);
        
        logActivity($user['id'], 'record_fuel', "تسجيل وقود: {$data['fuel_amount']} لتر");
        
        successResponse('تم تسجيل الوقود بنجاح');
        
    } catch (PDOException $e) {
        error_log("Record Fuel Error: " . $e->getMessage());
        errorResponse('حدث خطأ أثناء تسجيل الوقود', 500);
    }
}

/**
 * تسجيل صيانة السيارة
 */
function recordMaintenance() {
    $user = requireUserType('driver');
    $data = getJsonInput();
    
    validateRequiredFields($data, ['maintenance_type', 'description', 'maintenance_date']);
    
    try {
        $db = Database::getInstance()->getConnection();
        
        $stmt = $db->prepare("SELECT id FROM drivers WHERE user_id = ?");
        $stmt->execute([$user['id']]);
        $driver = $stmt->fetch();
        
        if (!$driver) {
            errorResponse('لم يتم العثور على بيانات السائق', 404);
        }
        
        // تسجيل الصيانة
        $stmt = $db->prepare("
            INSERT INTO vehicle_maintenance (driver_id, maintenance_type, description, cost, maintenance_date, next_maintenance_date, odometer_reading, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $driver['id'],
            $data['maintenance_type'],
            sanitizeInput($data['description']),
            $data['cost'] ?? null,
            $data['maintenance_date'],
            $data['next_maintenance_date'] ?? null,
            $data['odometer_reading'] ?? null,
            sanitizeInput($data['notes'] ?? '')
        ]);
        
        logActivity($user['id'], 'record_maintenance', "تسجيل صيانة: {$data['maintenance_type']}");
        
        successResponse('تم تسجيل الصيانة بنجاح');
        
    } catch (PDOException $e) {
        error_log("Record Maintenance Error: " . $e->getMessage());
        errorResponse('حدث خطأ أثناء تسجيل الصيانة', 500);
    }
}
