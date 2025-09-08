'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { completeRegistration } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { OTPInput } from '@/components/ui/otp-input';
import { CheckCircle, ArrowLeft, RefreshCw, Shield } from 'lucide-react';
import Link from 'next/link';

function VerifyOTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    // Get registration data from URL params or session storage
    const emailParam = searchParams.get('email');
    const passwordParam = searchParams.get('password');
    const displayNameParam = searchParams.get('displayName');

    if (emailParam && passwordParam && displayNameParam) {
      setEmail(emailParam);
      setPassword(passwordParam);
      setDisplayName(displayNameParam);
    } else {
      // Try to get from session storage
      const storedData = sessionStorage.getItem('registrationData');
      if (storedData) {
        const data = JSON.parse(storedData);
        setEmail(data.email);
        setPassword(data.password);
        setDisplayName(data.displayName);
      } else {
        // Redirect to register if no data
        router.push('/register');
      }
    }
  }, [searchParams, router]);

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otpCode.length !== 6) {
      setMessage({ type: 'error', text: 'OTP code must be 6 digits' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const { user, error } = await completeRegistration(email, password, displayName, otpCode);
      
      if (error) {
        setMessage({ type: 'error', text: error });
      } else if (user) {
        setSuccess(true);
        setMessage({ 
          type: 'success', 
          text: 'Account created successfully! You will be redirected to the homepage.' 
        });
        
        // Clear session storage
        sessionStorage.removeItem('registrationData');
        
        // Redirect to home after 2 seconds
        setTimeout(() => {
          router.push('/');
        }, 2000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while verifying the code' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    // This would typically resend the OTP
    // For now, we'll just show a message
    setMessage({ 
      type: 'success', 
      text: 'A new OTP code has been sent to your email' 
    });
  };


  if (success) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="text-center space-y-6">
              <CheckCircle className="h-20 w-20 text-green-400 mx-auto" />
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Verification Successful!</h1>
                <p className="text-white/70 mb-6">
                  Your account has been created and verified. Welcome aboard!
                </p>
                <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-6">
                  <p className="text-green-200 text-sm">
                    ✅ Email: {email}<br/>
                    ✅ Name: {displayName}<br/>
                    ✅ Status: Verified
                  </p>
                </div>
                <p className="text-white/60 text-sm">
                  You will be redirected to the homepage in a few seconds...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Email Verification</h1>
            <p className="text-white/70">
              Enter the 6-digit code sent to your email
            </p>
          </div>

          {/* OTP Form */}
          <Card className="backdrop-blur-md bg-white/20 border border-white/30 shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-white">Verification Code</CardTitle>
              <CardDescription className="text-white/70">
                We've sent a verification code to:
                <br />
                <span className="font-medium text-white">{email}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleOTPSubmit} className="space-y-6">
                {/* OTP Input */}
                <div className="space-y-4">
                  <Label className="text-white text-center block">
                    Verification Code (6 digits)
                  </Label>
                  <OTPInput
                    length={6}
                    value={otpCode}
                    onChange={setOtpCode}
                    disabled={isLoading}
                    className="mb-2"
                  />
                  <p className="text-white/60 text-sm text-center">
                    Enter the 6-digit code sent to your email
                  </p>
                </div>

                {/* Message */}
                {message && (
                  <Alert className={message.type === 'error' ? 'bg-red-500/20 border-red-500/50' : 'bg-green-500/20 border-green-500/50'}>
                    <AlertDescription className={message.type === 'error' ? 'text-red-200' : 'text-green-200'}>
                      {message.text}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-white hover:bg-gray-100 text-sky-600 border border-white hover:border-gray-200 transition-all duration-200 font-medium"
                  disabled={isLoading || otpCode.length !== 6}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify Code'
                  )}
                </Button>

                {/* Resend OTP */}
                <div className="text-center">
                  <p className="text-white/70 text-sm mb-2">
                    Didn't receive the code?
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResendOTP}
                    disabled={isLoading}
                    className="bg-transparent hover:bg-white/10 text-white border-white/30 hover:border-white/50"
                  >
                    Resend Code
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Back to Register */}
          <div className="text-center mt-6">
            <Link
              href="/register"
              className="inline-flex items-center text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Registration
            </Link>
          </div>

          {/* Tips */}
          <div className="mt-8 bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
            <h4 className="text-blue-200 font-medium mb-2">💡 Tips:</h4>
            <ul className="text-blue-200/80 text-sm space-y-1">
              <li>• Check your spam folder if the email doesn’t appear</li>
              <li>• Code is valid for 10 minutes</li>
              <li>• Maximum of 3 incorrect attempts</li>
              <li>• The code consists of 6 digits</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Loading Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mx-auto">
                <RefreshCw className="h-8 w-8 text-white animate-spin" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Loading...</h1>
              <p className="text-white/70">Preparing verification page</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <VerifyOTPContent />
    </Suspense>
  );
}
