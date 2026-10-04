<?php
/**
 * UniRide - Students API
 * واجهة برمجة التطبيقات للطالبات
 */

require_once 'config.php';

startSecureSession();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'profile':
        if ($method === 'GET') {
            getStudentProfile();
        } elseif ($method === 'PUT') {
            updateStudentProfile();
        }
        break;
        
    case 'schedule':
        if ($method === 'GET') {
            getSchedule();
        } elseif ($method === 'POST') {
            updateSchedule();
        }
        break;
        
    case 'trips':
        if ($method === 'GET') {
            getStudentTrips();
        }
        break;
        
    case 'current-trip':
        if ($method === 'GET') {
            getCurrentTrip();
        }
        break;
        
    case 'notifications':
        if ($method === 'GET') {
            getNotifications();
        } elseif ($method === 'PUT') {
            markNotificationRead();
        }
        break;
        
    case 'book-trip':
        if ($method === 'POST') {
            bookTrip();
        }
        break;
        
    default:
        errorResponse('إجراء غير صالح', 404);
}

/**
 * الحصول على بيانات الطالبة
 */
function getStudentProfile() {
    $user = requireUserType('student');
    
    try {
        $db = Database::getInstance()->getConnection();
        
        $stmt = $db->prepare("
            SELECT s.*, u.name, u.email, u.phone
            FROM students s
            JOIN users u ON s.user_id = u.id
            WHERE s.user_id = ?
        ");
        $stmt->execute([$user['id']]);
        $student = $stmt->fetch();
        
        if (!$student) {
            errorResponse('لم يتم العثور على بيانات الطالبة', 404);
        }
        
        successResponse('تم جلب البيانات بنجاح', $student);
        
    } catch (PDOException $e) {
        error_log("Get Student Profile Error: " . $e->getMessage());
        errorResponse('حدث خطأ أثناء جلب البيانات', 500);
    }
}

/**
 * تحديث بيانات الطالبة
 */
function updateStudentProfile() {
    $user = requireUserType('student');
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
        
        // تحديث بيانات الطالبة
        $updates = [];
        $params = [];
        
        $fields = ['university', 'major', 'year', 'address', 'location_lat', 'location_lng', 
                   'location_link', 'house_image', 'pickup_time', 'emergency_contact', 'notes'];
        
        foreach ($fields as $field) {
            if (isset($data[$field])) {
                $updates[] = "$field = ?";
                $params[] = sanitizeInput($data[$field]);
            }
        }
        
        if (!empty($updates)) {
            $params[] = $user['id'];
            
            $sql = "UPDATE students SET " . implode(', ', $updates) . " WHERE user_id = ?";
            $stmt = $db->prepare($sql);
            $stmt->execute($params);
        }
        
        logActivity($user['id'], 'update_profile', 'تحديث الملف الشخصي');
        
        successResponse('تم تحديث البيانات بنجاح');
        
    } catch (PDOException $e) {
        error_log("Update Student Profile Error: " . $e->getMessage());
        errorResponse('حدث خطأ أثناء تحديث البيانات', 500);
    }
}

/**
 * الحصول على الجدول الدراسي
 */
