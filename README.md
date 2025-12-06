# MyMenu - Digital Menu Management System

A modern, full-stack Digital Menu Management System built with Next.js (T3 Stack), TypeScript, Tailwind CSS, Prisma, and PostgreSQL.

## 🚀 Features

- **User Authentication**: Email-based verification without NextAuth
- **Restaurant Management**: Create and manage multiple restaurants
- **Menu Builder**: Create categories and dishes with images, descriptions, and pricing
- **Multi-Category Dishes**: Dishes can belong to multiple categories
- **Digital Menu Access**: 
  - QR Code generation for easy sharing
  - Unique shareable links
  - Responsive mobile-friendly interface
- **Admin Dashboard**: Intuitive management interface
- **Modern UI**: Built with Tailwind CSS and custom components

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Icons**: Lucide React
- **QR Code**: qrcode.react
- **Email**: Nodemailer
- **Hosting**: Vercel

## 📋 Project Structure

```
MyMenu/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/              # Authentication endpoints
│   │   │   ├── restaurants/       # Restaurant management
│   │   │   ├── menus/             # Menu management
│   │   │   └── dishes/            # Dish management
│   │   ├── dashboard/             # Admin dashboard
│   │   ├── login/                 # Login page
│   │   ├── menu/                  # Digital menu view
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # Home page
│   │   └── globals.css            # Global styles
│   ├── components/
│   │   ├── Button.tsx             # Reusable button
│   │   ├── Input.tsx              # Reusable input
│   │   ├── Card.tsx               # Card component
│   │   └── Modal.tsx              # Modal component
│   ├── server/
│   │   ├── auth.ts                # Authentication utilities
│   │   ├── db.ts                  # Prisma client
│   │   └── email.ts               # Email service
│   └── lib/
├── prisma/
│   └── schema.prisma              # Database schema
├── public/                         # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── postcss.config.js
```

## 🔐 Database Schema

### User
- id (Primary Key)
- email (Unique)
- fullName
- country
- verificationCode
- isVerified
- createdAt
- updatedAt

### Restaurant
- id (Primary Key)
- name
- location
- userId (Foreign Key)
- menus (Relationship)
- accessLinks (Relationship)

### Menu
- id (Primary Key)
- name
- description
- restaurantId (Foreign Key)
- categories (Relationship)

### Category
- id (Primary Key)
- name
- menuId (Foreign Key)
- dishes (Relationship via DishCategory)

### Dish
- id (Primary Key)
- name
- description
- price
- image
- spiceLevel
- categories (Relationship via DishCategory)

### DishCategory (Junction Table)
- id (Primary Key)
- dishId (Foreign Key)
- categoryId (Foreign Key)
- Unique constraint on (dishId, categoryId)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (use Neon for free hosting)
- Gmail account for email verification

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MyMenu
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your values:
   ```
   DATABASE_URL="postgresql://user:password@host/dbname?schema=public"
   EMAIL_USER="your-email@gmail.com"
   EMAIL_PASSWORD="your-app-specific-password"
   NEXTAUTH_SECRET="any-random-secret-string"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Setup Database**
   ```bash
   npm run db:generate
   npm run db:push
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📝 API Endpoints

### Authentication
- `POST /api/auth/send-code` - Send verification code to email
- `POST /api/auth/verify` - Verify code and complete profile
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Restaurants
- `GET /api/restaurants` - Get all user restaurants
- `POST /api/restaurants` - Create new restaurant
- `GET /api/restaurants/:id` - Get restaurant details
- `PUT /api/restaurants/:id` - Update restaurant
- `DELETE /api/restaurants/:id` - Delete restaurant

### Menus
- `POST /api/menus` - Create menu
- `GET /api/menus/:id` - Get menu details
- `PUT /api/menus/:id` - Update menu
- `DELETE /api/menus/:id` - Delete menu

### Categories
- `POST /api/menus/categories` - Create category
- `PUT /api/menus/categories/:id` - Update category
- `DELETE /api/menus/categories/:id` - Delete category

### Dishes
- `POST /api/dishes` - Create dish
- `PUT /api/dishes/:id` - Update dish
- `DELETE /api/dishes/:id` - Delete dish

### Public Access
- `GET /api/restaurants/public/:shareToken` - Get menu by share token

## 🎨 UI Features

### Admin Dashboard
- Clean, intuitive interface
- Restaurant management card view
- Quick menu creation
- QR code generation and sharing
- Responsive design for all devices

### Digital Menu (Customer View)
- Fixed header with restaurant info
- Sticky category tabs
- Floating category navigation buttons
- Dish cards with images, descriptions, prices
- Spice level indicators
- Optimized for mobile viewing
- Smooth scrolling and transitions

## 📱 Responsive Design

The application is fully responsive and works great on:
- Desktop (1920px and above)
- Tablet (768px - 1024px)
- Mobile (320px - 767px)

## 🔒 Security Features

- Email-based verification (no passwords)
- Session-based authentication with tokens
- HTTP-only cookies for security
- User ownership validation on all operations
- CORS and CSRF protection ready

## 🚀 Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy with one click

```bash
git push origin main
```

## 🎯 Features Implemented

✅ User registration and verification
✅ Email-based login
✅ Restaurant management
✅ Multi-menu support
✅ Category management
✅ Dish management
✅ Multi-category dish assignment
✅ QR code generation
✅ Shareable links
✅ Digital menu viewing
✅ Responsive design
✅ Admin dashboard
✅ Session management
✅ Database schema optimization

## 🐛 Known Limitations

- Email verification requires valid Gmail credentials
- Image uploads use external URLs (can be extended for direct upload)
- Single image per dish (can be extended to multiple images)

## 🔄 Future Enhancements

- [ ] Image upload functionality
- [ ] Multiple images per dish
- [ ] Dietary restrictions/allergen info
- [ ] Ratings and reviews
- [ ] Order management system
- [ ] Analytics dashboard
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Social media sharing
- [ ] Advanced search and filtering

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Development Notes

### AI Tool Usage

- **Tool Used**: Claude Haiku 4.5
- **Approach**: 
  - AI was used to generate boilerplate code and component structure
  - All code was reviewed, tested, and manually verified
  - Custom logic for specific requirements was hand-coded
  - Integration between components was manually implemented

### Key Decisions

1. **No NextAuth**: Used custom JWT-based sessions for simplicity
2. **Custom Components**: Built simple, composable UI components instead of external UI library
3. **Direct Image URLs**: Used external URLs for dish images for flexibility
4. **Floating Navigation**: Implemented floating category buttons for better UX on mobile
5. **Sticky Headers**: Used sticky positioning for better menu navigation

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests.

---

**Made with ❤️ using T3 Stack**
