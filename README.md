# UniRide

## 1. ما هو المشروع؟

نظام ويب عربي لإدارة نقل جامعي بين طالبات وسائقين. README السابق يسميه «نظام النقل الجامعي الذكي». الصفحات HTML، والمنطق في PHP تحت `api/`، والبيانات في MySQL باسم `uniride` حسب `api/config.php`.

## 2. لماذا يوجد هذا المشروع؟

README السابق يصف تنظيم رحلات من الجامعة وإليها مع جداول ومدفوعات وتتبع. الكود الحالي يحتوي جداول وجداول واجهة لهذه الوظائف: رحلات، طلبات، مواقع، طوارئ، وقود، صيانة، مدفوعات، تقييمات، إشعارات.

## 3. من يستخدمه؟

`users.user_type` يأخذ: `student` و `driver` و `admin`.

| النوع | الواجهة الموجودة |
| --- | --- |
| طالبة | `student-dashboard.html` و `student-profile.html` و `student-settings.html` |
| سائق | `driver-dashboard.html` و `driver-profile.html` و `driver-settings.html` |
| مدير | قيمة في الجدول. README السابق يذكر حساب `admin@uniride.com`. لا صفحة HTML باسم admin في المجلد |
| زائر | `index.html` للدخول و `signup.html` للتسجيل |

## 4. ماذا يستطيع النظام أن يفعل؟

من `api/auth.php`: `login` و `register` و `logout` و `check` و `profile`.

من `api/students.php`: `profile` و `schedule` و `trips` و `current-trip` و `notifications` و `book-trip`. الدوال تشمل تحديث الملف والجدول، و`markNotificationRead`.

من `api/drivers.php`: `profile` و `status` و `trips` و `today-trips` و `students` و `stats` و `update-location` و `trip-requests` و `accept-trip` و `reject-trip` و `add-trip` و `emergency` و `fuel` و `maintenance`.

حالات الرحلة في `trips`: `scheduled` و `waiting` و `arriving` و `in_progress` و `completed` و `cancelled`. نوع الرحلة `morning` أو `evening`. حالة طلب الرحلة: `pending` و `accepted` و `rejected` و `expired`.

## 5. كيف يعمل النظام؟

```
صفحة HTML
  -> js/api.js  (API_BASE_URL = 'api/')
  -> api/auth.php أو students.php أو drivers.php?action=...
  -> api/config.php
  -> MySQL uniride
  -> JSON
```

الجلسة في PHP. مدة الجلسة في الإعداد `SESSION_LIFETIME` تساوي 86400 ثانية، واسمها `uniride_session`. جدول `sessions` موجود أيضًا.

## 6. أمثلة واقعية

### دخول

1. `index.html` يرسل عبر `js` إلى `api/auth.php?action=login`.
2. `handleLogin` يبحث بالبريد أو الجوال باستعلام محضّر.
3. `verifyPassword` يطابق كلمة المرور مع التجزئة.
4. تُفتح الجلسة. `logActivity` يكتب في `activity_logs` عند استخدام الدالة.

### حجز رحلة طالبة

1. من لوحة الطالبة إجراء `book-trip`.
2. `bookTrip` في `students.php` ينشئ الطلب المرتبط.
3. السائق يرى `trip-requests` ثم `accept-trip` أو `reject-trip`.

### طوارئ أو وقود أو صيانة

1. السائق يستدعي `emergency` أو `fuel` أو `maintenance`.
2. الصف يذهب إلى `emergencies` أو `fuel_records` أو `vehicle_maintenance`.

README السابق يذكر حسابات بريد تجريبية في `seed_data.sql` (`fatima@uniride.com` و `sara@uniride.com` و `nora@uniride.com` و `ahmed@uniride.com` و `khaled@uniride.com` و `admin@uniride.com`) وكلمة مرور مشتركة مذكورة هناك. لا تُعاد كلمة المرور في هذا الملخص؛ راجع `seed_data.sql` و `INSTALLATION.md` على الجهاز.

## 7. رحلة المستخدم

1. فتح `index.html` وتسجيل الدخول، أو `signup.html` ثم `register`.
2. التوجيه حسب النوع إلى لوحة الطالبة أو السائق (منطق الواجهة في `js/login.js` وملفات اللوحات).
3. اختيار قسم داخل اللوحة: رحلات، جدول، إشعارات، أو ملف.
4. الطلب يذهب إلى `action` المقابل.
5. JSON يعود وتحدّث الصفحة.
6. الخروج عبر `action=logout`.

