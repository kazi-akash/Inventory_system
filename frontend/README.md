# Flash Sale System - Frontend

A professional, production-ready Next.js frontend for the Real-Time Inventory Reservation System with 5-minute expiry.

## 🚀 Features

- **Public Product Browsing** - Browse products without authentication
- **Real-Time Inventory** - Live inventory updates every 5 seconds
- **Smart Reservations** - 5-minute reservation system with countdown timers
- **Secure Authentication** - JWT-based auth with automatic token refresh
- **Admin Dashboard** - Complete product management (CRUD operations)
- **Responsive Design** - Mobile-first, works on all devices
- **Professional UI** - Clean, modern interface with Tailwind CSS
- **Type-Safe** - Full TypeScript support
- **Error Handling** - Comprehensive error handling and user feedback

## 📋 Prerequisites

- Node.js 18+ and npm
- Backend API running on `http://localhost:8000`

## 🛠️ Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**
```bash
# Copy the example env file
cp .env.local.example .env.local

# Edit .env.local with your settings
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_NAME=Flash Sale System
NEXT_PUBLIC_RESERVATION_EXPIRY_MINUTES=5
```

3. **Run the development server:**
```bash
npm run dev
```

4. **Open your browser:**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
frontend/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                 # Landing page
│   ├── products/                # Product pages
│   │   ├── page.tsx            # Product list
│   │   └── [id]/page.tsx       # Product detail
│   ├── login/page.tsx          # Login page
│   ├── register/page.tsx       # Register page
│   ├── reservations/           # Reservation pages
│   │   ├── page.tsx           # My reservations
│   │   └── [id]/page.tsx      # Reservation detail
│   └── admin/                  # Admin pages
│       └── products/           # Product management
│           ├── page.tsx       # Product list
│           ├── new/page.tsx   # Create product
│           └── [id]/edit/page.tsx  # Edit product
├── components/                  # React components
│   ├── ui/                     # Base UI components
│   ├── layout/                 # Layout components
│   ├── products/               # Product components
│   ├── reservations/           # Reservation components
│   └── admin/                  # Admin components
├── lib/                        # Utilities and logic
│   ├── api/                    # API client and services
│   ├── context/                # React Context providers
│   ├── hooks/                  # Custom React hooks
│   ├── types/                  # TypeScript types
│   └── utils/                  # Utility functions
└── middleware.ts               # Route protection

```

## 🎯 User Flows

### Anonymous User (Public Browsing)
1. Visit homepage
2. Browse products (no login required)
3. Click on product to view details
4. Click "Login to Reserve" → Redirected to login
5. After login → Redirected back to product
6. Reserve product → View reservations

### Registered User
1. Login
2. Browse products
3. Click "Reserve Now" (direct)
4. Complete checkout before 5-minute expiry

### Admin User
1. Login with admin account
2. Access Admin Panel from navbar
3. Create, edit, or delete products
4. Manage inventory in real-time

## 🔐 Authentication

### Test Accounts

**Regular User:**
- Email: `user@example.com`
- Password: `user123`

**Admin User:**
- Email: `admin@example.com`
- Password: `admin123`

### Auth Flow
- JWT tokens stored in localStorage
- Automatic token refresh on 401 errors
- Protected routes redirect to login
- Redirect back to original page after login

## 🎨 Key Components

### Product Components
- **ProductList** - Grid of product cards with real-time updates
- **ProductCard** - Individual product display
- **ProductDetail** - Full product information
- **ReserveButton** - Smart button (login prompt or reserve)

### Reservation Components
- **ReservationList** - User's reservations with status
- **ReservationCard** - Individual reservation display
- **CountdownTimer** - Real-time countdown with animations

### Admin Components
- **ProductForm** - Create/edit product form
- **ProductTable** - Admin product management table

## 🔄 Real-Time Features

- **Product Inventory**: Polls every 5 seconds
- **Reservations**: Polls every 10 seconds
- **Countdown Timers**: Updates every second
- **Auto-expiry**: Automatically updates UI when reservation expires

## 🎨 Design System

### Colors
- Primary: Blue (#2563EB)
- Success: Green (#10B981)
- Warning: Amber (#F59E0B)
- Danger: Red (#EF4444)
- Neutral: Gray scale

### Typography
- Font: Inter
- Headings: Bold, clear hierarchy
- Body: 16px for readability

### Components
- Buttons: Primary, Secondary, Danger, Ghost
- Cards: Elevated with hover effects
- Badges: Color-coded status indicators
- Modals: Centered with backdrop
- Toasts: Slide-in notifications

## 📱 Responsive Breakpoints

- Mobile: 320px - 640px
- Tablet: 641px - 1024px
- Desktop: 1025px+

## 🚀 Build & Deploy

### Build for production:
```bash
npm run build
```

### Start production server:
```bash
npm start
```

### Type checking:
```bash
npm run type-check
```

### Linting:
```bash
npm run lint
```

## 🔧 Configuration

### API URL
Update `NEXT_PUBLIC_API_URL` in `.env.local` to point to your backend API.

### Polling Intervals
Adjust in `lib/utils/constants.ts`:
```typescript
export const POLL_INTERVALS = {
  PRODUCTS: 5000,        // 5 seconds
  RESERVATIONS: 10000,   // 10 seconds
  RESERVATION_DETAIL: 5000,
  COUNTDOWN: 1000,       // 1 second
};
```

## 📚 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context + SWR
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form + Zod
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 🐛 Troubleshooting

### API Connection Issues
- Ensure backend is running on `http://localhost:8000`
- Check CORS settings in backend
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`

### Authentication Issues
- Clear localStorage and cookies
- Check token expiry (15 minutes default)
- Verify backend auth endpoints are working

### Real-time Updates Not Working
- Check polling intervals in constants
- Verify SWR configuration
- Check browser console for errors

## 📖 Documentation

For detailed architecture and design decisions, see:
- `FRONTEND_ARCHITECTURE.md` - Complete technical architecture
- `FRONTEND_UX_FLOWS.md` - User experience flows
- `FRONTEND_DATA_FLOW.md` - Data flow diagrams
- `API_EXAMPLES.md` - Backend API examples

## 🤝 Contributing

1. Follow the existing code style
2. Use TypeScript for type safety
3. Write meaningful commit messages
4. Test on multiple screen sizes
5. Ensure accessibility compliance

## 📄 License

This project is part of the Real-Time Inventory Reservation System.

---

**Built with ❤️ using Next.js and TypeScript**
