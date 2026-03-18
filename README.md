# 🌱 RiseNow — Helping Strugglers Stand Again

> A fully responsive career guidance & motivation platform built for job seekers, career switchers, and people starting over — with zero budget and free resources.

**🔗 Live Demo:** [bhaskar0111.github.io/Rise-Now](https://bhaskar0111.github.io/Rise-Now/)

---

## 📌 Problem Statement

Millions of Indians face career setbacks — job loss, wrong field, no guidance — but premium career coaching costs ₹10,000–50,000. Free resources exist but are scattered, overwhelming, and not curated for beginners.

**RiseNow solves this by providing:**
- Curated, structured learning paths for in-demand careers
- Real success stories that feel relatable (not celebrity rags-to-riches)
- Mental support resources for people who feel stuck
- A free 1:1 career guidance call option

---

## ✨ Features

| Feature | Description |
|---|---|
| 🗺️ Career Path Modals | Click-to-open roadmaps for Data Analytics, Web Dev, Digital Marketing, Graphic Design — with free resource links |
| 📈 Progress Tracker | Checklist with localStorage — tracks your learning progress across sessions |
| 📖 Inline Success Stories | 4 real-style comeback stories readable in modal — no broken links |
| 🌙 Dark / Light Mode | Theme toggle with localStorage persistence |
| 🇮🇳 Hindi Toggle | Bilingual support — English / Hindi switching |
| 📱 Responsive Design | Mobile-first with hamburger nav, all screen sizes |
| 💬 WhatsApp Integration | Floating CTA button with pre-filled message |
| 📧 Newsletter (Formspree) | Email collection with zero backend — GitHub Pages compatible |
| 🗓️ Book a Call | Calendly-ready 1:1 career guidance section |
| 🔗 Share Buttons | Web Share API + WhatsApp sharing on every story |
| ♿ Accessibility | Semantic HTML, ARIA labels, keyboard navigation |
| 📊 Google Analytics | User behavior tracking integrated |

---

## 🛠️ Tech Stack

```
Frontend    → HTML5, CSS3, Vanilla JavaScript
Hosting     → GitHub Pages (free, zero cost)
Forms       → Formspree (static-site compatible)
Scheduling  → Calendly embed
Analytics   → Google Analytics 4
Design      → Custom CSS (no frameworks)
Fonts       → Google Fonts (Segoe UI system stack)
```

**Why no framework?**
Intentional choice — demonstrates deep understanding of core web fundamentals. No build step, no dependencies, instant load time.

---

## 📐 Architecture

```
Rise-Now/
│
├── index.html          # Single-file app — all HTML, CSS, JS
├── README.md           # This file
├── favicon.svg         # Vector favicon
│
└── blog/               # (Planned) Blog articles
    └── first-post.html
```

**Design Decisions:**
- **Single HTML file** — Zero build pipeline, perfect for GitHub Pages, easy to maintain
- **localStorage** — Progress tracking without a backend
- **CSS Variables** — Theme switching (dark/light) without JavaScript CSS manipulation
- **Intersection Observer API** — Performant scroll animations without libraries
- **Web Share API** — Native mobile sharing with clipboard fallback

---

## 🚀 Getting Started

No installation needed. Just open in browser:

```bash
git clone https://github.com/BHASKAR0111/Rise-Now.git
cd Rise-Now
# Open index.html in your browser
```

Or visit the live site: [bhaskar0111.github.io/Rise-Now](https://bhaskar0111.github.io/Rise-Now/)

---

## 🔧 Configuration

To personalize for your own use:

**1. Google Analytics**
```html
<!-- In index.html, replace with your Measurement ID -->
gtag('config', 'G-XXXXXXXXXX');
```

**2. Formspree (Contact + Newsletter)**
```html
<!-- Replace YOUR_FORM_ID in two places -->
action="https://formspree.io/f/YOUR_FORM_ID"
```

**3. Calendly (Book a Call)**
```html
<!-- Replace with your Calendly username -->
href="https://calendly.com/YOUR_USERNAME/30min"
```

**4. WhatsApp Number**
```html
<!-- Replace with your number (with country code, no +) -->
href="https://wa.me/91XXXXXXXXXX?text=..."
```

---

## 📊 Performance

| Metric | Score |
|---|---|
| Zero external CSS dependencies | ✅ |
| No JavaScript frameworks | ✅ |
| GitHub Pages hosted | ✅ Free |
| Mobile responsive | ✅ All breakpoints |
| localStorage persistence | ✅ No backend needed |

---

## 💡 Key Learnings

Building RiseNow taught me:

- **UX over features** — Users need clarity, not more buttons. Every modal was designed to answer one question: "Where do I start?"
- **Static-first thinking** — Formspree, Calendly, Google Analytics — all integrate with static HTML. No server needed for a functional product.
- **localStorage as a database** — Progress tracking, theme preference, language preference — all persisted without a single API call.
- **CSS Variables for theming** — Dark/light mode with `body.light { --bg: #fff }` — cleaner than any library.
- **Intersection Observer** — Replaced scroll event listeners (expensive) with a single observer (performant).

---

## 🗺️ Roadmap

- [ ] Full Hindi translation across all sections
- [ ] Blog section with SEO-optimized articles
- [ ] Custom domain (risenow.in)
- [ ] Testimonials section with real user submissions
- [ ] PWA support (offline access)

---

## 🤝 Connect

Built by **Bhaskar Baluni** — Data Analyst | Python | Power BI

- 🌐 Portfolio: [bhaskar0111.github.io/Bhaskar-Portfolio](https://bhaskar0111.github.io/Bhaskar-Portfolio/)
- 💼 LinkedIn: [linkedin.com/in/bhaskar-baluni](https://www.linkedin.com/in/bhaskar-baluni)
- 🐙 GitHub: [github.com/BHASKAR0111](https://github.com/BHASKAR0111)
- 📧 Email: bhaskarbaluni10@gmail.com

---

> *"Your setback is setting you up for your greatest comeback."*
> 
> — RiseNow

