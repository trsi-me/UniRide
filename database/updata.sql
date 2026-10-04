-- تحديث جميع إشارات جامعة الملك سعود إلى جامعة القصيم
-- تحديث جميع المواقع من الرياض إلى القصيم

USE uniride;

-- تحديث جدول الطالبات
UPDATE students 
SET university = 'جامعة القصيم' 
WHERE university = 'جامعة الملك سعود';

-- تحديث العناوين من الرياض إلى القصيم
UPDATE students 
SET address = REPLACE(address, 'الرياض', 'القصيم')
WHERE address LIKE '%الرياض%';

-- تحديث العناوين من حي النرجس إلى حي النهضة
UPDATE students 
SET address = REPLACE(address, 'حي النرجس', 'حي النهضة')
WHERE address LIKE '%حي النرجس%';

-- تحديث الإحداثيات الجغرافية للقصيم
UPDATE students 
SET location_lat = 26.3260, 
    location_lng = 43.9750,
    location_link = 'https://maps.google.com/?q=26.3260,43.9750'
WHERE university = 'جامعة القصيم' 
AND (location_lat != 26.3260 OR location_lng != 43.9750);

-- التحقق من التحديثات
SELECT id, university, address, location_lat, location_lng 
FROM students 
WHERE university = 'جامعة القصيم';