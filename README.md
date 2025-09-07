# MuslimTime

Assalamu'alaikum. MuslimTime is a web application with an Islamic theme for reading the Qur'an, listening to murottal (Qur'an recitations), viewing prayer times, and managing user accounts with email verification and OTP. The UI features a calming blue palette with Islamic elements and supports both light and dark themes.

> "And We send down in the Qur'an that which is a healing and a mercy to those who believe." — QS. Al‑Isrā': 82

## Main Features
- Al‑Qur'an:
  - List of Surahs and Juz, Surah detail pages with Grid and Mushaf views
  - Last reading/progress sync in the sidebar
  - Minimalist murottal player
- Prayer Times: automatic location + manual refresh
- Firebase Authentication: Register, Login, Remember Me
- Email Verification & OTP via Gmail SMTP (console fallback for dev)
- Theme: automatic light/dark and manual toggle
- UI/UX: Shadcn components + Tailwind, mobile/desktop support

## Technology Stack
- Next.js 14 (App Router) + TypeScript
- Firebase (Auth, Firestore, Storage)
- Tailwind CSS + Shadcn UI + Lucide Icons
- Nodemailer (Gmail SMTP) for OTP/Email

## Getting Started
### 1) Prerequisites
- Node.js 18+
- Firebase Account & Project
- Gmail Account (enable 2FA + App Password)

### 2) Environment Configuration
Create a `.env.local` file in the project root:
