// Client-side email service that calls API route
// This avoids Node.js modules in the browser

// Send OTP via email using API route
export const sendOTPEmail = async (email: string, code: string): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('📧 sendOTPEmail called with:', { email, code });
    console.log('📧 Making API call to /api/send-otp');
    
    const response = await fetch('/api/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code }),
    });

    console.log('📧 API response status:', response.status);
    const result = await response.json();
    console.log('📧 API response data:', result);
    
    return result;
  } catch (error: any) {
    console.error('Error sending OTP email:', error);
    return { 
      success: false, 
      error: 'Gagal mengirim email verifikasi' 
    };
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email: string, resetLink: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // For now, just log to console
    console.log('📧 Password reset email simulation:', { email, resetLink });
    return { success: true };
  } catch (error: any) {
    console.error('Error sending password reset email:', error);
    return { 
      success: false, 
      error: 'Gagal mengirim email reset password' 
    };
  }
};
