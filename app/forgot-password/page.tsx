'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { sendPasswordReset } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const forgotPasswordSchema = z.object({
  email: z.string().email('Email tidak valid'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [emailSent, setEmailSent] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await sendPasswordReset(data.email);
      
      if (error) {
        setError(error);
      } else {
        setSuccess(true);
        setEmailSent(data.email);
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengirim email reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Background dengan gradient biru */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-400 to-blue-500"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-40 right-10 w-16 h-16 bg-white/5 rounded-full blur-xl"></div>

        <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-md">
            <Card className="backdrop-blur-md bg-white/20 border border-white/30 shadow-2xl text-white">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
                <CardTitle className="text-2xl font-bold text-white">Email Terkirim!</CardTitle>
                <CardDescription className="text-white/70">
                  Kami telah mengirim link reset password ke email Anda
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-blue-300 mt-0.5" />
                    <div>
                      <p className="text-blue-200 text-sm font-medium">
                        Email dikirim ke: <span className="font-semibold">{emailSent}</span>
                      </p>
                      <p className="text-blue-200/80 text-xs mt-1">
                        Silakan cek inbox atau folder spam Anda
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
                  <p className="text-yellow-200 text-sm">
                    <strong>Penting:</strong> Link reset password akan berlaku selama 1 jam. 
                    Jika tidak menerima email dalam beberapa menit, silakan coba lagi.
                  </p>
                </div>

                <div className="space-y-3">
                  <Button 
                    onClick={() => window.location.href = '/login'} 
                    className="w-full bg-white hover:bg-gray-100 text-sky-600 border border-white hover:border-gray-200 transition-all duration-200 font-medium"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali ke Login
                  </Button>
                  
                  <Button 
                    onClick={() => {
                      setSuccess(false);
                      setEmailSent('');
                    }} 
                    variant="outline"
                    className="w-full bg-transparent hover:bg-white/10 text-white border-white/30 hover:border-white/50 transition-all duration-200"
                  >
                    Kirim Ulang Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background dengan gradient biru */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-400 to-blue-500"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
      <div className="absolute top-40 right-20 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
      <div className="absolute bottom-20 left-20 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-40 right-10 w-16 h-16 bg-white/5 rounded-full blur-xl"></div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          <Card className="backdrop-blur-md bg-white/20 border border-white/30 shadow-2xl text-white">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-white">Lupa Password?</CardTitle>
              <CardDescription className="text-white/70">
                Masukkan email Anda dan kami akan mengirim link untuk reset password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                    <p className="text-red-200 text-sm">{error}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/90 font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    {...register('email')}
                    disabled={isLoading}
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:border-white/50 focus:ring-white/30"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-300">{errors.email.message}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-white hover:bg-gray-100 text-sky-600 border border-white hover:border-gray-200 transition-all duration-200 font-medium" 
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Kirim Link Reset Password
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="text-sm text-white hover:text-white/80 underline underline-offset-4 transition-colors"
                >
                  <ArrowLeft className="inline h-4 w-4 mr-1" />
                  Kembali ke Login
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
