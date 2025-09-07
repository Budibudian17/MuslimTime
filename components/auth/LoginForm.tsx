'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signInUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, redirectTo = '/' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const { user, error } = await signInUser(data.email, data.password, rememberMe);
      
      if (error) {
        setError(error);
      } else if (user) {
        // Check if email is verified
        if (!user.emailVerified) {
          setError('Email belum terverifikasi. Silakan cek email Anda dan klik link verifikasi.');
          return;
        }
        
        onSuccess?.();
        if (typeof window !== 'undefined') {
          window.location.href = redirectTo;
        }
      }
    } catch (err) {
      setError('Terjadi kesalahan saat login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Masuk</h2>
        <p className="text-white/70">
          Masukkan email dan password Anda untuk masuk ke akun
        </p>
      </div>
      <div className="space-y-4">
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

          <div className="space-y-2">
            <Label htmlFor="password" className="text-white/90 font-medium">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Masukkan password"
                {...register('password')}
                disabled={isLoading}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:border-white/50 focus:ring-white/30 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-white/70 hover:text-white"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-300">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember-me"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                disabled={isLoading}
                className="border-white/30 data-[state=checked]:bg-white data-[state=checked]:text-sky-600"
              />
              <Label 
                htmlFor="remember-me" 
                className="text-white/90 text-sm cursor-pointer"
              >
                Ingat saya
              </Label>
            </div>
            <Link
              href="/forgot-password"
              className="text-sm text-white hover:text-white/80 underline underline-offset-4 transition-colors"
            >
              Lupa password?
            </Link>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-white hover:bg-gray-100 text-sky-600 border border-white hover:border-gray-200 transition-all duration-200 font-medium" 
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Masuk
          </Button>
        </form>

        <div className="mt-6 text-center text-sm space-y-2">
          <div>
            <span className="text-white/60">Belum punya akun? </span>
            <Link
              href="/register"
              className="font-medium text-white hover:text-white/80 underline underline-offset-4 transition-colors"
            >
              Daftar sekarang
            </Link>
          </div>
          {/* <div>
            <span className="text-white/60">Email belum terverifikasi? </span>
            <Link
              href="/verify-email"
              className="font-medium text-white hover:text-white/80 underline underline-offset-4 transition-colors"
            >
              Verifikasi email
            </Link>
          </div> */}
        </div>
      </div>
    </div>
  );
};