## 8. الوحدات والأقسام

| الوحدة | الملفات | الوظيفة |
| --- | --- | --- |
| الدخول والتسجيل | `index.html` `signup.html` `js/login.js` `js/signup.js` `api/auth.php` | الحساب والجلسة |
| لوحة الطالبة | `student-dashboard.html` `js/dashboard.js` `api/students.php` | جدول ورحلات وإشعارات وحجز |
| ملف الطالبة | `student-profile.html` `student-settings.html` `js/student-profile.js` `js/profile.js` | بيانات إضافية |
| لوحة السائق | `driver-dashboard.html` `js/driver-dashboard.js` `api/drivers.php` | طلبات ورحلات وموقع وطوارئ |
| ملف السائق | `driver-profile.html` `driver-settings.html` `js/driver-profile.js` | المركبة والحالة |
| عميل API | `js/api.js` | عنوان `api/` |
| القاعدة | `database/schema.sql` `seed_data.sql` `updata.sql` | الجداول والبيانات |

## 9. الشركات والكيانات

غير موجود في الملفات الحالية كمجموعة شركات. كيان واحد: نظام النقل `uniride`.

## 10. الصلاحيات

`requireAuth` و `requireUserType` في `config.php` يحددان من يستدعي العمليات التي تستخدمهما. الأنواع الثلاثة في الجدول: طالبة وسائق ومدير. حالة المستخدم: `active` أو `inactive` أو `suspended`. لا مصفوفة صلاحيات أدق من نوع المستخدم في الملفات المقروءة.

## 11. الأتمتة وWorkflows

لا Cron. سير الطلب داخل الطلبات العادية:

```
book-trip -> trip_requests (pending)
  -> accept-trip أو reject-trip
  -> رحلة في trips بحالات حتى completed أو cancelled
```

إشعار يُخزَّن في `notifications` ويُعلَّم مقروءًا بـ `markNotificationRead`. لا عامل خلفي يرسل الإشعار خارج القاعدة.

## 12. التكامل بين الوحدات

طلب الطالبة يظهر للسائق في `trip-requests`. قبول الطلب يغيّر حالة الطلب ويمكن أن ينشئ رحلة عبر `acceptTripRequest`. موقع السائق يُحدَّث في `updateLocation` نحو `live_locations`. التقييمات في جدول `ratings`. المدفوعات في `payments` بحالات `pending` و `completed` و `failed` و `refunded` وطرق `cash` و `card` و `wallet` و `bank_transfer`. النشاط في `activity_logs`.

## 13. المصطلحات

| المصطلح | المعنى في المشروع |
| --- | --- |
| `action` | اسم العملية في سلسلة الاستعلام مثل `?action=login` |
| `trip_type` | `morning` أو `evening` |
| `driver_status` | `available` أو `busy` أو `offline` |
| bcrypt | `PASSWORD_BCRYPT` بتكلفة 10 في `hashPassword` |
| جلسة | `uniride_session` لمدة 86400 ثانية |

## 14. الأسئلة الشائعة

**كم جدولًا؟**  
`schema.sql` ينشئ 15 جدولًا. README السابق يقول 14 ويذكر أسماء غير موجودة في المخطط الحالي (`messages` و `emergency_contacts` و `trip_routes` و `driver_documents` و `system_settings`). الأسماء الفعلية في القسم 21.

**ما ملف تحديث كلمات المرور؟**  
README السابق يذكر `update_passwords.sql`. الملف الموجود `database/updata.sql`.

**هل لوحة المدير صفحة مستقلة؟**  
غير موجود في الملفات الحالية كملف HTML للمدير. النوع `admin` موجود في الجدول.

## 15. المعمارية

```
HTML + styles + js
        |
        v
api/auth.php | students.php | drivers.php
        |
        v
config.php (PDO/mysqli حسب الصنف Database)
        |
        v
MySQL uniride
```

`config.php` يعرّف الصنف `Database` بنمط نسخة واحدة و`getConnection`.

## 16. التقنيات

HTML و CSS و JavaScript و PHP و MySQL. خط IBM Plex Sans Arabic محلي في `assets/fonts`. README السابق يذكر Font Awesome في الواجهة. المنطقة الزمنية `Asia/Riyadh`.

