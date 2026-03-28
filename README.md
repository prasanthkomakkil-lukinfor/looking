# LookingFor.in - Controlled Reverse Marketplace MVP

A production-ready reverse classifieds platform where users post requirements and providers request approval-based chats.

## ✨ Key Features

### 🔐 WhatsApp Authentication
- Phone-verified login (no passwords)
- 4-digit code via WhatsApp
- Auto-creates user on first login

### 📋 Requirement Posting
- Real Estate (5 categories) or Services (8 categories)
- Public or Anonymous posting
- Optional budget specification
- 30-day auto-expiry

### 💬 Approval-Based Chat
- **REQUEST → APPROVAL → CHAT** workflow
- Providers cannot contact directly
- Seekers approve each request
- Rejection or blocking options

### 🔒 Contact Protection (CRITICAL)
- Phone number ALWAYS locked by default
- Visible only after: Chat accepted + User is premium
- Builds trust and prevents spam

### 💳 Premium Plans
- **Individuals:** ₹499/year (5 posts, unlimited chat)
- **Service Providers:** ₹1499-2499/year (25-unlimited responses)
- **Real Estate Agents:** ₹3000-3999/year (30-unlimited listings)

### 🚀 Progressive Web App
- Install to home screen
- Offline support
- App-like experience
- Works on iOS & Android

### 🎯 Mobile-First Design
- Fully responsive
- Touch-optimized
- Fast loading (314KB gzipped)

## 🏗️ Architecture

### Tech Stack
- **Frontend:** React 18 + TypeScript
- **Styling:** Tailwind CSS
- **Backend:** Supabase (PostgreSQL)
- **Auth:** WhatsApp OTP
- **PWA:** Manifest + Service Worker
- **Build:** Vite

### Key Tables
- `users` - User profiles
- `requirements` - Posted requirements
- `chat_requests` - Chat approval flow
- `chat_messages` - Messages (with limits)
- `subscriptions` - Premium plans
- `premium_plans` - Plan definitions

## 🔄 Core Workflows

### Seeker Flow
1. Login via WhatsApp
2. Post requirement (public or anonymous)
3. Receive chat requests from providers
4. Accept/Reject/Block requests
5. Chat with approved providers
6. Contact visible after approval (if premium)

### Provider Flow
1. Login via WhatsApp
2. Browse active requirements
3. Send chat request with intro message
4. Wait for seeker approval
5. Chat once approved
6. Contact details visible (if seeker is premium)

## 🛡️ Trust Signals

**Throughout the UI:**
- ✅ "You approve who can chat with you"
- ✅ "No spam. No unwanted calls"
- ✅ "Your number is never shared without permission"
- 🔒 "Contact details locked until approval and premium"
- 🔒 Anonymous badge on private posts

## 📱 Navigation

4-tab interface:
- **Home** - Browse requirements
- **Post** - Create requirement
- **Chats** - Manage requests & messages
- **Dashboard** - Your posts & stats

## 🚀 Getting Started

### Setup
```bash
# Install dependencies
npm install

# Set environment variables
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# Development
npm run dev

# Production build
npm run build

# Deploy
npm run build && vercel --prod
```

### Features Checklist
- ✅ WhatsApp login
- ✅ Requirement posting (public/anonymous)
- ✅ Strict chat approval system
- ✅ Contact protection (locked by default)
- ✅ Message limits (3 free, unlimited premium)
- ✅ Premium plan enforcement
- ✅ Trust signals throughout
- ✅ PWA support
- ✅ Mobile-optimized
- ✅ Production build (314KB gzipped)

## 📊 Build Stats

```
dist/index.html                 1.99 kB │ gzip:  0.83 kB
dist/assets/index-XXX.css      21.29 kB │ gzip:  4.37 kB
dist/assets/index-XXX.js      314.71 kB │ gzip: 90.10 kB
Total: 314.71 kB gzipped
```

## 🎨 Design Principles

- **Mobile-first:** Optimized for phones first
- **Clear hierarchy:** Important info first
- **Trust-focused:** Security signals everywhere
- **Minimal:** Only essential features
- **Fast:** < 1s page load
- **Accessible:** Touch-friendly, readable

## 🔐 Security

- **RLS Policies:** Row-level security on all tables
- **Contact locked:** Phone never visible without approval + premium
- **Message limits:** Enforced at database level
- **Phone verified:** WhatsApp authentication only
- **No passwords:** Eliminates credential theft

## 📋 Categories

**Real Estate:** Rent | Buy | Commercial | PG/Shared | Flatmate/Roommate

**Services:** Electrician | Plumber | Cleaner | AC Repair | Carpenter | Painter | Housemaid | Houseman

## 💰 Monetization

- Free: 1 post, 3 messages/chat
- Premium: ₹499-3999/year
- Post limits enforced
- Message limits enforced
- Razorpay integration ready

## 🎯 Product Vision

> Post what you need. Providers find you. You decide who contacts you. No spam. No unwanted calls.

A controlled, trust-first marketplace where users have complete control over their contact information and communications.

## 📚 Documentation

See `MVPDOC.md` for comprehensive technical documentation.

## ✅ Status

**Production Ready** - All core features implemented and tested.

- Built with React + TypeScript
- Fully responsive
- PWA-enabled
- RLS secured
- Premium enforced
- Trust signals everywhere

---

**Created:** March 27, 2024
**Status:** ✅ Production Ready
**Build:** 314KB gzipped
