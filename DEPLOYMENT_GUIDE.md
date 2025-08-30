# 🚀 Deployment Guide - Bibliotheca Nexus with PhonePe Integration

## ✅ Code Successfully Pushed to GitHub!

**Repository**: https://github.com/Aashvee-Tech-Solutions/bibliotheca-nexus
**Latest Commit**: 2a1c869 - PhonePe payment gateway integration complete

---

## 📋 Pre-Deployment Checklist

### ✅ Completed
- [x] PhonePe payment gateway integration
- [x] Sign-out button fix
- [x] Database migrations created
- [x] Edge functions implemented
- [x] Code pushed to GitHub

### 🔄 Next Steps Required

## 1. 🗄️ Supabase Database Deployment

### Option A: Supabase CLI (Recommended)
If you have Supabase CLI installed:
```bash
# Install Supabase CLI if not installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref nbliowysyxjyeckmznmq

# Push database migrations
supabase db push

# Deploy edge functions
supabase functions deploy phonepe-payment
supabase functions deploy phonepe-webhook
supabase functions deploy phonepe-status
supabase functions deploy phonepe-refund
```

### Option B: Manual Deployment (via Supabase Dashboard)
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `nbliowysyxjyeckmznmq`
3. **Database Migrations**:
   - Go to SQL Editor
   - Copy and run the contents of `supabase/migrations/20250831000000_enhanced_payment_system.sql`
   
4. **Edge Functions**:
   - Go to Edge Functions
   - Create new functions and copy code from:
     - `supabase/functions/phonepe-payment/index.ts`
     - `supabase/functions/phonepe-webhook/index.ts`
     - `supabase/functions/phonepe-status/index.ts`
     - `supabase/functions/phonepe-refund/index.ts`

## 2. 🔧 Environment Variables Setup

### Supabase Environment Variables
In Supabase Dashboard → Settings → Edge Functions → Environment Variables:

```env
PHONEPE_MERCHANT_ID=your_phonepe_merchant_id
PHONEPE_SALT_KEY=your_phonepe_salt_key
PHONEPE_MODE=sandbox
```

### For Testing (Sandbox Credentials)
```env
PHONEPE_MERCHANT_ID=PGTESTPAYUAT
PHONEPE_SALT_KEY=099eb0cd-02cf-4e2a-8aca-3e6c6aff0399
PHONEPE_MODE=sandbox
```

## 3. 📱 PhonePe Merchant Setup

### Create PhonePe Business Account
1. Go to [PhonePe Business Portal](https://business.phonepe.com/)
2. Register your business
3. Complete KYC verification
4. Get your merchant credentials

### Configure Webhook URLs
In PhonePe merchant dashboard, set webhook URL to:
```
https://nbliowysyxjyeckmznmq.supabase.co/functions/v1/phonepe-webhook
```

## 4. 🌐 Frontend Deployment Options

### Option A: Vercel (Recommended)
1. Go to [Vercel Dashboard](https://vercel.com/)
2. Import from GitHub: `Aashvee-Tech-Solutions/bibliotheca-nexus`
3. Environment variables will be auto-detected from `.env`
4. Deploy!

### Option B: Netlify
1. Go to [Netlify](https://netlify.com/)
2. Import from GitHub repository
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Deploy!

### Option C: Direct Build
```bash
# Install dependencies (if not done)
npm install

# Build for production
npm run build

# The dist/ folder contains your built application
```

## 5. 🧪 Testing Deployment

### Database Test
1. Check if new tables exist in Supabase:
   - `payment_logs` table
   - Enhanced `authorship_purchases` table
   - `payment_analytics` view

### Edge Functions Test
Test each function via Supabase dashboard or curl:

```bash
# Test payment initiation (replace with actual purchase ID)
curl -X POST \
  https://nbliowysyxjyeckmznmq.supabase.co/functions/v1/phonepe-payment \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "purchase_id": "test-id",
    "amount": 100,
    "user_details": {
      "phone_number": "9999999999",
      "name": "Test User"
    }
  }'
```

### Frontend Test
1. Navigate to your deployed URL
2. Test sign-out functionality (desktop and mobile)
3. Test payment flow (if PhonePe credentials are set up)

## 6. 🔒 Security Checklist

### Before Going Live
- [ ] Replace sandbox PhonePe credentials with production ones
- [ ] Verify SSL certificate on your domain
- [ ] Test webhook signature validation
- [ ] Review database permissions
- [ ] Enable rate limiting if needed
- [ ] Set up monitoring and alerts

## 7. 📊 Monitoring Setup

### Supabase Monitoring
- Monitor edge function logs
- Set up database performance alerts
- Track API usage and errors

### PhonePe Dashboard
- Monitor payment success rates
- Check webhook delivery status
- Review transaction reports

## 8. 🆘 Quick Fixes for Common Issues

### Database Migration Issues
```sql
-- If migration fails, run these commands manually in SQL Editor:

-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN ('payment_logs', 'authorship_purchases');

-- If payment_logs doesn't exist, create it
CREATE TABLE IF NOT EXISTS public.payment_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_id UUID NOT NULL,
  transaction_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

### Edge Function Issues
- Check function logs in Supabase dashboard
- Verify environment variables are set
- Ensure authentication headers are included in requests

### Frontend Issues
- Check browser console for JavaScript errors
- Verify API endpoints are accessible
- Test responsive design on different devices

## 9. 🎯 Post-Deployment Actions

### Immediate Tasks
1. Test the complete payment flow
2. Verify sign-out functionality
3. Check responsive design
4. Monitor error rates
5. Set up backup procedures

### Within 24 Hours
1. Monitor payment transactions
2. Check webhook deliveries
3. Review performance metrics
4. Gather user feedback
5. Plan any necessary hotfixes

### Within 1 Week
1. Analyze payment patterns
2. Optimize performance bottlenecks
3. Review security logs
4. Plan feature enhancements
5. Document lessons learned

---

## 🎉 Deployment Status

| Component | Status | Action Required |
|-----------|--------|-----------------|
| GitHub Push | ✅ Complete | None |
| Database Migration | 🔄 Pending | Run migration in Supabase |
| Edge Functions | 🔄 Pending | Deploy functions in Supabase |
| Environment Variables | 🔄 Pending | Set PhonePe credentials |
| Frontend Deploy | 🔄 Pending | Deploy to Vercel/Netlify |
| PhonePe Setup | 🔄 Pending | Create merchant account |
| Testing | 🔄 Pending | Run post-deployment tests |

## 📞 Support Resources

- **Supabase Support**: https://supabase.com/support
- **PhonePe Business**: business.support@phonepe.com
- **Vercel Support**: https://vercel.com/support
- **Repository Issues**: https://github.com/Aashvee-Tech-Solutions/bibliotheca-nexus/issues

---

**🚀 Your PhonePe payment gateway integration is ready for deployment!**

The code is pushed to GitHub and all components are implemented. Follow the deployment steps above to get your application live with secure payment processing.
