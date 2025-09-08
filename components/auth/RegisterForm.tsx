'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { registerUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const registerSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, redirectTo = '/' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { user, error, otpSent, message } = await registerUser(data.email, data.password, data.displayName);
      
      if (error) {
        setError(error);
      } else if (otpSent) {
        // Store registration data for OTP verification
        sessionStorage.setItem('registrationData', JSON.stringify({
          email: data.email,
          password: data.password,
          displayName: data.displayName
        }));
        
        setSuccess(true);
        onSuccess?.();
      }
    } catch (err) {
      setError('An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full">
        <div className="text-center space-y-4">
          <CheckCircle className="h-16 w-16 text-green-400 mx-auto" />
          <div>
            <h3 className="text-lg font-semibold text-white">Verification Code Sent!</h3>
            <p className="text-white/70 mb-4">
              We've sent a 6-digit verification code to your email. Please check your inbox and enter the code.
            </p>
            <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-3 mb-4">
              <p className="text-blue-200 text-sm">
                🔐 <strong>OTP Code:</strong> Enter the 6-digit code sent to your email.
              </p>
            </div>
            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 mb-4">
              <p className="text-yellow-200 text-sm">
                ⏰ <strong>Note:</strong> The code is valid for 10 minutes and allows up to 3 attempts.
              </p>
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={() => window.location.href = '/verify-otp'}
                className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-white border border-blue-500/30 hover:border-blue-500/50"
              >
                Verify OTP Code
              </Button>
              <Button 
                onClick={() => window.location.href = '/login'}
                className="flex-1 bg-white/20 hover:bg-white/30 text-white border border-white/30 hover:border-white/50"
              >
                Go to Login
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Sign Up</h2>
        <p className="text-white/70">
          Create a new account to access all features
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
            <Label htmlFor="displayName" className="text-white/90 font-medium">Full Name</Label>
            <Input
              id="displayName"
              type="text"
              placeholder="Enter full name"
              {...register('displayName')}
              disabled={isLoading}
              className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:border-white/50 focus:ring-white/30"
            />
            {errors.displayName && (
              <p className="text-sm text-red-300">{errors.displayName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/90 font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@email.com"
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
                placeholder="Enter password"
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

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-white/90 font-medium">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm password"
                {...register('confirmPassword')}
                disabled={isLoading}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:border-white/50 focus:ring-white/30 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-white/70 hover:text-white"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-300">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full bg-white hover:bg-gray-100 text-sky-600 border border-white hover:border-gray-200 transition-all duration-200 font-medium" 
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign Up
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-white/60">Already have an account? </span>
          <Link
            href="/login"
            className="font-medium text-white hover:text-white/80 underline underline-offset-4 transition-colors"
          >
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
};
