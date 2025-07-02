# Supabase Setup Guide for Gloria Jean's POS

## Quick Start

The POS system will work without Supabase (orders saved locally), but for production use, you'll want to configure a database.

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up/Sign in
3. Click "New Project"
4. Choose organization and enter project details
5. Wait for project to be created

## Step 2: Get Credentials

1. Go to your project dashboard
2. Click **Settings** > **API**
3. Copy the following:
   - **Project URL** (looks like: `https://abc123.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

## Step 3: Create Environment File

Create a file named `.env.local` in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Admin and Cashier Passwords
ADMIN_PASSWORD=gloria_admin_2024
CASHIER_PASSWORD=gloria_cashier_2024
```

Replace the placeholder values with your actual credentials.

## Step 4: Set Up Database Tables

1. In your Supabase dashboard, go to **SQL Editor**
2. Run the contents of `lib/database.sql` to create tables
3. Run the contents of `lib/seed-data.sql` to populate menu items

## Step 5: Configure Row Level Security (Optional)

For production, you may want to set up RLS policies:

```sql
-- Enable RLS on all tables
ALTER TABLE staff_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create policies as needed
-- Example: Allow all operations for now (customize for production)
CREATE POLICY "Allow all operations" ON orders FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON order_items FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON menu_items FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON staff_users FOR ALL USING (true);
```

## Step 6: Test Connection

1. Restart your development server: `npm run dev`
2. Place a test order and complete payment
3. Check the browser console for "Order saved successfully to Supabase"
4. Verify the data in your Supabase dashboard under **Table Editor**

## Troubleshooting

### Common Issues:

1. **Environment variables not loaded**: Make sure `.env.local` is in the project root and restart the dev server
2. **Tables don't exist**: Run the SQL scripts from Step 4
3. **Permission denied**: Check RLS policies or disable RLS for development
4. **Invalid credentials**: Double-check your project URL and anon key

### Without Supabase:

The POS system will still work perfectly for:
- Taking orders
- Managing tables
- Processing payments
- Printing receipts
- Local data persistence

Orders will be saved in the browser's local storage instead of the database.

## Production Considerations

For production deployment:
- Set up proper RLS policies
- Use service role key for server-side operations
- Configure proper authentication
- Set up database backups
- Monitor usage and performance

---

**Need Help?** Check the [Supabase Documentation](https://supabase.com/docs) or [Next.js Integration Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs) 