<div align="center">

<img src="public/logo.png" alt="MuslimTime Logo" width="96" />

# MuslimTime ✨

A serene, Islamic-themed web app to read the Qur'an, listen to beautiful recitations, track prayer times, and manage user accounts with email verification and OTP. Designed with a calming blue palette, subtle Islamic accents, and full light/dark theme support.

> “And We send down of the Qur’an that which is healing and mercy for the believers.” — Qur’an 17:82

</div>

---

## Features 🌙
- 📖 Qur'an
  - Surah and Juz lists
  - Surah detail with Grid view and Mushaf view
  - Smooth reading progress syncing (sidebar)
  - Minimal, accessible audio player
- 🕌 Prayer Times
  - Auto geolocation + manual refresh
- 🔐 Authentication (Firebase)
  - Register, Login, Remember Me
  - Email Verification & OTP (Gmail SMTP with dev fallback)
- 🎨 Theming
  - Light/Dark system + manual toggle
  - Night hero banner switches to `public/night.png` in dark mode
- ⚙️ Modern UI/UX
  - Tailwind + Shadcn UI + Lucide Icons
  - Mobile‑first, desktop‑ready

## Tech Stack 🧰
- Next.js 14 (App Router) + TypeScript
- Firebase (Auth, Firestore, Storage)
- Tailwind CSS + Shadcn UI
- Nodemailer (Gmail SMTP) for emails/OTP

---

## Quick Start 🚀
### 1) Requirements
- Node.js 18+
- Firebase project
- Gmail with 2FA + App Password (for real email sending)

### 2) Environment Variables
Create `.env.local` in project root:

```
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Gmail SMTP (optional for dev, recommended for prod)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password
```

If `GMAIL_USER` and `GMAIL_APP_PASSWORD` are missing, OTP email falls back to console logs (dev‑friendly).

### 3) Install & Run
```
pnpm install   # or npm install / yarn
pnpm dev       # http://localhost:3000
```

> Tip: Use `pnpm build && pnpm start` for production.

---

## Project Structure 🗂️
```
app/
  api/send-otp/route.ts      # OTP email API (SMTP + fallback)
  surah/[id]/                # Surah detail + Mushaf view
  juz/[id]/                  # Juz detail
components/                  # UI & layout components
lib/                         # Firebase, services, contexts
public/                      # Assets (incl. night.png for dark hero)
```

## Auth & Verification Flow 🔄
1. User registers → OTP sent to email
2. OTP stored temporarily in Firestore (10‑minute expiry, 3 attempts)
3. Verification marks email as verified → reading history persists in Firestore

> In dev, OTP is printed in the console if Gmail isn’t configured.

---

## Design & Accessibility 🎛️
- Hero automatically swaps to `public/night.png` in dark mode
- Skeletons, cards, and buttons include dark variants
- Ghost buttons tuned to avoid harsh white hover in dark mode
- Arabic typography and contrast optimized for readability

<div align="center">
  <img src="public/people.png" alt="Preview" width="480" />
  <br/>
  <sub>Light and dark themes with an Islamic touch.</sub>
</div>

---

## Deployment ☁️
Works on any Next.js‑compatible host (Vercel, Render, etc.). Don’t forget to set env vars in your hosting dashboard.

```
pnpm build
pnpm start
```

---

## Contributing 🤝
- Fork → feature branch → PR
- Keep the visual language consistent (blue Islamic theme, soft gradients)
- Don’t commit secrets; use environment variables

## License 📄
MIT — please use responsibly and kindly.

---

<div align="center">
  With prayers and good intentions — may this app be a means of benefit. <br/>
  <b>Barakallahu fikum.</b>
</div>
