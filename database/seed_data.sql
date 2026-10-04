-- UniRide Seed Data
-- بيانات افتراضية شاملة لجميع المستخدمين

USE uniride;

-- إضافة المستخدمين (كلمة المرور: 123456)
INSERT INTO users (name, email, phone, password, user_type, status) VALUES
('فاطمة أحمد محمد', 'fatima@uniride.com', '0501234567', '$2y$10$ND8e6puWDLw3KlfQnC0U6uo8a3fzjcixJI26tKFPeIVozVIJ.Nh42', 'student', 'active'),
('سارة عبدالله العتيبي', 'sara@uniride.com', '0502345678', '$2y$10$ND8e6puWDLw3KlfQnC0U6uo8a3fzjcixJI26tKFPeIVozVIJ.Nh42', 'student', 'active'),
('نورا محمد القحطاني', 'nora@uniride.com', '0503456789', '$2y$10$ND8e6puWDLw3KlfQnC0U6uo8a3fzjcixJI26tKFPeIVozVIJ.Nh42', 'student', 'active'),
('ريم عبدالرحمن الشمري', 'reem@uniride.com', '0504567890', '$2y$10$ND8e6puWDLw3KlfQnC0U6uo8a3fzjcixJI26tKFPeIVozVIJ.Nh42', 'student', 'active'),
('هند سعد المطيري', 'hind@uniride.com', '0505678901', '$2y$10$ND8e6puWDLw3KlfQnC0U6uo8a3fzjcixJI26tKFPeIVozVIJ.Nh42', 'student', 'active'),
('مريم خالد الغامدي', 'mariam@uniride.com', '0506789012', '$2y$10$ND8e6puWDLw3KlfQnC0U6uo8a3fzjcixJI26tKFPeIVozVIJ.Nh42', 'student', 'active'),
('أحمد محمد العتيبي', 'ahmed@uniride.com', '0509876543', '$2y$10$ND8e6puWDLw3KlfQnC0U6uo8a3fzjcixJI26tKFPeIVozVIJ.Nh42', 'driver', 'active'),
('خالد عبدالله القحطاني', 'khaled@uniride.com', '0508765432', '$2y$10$ND8e6puWDLw3KlfQnC0U6uo8a3fzjcixJI26tKFPeIVozVIJ.Nh42', 'driver', 'active'),
('مدير النظام', 'admin@uniride.com', '0500000000', '$2y$10$ND8e6puWDLw3KlfQnC0U6uo8a3fzjcixJI26tKFPeIVozVIJ.Nh42', 'admin', 'active');

-- إضافة بيانات الطالبات
INSERT INTO students (user_id, university, major, year, address, location_lat, location_lng, location_link, house_image, pickup_time, emergency_contact, notes) VALUES
(1, 'جامعة القصيم', 'هندسة الحاسوب', 'السنة الثالثة', 'القصيم، حي النهضة', 26.3260, 43.9750, 'https://maps.google.com/?q=26.3260,43.9750', 'assets/house-placeholder.svg', '07:30:00', '0509876543', 'تفضل الجلوس في المقعد الأمامي'),
(2, 'جامعة الأميرة نورة', 'الطب', 'السنة الرابعة', 'الرياض، حي العليا', 24.7243, 46.6814, 'https://maps.google.com/?q=24.7243,46.6814', 'assets/house-placeholder.svg', '08:00:00', '0508765432', 'تحتاج مساعدة في حمل الكتب'),
(3, 'جامعة الإمام', 'الشريعة', 'السنة الثانية', 'الرياض، حي الملز', 24.6877, 46.7219, 'https://maps.google.com/?q=24.6877,46.7219', 'assets/house-placeholder.svg', '07:45:00', '0507654321', 'تصل متأخرة أحياناً'),
(4, 'جامعة الملك عبدالعزيز', 'الأدب الإنجليزي', 'السنة الثالثة', 'الرياض، حي النخيل', 24.7456, 46.6532, 'https://maps.google.com/?q=24.7456,46.6532', 'assets/house-placeholder.svg', '08:15:00', '0506543210', 'تحب الاستماع للموسيقى'),
(5, 'جامعة القصيم', 'التمريض', 'السنة الرابعة', 'القصيم، حي النهضة', 26.3260, 43.9750, 'https://maps.google.com/?q=26.3260,43.9750', 'assets/house-placeholder.svg', '07:15:00', '0505432109', 'تدرس في المستشفى أحياناً'),
(6, 'جامعة الأميرة نورة', 'الصيدلة', 'السنة الثالثة', 'الرياض، حي الصحافة', 24.7321, 46.7123, 'https://maps.google.com/?q=24.7321,46.7123', 'assets/house-placeholder.svg', '08:30:00', '0504321098', 'تحتاج موقف قريب');

-- إضافة بيانات السائقين
INSERT INTO drivers (user_id, car_type, car_model, car_year, plate_number, license_number, experience_years, rating, total_trips, total_earnings, driver_status, working_hours_start, working_hours_end) VALUES
(7, 'تويوتا', 'كامري', 2022, 'أ ب ج 1234', '1234567890', 5, 4.85, 1250, 125000.00, 'available', '06:00:00', '18:00:00'),
(8, 'هيونداي', 'سوناتا', 2021, 'د هـ و 5678', '2345678901', 7, 4.72, 1580, 158000.00, 'available', '06:00:00', '18:00:00');

-- إضافة الجداول الدراسية
INSERT INTO schedules (student_id, day_of_week, start_time, end_time, subjects, is_active) VALUES
(1, 'sunday', '08:00:00', '15:00:00', 'هندسة البرمجيات، قواعد البيانات', TRUE),
(1, 'monday', '08:00:00', '14:00:00', 'تحليل الخوارزميات', TRUE),
(2, 'sunday', '08:30:00', '16:00:00', 'علم التشريح، الكيمياء', TRUE);

-- إضافة رحلات
INSERT INTO trips (student_id, driver_id, trip_date, pickup_time, trip_type, trip_status, distance, fare, payment_status) VALUES
(1, 1, CURDATE(), '07:30:00', 'morning', 'completed', 12.5, 50.00, 'paid'),
(2, 2, CURDATE(), '08:00:00', 'morning', 'in_progress', 15.3, 60.00, 'pending');

-- إضافة إشعارات
INSERT INTO notifications (user_id, title, message, notification_type, is_read) VALUES
(1, 'تم تأكيد رحلتك', 'رحلتك غداً الساعة 7:30 صباحاً', 'trip', FALSE),
(7, 'رحلة جديدة', 'تم تعيين رحلة جديدة', 'trip', FALSE);
