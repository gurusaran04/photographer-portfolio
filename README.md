# Muthukumaran — Visual Storyteller & Photographer Portfolio

A modern, high-performance portfolio website and CMS dashboard built for photographer **Muthukumaran** (Chennai, India).

---

## 🌟 Key Features

1. **Public Portfolio (`/`)**
   - **Hero Section**: Dynamic background image grid highlighting latest visuals, animated branding typography, and quick call-to-actions.
   - **Studio Accomplishments**: Live stats bar with customizable numbers and labels.
   - **Interactive Masonry Gallery**: Category filters (Portrait, Street, Landscape, Wedding, Fashion, Sports, etc.), responsive masonry layout, and fullscreen lightbox modal with next/prev controls.
   - **Bio & Gear Specs**: Artist narrative, equipment breakdown, and dynamic skill tags.
   - **Packages & Services**: Photography session pricing cards with customizable icons and details.
   - **Client Endorsements**: Star reviews and client testimonials.
   - **Interactive Contact Form**: Direct inquiry form with real-time database logging and EmailJS dispatch matching the studio design.
   - **Responsive Design**: Full mobile support with slide-out hamburger navigation and custom desktop gold cursor.

2. **Studio Admin CMS (`/admin`)**
   - **Security & Access**: Protected dashboard with customizable admin passcode (stored in portfolio settings) and session memory across reloads.
   - **Gallery Manager**: Instant photo insertion (via drag-and-drop auto-compressed image upload or direct URL) and deletion. Changes synchronize immediately with the public portfolio.
   - **Hero & Stats Editor**: Live editing of name, tagline, and dynamic addition/removal of achievement metrics.
   - **Bio & Skills Manager**: Update biography, profile image, gear specs, and add/remove discipline skill tags.
   - **Photography Packages**: Create packages with custom icons, prices, and descriptions.
   - **Client Reviews**: Add and delete client ratings and feedback.
   - **Contacts Inquiry Ledger**: View incoming inquiries from the contact form with sender details, timestamps, and 1-click email reply links.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite 8, React Router v7
- **Styling**: Bootstrap 5.3 CDN, Bootstrap Icons v1.13, Google Fonts (*Cormorant Garamond* & *Outfit*)
- **Database / Backend**: Supabase (PostgreSQL) with automatic multi-tier `localStorage` fallback
- **Email Dispatch**: EmailJS (`@emailjs/browser`)

---

## 🗄️ Supabase SQL Database Schema

To set up the cloud database tables in your Supabase SQL editor:

```sql
-- 1. Create table for portfolio settings and content
CREATE TABLE IF NOT EXISTS portfolio_settings (
  id TEXT PRIMARY KEY,
  hero JSONB,
  stats JSONB,
  about JSONB,
  services JSONB,
  gallery JSONB,
  testimonials JSONB,
  contact JSONB,
  adminPassword TEXT DEFAULT 'admin123',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Create table for contact form inquiries (leads)
CREATE TABLE IF NOT EXISTS portfolio_leads (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable public read/write access (or configure RLS according to your security requirements)
ALTER TABLE portfolio_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read and write on portfolio_settings"
  ON portfolio_settings FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read and insert on portfolio_leads"
  ON portfolio_leads FOR ALL USING (true) WITH CHECK (true);
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables (`.env`)
Create a `.env` file in the project root:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_ADMIN_PASSWORD=admin123
```
*(Note: If Supabase is offline or not configured, the application automatically runs using local persistent storage)*

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

---

## 🔐 Admin Access

- **Route**: Navigate to `/admin` or click the lock icon in the navigation bar.
- **Default Passcode**: `admin123`
- You can change your admin password anytime under the **Security & Access** tab in the dashboard.
