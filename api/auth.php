<?php
/**
 * UniRide - Authentication API
 * واجهة برمجة التطبيقات للمصادقة
 */

// إيقاف عرض الأخطاء لإرجاع JSON فقط
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// بدء output buffering لالتقاط أي output غير مرغوب فيه
ob_start();

try {
    require_once 'config.php';
} catch (Exception $e) {
    ob_clean();
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => false,
        'message' => 'خطأ في تحميل إعدادات النظام'
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

// معالجة الأخطاء العامة
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    error_log("PHP Error [$errno]: $errstr in $errfile on line $errline");
    ob_clean();
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => false,
        'message' => 'حدث خطأ في الخادم'
    ], JSON_UNESCAPED_UNICODE);
    exit();
});

set_exception_handler(function($exception) {
    error_log("Uncaught Exception: " . $exception->getMessage());
    ob_clean();
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => false,
        'message' => 'حدث خطأ غير متوقع في الخادم'
    ], JSON_UNESCAPED_UNICODE);
    exit();
});

startSecureSession();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'login':
        if ($method === 'POST') {
            handleLogin();
        }
        break;
        
    case 'register':
        if ($method === 'POST') {
            handleRegister();
        }
        break;
        
    case 'logout':
        if ($method === 'POST') {
            handleLogout();
        }
        break;
        
    case 'check':
        if ($method === 'GET') {
            checkAuth();
        }
        break;
        
    case 'profile':
        if ($method === 'GET') {
            getProfile();
        }
        break;
        
    default:
        errorResponse('إجراء غير صالح', 404);
}

/**
 * تسجيل الدخول
 */
function handleLogin() {
    $data = getJsonInput();
    
    validateRequiredFields($data, ['emailPhone', 'password']);
    
    $emailPhone = sanitizeInput($data['emailPhone']);
    $password = $data['password'];
    
    try {
        $db = Database::getInstance()->getConnection();
        
        // البحث عن المستخدم بالبريد الإلكتروني أو رقم الجوال
        $stmt = $db->prepare("
            SELECT * FROM users 
            WHERE (email = ? OR phone = ?) AND status = 'active'
        ");
        $stmt->execute([$emailPhone, $emailPhone]);
        $user = $stmt->fetch();
        
        if (!$user) {
            errorResponse('البريد الإلكتروني أو رقم الجوال غير صحيح', 401);
        }
        
        if (!verifyPassword($password, $user['password'])) {
            errorResponse('كلمة المرور غير صحيحة', 401);
        }
        
        // إنشاء جلسة جديدة
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_type'] = $user['user_type'];
        $_SESSION['user_name'] = $user['name'];
        
        // حفظ الجلسة في قاعدة البيانات
        $sessionToken = generateSessionToken();
        $expiresAt = date('Y-m-d H:i:s', time() + SESSION_LIFETIME);
        
        $stmt = $db->prepare("
            INSERT INTO sessions (user_id, session_token, ip_address, user_agent, expires_at)
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $user['id'],
            $sessionToken,
            $_SERVER['REMOTE_ADDR'] ?? null,
            $_SERVER['HTTP_USER_AGENT'] ?? null,
            $expiresAt
        ]);
        
        // تسجيل النشاط
        logActivity($user['id'], 'login', 'تسجيل دخول ناجح');
        
        // الحصول على بيانات الملف الشخصي
        $profileData = null;
        if ($user['user_type'] === 'student') {
            $stmt = $db->prepare("SELECT * FROM students WHERE user_id = ?");
            $stmt->execute([$user['id']]);
            $profileData = $stmt->fetch();
        } elseif ($user['user_type'] === 'driver') {
            $stmt = $db->prepare("SELECT * FROM drivers WHERE user_id = ?");
            $stmt->execute([$user['id']]);
            $profileData = $stmt->fetch();
        }
        
        successResponse('تم تسجيل الدخول بنجاح', [
            'user' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'phone' => $user['phone'],
                'user_type' => $user['user_type']
            ],
            'profile' => $profileData,
            'session_token' => $sessionToken
        ]);
        
    } catch (PDOException $e) {
        error_log("Login Error: " . $e->getMessage());
        errorResponse('حدث خطأ أثناء تسجيل الدخول', 500);
    }
}

/**
 * إنشاء حساب جديد
 */
