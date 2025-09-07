'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function FixEmailVerificationPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleFixVerification = async () => {
    if (!email) {
      setMessage({ type: 'error', text: 'Please enter an email address' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/mark-email-verified', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: `Email ${email} has been marked as verified successfully! Please refresh the profile page.` 
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: `Failed to mark email as verified: ${result.error}` 
        });
      }
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: `An error occurred: ${error.message}` 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Fix Email Verification</CardTitle>
          <CardDescription className="text-center">
            Mark an email as verified for existing users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              disabled={isLoading}
            />
          </div>

          <Button 
            onClick={handleFixVerification} 
            disabled={isLoading || !email}
            className="w-full"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Mark Email as Verified
          </Button>

          {message && (
            <Alert className={message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
              {message.type === 'error' ? (
                <AlertCircle className="h-4 w-4 text-red-600" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
              <AlertDescription className={message.type === 'error' ? 'text-red-800' : 'text-green-800'}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>Instructions:</strong></p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Enter the email address of the user</li>
              <li>Click "Mark Email as Verified"</li>
              <li>Go back to the profile page and refresh</li>
              <li>The "Email Belum Terverifikasi" warning should disappear</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
