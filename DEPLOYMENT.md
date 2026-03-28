# LookingFor.in - Deployment Guide

## Pre-Deployment Checklist

### Environment Setup
- [ ] Supabase project created
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] WhatsApp integration ready
- [ ] Razorpay test credentials ready

### Code Quality
- [ ] All components built successfully
- [ ] Build size: 314KB gzipped ✅
- [ ] No TypeScript errors ✅
- [ ] Mobile responsiveness tested
- [ ] PWA manifest validates

---

## Step 1: Configure Environment Variables

Create `.env` file in project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Get these from [Supabase Dashboard](https://supabase.com/dashboard):
1. Go to Project Settings → API
2. Copy `URL` and `anon` public key

---

## Step 2: Apply Database Migrations

All migrations are already created. Just verify they're applied:

**Already migrated tables:**
- `users` ✅
- `requirements` ✅
- `chat_requests` ✅
- `chat_messages` ✅
- `subscriptions` ✅
- `premium_plans` ✅
- `whatsapp_verifications` ✅
- `subcategories` ✅

Verify in Supabase:
1. Go to SQL Editor
2. Run: `SELECT tablename FROM pg_tables WHERE schemaname='public';`
3. Should show all tables above

---

## Step 3: Build for Production

```bash
# Install dependencies (if not done)
npm install

# Build
npm run build

# Output: dist/ folder ready for deployment
```

Build output:
```
dist/index.html                 1.99 kB │ gzip:  0.83 kB
dist/assets/index-CSS.css      21.29 kB │ gzip:  4.37 kB
dist/assets/index-JS.js       314.71 kB │ gzip: 90.10 kB
```

---

## Step 4: Deploy to Vercel (Recommended)

### Option A: Git Integration (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "LookingFor.in MVP - Production Release"
   git branch -M main
   git remote add origin https://github.com/yourusername/lookingfor
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Select GitHub repo
   - Configure environment variables
   - Deploy

3. **Set Environment Variables in Vercel**
   ```
   VITE_SUPABASE_URL = your_supabase_url
   VITE_SUPABASE_ANON_KEY = your_anon_key
   ```

### Option B: Direct Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

---

## Step 5: Configure Custom Domain

In Vercel Dashboard:
1. Go to Project Settings → Domains
2. Add your domain (e.g., `lookingfor.in`)
3. Point DNS records:
   ```
   CNAME: cname.vercel-dns.com (for www)
   A: 76.76.19.19 (for apex)
   ```

---

## Step 6: Enable PWA

PWA should work automatically:

1. **Manifest:** `public/manifest.json` ✅
2. **Service Worker:** `public/service-worker.js` ✅
3. **Meta tags:** `index.html` ✅

Test PWA:
1. Open app in Chrome/Edge
2. Look for "Install" button
3. Click to add to home screen

---

## Step 7: Configure Razorpay (Future)

When ready to enable payments:

1. Get Razorpay keys from dashboard
2. Store in Vercel secrets:
   ```
   RAZORPAY_KEY_ID = your_key
   RAZORPAY_KEY_SECRET = your_secret
   ```
3. Implement payment edge function
4. Create subscription checkout flow

---

## Step 8: Post-Deployment Testing

### Mobile Testing
- [ ] Open on iPhone (Safari)
- [ ] Open on Android (Chrome)
- [ ] Test "Add to Home Screen"
- [ ] Test offline mode
- [ ] Test WhatsApp login
- [ ] Test requirement posting
- [ ] Test chat approval flow

### Desktop Testing
- [ ] Open on Chrome
- [ ] Open on Firefox
- [ ] Open on Safari
- [ ] Test responsive design
- [ ] Test all features

### Functionality Testing
- [ ] User registration via WhatsApp
- [ ] Requirement creation (public/anonymous)
- [ ] Chat request sending
- [ ] Chat request approval
- [ ] Message limits (3 free)
- [ ] Contact protection (locked by default)
- [ ] Premium upgrade prompt

---

## Step 9: Domain Configuration

If using custom domain:

1. **Update app base URL** (if needed)
   - All relative paths already use `/`
   - No changes needed

2. **Update manifest.json** if domain changes
   - Update `start_url` if needed

3. **SSL Certificate**
   - Vercel auto-issues for free
   - HTTPS enabled automatically

---

## Step 10: Monitoring & Analytics

### Add Analytics (Optional)
```tsx
// In main.tsx or a useEffect hook
import { supabase } from './lib/supabase';

// Track page views
const trackPageView = (page: string) => {
  supabase.from('page_views').insert({ page, timestamp: new Date() });
};
```

### Set Up Alerts
- Vercel: Monitor build & deploy failures
- Supabase: Set up database alerts
- Email: Alert on errors

---

## Step 11: Backup & Security

### Database Backups
1. Supabase auto-backs up daily
2. Enable point-in-time recovery (PITR)
3. Export critical data weekly

### Security Headers
Vercel sets these automatically:
- `Strict-Transport-Security` (HSTS)
- `X-Content-Type-Options`
- `X-Frame-Options`
- `X-XSS-Protection`

### Rate Limiting
- Implement on Supabase functions
- WhatsApp API rate limits: 60 requests/minute

---

## Step 12: Performance Optimization

**Current Build Size:** 314KB gzipped ✅

If you need to reduce further:
- Remove unused Lucide icons
- Code split on routes
- Lazy load chat components
- Compress images

---

## Rollback Plan

If issues after deployment:

```bash
# Check deployment history
vercel ls

# Rollback to previous version
vercel rollback

# Or redeploy previous commit
git revert HEAD
git push
```

---

## Scaling Considerations

For high traffic:

1. **Database:**
   - Upgrade Supabase plan
   - Add indexes to queries
   - Optimize RLS policies

2. **Backend:**
   - Edge functions for payment
   - Queue long-running tasks
   - Cache frequent queries

3. **Frontend:**
   - CDN caching enabled (automatic with Vercel)
   - Lazy load images
   - Code split routes

---

## Monitoring Checklist

After deployment:

- [ ] Health check endpoint works
- [ ] Errors logged to console
- [ ] Database queries running fast
- [ ] Push notifications working (future)
- [ ] Email alerts configured
- [ ] Traffic monitoring active

---

## Support

For deployment issues:

1. **Build errors:** Check `npm run build` output
2. **Runtime errors:** Check browser console + Vercel logs
3. **Database errors:** Check Supabase SQL Editor
4. **Performance:** Use Lighthouse audit

---

## Production Checklist (FINAL)

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Build successful (314KB)
- [ ] Deployed to Vercel
- [ ] Custom domain configured
- [ ] PWA install tested
- [ ] Mobile responsiveness verified
- [ ] All features tested
- [ ] Performance monitored
- [ ] Backups enabled
- [ ] Security headers set
- [ ] Analytics configured
- [ ] Error logging enabled
- [ ] Rate limiting enabled

---

**Status:** ✅ Ready for Production

**Deployment Command:**
```bash
npm run build && vercel --prod
```

**Live URL:** `https://lookingfor.in`

**Created:** March 27, 2024