## 17. هيكل المشروع

```
UniRide/
  index.html  signup.html
  student-dashboard.html  student-profile.html  student-settings.html
  driver-dashboard.html  driver-profile.html  driver-settings.html
  api/config.php  auth.php  students.php  drivers.php
  database/schema.sql  seed_data.sql  updata.sql
  js/  styles/  assets/fonts/
  README.md  INSTALLATION.md
```

README السابق لم يذكر `student-profile.html` و `driver-profile.html` وهما موجودان.

## 18. الواجهة

صفحات متعددة لا تطبيق صفحة واحدة. `js/api.js` يثبت `API_BASE_URL` على `api/`. ملفات JS أخرى: `dashboard.js` و `driver-dashboard.js` و `driver-profile.js` و `login.js` و `main.js` و `profile.js` و `signup.js` و `student-profile.js`. التنسيق في `styles/` (`main.css` و `dashboard.css` و `driver-dashboard.css` و `login.css` و `profile.css` و `signup.css` و `typography.css`). الاتجاه عربي في صفحات المشروع حسب README والملفات. أيقونة تبويب غير ظاهرة في قائمة الملفات.

## 19. الخادم

PHP. الدوال المشتركة في `config.php`: `jsonResponse` و `successResponse` و `errorResponse` و `validateEmail` و `validatePhone` (نمط `05` ثم 8 أرقام) و `hashPassword` و `verifyPassword` و `generateSessionToken` و `sanitizeInput` و `getJsonInput` و `validateRequiredFields` و `getCurrentUser` و `requireAuth` و `requireUserType` و `logActivity` و `startSecureSession` و `cleanExpiredSessions`.

`display_errors` مضبوط على 0 و `log_errors` على 1.

## 20. مسار الطلب

```
المتصفح
  -> js يستدعي api/students.php?action=book-trip
  -> students.php يقرأ action
  -> requireAuth / نوع المستخدم حيث تُستدعى
  -> استعلام محضّر
  -> JSON successResponse أو errorResponse
  -> الواجهة تحدّث اللوحة
```

## 21. قاعدة البيانات

الاسم في الإعداد: `uniride`. الاتصال من `api/config.php` بمضيف `localhost` ومستخدم `root` وكلمة مرور فارغة في الملف. الترميز `utf8mb4`.

| الجدول | دور مختصر من الأعمدة الظاهرة |
| --- | --- |
| `users` | الاسم والبريد والجوال وكلمة المرور ونوع المستخدم والحالة |
| `students` | جامعة وتخصص وسنة وعنوان وموقع ووقت التقاط |
| `drivers` | مركبة ولوحة وتقييم ورحلات وحالة السائق |
| `trips` | طالبة وسائق وتاريخ ونوع وحالة وأجرة ودفع |
| `schedules` | يوم ووقت ومواد |
| `notifications` | عنوان ونص ونوع `trip/payment/system/emergency/rating` ومقروء |
| `live_locations` | موقع مباشر |
| `emergencies` | نوع `accident/breakdown/medical/security/other` وحالة |
| `vehicle_maintenance` | نوع صيانة |
| `fuel_records` | وقود |
| `payments` | طريقة وحالة مبلغ |
| `ratings` | تقييم |
| `sessions` | جلسات |
| `activity_logs` | نشاط |
| `trip_requests` | طلب صباح أو مساء وحالة القبول |

ملفات: `schema.sql` و `seed_data.sql` و `updata.sql`. README السابق وصف جداول `messages` وغيرها؛ تلك الأسماء ليست في `schema.sql` الحالي.

## 22. واجهة البرمجة

الأساس: `api/<ملف>.php?action=<الاسم>`. الجسم JSON في عمليات الكتابة. الترويسة في `config.php` تضع `Content-Type: application/json` و `Access-Control-Allow-Origin: *`.

| الملف | قيم `action` |
| --- | --- |
| `auth.php` | `login` `register` `logout` `check` `profile` |
| `students.php` | `profile` `schedule` `trips` `current-trip` `notifications` `book-trip` |
| `drivers.php` | `profile` `status` `trips` `today-trips` `students` `stats` `update-location` `trip-requests` `accept-trip` `reject-trip` `add-trip` `emergency` `fuel` `maintenance` |

المصادقة: جلسة PHP بعد `login`، و`requireAuth` حيث تُستدعى داخل الدوال.

