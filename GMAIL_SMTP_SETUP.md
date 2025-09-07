# 📧 Gmail SMTP Setup - MuslimTime

## 🎯 **Overview:**

Sekarang sistem OTP sudah mendukung pengiriman email asli menggunakan Gmail SMTP! Ada dua mode:
1. **Development Mode:** OTP ditampilkan di console browser (default)
2. **Production Mode:** OTP dikirim ke email asli menggunakan Gmail SMTP

## 🔧 **Setup Gmail SMTP:**

### **Step 1: Enable 2-Factor Authentication**
1. Buka [https://myaccount.google.com/security](https://myaccount.google.com/security)
2. Login ke akun Gmail Anda
3. Klik **"2-Step Verification"**
4. Ikuti instruksi untuk enable 2FA

### **Step 2: Generate App Password**
1. Setelah 2FA aktif, kembali ke [https://myaccount.google.com/security](https://myaccount.google.com/security)
2. Klik **"App passwords"** (di bawah 2-Step Verification)
3. Pilih **"Mail"** dan **"Other (Custom name)"**
4. Masukkan nama: **"MuslimTime"**
5. Klik **"Generate"**
6. **Copy App Password** yang dihasilkan (16 karakter)

### **Step 3: Update Environment Variables**
Buat file `.env.local` di root project:

```env
# Firebase Configuration (sudah ada)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Gmail SMTP Configuration (tambahkan ini)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password
```

### **Step 4: Restart Application**
```bash
# Stop aplikasi (Ctrl+C)
# Restart aplikasi
npm run dev
```

## 🚀 **Cara Kerja Sistem:**

### **Development Mode (Default):**
```typescript
// Jika Gmail tidak dikonfigurasi, sistem akan:
1. Generate OTP code
2. Store di Firestore
3. Tampilkan di console browser dengan format yang bagus
4. User copy kode dari console
```

### **Production Mode:**
```typescript
// Jika Gmail dikonfigurasi, sistem akan:
1. Generate OTP code
2. Store di Firestore
3. Kirim email asli ke Gmail user
4. User cek email dan masukkan kode
```

## 📱 **Testing:**

### **1. Test Development Mode:**
```bash
# Jalankan aplikasi tanpa Gmail config
npm run dev

# Buka browser dan buka Developer Tools (F12)
# Daftar akun baru
# Lihat console untuk OTP code dengan format yang bagus
```

### **2. Test Production Mode:**
```bash
# Setup Gmail SMTP (ikuti langkah di atas)
# Update .env.local dengan Gmail credentials
# Restart aplikasi
npm run dev

# Daftar akun baru
# Cek email Gmail untuk OTP code
```

## 🎨 **Email Template:**

Email yang dikirim akan memiliki format yang bagus dengan:

- **Header:** Logo MuslimTime dengan gradient biru
- **Content:** Pesan dalam bahasa Indonesia
- **OTP Code:** Kode 6 digit dengan styling khusus
- **Warning:** Informasi masa berlaku dan batas percobaan
- **Footer:** Signature tim MuslimTime

## 🔒 **Security Features:**

### **1. Gmail App Password:**
- ✅ **Tidak menggunakan password utama** Gmail
- ✅ **App-specific password** yang aman
- ✅ **Bisa di-revoke** kapan saja
- ✅ **2FA required** untuk generate

### **2. Rate Limiting:**
- ✅ **3 attempts max** per OTP
- ✅ **10 minutes expiry** per OTP
- ✅ **One-time use** (kode dihapus setelah berhasil)

### **3. Error Handling:**
- ✅ **Fallback to console** jika Gmail gagal
- ✅ **Clear error messages** untuk user
- ✅ **Retry mechanism** untuk failed sends

## 🛠️ **Troubleshooting:**

### **Problem: Email tidak terkirim**
```bash
# Check 1: Gmail Configuration
echo $GMAIL_USER
echo $GMAIL_APP_PASSWORD

# Check 2: 2FA Status
# Pastikan 2FA sudah aktif di Gmail

# Check 3: App Password
# Pastikan App Password sudah dibuat dengan benar

# Check 4: Console Errors
# Buka Developer Tools → Console
# Lihat error messages
```

### **Problem: "Invalid login" error**
```bash
# Solution 1: Check App Password
# Pastikan App Password 16 karakter dan tidak ada spasi

# Solution 2: Regenerate App Password
# Hapus App Password lama, buat yang baru

# Solution 3: Check 2FA
# Pastikan 2FA sudah aktif
```

### **Problem: Email masuk spam**
```bash
# Solution 1: Add to Whitelist
# Tambahkan Gmail address ke whitelist

# Solution 2: Check Gmail Settings
# Pastikan Gmail tidak memblokir aplikasi

# Solution 3: Use Different Gmail
# Coba dengan Gmail account yang berbeda
```

## 📊 **Monitoring:**

### **1. Console Logs:**
```typescript
// Development mode logs
📧 OTP EMAIL SIMULATION (Gmail not configured)
📬 To: user@example.com
🔐 OTP Code: 123456
⏰ Expires in: 10 minutes
📱 App: MuslimTime

// Production mode logs
📧 Email sent successfully: <message-id>
```

### **2. Gmail Sent Items:**
- **Sent emails** akan muncul di Gmail Sent folder
- **Delivery status** bisa dicek di Gmail
- **Bounce handling** otomatis oleh Gmail

## 🎯 **Best Practices:**

### **1. Gmail Security:**
- ✅ **Use App Password** bukan password utama
- ✅ **Enable 2FA** untuk keamanan
- ✅ **Regular password rotation** untuk App Password
- ✅ **Monitor sent emails** di Gmail

### **2. Error Handling:**
- ✅ **Graceful fallback** ke console mode
- ✅ **User-friendly messages** untuk errors
- ✅ **Retry options** untuk failed sends

### **3. Performance:**
- ✅ **Async email sending** untuk non-blocking
- ✅ **Timeout handling** untuk slow connections
- ✅ **Connection pooling** untuk Gmail SMTP

## 🚀 **Deployment:**

### **1. Environment Variables:**
```bash
# Production deployment
# Pastikan semua env vars sudah set:
GMAIL_USER=production-email@gmail.com
GMAIL_APP_PASSWORD=production-app-password
```

### **2. Gmail Limits:**
- **Free Gmail:** 500 emails/day
- **Google Workspace:** 2000 emails/day
- **Rate Limits:** 100 emails/hour

## 🎉 **Summary:**

### **What's New:**
1. ✅ **Real Email Sending** via Gmail SMTP
2. ✅ **Console Fallback** untuk development
3. ✅ **Professional Email Templates** dengan HTML
4. ✅ **Error Handling** dan retry logic
5. ✅ **Environment Configuration**

### **User Experience:**
- **Development:** OTP muncul di console (mudah testing)
- **Production:** OTP dikirim ke email asli (user-friendly)

### **Setup Time:**
- **Gmail Setup:** ~5 menit
- **App Password:** ~2 menit
- **Environment Config:** ~1 menit

---

**🎉 Gmail SMTP Sudah Siap!** Sekarang OTP bisa dikirim ke email asli atau ditampilkan di console untuk testing. User experience jauh lebih baik! 📧✨
