# LookingFor.in - Production MVP Documentation

## CORE PRODUCT

A **controlled reverse marketplace** where:
- Users post requirements (what they need)
- Providers cannot contact directly
- Every interaction follows: **REQUEST → APPROVAL → CHAT**
- Contact details are ALWAYS locked until approval + premium

---

## 1. AUTHENTICATION: WhatsApp-Based Login

### Flow
1. User enters phone number
2. System generates 4-digit code
3. Button: "Send via WhatsApp"
4. Opens WhatsApp with pre-filled message:
   ```
   Your LookingFor.in login code is: ####
   ```
5. User sends message manually
6. User enters 4-digit code in app
7. Verified and logged in

### Security
- No passwords
- Phone-verified users only
- WhatsApp confirmation ensures real number

---

## 2. CATEGORIES (STRICT - NO OTHERS)

### Real Estate (5 only)
- Rent | Buy | Commercial | PG / Shared | Flatmate / Roommate

### Services (8 only)
- Electrician | Plumber | Cleaner | AC Repair | Carpenter | Painter | Housemaid | Houseman

---

## 3. POST REQUIREMENT

### Fields
- Category + Subcategory (dropdown)
- Location (City + Area)
- Description
- Budget (optional, min/max)
- Toggle: **Public or Anonymous**

### Rules
- **Anonymous** = Name + Phone hidden
- **Public** = Name visible, phone locked until approval
- 1 free post, then premium required
- Auto-expires after 30 days

---

## 4. STRICT CHAT SYSTEM

### NO Direct Messaging - Always REQUEST → APPROVAL → CHAT

**Flow:**
1. Provider clicks "Request Chat"
2. Writes intro message
3. Creates chat request (status: `PENDING`)
4. Seeker sees request
5. Seeker chooses: **Accept / Reject / Block**
6. **ONLY if Accepted:** Chat opens

### Chat States
```
PENDING      = Waiting for seeker approval
ACCEPTED     = Approved, can chat
REJECTED     = Rejected, no contact
BLOCKED      = Blocked, no future requests
```

---

## 5. CONTACT PROTECTION (MOST IMPORTANT)

### Default: ALWAYS LOCKED

Contact (phone) visible **ONLY if:**
1. Chat status = `ACCEPTED`
2. User has active premium subscription

### UI Signals
- 🔒 Lock icon + "Contact details are locked"
- After approval + premium: Phone revealed
- Message: "Contact details locked until approval and premium"

---

## 6. MESSAGE LIMITS

### Free Users
- Max **3 messages per chat**
- Then: Chat input disabled
- Banner: "Upgrade to premium for unlimited messages"

### Premium Users
- Unlimited messages
- Same approval required (always)

---

## 7. PREMIUM PLANS (STRICT ENFORCEMENT)

### Individuals (₹499/year)
- 5 posts
- Unlimited chat messages
- Contact visible after approval

### Service Providers
- ₹1499/year: 25 responses/month
- ₹2499/year: Unlimited responses

### Real Estate Agents
- ₹3000/year: 30 listings/month
- ₹3999/year: Unlimited listings

---

## 8. TRUST SIGNALS (THROUGHOUT UI)

Display on:
- **Login:** ✅ You approve who chats | ✅ No spam | ✅ Number never shared without permission
- **Home:** ✅ Seekers approve all contacts | ✅ Numbers locked until approval
- **Chat Modal:** ✅ Seeker Approval Required | ✅ Contact hidden until approved
- **Chat Screen:** 🔒 Contact details locked | After approval: Premium - Contact visible
- **Cards:** 🔒 Anonymous badge | Chat only opens after approval

---

## 9. USER MESSAGES (EXACT TEXTS)

1. "Chat request sent. Waiting for approval."
2. "Request accepted. You can now chat."
3. "Upgrade to premium for unlimited messages."
4. "Contact details are locked until approval and premium."
5. "You've reached the free message limit. Upgrade to continue."
6. "Identity Protected - Your name and number are hidden"

---

## 10. PWA (PROGRESSIVE WEB APP)

### Features
- Install to home screen
- Offline support
- App-like experience
- Manifest + Service Worker

### Manifest (`public/manifest.json`)
- Name: "LookingFor.in"
- Display: `standalone`
- Theme color: `#000000`
- Icons: 192x192, 512x512 (maskable)

### Service Worker (`public/service-worker.js`)
- Cache static assets
- Network-first for API
- Offline fallback

---

## 11. NAVIGATION (4 TABS)

- **Home:** Browse requirements
- **Post:** Create new requirement
- **Chats:** Manage requests & messages
- **Dashboard:** My posts, stats

---

## 12. DASHBOARDS

### Seeker
- My Posts (status, views)
- Chat Requests (pending/accepted)
- Stats (posts, chats)

### Provider
- Browse Requirements (with filter)
- My Requests (status)
- Active Chats
- Response usage (if limited plan)

---

## 13. STATUS FLAGS

```
CHAT_PENDING_APPROVAL  = Waiting for decision
CHAT_ACCEPTED          = Approved, can chat
CHAT_REJECTED          = Rejected
CHAT_BLOCKED           = Blocked

POST_ANONYMOUS = Hide name/phone
CONTACT_LOCKED = Default (until approval + premium)
CONTACT_UNLOCKED = After both conditions met
```

---

## 14. TECHNICAL STACK

- React 18 + TypeScript
- Tailwind CSS (Mobile-first)
- Supabase (Auth + Database)
- WhatsApp OTP
- PWA (Manifest + Service Worker)
- Vite Build

---

## 15. BUILD STATUS

✅ **Production Ready**
- Build Size: 314KB gzipped
- All components refactored
- WhatsApp login implemented
- Chat approval system enforced
- Contact protection active
- PWA ready
- Trust signals throughout

---

## CORE PROMISE

> Post what you need. Providers find you. You decide who contacts you. No spam. No unwanted calls.

---

**Last Updated:** March 27, 2024
