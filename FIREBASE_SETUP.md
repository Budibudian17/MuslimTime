# Setup Firebase Authentication

## Langkah-langkah Setup Firebase

### 1. Buat Project Firebase
1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Klik "Create a project" atau "Add project"
3. Masukkan nama project (contoh: "muslimtime-app")
4. Pilih apakah ingin menggunakan Google Analytics (opsional)
5. Klik "Create project"

### 2. Enable Authentication
1. Di Firebase Console, pilih project Anda
2. Di sidebar kiri, klik "Authentication"
3. Klik "Get started"
4. Pilih tab "Sign-in method"
5. Enable "Email/Password" provider
6. Klik "Save"

### 3. Dapatkan Konfigurasi Firebase
1. Di Firebase Console, klik ikon gear (Settings) di sidebar
2. Pilih "Project settings"
3. Scroll ke bawah ke bagian "Your apps"
4. Klik "Web" icon (</>) untuk menambahkan web app
5. Masukkan nama app (contoh: "MuslimTime Web")
6. Klik "Register app"
7. Copy konfigurasi Firebase yang diberikan

### 4. Setup Environment Variables
1. Buat file `.env.local` di root project
2. Masukkan konfigurasi Firebase:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 5. Test Authentication
1. Jalankan aplikasi: `npm run dev`
2. Buka `http://localhost:3000`
3. Klik "Daftar" untuk membuat akun baru
4. Klik "Masuk" untuk login dengan akun yang sudah ada
5. Test logout dengan klik menu user di pojok kanan atas

## Fitur Authentication yang Tersedia

- ✅ Register dengan email dan password
- ✅ Login dengan email dan password
- ✅ Logout
- ✅ Protected routes
- ✅ User state management
- ✅ Form validation dengan Zod
- ✅ Error handling
- ✅ Loading states
- ✅ Responsive design

## Struktur File Authentication

```
lib/
├── firebase.ts              # Konfigurasi Firebase
├── auth.ts                  # Fungsi authentication
└── contexts/
    └── AuthContext.tsx      # Context untuk state management

components/auth/
├── LoginForm.tsx            # Form login
├── RegisterForm.tsx         # Form register
├── ProtectedRoute.tsx       # Wrapper untuk protected routes
└── UserMenu.tsx            # Menu user dropdown

app/
├── login/
│   └── page.tsx            # Halaman login
└── register/
    └── page.tsx            # Halaman register
```

## Troubleshooting

### Error: "Firebase: Error (auth/invalid-api-key)"
- Pastikan API key di `.env.local` sudah benar
- Restart development server setelah mengubah environment variables

### Error: "Firebase: Error (auth/email-already-in-use)"
- Email sudah terdaftar, gunakan email lain atau coba login

### Error: "Firebase: Error (auth/weak-password)"
- Password harus minimal 6 karakter

### Error: "Firebase: Error (auth/invalid-email)"
- Format email tidak valid

## Security Notes

- Jangan commit file `.env.local` ke repository
- Gunakan Firebase Security Rules untuk melindungi data
- Enable email verification jika diperlukan
- Pertimbangkan untuk menambahkan rate limiting
