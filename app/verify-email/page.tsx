'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { sendVerificationEmail } from '@/lib/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const { user, loading } = useAuth();
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/login';
    }
    // If user is verified, redirect to dashboard
    if (!loading && user && user.emailVerified) {
      window.location.href = '/';
    }
  }, [user, loading]);

  const handleResendVerification = async () => {
    if (!user || !auth.currentUser) return;
    
    setIsSending(true);
    setMessage(null);
    
    try {
      const { error } = await sendVerificationEmail(auth.currentUser);
      
      if (error) {
        setMessage({ type: 'error', text: error });
      } else {
        setMessage({ 
          type: 'success', 
          text: 'Email verifikasi telah dikirim ulang. Silakan cek email Anda.' 
        });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan saat mengirim email.' });
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!user || user.emailVerified) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background dengan tema biru-putih */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-400 to-blue-500">
        {/* Pattern overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute top-1/4 right-10 w-24 h-24 bg-blue-400/20 rounded-full blur-lg"></div>
        <div className="absolute bottom-1/4 left-1/4 w-40 h-40 bg-sky-400/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 right-1/4 w-28 h-28 bg-blue-300/20 rounded-full blur-xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md sm:max-w-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full mb-4 border border-white/20">
              <Mail className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 drop-shadow-lg">
              Verifikasi Email
            </h1>
            <p className="text-white/80 text-base sm:text-lg px-4">
              Silakan verifikasi email Anda untuk melanjutkan
            </p>
          </div>

          {/* Verification Card */}
          <div className="backdrop-blur-md bg-white/20 rounded-2xl border border-white/30 shadow-2xl p-6 sm:p-8">
            <div className="text-center space-y-6">
              {user.emailVerified ? (
                <div className="space-y-4">
                  <CheckCircle className="h-16 w-16 text-green-400 mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">Email Terverifikasi!</h3>
                    <p className="text-white/70">
                      Email Anda sudah terverifikasi. Anda dapat melanjutkan ke dashboard.
                    </p>
                  </div>
                  <Button asChild className="w-full bg-white hover:bg-gray-100 text-sky-600">
                    <Link href="/">Lanjut ke Dashboard</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <AlertCircle className="h-16 w-16 text-yellow-400 mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">Email Belum Terverifikasi</h3>
                    <p className="text-white/70">
                      Kami telah mengirim email verifikasi ke <strong>{user.email}</strong>
                    </p>
                  </div>
                  
                  {message && (
                    <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
                      <AlertDescription className={message.type === 'error' ? 'text-red-200' : 'text-green-200'}>
                        {message.text}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-3">
                    <Button 
                      onClick={handleResendVerification}
                      disabled={isSending}
                      className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 hover:border-white/50"
                    >
                      {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Kirim Ulang Email Verifikasi
                    </Button>
                    
                    <Button asChild variant="ghost" className="w-full text-white/70 hover:text-white">
                      <Link href="/login">Kembali ke Login</Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer text */}
          <div className="text-center mt-6 sm:mt-8 px-4">
            <p className="text-white/60 text-xs sm:text-sm leading-relaxed">
              "Dan barangsiapa yang bertakwa kepada Allah, niscaya Dia akan mengadakan baginya jalan keluar"
            </p>
            <p className="text-white/40 text-xs mt-2">QS. At-Talaq: 2</p>
          </div>
        </div>
      </div>
    </div>
  );
}