function handleRegister() {
    $data = getJsonInput();
    
    $requiredFields = ['name', 'email', 'phone', 'password', 'userType'];
    validateRequiredFields($data, $requiredFields);
    
    $name = sanitizeInput($data['name']);
    $email = sanitizeInput($data['email']);
    $phone = sanitizeInput($data['phone']);
    $password = $data['password'];
    $userType = sanitizeInput($data['userType']);
    
    // التحقق من صحة البيانات
    if (!validateEmail($email)) {
        errorResponse('البريد الإلكتروني غير صالح');
    }
    
    if (!validatePhone($phone)) {
        errorResponse('رقم الجوال غير صالح (يجب أن يبدأ بـ 05 ويتكون من 10 أرقام)');
    }
    
    if (strlen($password) < 6) {
        errorResponse('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
    }
    
    if (!in_array($userType, ['student', 'driver'])) {
        errorResponse('نوع المستخدم غير صالح');
    }
    
    try {
        $db = Database::getInstance()->getConnection();
        
        // التحقق من عدم وجود المستخدم مسبقاً
        $stmt = $db->prepare("SELECT id FROM users WHERE email = ? OR phone = ?");
        $stmt->execute([$email, $phone]);
        
        if ($stmt->fetch()) {
            errorResponse('البريد الإلكتروني أو رقم الجوال مستخدم مسبقاً');
        }
        
        // إنشاء المستخدم
        $hashedPassword = hashPassword($password);
        
        $stmt = $db->prepare("
            INSERT INTO users (name, email, phone, password, user_type)
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([$name, $email, $phone, $hashedPassword, $userType]);
        
        $userId = $db->lastInsertId();
        
        // إنشاء ملف شخصي حسب نوع المستخدم
        if ($userType === 'student') {
            $stmt = $db->prepare("
                INSERT INTO students (user_id, university, major, year, address, pickup_time, emergency_contact)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $userId,
                $data['university'] ?? 'غير محدد',
                $data['major'] ?? 'غير محدد',
                $data['year'] ?? 'غير محدد',
                $data['address'] ?? 'غير محدد',
                $data['pickupTime'] ?? '08:00:00',
                $data['emergencyContact'] ?? $phone
            ]);
        } elseif ($userType === 'driver') {
            $stmt = $db->prepare("
                INSERT INTO drivers (user_id, car_type, car_model, car_year, plate_number, license_number, experience_years)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $userId,
                $data['carType'] ?? 'غير محدد',
                $data['carModel'] ?? 'غير محدد',
                $data['carYear'] ?? date('Y'),
                $data['plateNumber'] ?? 'غير محدد',
                $data['licenseNumber'] ?? 'غير محدد',
                $data['experienceYears'] ?? 0
            ]);
        }
        
        // تسجيل النشاط
        logActivity($userId, 'register', 'إنشاء حساب جديد');
        
        successResponse('تم إنشاء الحساب بنجاح', [
            'user_id' => $userId,
            'user_type' => $userType
        ]);
        
    } catch (PDOException $e) {
        error_log("Register Error: " . $e->getMessage());
        errorResponse('حدث خطأ أثناء إنشاء الحساب', 500);
    }
}

/**
 * تسجيل الخروج
 */
function handleLogout() {
    $user = requireAuth();
    
    try {
        $db = Database::getInstance()->getConnection();
        
        // حذف الجلسة من قاعدة البيانات
        $stmt = $db->prepare("DELETE FROM sessions WHERE user_id = ?");
        $stmt->execute([$user['id']]);
        
        // تسجيل النشاط
        logActivity($user['id'], 'logout', 'تسجيل خروج');
        
        // إنهاء الجلسة
        session_destroy();
        
        successResponse('تم تسجيل الخروج بنجاح');
        
    } catch (PDOException $e) {
        error_log("Logout Error: " . $e->getMessage());
        errorResponse('حدث خطأ أثناء تسجيل الخروج', 500);
    }
}

/**
 * التحقق من حالة تسجيل الدخول
 */
function checkAuth() {
    if (!isset($_SESSION['user_id'])) {
        jsonResponse([
            'success' => true,
            'authenticated' => false
        ]);
    }
    
    $user = getCurrentUser();
    
    if (!$user) {
        session_destroy();
        jsonResponse([
            'success' => true,
            'authenticated' => false
        ]);
    }
    
    jsonResponse([
        'success' => true,
        'authenticated' => true,
        'user' => [
            'id' => $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'phone' => $user['phone'],
            'user_type' => $user['user_type']
        ]
    ]);
}

/**
 * الحصول على بيانات الملف الشخصي
 */
function getProfile() {
    $user = requireAuth();
    
    try {
        $db = Database::getInstance()->getConnection();
        
        $profileData = null;
        
        if ($user['user_type'] === 'student') {
            $stmt = $db->prepare("
                SELECT s.*, u.name, u.email, u.phone
                FROM students s
                JOIN users u ON s.user_id = u.id
                WHERE s.user_id = ?
            ");
            $stmt->execute([$user['id']]);
            $profileData = $stmt->fetch();
        } elseif ($user['user_type'] === 'driver') {
            $stmt = $db->prepare("
                SELECT d.*, u.name, u.email, u.phone
                FROM drivers d
                JOIN users u ON d.user_id = u.id
                WHERE d.user_id = ?
            ");
            $stmt->execute([$user['id']]);
            $profileData = $stmt->fetch();
        }
        
        successResponse('تم جلب البيانات بنجاح', [
            'user' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'phone' => $user['phone'],
                'user_type' => $user['user_type']
            ],
            'profile' => $profileData
        ]);
        
    } catch (PDOException $e) {
        error_log("Get Profile Error: " . $e->getMessage());
        errorResponse('حدث خطأ أثناء جلب البيانات', 500);
    }
}
