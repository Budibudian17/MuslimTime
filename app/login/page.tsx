'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    // Only redirect if user is logged in AND email is verified
    if (!loading && user && user.emailVerified) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Check if user just registered (from URL params or session storage)
    const urlParams = new URLSearchParams(window.location.search);
    const fromRegister = urlParams.get('from') === 'register';
    
    if (fromRegister) {
      setShowSuccessMessage(true);
      // Clear the URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Memuat...</p>
        </div>
      </div>
    );
  }

  if (user && user.emailVerified) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background adaptif tema */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-400 to-blue-500 dark:from-slate-900 dark:to-slate-800">
        {/* Pattern overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.18'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 dark:bg-white/5 rounded-full blur-xl"></div>
        <div className="absolute top-1/4 right-10 w-24 h-24 bg-blue-400/20 dark:bg-blue-300/10 rounded-full blur-lg"></div>
        <div className="absolute bottom-1/4 left-1/4 w-40 h-40 bg-sky-400/20 dark:bg-sky-300/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 right-1/4 w-28 h-28 bg-blue-300/20 dark:bg-blue-200/10 rounded-full blur-xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md sm:max-w-lg">
          {/* Header dengan logo dan branding */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full mb-4 border border-white/20">
              <img
                src="/logo.png"
                alt="MuslimTime Logo"
                className="w-12 h-12"
              />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 drop-shadow-lg">
              MuslimTime
            </h1>
            <p className="text-white/80 text-base sm:text-lg px-4">
              Aplikasi Islami untuk Waktu Sholat dan Al-Quran
            </p>
            <div className="mt-4 flex items-center justify-center space-x-2 text-white/60">
              <div className="w-2 h-2 bg-white/40 rounded-full"></div>
              <div className="w-2 h-2 bg-white/60 rounded-full"></div>
              <div className="w-2 h-2 bg-white/40 rounded-full"></div>
            </div>
          </div>

          {/* Success message if coming from register */}
          {showSuccessMessage && (
            <div className="mb-6 space-y-3">
              <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
                <p className="text-green-200 text-center text-sm">
                  ✅ Akun berhasil dibuat! Silakan login dengan email dan password yang baru dibuat.
                </p>
              </div>
              <div className="p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg">
                <p className="text-blue-200 text-center text-sm">
                  📧 <strong>Penting:</strong> Pastikan Anda sudah memverifikasi email sebelum login. Cek folder spam jika email tidak muncul.
                </p>
              </div>
            </div>
          )}

          {/* Login Form dengan glassmorphism effect */}
          <div className="backdrop-blur-md bg-white/20 dark:bg-white/5 rounded-2xl border border-white/30 dark:border-white/10 shadow-2xl p-6 sm:p-8">
            <LoginForm />
          </div>

          {/* Footer text */}
          <div className="text-center mt-6 sm:mt-8 px-4">
            <p className="text-white/60 dark:text-white/70 text-xs sm:text-sm leading-relaxed">
              "Dan barangsiapa yang bertakwa kepada Allah, niscaya Dia akan mengadakan baginya jalan keluar"
            </p>
            <p className="text-white/40 dark:text-white/50 text-xs mt-2">QS. At-Talaq: 2</p>
          </div>
        </div>
      </div>
    </div>
  );
}
