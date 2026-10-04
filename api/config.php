<?php
/**
 * UniRide - Database Configuration
 * ملف إعدادات الاتصال بقاعدة البيانات
 */

// إيقاف عرض الأخطاء لإرجاع JSON فقط (لا HTML)
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// إعدادات قاعدة البيانات
define('DB_HOST', 'localhost');
define('DB_NAME', 'uniride');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

// إعدادات الجلسة
define('SESSION_LIFETIME', 86400); // 24 ساعة
define('SESSION_NAME', 'uniride_session');

// إعدادات الأمان
define('HASH_ALGO', PASSWORD_BCRYPT);
define('HASH_COST', 10);

// إعدادات التطبيق
define('TIMEZONE', 'Asia/Riyadh');
date_default_timezone_set(TIMEZONE);

// إعدادات CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// معالجة طلبات OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

/**
 * Database Connection Class
 * كلاس الاتصال بقاعدة البيانات
 */
class Database {
    private static $instance = null;
    private $connection;
    
    private function __construct() {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
            ];
            
            $this->connection = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            error_log("Database Connection Error: " . $e->getMessage());
            http_response_code(500);
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode([
                'success' => false,
                'message' => 'خطأ في الاتصال بقاعدة البيانات'
            ], JSON_UNESCAPED_UNICODE);
            exit();
        }
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function getConnection() {
        return $this->connection;
    }
    
    // منع الاستنساخ
    private function __clone() {}
    
    // منع إلغاء التسلسل
    public function __wakeup() {
        throw new Exception("Cannot unserialize singleton");
    }
}

/**
 * Helper Functions
 * دوال مساعدة
 */

// إرجاع استجابة JSON
function jsonResponse($data, $statusCode = 200) {
    // تنظيف أي output سابق
    if (ob_get_level() > 0) {
        ob_clean();
    }
    
    // التأكد من أن Content-Type هو JSON
    header('Content-Type: application/json; charset=utf-8');
    http_response_code($statusCode);
    
    // إرسال JSON
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit();
}

// إرجاع استجابة نجاح
function successResponse($message, $data = null) {
    $response = [
        'success' => true,
        'message' => $message
    ];
    
    if ($data !== null) {
        $response['data'] = $data;
    }
    
    jsonResponse($response);
}

// إرجاع استجابة خطأ
function errorResponse($message, $statusCode = 400) {
    jsonResponse([
        'success' => false,
        'message' => $message
    ], $statusCode);
}

// التحقق من صحة البريد الإلكتروني
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

// التحقق من صحة رقم الجوال السعودي
function validatePhone($phone) {
    return preg_match('/^05[0-9]{8}$/', $phone);
}

// تشفير كلمة المرور
function hashPassword($password) {
    return password_hash($password, HASH_ALGO, ['cost' => HASH_COST]);
}

// التحقق من كلمة المرور
function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

// توليد رمز جلسة عشوائي
function generateSessionToken() {
    return bin2hex(random_bytes(32));
}

// تنظيف المدخلات
function sanitizeInput($data) {
    if (is_array($data)) {
        return array_map('sanitizeInput', $data);
    }
    return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
}

// الحصول على بيانات POST كـ JSON
function getJsonInput() {
    $input = file_get_contents('php://input');
    return json_decode($input, true);
}

// التحقق من الحقول المطلوبة
function validateRequiredFields($data, $requiredFields) {
    $missingFields = [];
    
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            $missingFields[] = $field;
        }
    }
    
    if (!empty($missingFields)) {
        errorResponse('الحقول التالية مطلوبة: ' . implode(', ', $missingFields));
    }
    
    return true;
}

// الحصول على معلومات المستخدم من الجلسة
function getCurrentUser() {
    if (!isset($_SESSION['user_id'])) {
        return null;
    }
    
    try {
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("
            SELECT u.*, 
                   CASE 
                       WHEN u.user_type = 'student' THEN s.id
                       WHEN u.user_type = 'driver' THEN d.id
                       ELSE NULL
                   END as profile_id
            FROM users u
            LEFT JOIN students s ON u.id = s.user_id AND u.user_type = 'student'
            LEFT JOIN drivers d ON u.id = d.user_id AND u.user_type = 'driver'
            WHERE u.id = ?
        ");
        $stmt->execute([$_SESSION['user_id']]);
        return $stmt->fetch();
    } catch (PDOException $e) {
        error_log("Get Current User Error: " . $e->getMessage());
        return null;
    }
}

// التحقق من تسجيل الدخول
function requireAuth() {
    session_start();
    
    if (!isset($_SESSION['user_id'])) {
        errorResponse('يجب تسجيل الدخول أولاً', 401);
    }
    
    return getCurrentUser();
}

// التحقق من نوع المستخدم
function requireUserType($allowedTypes) {
    $user = requireAuth();
    
    if (!in_array($user['user_type'], (array)$allowedTypes)) {
        errorResponse('غير مصرح لك بالوصول لهذه الصفحة', 403);
    }
    
    return $user;
}

// تسجيل النشاط
function logActivity($userId, $activityType, $description = null) {
    try {
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("
            INSERT INTO activity_logs (user_id, activity_type, description, ip_address, user_agent)
            VALUES (?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $userId,
            $activityType,
            $description,
            $_SERVER['REMOTE_ADDR'] ?? null,
            $_SERVER['HTTP_USER_AGENT'] ?? null
        ]);
    } catch (PDOException $e) {
        error_log("Log Activity Error: " . $e->getMessage());
    }
}

// بدء الجلسة بشكل آمن
function startSecureSession() {
    if (session_status() === PHP_SESSION_NONE) {
        ini_set('session.cookie_httponly', 1);
        ini_set('session.use_only_cookies', 1);
        ini_set('session.cookie_secure', 0); // تغيير إلى 1 عند استخدام HTTPS
        session_name(SESSION_NAME);
        session_start();
    }
}

// تنظيف الجلسات المنتهية
function cleanExpiredSessions() {
    try {
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("DELETE FROM sessions WHERE expires_at < NOW()");
        $stmt->execute();
    } catch (PDOException $e) {
        error_log("Clean Expired Sessions Error: " . $e->getMessage());
    }
}
