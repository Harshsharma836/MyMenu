# 🍽️ MyMenu – Digital Menu Management System

A modern and stylish **digital menu builder** for restaurants — create menus, add categories & dishes, upload images, and share QR-based menus with customers.

📌 **Live Project Screen Recording**
[https://screenrec.com/share/mnD04vK3jN](https://screenrec.com/share/mnD04vK3jN)

---

## 🚀 Features

* Email-based login (no passwords)
* Manage multiple restaurants under one account
* Create menus → categories → dishes
* Multi-category dish support
* **Cloudinary image upload for dishes**
* Digital menu with responsive mobile-first design
* QR code + public share link for customers
* Clean and powerful admin dashboard
* Secure HTTP-only cookie sessions

---

## 🛠️ Tech Stack

| Layer     | Tools                     |
| --------- | ------------------------- |
| Framework | Next.js 15 (App Router)   |
| Language  | TypeScript                |
| Styling   | Tailwind CSS              |
| Database  | PostgreSQL (Neon)         |
| ORM       | Prisma                    |
| Auth      | Custom email verification |
| Images    | **Cloudinary**            |
| QR        | qrcode.react              |
| Email     | Nodemailer                |
| Hosting   | Vercel                    |

---

## 🔄 Project Flow

```
User enters email → receives OTP
User verifies OTP → profile created
User creates restaurant
User adds menu(s)
User creates categories
User uploads dish details + Cloudinary image
System generates QR and share link
Customer scans link/QR → views menu (no login required)
```

✔ Admin controls everything
✔ Customer only views the menu

---

## 🔐 API Routes (Summary)

### Auth

```
POST /api/auth/send-code
POST /api/auth/verify
GET  /api/auth/me
POST /api/auth/logout
```

### Restaurants

```
GET /api/restaurants
POST /api/restaurants
PUT /api/restaurants/:id
DELETE /api/restaurants/:id
```

### Menus / Categories / Dishes

```
POST /api/menus
POST /api/menus/categories
POST /api/dishes   ← Handles Cloudinary upload
```

### Public Access

```
GET /api/restaurants/public/:shareToken
```

---

## 🧾 Database Schema (Simplified)

```
User → Restaurants → Menus → Categories → Dishes
                 ↳ PublicShareLink (QR)
```

`DishCategory` handles **many‑to‑many** between dishes & categories.

---

## 🔧 Installation

```bash
git clone <repository-url>
cd MyMenu
npm install
cp .env.example .env.local
```

### Required Env Variables

```
DATABASE_URL=
EMAIL_USER=
EMAIL_PASSWORD=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
```

### Setup DB & Run

```bash
npm run db:generate
npm run db:push
npm run dev
```

Open → [http://localhost:3000](http://localhost:3000)

---

## 📱 UI Highlights

* Fully mobile responsive
* Floating category scroll buttons
* Sticky category navigation
* Smooth animations and fast UX

Designed to make **restaurant browsing feel premium**.

---
### @harsh

