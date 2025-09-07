# MuslimTime

Assalamu'alaikum. MuslimTime adalah aplikasi web bertema Islami untuk membaca Al‑Qur'an, mendengarkan murottal, melihat jadwal sholat, dan mengelola akun pengguna dengan verifikasi email dan OTP. UI mengusung nuansa biru yang tenang dengan sentuhan elemen Islami serta mendukung light/dark theme.

> "Dan Kami turunkan dari Al‑Qur'an (sesuatu) yang menjadi penawar dan rahmat bagi orang-orang yang beriman." — QS. Al‑Isrā': 82

## Fitur Utama
- Al‑Qur'an:
  - Daftar Surah dan Juz, halaman detail Surah dengan tampilan Grid dan Mushaf
  - Sinkronisasi bacaan/riwayat terakhir di sidebar
  - Player murottal minimalis
- Waktu Sholat: lokasi otomatis + refresh manual
- Autentikasi Firebase: Register, Login, Remember Me
- Verifikasi Email & OTP via Gmail SMTP (fallback console untuk dev)
- Tema: light/dark otomatis dan toggle manual
- UI/UX: komponen Shadcn + Tailwind, dukungan mobile/desktop

## Teknologi
- Next.js 14 (App Router) + TypeScript
- Firebase (Auth, Firestore, Storage)
- Tailwind CSS + Shadcn UI + Lucide Icons
- Nodemailer (Gmail SMTP) untuk OTP/Email

## Memulai
### 1) Persiapan
- Node.js 18+
- Akun Firebase & Project
- Akun Gmail (aktifkan 2FA + App Password)

### 2) Konfigurasi Environment
Buat file `.env.local` di root:

```
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Gmail SMTP (opsional untuk dev, wajib untuk produksi)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password
```

Catatan: Jika GMAIL_USER/GMAIL_APP_PASSWORD tidak diisi, pengiriman OTP fallback ke console (mode dev).

### 3) Instalasi & Run
```
pnpm install   # atau npm install / yarn
pnpm dev       # http://localhost:3000
```

## Struktur Proyek (ringkas)
```
app/
  api/send-otp/route.ts      # API pengiriman OTP (SMTP + fallback)
  surah/[id]/                # Halaman Surah + Mushaf view
  juz/[id]/                  # Halaman Juz
components/                  # Komponen UI & layout
lib/                         # Firebase, services, contexts
public/                      # Aset gambar (termasuk night.png untuk dark hero)
```

## Alur Autentikasi & Verifikasi
1) Pengguna register → OTP dikirim via email
2) OTP disimpan sementara di Firestore (masa berlaku 10 menit, max 3 percobaan)
3) Verifikasi → tandai email terverifikasi → riwayat bacaan tersimpan di Firestore

Detail panduan dapat dilihat pada dokumen `.md` di repo ini (opsional untuk dipertahankan) atau dipindahkan ke folder `docs/`.

## Build & Deploy
```
pnpm build
pnpm start   # menjalankan hasil build
```
Deploy ke layanan Next.js compatible (Vercel, Render, dsb). Pastikan environment variables diset di dashboard hosting.

## Tips Desain & Tema
- Hero section otomatis memakai `public/night.png` saat dark mode
- Skeleton & card memiliki varian warna gelap
- Komponen tombol `ghost` disesuaikan agar hover tidak putih menyala

## Kontribusi
- Fork → branch fitur → PR
- Jaga konsistensi tema (biru Islami, tipografi nyaman)
- Hindari menaruh kredensial di repo

## Lisensi
MIT. Mohon gunakan dengan bijak.

---
Semoga aplikasi ini menjadi sarana kebaikan. Barakallahu fikum.
