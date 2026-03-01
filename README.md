# 🦐 U-ra Seafood — ระบบจัดการร้านค้าออนไลน์

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![MySQL](https://img.shields.io/badge/MySQL-XAMPP-blue)](https://www.mysql.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org)

ระบบจัดการร้านค้าออนไลน์สำหรับร้านกุ้งดอง & แซลมอนดอง U-ra พัฒนาด้วย **Next.js 16 App Router** พร้อมระบบสมาชิก, ตะกร้าสินค้า, ออเดอร์, สะสมแต้ม และ Admin Panel ครบครัน

---

## 📋 สารบัญ

- [ฟีเจอร์หลัก](#ฟีเจอร์หลัก)
- [Technology Stack](#technology-stack)
- [โครงสร้างโปรเจกต์](#โครงสร้างโปรเจกต์)
- [การติดตั้ง](#การติดตั้ง)
- [การตั้งค่า Database](#การตั้งค่า-database)
- [Environment Variables](#environment-variables)
- [บัญชีเริ่มต้น](#บัญชีเริ่มต้น)
- [การใช้งาน](#การใช้งาน)

---

## ✨ ฟีเจอร์หลัก

### ฝั่งลูกค้า (User)
| ฟีเจอร์ | รายละเอียด |
|---------|------------|
| 🔐 สมัครสมาชิก / เข้าสู่ระบบ | Cookie session, bcrypt password |
| 🛒 ตะกร้าสินค้า | เพิ่ม/ลด/ลบ, เช็คสต็อก real-time |
| ⭐ ระบบสะสมแต้ม | 1 แต้ม ต่อทุก 10 บาท |
| 🎁 แลกแต้มส่วนลด | 1 แต้ม = ลด 1 บาท |
| 💳 ชำระเงินแจ้งโอน | แนบสลิปโอนเงิน |
| 📦 ประวัติออเดอร์ | ดูสถานะ, สั่งซ้ำ |
| 📍 ที่อยู่จัดส่ง | จัดการหลายที่อยู่, ตั้งหลัก |
| 💬 รีวิวสินค้า | ให้ดาว 1-5 + ความคิดเห็น |
| ❤️ รายการโปรด | บันทึกเมนูที่ชอบ |

### ฝั่ง Admin
| ฟีเจอร์ | รายละเอียด |
|---------|------------|
| 📊 Dashboard | ยอดขาย, กราฟ, ออเดอร์ล่าสุด |
| 🛍️ จัดการสินค้า | เพิ่ม/แก้ไข/ลบ, อัปโหลดรูป, สต็อก |
| 📦 จัดการออเดอร์ | เปลี่ยนสถานะ, ยกเลิก (คืนสต็อก) |
| 👤 สั่งให้ลูกค้า | สั่งสินค้าพร้อมระบุเบอร์เพื่อสะสมแต้มให้ |
| 🔔 แจ้งเตือน Discord | Webhook ส่งแจ้งเตือนออเดอร์ใหม่ |

---

## 🔧 Technology Stack

```
Frontend:   Next.js 16 (App Router) + TypeScript + React 19
Database:   MySQL (XAMPP) — raw mysql2 pool
Auth:       Cookie Session (custom) + bcryptjs
Charts:     recharts
File Upload: Next.js API Route → /public/uploads/
```

---

## 📁 โครงสร้างโปรเจกต์

```
food-shop/
├── app/
│   ├── admin/
│   │   ├── dashboard/page.tsx    # 📊 แดชบอร์ด
│   │   ├── orders/page.tsx       # 📦 จัดการออเดอร์
│   │   ├── page.tsx              # 🛍️ จัดการสินค้า
│   │   └── layout.tsx            # Admin nav bar
│   ├── api/
│   │   ├── admin/stats/route.ts  # API ข้อมูลกราฟ
│   │   ├── review/route.ts       # API รีวิวสินค้า
│   │   ├── slip/route.ts         # API อัปโหลดสลิป
│   │   └── upload/route.ts       # API อัปโหลดรูป
│   ├── checkout/                 # หน้าชำระเงิน
│   ├── profile/                  # หน้าโปรไฟล์
│   ├── login/ register/          # หน้า Auth
│   ├── actions.ts                # Server Actions หลัก
│   └── auth-actions.ts           # Server Actions ล็อกอิน
├── components/
│   ├── FoodList.tsx              # รายการสินค้า + ตะกร้า
│   ├── Navbar.tsx                # Navigation bar
│   ├── AdminCharts.tsx           # กราฟ recharts
│   ├── ReviewModal.tsx           # Modal รีวิว
│   └── ImageUpload.tsx           # อัปโหลดรูป drag&drop
├── lib/
│   ├── db.ts                     # MySQL connection pool
│   ├── auth.ts                   # getSession / cookie utils
│   └── discord.ts                # Discord webhook
├── prisma/schema.prisma          # Database schema (reference)
└── .env                          # Environment variables
```

---

## 🚀 การติดตั้ง

### ความต้องการ
- **Node.js** 18 ขึ้นไป
- **XAMPP** (MySQL + Apache)

### ขั้นตอน

```bash
# 1. Clone หรือเปิดโปรเจกต์
cd FoodProject/food-shop

# 2. ติดตั้ง dependencies
npm install

# 3. คัดลอกไฟล์ .env
cp .env.example .env   # หรือแก้ไข .env ตรง ๆ

# 4. รัน dev server
npm run dev
```

เปิดเบราว์เซอร์ที่ `http://localhost:3000`

---

## 🗄️ การตั้งค่า Database

### 1. เริ่ม XAMPP
- เปิด **XAMPP Control Panel**
- Start **Apache** และ **MySQL**

### 2. สร้าง Database

เปิด `http://localhost/phpmyadmin` แล้วสร้าง database ชื่อ `food_shop`

### 3. สร้างตาราง (รัน SQL ต่อไปนี้ใน phpMyAdmin)

```sql
-- ตาราง User
CREATE TABLE User (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  phone VARCHAR(20),
  role VARCHAR(20) DEFAULT 'USER',
  points INT DEFAULT 0,
  createdAt DATETIME DEFAULT NOW()
);

-- ตาราง Product
CREATE TABLE Product (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price INT NOT NULL,
  stock INT DEFAULT 0,
  image VARCHAR(500)
);

-- ตาราง Order
CREATE TABLE `Order` (
  id INT AUTO_INCREMENT PRIMARY KEY,
  total INT NOT NULL,
  status VARCHAR(20) DEFAULT 'PENDING',
  slipUrl VARCHAR(500),
  userId INT,
  createdAt DATETIME DEFAULT NOW(),
  FOREIGN KEY (userId) REFERENCES User(id)
);

-- ตาราง OrderItem
CREATE TABLE OrderItem (
  id INT AUTO_INCREMENT PRIMARY KEY,
  orderId INT NOT NULL,
  productId INT NOT NULL,
  quantity INT NOT NULL,
  price INT NOT NULL,
  FOREIGN KEY (orderId) REFERENCES `Order`(id),
  FOREIGN KEY (productId) REFERENCES Product(id)
);

-- ตาราง Address
CREATE TABLE Address (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  recipientName VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  isDefault BOOLEAN DEFAULT false,
  createdAt DATETIME DEFAULT NOW(),
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
);

-- ตาราง Favorite
CREATE TABLE Favorite (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  productId INT NOT NULL,
  createdAt DATETIME DEFAULT NOW(),
  UNIQUE KEY uniq_fav (userId, productId),
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
  FOREIGN KEY (productId) REFERENCES Product(id) ON DELETE CASCADE
);

-- ตาราง NotificationSetting
CREATE TABLE NotificationSetting (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT UNIQUE NOT NULL,
  promoNotif BOOLEAN DEFAULT true,
  orderNotif BOOLEAN DEFAULT true,
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
);

-- ตาราง Review
CREATE TABLE IF NOT EXISTS Review (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  productId INT NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  createdAt DATETIME DEFAULT NOW(),
  UNIQUE KEY uniq_user_product (userId, productId)
);
```

---

## ⚙️ Environment Variables

แก้ไขไฟล์ `.env`:

```env
# MySQL (XAMPP)
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=food_shop

DATABASE_URL="mysql://root:@localhost:3306/food_shop"

# Admin Credentials (เข้าหน้า /admin/login)
ADMIN_USERNAME=admin01
ADMIN_PASSWORD=admin

# Discord Webhook (ไม่บังคับ — ถ้าเว้นว่างจะข้ามการแจ้งเตือน)
DISCORD_WEBHOOK_URL=
```

---

## 👤 บัญชีเริ่มต้น

| บัญชี | URL | Username | Password |
|-------|-----|----------|----------|
| Admin | `/admin/login` | `admin01` | `admin` |
| User | `/login` | สมัครสมาชิกเอง | - |

> ⚠️ **แนะนำ**: เปลี่ยน password ใน `.env` ก่อนใช้งานจริง

---

## 📖 การใช้งาน

### สำหรับลูกค้า
1. สมัครสมาชิกที่ `/register`
2. เข้าสู่ระบบที่ `/login`
3. เลือกสินค้าใส่ตะกร้า → กด "ยืนยันสั่งอาหาร"
4. ดูประวัติออเดอร์และสถานะได้ที่ `/profile` → แท็บ "🛒 ประวัติสั่งซื้อ"

### สำหรับ Admin
1. เข้า `/admin/login`
2. **Dashboard** — ดูยอดขายและกราฟ
3. **จัดการสินค้า** — เพิ่ม/แก้ไข/ลบสินค้า
4. **ออเดอร์** — อัปเดตสถานะ, ยกเลิก (คืนสต็อกอัตโนมัติ)

---

## 🔄 สถานะออเดอร์

```
PENDING → PAID → SHIPPED
   ↓
CANCELLED (คืนสต็อกอัตโนมัติ)
```

---

*พัฒนาโดย U-ra Seafood Team · 2026*