function getSchedule() {
    $user = requireUserType('student');
    
    try {
        $db = Database::getInstance()->getConnection();
        
        $stmt = $db->prepare("
            SELECT s.id as student_id FROM students s WHERE s.user_id = ?
        ");
        $stmt->execute([$user['id']]);
        $student = $stmt->fetch();
        
        if (!$student) {
            errorResponse('لم يتم العثور على بيانات الطالبة', 404);
        }
        
        $stmt = $db->prepare("
            SELECT * FROM schedules 
            WHERE student_id = ? AND is_active = TRUE
            ORDER BY FIELD(day_of_week, 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday')
        ");
        $stmt->execute([$student['student_id']]);
        $schedule = $stmt->fetchAll();
        
        successResponse('تم جلب الجدول بنجاح', $schedule);
        
    } catch (PDOException $e) {
        error_log("Get Schedule Error: " . $e->getMessage());
        errorResponse('حدث خطأ أثناء جلب الجدول', 500);
    }
}

/**
 * تحديث الجدول الدراسي
 */
function updateSchedule() {
    $user = requireUserType('student');
    $data = getJsonInput();
    
    validateRequiredFields($data, ['schedules']);
    
    try {
        $db = Database::getInstance()->getConnection();
        
        $stmt = $db->prepare("SELECT id FROM students WHERE user_id = ?");
        $stmt->execute([$user['id']]);
        $student = $stmt->fetch();
        
        if (!$student) {
            errorResponse('لم يتم العثور على بيانات الطالبة', 404);
        }
        
        $studentId = $student['id'];
        
        // حذف الجدول القديم
        $stmt = $db->prepare("DELETE FROM schedules WHERE student_id = ?");
        $stmt->execute([$studentId]);
        
        // إضافة الجدول الجديد
        $stmt = $db->prepare("
            INSERT INTO schedules (student_id, day_of_week, start_time, end_time, subjects, is_active)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        
        foreach ($data['schedules'] as $schedule) {
            $isActive = isset($schedule['is_active']) ? (bool)$schedule['is_active'] : true;
            $stmt->execute([
                $studentId,
                $schedule['day'],
                $schedule['startTime'],
                $schedule['endTime'],
                $schedule['subjects'] ?? null,
                $isActive ? 1 : 0
            ]);
        }
        
        logActivity($user['id'], 'update_schedule', 'تحديث الجدول الدراسي');
        
        successResponse('تم تحديث الجدول بنجاح');
        
    } catch (PDOException $e) {
        error_log("Update Schedule Error: " . $e->getMessage());
        errorResponse('حدث خطأ أثناء تحديث الجدول', 500);
    }
}

/**
 * الحصول على رحلات الطالبة
 */
function getStudentTrips() {
    $user = requireUserType('student');
    
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
    $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
    
    try {
        $db = Database::getInstance()->getConnection();
        
        $stmt = $db->prepare("SELECT id FROM students WHERE user_id = ?");
        $stmt->execute([$user['id']]);
        $student = $stmt->fetch();
        
        if (!$student) {
            errorResponse('لم يتم العثور على بيانات الطالبة', 404);
        }
        
        $stmt = $db->prepare("
            SELECT t.*, 
                   u.name as driver_name, 
                   u.phone as driver_phone,
                   d.car_type, d.car_model, d.plate_number, d.rating as driver_rating
            FROM trips t
            JOIN drivers d ON t.driver_id = d.id
            JOIN users u ON d.user_id = u.id
            WHERE t.student_id = ?
            ORDER BY t.trip_date DESC, t.pickup_time DESC
            LIMIT ? OFFSET ?
        ");
        $stmt->execute([$student['id'], $limit, $offset]);
        $trips = $stmt->fetchAll();
        
        successResponse('تم جلب الرحلات بنجاح', $trips);
        
    } catch (PDOException $e) {
        error_log("Get Student Trips Error: " . $e->getMessage());
        errorResponse('حدث خطأ أثناء جلب الرحلات', 500);
    }
}

/**
 * الحصول على الرحلة الحالية
 */
function getCurrentTrip() {
    $user = requireUserType('student');
    
    try {
        $db = Database::getInstance()->getConnection();
        
        $stmt = $db->prepare("SELECT id FROM students WHERE user_id = ?");
        $stmt->execute([$user['id']]);
        $student = $stmt->fetch();
        
        if (!$student) {
            errorResponse('لم يتم العثور على بيانات الطالبة', 404);
        }
        
        $stmt = $db->prepare("
            SELECT t.*, 
                   u.name as driver_name, 
                   u.phone as driver_phone,
                   d.car_type, d.car_model, d.plate_number, d.rating as driver_rating
            FROM trips t
            JOIN drivers d ON t.driver_id = d.id
            JOIN users u ON d.user_id = u.id
            WHERE t.student_id = ? 
            AND t.trip_date = CURDATE()
            AND t.trip_status IN ('scheduled', 'waiting', 'arriving', 'in_progress')
            ORDER BY t.pickup_time ASC
            LIMIT 1
        ");
        $stmt->execute([$student['id']]);
        $trip = $stmt->fetch();
        
        if (!$trip) {
            successResponse('لا توجد رحلة حالية', null);
            return;
        }
        
        // الحصول على آخر موقع للسائق
        $stmt = $db->prepare("
            SELECT * FROM live_locations 
            WHERE trip_id = ? 
            ORDER BY timestamp DESC 
            LIMIT 1
        ");
        $stmt->execute([$trip['id']]);
        $location = $stmt->fetch();
        
        $trip['driver_location'] = $location;
        
        successResponse('تم جلب الرحلة الحالية بنجاح', $trip);
        
    } catch (PDOException $e) {
        error_log("Get Current Trip Error: " . $e->getMessage());
        errorResponse('حدث خطأ أثناء جلب الرحلة', 500);
    }
}

/**
 * الحصول على الإشعارات
 */
function getNotifications() {
    $user = requireAuth();
    
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
    $unreadOnly = isset($_GET['unread']) && $_GET['unread'] === 'true';
    
    try {
        $db = Database::getInstance()->getConnection();
        
        $sql = "
            SELECT * FROM notifications 
            WHERE user_id = ?
        ";
        
        if ($unreadOnly) {
            $sql .= " AND is_read = FALSE";
        }
        
        $sql .= " ORDER BY created_at DESC LIMIT ?";
        
        $stmt = $db->prepare($sql);
        $stmt->execute([$user['id'], $limit]);
        $notifications = $stmt->fetchAll();
        
        // عدد الإشعارات غير المقروءة
        $stmt = $db->prepare("
            SELECT COUNT(*) as unread_count 
            FROM notifications 
            WHERE user_id = ? AND is_read = FALSE
        ");
        $stmt->execute([$user['id']]);
        $unreadCount = $stmt->fetch()['unread_count'];
        
        successResponse('تم جلب الإشعارات بنجاح', [
            'notifications' => $notifications,
            'unread_count' => $unreadCount
        ]);
        
    } catch (PDOException $e) {
        error_log("Get Notifications Error: " . $e->getMessage());
        errorResponse('حدث خطأ أثناء جلب الإشعارات', 500);
    }
}

/**
 * تحديد الإشعار كمقروء
 */
function markNotificationRead() {
    $user = requireAuth();
    $data = getJsonInput();
    
    try {
        $db = Database::getInstance()->getConnection();
        
        if (isset($data['notification_id'])) {
            $stmt = $db->prepare("
                UPDATE notifications 
                SET is_read = TRUE 
                WHERE id = ? AND user_id = ?
            ");
            $stmt->execute([$data['notification_id'], $user['id']]);
        } else {
            // تحديد جميع الإشعارات كمقروءة
            $stmt = $db->prepare("
                UPDATE notifications 
                SET is_read = TRUE 
                WHERE user_id = ?
            ");
            $stmt->execute([$user['id']]);
        }
        
        successResponse('تم تحديث الإشعارات بنجاح');
        
    } catch (PDOException $e) {
        error_log("Mark Notification Read Error: " . $e->getMessage());
        errorResponse('حدث خطأ أثناء تحديث الإشعارات', 500);
    }
}

/**
 * حجز رحلة جديدة
 */
function bookTrip() {
    $user = requireUserType('student');
    $data = getJsonInput();
    
    validateRequiredFields($data, ['trip_date', 'pickup_time', 'trip_type']);
    
    try {
        $db = Database::getInstance()->getConnection();
        
        // التحقق من وجود بيانات الطالبة
        $stmt = $db->prepare("SELECT id FROM students WHERE user_id = ?");
        $stmt->execute([$user['id']]);
        $student = $stmt->fetch();
        
        if (!$student) {
            errorResponse('لم يتم العثور على بيانات الطالبة', 404);
        }
        
        // التحقق من عدم وجود طلب سابق في نفس اليوم والوقت
        $stmt = $db->prepare("
            SELECT id FROM trip_requests 
            WHERE student_id = ? AND trip_date = ? AND pickup_time = ? 
            AND request_status IN ('pending', 'accepted')
        ");
        $stmt->execute([$student['id'], $data['trip_date'], $data['pickup_time']]);
        $existingRequest = $stmt->fetch();
        
        if ($existingRequest) {
            errorResponse('لديك طلب رحلة موجود بالفعل في هذا التاريخ والوقت');
        }
        
        // إنشاء طلب رحلة جديد
        $stmt = $db->prepare("
            INSERT INTO trip_requests (student_id, trip_date, pickup_time, trip_type, notes, request_status)
            VALUES (?, ?, ?, ?, ?, 'pending')
        ");
        $stmt->execute([
            $student['id'],
            $data['trip_date'],
            $data['pickup_time'],
            $data['trip_type'],
            $data['notes'] ?? null
        ]);
        
        $requestId = $db->lastInsertId();
        
        // إرسال إشعارات للسائقين المتاحين
        $stmt = $db->prepare("
            SELECT d.id, d.user_id, u.name, u.phone
            FROM drivers d
            JOIN users u ON d.user_id = u.id
            WHERE d.driver_status = 'available'
            AND (d.working_hours_start IS NULL OR TIME(?) >= d.working_hours_start)
            AND (d.working_hours_end IS NULL OR TIME(?) <= d.working_hours_end)
        ");
        $stmt->execute([$data['pickup_time'], $data['pickup_time']]);
        $availableDrivers = $stmt->fetchAll();
        
        // إرسال إشعارات للسائقين
        foreach ($availableDrivers as $driver) {
            $stmt = $db->prepare("
                INSERT INTO notifications (user_id, title, message, notification_type, related_trip_id)
                VALUES (?, ?, ?, 'trip', ?)
            ");
            $stmt->execute([
                $driver['user_id'],
                'طلب رحلة جديد',
                "طلب جديد من طالبة للحجز في تاريخ {$data['trip_date']} في الساعة {$data['pickup_time']}",
                $requestId
            ]);
        }
        
        logActivity($user['id'], 'book_trip', "حجز رحلة بتاريخ {$data['trip_date']}");
        
        successResponse('تم إرسال طلب الرحلة بنجاح. سيتم إشعار السائقين المتاحين.', [
            'request_id' => $requestId
        ]);
        
    } catch (PDOException $e) {
        error_log("Book Trip Error: " . $e->getMessage());
        errorResponse('حدث خطأ أثناء حجز الرحلة', 500);
    }
}
