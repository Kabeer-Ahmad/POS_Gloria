# Gloria Jean's Coffees - Point of Sale System

A modern, web-based Point of Sale (POS) system built with Next.js 15, TypeScript, Tailwind CSS, and Supabase for Gloria Jean's Coffees.

## 🚀 Features

### Authentication & Authorization
- **Admin Role**: Full access to all features including menu management, order management, and sales reports
- **Cashier Role**: Can create orders, process payments, and hold orders (limited access)
- Session-based authentication with localStorage persistence

### Order Management
- Create new orders with multiple items
- Add items with different sizes and extras
- Hold orders for later completion
- Edit quantities and remove items
- Dynamic GST calculation based on payment method:
  - **Cash payments**: 16% GST
  - **Card payments**: 5% GST

### Menu System
- Complete menu with all Gloria Jean's items including:
  - Espresso classics and specialties
  - Hot chocolates and teas
  - Chillers and smoothies
  - Food items and combo deals
  - Extras (espresso shots, syrups, whipped cream)
- Category-based filtering
- Size-based pricing

### Payment & Receipts
- Payment method selection (Cash/Card)
- Automatic tax calculation
- Receipt generation with:
  - A4 print format
  - Thermal printer format (text-based)
  - Complete order details and totals

### Reports (Admin Only)
- Sales analytics (coming soon)
- Revenue tracking (coming soon)
- Order statistics (coming soon)

### Modern UI/UX
- Responsive design for desktop and tablet
- Clean, intuitive interface
- Real-time updates
- Toast notifications
- Dark mode support

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Custom session-based auth
- **State Management**: Zustand
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Date Handling**: date-fns

## 📋 Prerequisites

Before running this project, make sure you have:

- Node.js 18+ installed
- A Supabase account and project
- Git

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd gloria_pos
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase (Optional for Testing)

**Note**: The POS system will work without Supabase - orders will be saved locally. For production use, set up Supabase:

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to your project's SQL Editor
3. Run the database schema from `lib/database.sql`
4. Run the seed data from `lib/seed-data.sql`
5. Get your project URL and anon key from Settings → API

**For detailed setup instructions**, see [SETUP_SUPABASE.md](SETUP_SUPABASE.md)

### 4. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Staff Passwords (currently set in code)
ADMIN_PASSWORD=7890
CASHIER_PASSWORD=1111
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 Default Login Credentials

### Admin Access
- **Role**: Admin
- **Password**: `7890`
- **UUID**: `00000000-0000-0000-0000-000000000001`

### Cashier Access
- **Role**: Cashier  
- **Password**: `1111`
- **UUID**: `00000000-0000-0000-0000-000000000002`

## 📱 Usage

### For Cashiers
1. Login with cashier credentials
2. Start a new order
3. Browse menu categories and add items
4. Customize items with sizes and extras
5. Review order in the right panel
6. Process payment (cash or card)
7. Print receipt

### For Admins
- All cashier features plus:
- Access to sales reports
- Menu management capabilities
- Full order management (including deletions)

## 🗃️ Database Schema

The system uses four main tables:

- **staff_users**: Store staff login credentials and roles
- **menu_items**: Complete menu with categories, sizes, and pricing
- **orders**: Order headers with totals and payment info
- **order_items**: Individual items within each order

## 🔧 Development

### Project Structure

```
gloria_pos/
├── app/                    # Next.js App Router pages
├── components/            
│   ├── auth/              # Authentication components
│   └── pos/               # POS interface components
├── lib/                   # Utilities and configurations
│   ├── auth.ts           # Authentication logic
│   ├── store.ts          # Zustand state management
│   ├── supabase.ts       # Supabase client
│   ├── database.sql      # Database schema
│   └── seed-data.sql     # Menu seed data
└── ...
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Environment Variables for Production

Make sure to set all environment variables in your deployment platform:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSWORD`
- `CASHIER_PASSWORD`

## 🔒 Security Considerations

- Change default passwords before production use
- Use Row Level Security (RLS) in Supabase
- Implement proper session management
- Validate all inputs on both client and server side
- Use HTTPS in production

## 🎯 Future Enhancements

- Real-time order syncing across devices
- Inventory management
- Customer management
- Advanced reporting and analytics
- Mobile app for staff
- Kitchen display system
- Integration with payment processors
- Offline mode support

## 🐛 Troubleshooting

### Common Issues

1. **Supabase Connection Error**
   - Verify environment variables are correct
   - Check if Supabase project is active
   - Ensure RLS policies are properly configured

2. **Authentication Not Working**
   - Verify passwords in environment variables
   - Check browser console for errors
   - Clear localStorage and try again

3. **Menu Items Not Loading**
   - Ensure seed data was imported successfully
   - Check database connection
   - Verify menu_items table structure

## 📄 License

This project is proprietary software for Gloria Jean's Coffees.

## 🤝 Support

For technical support or questions about the POS system, please contact the development team.