## 23. المصادقة والصلاحيات

التسجيل `handleRegister` يخزّن كلمة المرور عبر `password_hash` بخوارزمية bcrypt وتكلفة 10. الدخول `password_verify`. الجلسة `startSecureSession`. رمز الجلسة `bin2hex(random_bytes(32))` في `generateSessionToken`. نوع المستخدم يُفحص بـ `requireUserType`. تنظيف النص بـ `htmlspecialchars` و `strip_tags`.

## 24. الأمان

الموجود: تجزئة كلمات المرور، استعلامات محضّرة في مسار الدخول الموثق في README السابق (`bind_param`)، إخفاء أخطاء PHP عن المتصفح، تحقق بريد وجوال، سجل نشاط، تنظيف جلسات منتهية بالدالة `cleanExpiredSessions`.

الموجود أيضًا بشكل واسع: `Access-Control-Allow-Origin: *` على واجهة `config.php`، وكلمة مرور القاعدة فارغة للمستخدم `root` داخل الملف. لا CSRF ظاهر لنماذج المتصفح التي تعتمد الجلسة مع هذا الرأس المفتوح. أيقونة تبويب غير موجودة في شجرة الملفات.

## 25. الإعدادات

ثوابت في `api/config.php`: `DB_HOST` و `DB_NAME` و `DB_USER` و `DB_PASS` و `DB_CHARSET` و `SESSION_LIFETIME` و `SESSION_NAME` و `HASH_ALGO` و `HASH_COST` و `TIMEZONE`. لا `.env`.

## 26. التكاملات

غير موجود في الملفات الحالية كبريد أو خرائط مدفوعة أو بوابة دفع خارجية. طرق الدفع أسماء في الجدول فقط. الموقع يُخزَّن كإحداثيات وحقول موقع.

## 27. المهام المجدولة

غير موجود في الملفات الحالية. `cleanExpiredSessions` دالة تُستدعى من الكود لا من Cron موثق.

## 28. تخزين الملفات

خطوط في `assets/fonts`. جدول مستندات السائق المذكور في README السابق غير موجود في `schema.sql`. لا مجلد `uploads`.

## 29. السجلات والمراقبة

`activity_logs` عبر `logActivity`. `log_errors` مفعّل في PHP و `display_errors` مغلق. لا لوحة مراقبة خارجية.

## 30. التثبيت

1. Apache أو ما يعادله مع PHP و MySQL. README السابق و `INSTALLATION.md` يذكران XAMPP.
2. انسخ المجلد إلى جذر الويب، مثل `htdocs/UniRide`.
3. أنشئ القاعدة `uniride` بترميز `utf8mb4_unicode_ci` أو اترك الاستيراد ينشئ الجداول بعد اختيار القاعدة.
4. استورد `database/schema.sql` ثم `database/seed_data.sql`.
5. طابق `api/config.php` مع مستخدم MySQL.
6. افتح `http://localhost/UniRide/`.
7. حسابات التجربة موثقة في `seed_data.sql` و README السابق، لا في هذا القسم كنص كلمة مرور.

## 31. دليل التطوير

- صفحة: HTML جديد في الجذر مع CSS من `styles/` ونداء من `js/api.js`.
- عملية API: أضف `case` في `switch ($action)` ودالة في `students.php` أو `drivers.php` أو `auth.php`.
- جدول: عدّل `schema.sql`. لا مجلد migrations.
- صلاحية: مرّر النوع إلى `requireUserType`.
- الإعدادات العامة ليست جدول `system_settings`؛ ذلك الاسم من README السابق وغير موجود في المخطط.

## 32. النشر

غير موثق كإنتاج. الإعداد الحالي `root` بلا كلمة مرور و CORS للجميع مناسب للتطوير المحلي المذكور في README السابق. لا ملف منصة نشر.

## 33. النسخ الاحتياطي

غير موجود كسكربت. التصدير من MySQL لقاعدة `uniride`.

## 34. استكشاف الأخطاء

| العرض | المطابق |
| --- | --- |
| JSON لا يعود وتظهر صفحة HTML | PHP غير ممرَّر عبر Apache أو المسار ليس `api/` |
| دخول يفشل | البذرة غير مستوردة أو تجزئة كلمة المرور لا تطابق `password_verify` |
| جوال مرفوض | النمط `05` ثم 8 أرقام |
| جدول مفقود ذكره README القديم | استخدم أسماء `schema.sql` الخمسة عشر |
| ملف `update_passwords.sql` غير موجود | الاسم الحالي `updata.sql` |

