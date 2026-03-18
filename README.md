# SkillBrew ROI Calculator

An interactive ROI calculator that shows how much time and money [SkillBrew](https://skillbrew.com) saves across different hiring models — **Staffing Agencies**, **Corporates**, and **Startups**.

Built with React + TypeScript + Vite.

---

## 🚀 Features

### Three Calculator Tabs

| Tab | Target User | Key Insight |
|-----|------------|-------------|
| **For Staffing Agency** | Recruitment agencies | Revenue uplift + screening cost reduction |
| **For Corporates** | In-house HR teams | Annual savings vs blended ₹71,800/hire benchmark |
| **For Startups** | Founders & small teams | Founder hours reclaimed (30 hrs → 5 hrs per hire) |

### SkillBrew Pricing (across all tabs)
- **Job Posting** — Free
- **Resume Shortlisting** — Free
- **Assessment** — ₹30 per candidate
- **Interview** — ₹70 per candidate
- **WhatsApp + Email Automation** — Built-in

### Interactive UI
- Real-time slider inputs with animated value updates
- Savings hero card with animated percentage ring
- Metric ticket cards (hours saved, cost reduced, quality improvements)
- Fully responsive layout

---

## 📊 Research Data

Cost benchmarks based on the **India Talent Report 2026** (blended mid-level, ₹8L CTC baseline):

| Entity | Avg Cost Per Hire | Annual (12 hires) |
|--------|------------------|-------------------|
| Staffing Agency | ₹1,23,000 | ₹14.76L |
| Corporate (In-house) | ₹71,800 | ₹8.62L |
| Startup / Small Co. | ₹55,000 | ₹3.30L |

---

## 🛠 Tech Stack

- **React 18** + **TypeScript**
- **Vite** — dev server & build
- **Framer Motion** — animated numbers & SVG ring
- **Recharts** — bar charts (staffing tab)
- **Lucide React** — icons

---

## 📦 Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

---

## 📁 Project Structure

```
src/
├── calculations/
│   ├── staffing.ts        # Staffing agency calculation engine
│   ├── corporate.ts       # Corporate (in-house HR) calculation engine
│   └── startup.ts         # Startup calculation engine
├── components/
│   ├── Calculator.tsx      # Main wrapper with tab navigation
│   ├── ForStaffing.tsx     # Staffing agency tab UI
│   ├── forcorporates.tsx   # Corporate tab UI
│   └── forstartups.tsx     # Startup tab UI
├── main.tsx                # App entry point
└── main.css                # All styles
```

---

## 📄 License

Private — SkillBrew © 2026
