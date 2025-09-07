'use client';

import React, { useState } from 'react';
import { sendOTPEmail } from '@/lib/services/email';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function TestOTPPage() {
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setResult({ type: 'error', message: 'Email harus diisi' });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      console.log('🚀 Starting OTP send process...');
      console.log('📧 Email:', email);
      console.log('🔐 Code:', otpCode || '123456');
      
      const { success, error } = await sendOTPEmail(email, otpCode || '123456');
      
      console.log('📤 Send result:', { success, error });
      
      if (success) {
        setResult({ 
          type: 'success', 
          message: 'Email berhasil dikirim! Cek email Anda atau lihat console browser.' 
        });
      } else {
        setResult({ 
          type: 'error', 
          message: error || 'Gagal mengirim email' 
        });
      }
    } catch (error) {
      console.error('❌ Error in handleSendOTP:', error);
      setResult({ 
        type: 'error', 
        message: 'Terjadi kesalahan saat mengirim email' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateRandomOTP = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setOtpCode(code);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600"></div>
      <div className="absolute inset-0 bg-black/20"></div>
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
              <Mail className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Test OTP Email</h1>
            <p className="text-white/70">
              Debug pengiriman email OTP
            </p>
          </div>

          {/* Test Form */}
          <Card className="backdrop-blur-md bg-white/20 border border-white/30 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white">Email Test</CardTitle>
              <CardDescription className="text-white/70">
                Test pengiriman OTP dengan debug info
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendOTP} className="space-y-4">
                {/* Email Input */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="test@example.com"
                    className="bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-white/50 focus:ring-white/20"
                    disabled={isLoading}
                  />
                </div>

                {/* OTP Code Input */}
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-white">
                    OTP Code (optional)
                  </Label>
                  <div className="flex space-x-2">
                    <Input
                      id="otp"
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="123456"
                      maxLength={6}
                      className="bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-white/50 focus:ring-white/20"
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      onClick={generateRandomOTP}
                      disabled={isLoading}
                      className="bg-white/20 hover:bg-white/30 text-white border border-white/30 hover:border-white/50"
                    >
                      Random
                    </Button>
                  </div>
                </div>

                {/* Result */}
                {result && (
                  <Alert className={result.type === 'error' ? 'bg-red-500/20 border-red-500/50' : 'bg-green-500/20 border-green-500/50'}>
                    <AlertDescription className={result.type === 'error' ? 'text-red-200' : 'text-green-200'}>
                      {result.message}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-white hover:bg-gray-100 text-sky-600 border border-white hover:border-gray-200 transition-all duration-200 font-medium"
                  disabled={isLoading || !email}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Test OTP
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Debug Info */}
          <div className="mt-6 space-y-4">
            <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
              <h4 className="text-blue-200 font-medium mb-2">🔧 Debug Info:</h4>
              <ul className="text-blue-200/80 text-sm space-y-1">
                <li>• Buka Developer Tools (F12) → Console</li>
                <li>• Lihat log "🚀 Starting OTP send process..."</li>
                <li>• Check API call ke /api/send-otp</li>
                <li>• Lihat response dari server</li>
              </ul>
            </div>

            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
              <h4 className="text-yellow-200 font-medium mb-2">📧 Email Status:</h4>
              <ul className="text-yellow-200/80 text-sm space-y-1">
                <li>• Development: OTP muncul di console server</li>
                <li>• Production: OTP dikirim ke email asli</li>
                <li>• Check terminal/console untuk server logs</li>
              </ul>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <a
              href="/"
              className="text-white/70 hover:text-white transition-colors"
            >
              ← Kembali ke Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