## 35. الاعتماديات

لا `composer.json` ولا `package.json`. PHP مع إضافة MySQL، و `password_hash`. الخط المحلي IBM Plex Sans Arabic. إصدار PHP غير مثبت في ملف.

## 36. القيود المعروفة

- README السابق يختلف عن المخطط في عدد الجداول وأسمائها وفي اسم ملف كلمات المرور وفي نقص صفحات الملف الشخصي.
- لا واجهة مدير مستقلة رغم نوع `admin`.
- CORS مفتوح.
- أسرار القاعدة داخل `config.php`.
- لا أيقونة تبويب في الشجرة.

## 37. حالة النظام الحالية

| الحالة | التفاصيل |
| --- | --- |
| موجود | لوحات طالبة وسائق، ثلاث واجهات PHP، 15 جدولًا، بذرة، دليل تثبيت |
| يحتاج بيئة PHP/MySQL | التشغيل |
| غير مكتمل توثيقًا | لوحة المدير، بعض الجداول التي وصفها README السابق |
| مرجع إضافي | `INSTALLATION.md` و README السابق |

## 38. القرارات المعمارية

استنتاج من الكود: الواجهة ثابتة والعمليات عبر `action` في ثلاثة ملفات PHP لا عبر إطار عمل. نوع المستخدم عمود في `users` لا جدول أدوار منفصل. كلمات المرور bcrypt لا نصًا واضحًا.

## 39. سجل التغييرات

غير موجود كسجل إصدارات. `updata.sql` ملف تغيير بيانات أو كلمات مرور حسب اسمه القريب من update، ومحتواه هو المرجع عند الحاجة لا هذا الملخص. README السابق يبقى مصدر الحسابات التجريبية إلى أن يُحدَّث يدويًا.

## System Overview

```
طالبة أو سائق
    -> HTML
    -> js/api.js
    -> auth | students | drivers
    -> MySQL uniride
         users students drivers
         trips trip_requests schedules
         notifications live_locations
         emergencies fuel_records vehicle_maintenance
         payments ratings sessions activity_logs
```

## Quick Reference

| الجزء | التقنية | الموقع | الوظيفة |
| --- | --- | --- | --- |
| الدخول | HTML/JS | `index.html` `js/login.js` | فتح الجلسة |
| التسجيل | HTML/JS | `signup.html` | حساب جديد |
| الطالبة | HTML/JS/PHP | `student-*.html` `api/students.php` | رحلات وجدول |
| السائق | HTML/JS/PHP | `driver-*.html` `api/drivers.php` | طلبات وتشغيل |
| الإعداد | PHP | `api/config.php` | اتصال وأمان جلسة |
| المخطط | SQL | `database/schema.sql` | 15 جدولًا |
| البذرة | SQL | `database/seed_data.sql` | حسابات تجريبية |

## Quick Start

ضع المجلد تحت خادم PHP، استورد `database/schema.sql` ثم `database/seed_data.sql`، افتح `index.html` عبر `http://localhost/UniRide/`.

## For Non-Technical Users

- ما هو النظام؟ تنظيم نقل الطالبات مع السائقين.
- ماذا يفعل؟ دخول، رحلات، جداول، إشعارات، وللسائق طلبات وموقع وطوارئ ووقود وصيانة.
- كيف يُستخدم؟ فتح صفحة الدخول، ثم لوحة الطالبة أو لوحة السائق.
- أهم الأقسام: الدخول، التسجيل، لوحة الطالبة، لوحة السائق، الملفات الشخصية والإعدادات.
- حسابات التجربة وأسماءها في ملف البذرة داخل مجلد `database`.

## For Developers

- التقنيات: HTML و CSS و JavaScript و PHP و MySQL.
- المعمارية: واجهة تستدعي `api/*.php?action=`.
- قاعدة البيانات: `uniride` بخمسة عشر جدولًا في `schema.sql`.
- API: `auth.php` و `students.php` و `drivers.php`.
- أهم الملفات: `api/config.php` و `js/api.js` و `database/schema.sql`.
- التطوير: أضف `case` جديدًا. لا تنسخ قائمة الجداول من README السابق إذا خالفت `schema.sql`. ملف التحديث اسمه `updata.sql`.
