import { db } from '../firebase';
import { collection, doc, setDoc, getDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { sendOTPEmail } from './email';

export interface OTPData {
  code: string;
  email: string;
  expiresAt: Date;
  attempts: number;
  verified: boolean;
}

// Generate 6-digit OTP code
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store OTP in Firestore
export const storeOTP = async (email: string, code: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const otpId = `otp_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const otpRef = doc(db, 'otp_codes', otpId);
    
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    
    const otpData = {
      code,
      email,
      expiresAt: expiresAt,
      attempts: 0,
      verified: false,
    };

    console.log('💾 Storing OTP data:', {
      otpId,
      code,
      email,
      expiresAt: expiresAt.toISOString(),
      expiresInMinutes: 10
    });

    await setDoc(otpRef, otpData);

    console.log('✅ OTP stored successfully');
    return { success: true };
  } catch (error: any) {
    console.error('Error storing OTP:', error);
    return { 
      success: false, 
      error: 'Gagal menyimpan kode verifikasi' 
    };
  }
};

// Verify OTP code
export const verifyOTP = async (email: string, code: string): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('🔍 verifyOTP called with:', { email, code });
    
    const otpId = `otp_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const otpRef = doc(db, 'otp_codes', otpId);
    console.log('🔍 Looking for OTP with ID:', otpId);
    
    const otpDoc = await getDoc(otpRef);

    if (!otpDoc.exists()) {
      console.log('❌ OTP document not found');
      return { 
        success: false, 
        error: 'Kode verifikasi tidak ditemukan atau sudah expired' 
      };
    }

    const otpData = otpDoc.data() as OTPData;
    console.log('📄 OTP data found:', {
      code: otpData.code,
      email: otpData.email,
      expiresAt: otpData.expiresAt,
      attempts: otpData.attempts,
      verified: otpData.verified
    });

    // Check if already verified
    if (otpData.verified) {
      return { 
        success: false, 
        error: 'Email sudah terverifikasi' 
      };
    }

    // Check if expired
    const now = new Date();
    let expiresAt: Date;
    
    if (otpData.expiresAt instanceof Date) {
      expiresAt = otpData.expiresAt;
    } else if (otpData.expiresAt && typeof otpData.expiresAt === 'object' && 'toDate' in otpData.expiresAt) {
      expiresAt = (otpData.expiresAt as { toDate: () => Date }).toDate();
    } else {
      // Fallback: if expiresAt is not properly set, consider it expired
      console.log('⚠️ Invalid expiresAt format:', otpData.expiresAt);
      await deleteDoc(otpRef);
      return { 
        success: false, 
        error: 'Kode verifikasi sudah expired. Silakan request kode baru' 
      };
    }
    
    console.log('🕐 Current time:', now.toISOString());
    console.log('⏰ Expires at:', expiresAt.toISOString());
    console.log('⏱️ Time difference (minutes):', (expiresAt.getTime() - now.getTime()) / (1000 * 60));
    
    if (now > expiresAt) {
      // Delete expired OTP
      await deleteDoc(otpRef);
      return { 
        success: false, 
        error: 'Kode verifikasi sudah expired. Silakan request kode baru' 
      };
    }

    // Check attempts limit
    if (otpData.attempts >= 3) {
      // Delete OTP after 3 failed attempts
      await deleteDoc(otpRef);
      return { 
        success: false, 
        error: 'Terlalu banyak percobaan salah. Silakan request kode baru' 
      };
    }

    // Verify code
    if (otpData.code !== code) {
      // Increment attempts
      await setDoc(otpRef, {
        ...otpData,
        attempts: otpData.attempts + 1,
      }, { merge: true });

      const remainingAttempts = 3 - (otpData.attempts + 1);
      return { 
        success: false, 
        error: `Kode salah. Sisa percobaan: ${remainingAttempts}` 
      };
    }

    // Mark as verified
    await setDoc(otpRef, {
      ...otpData,
      verified: true,
    }, { merge: true });

    return { success: true };
  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    return { 
      success: false, 
      error: 'Gagal memverifikasi kode' 
    };
  }
};

// Check if email is verified
export const isEmailVerified = async (email: string): Promise<{ verified: boolean; error?: string }> => {
  try {
    const otpId = `otp_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const otpRef = doc(db, 'otp_codes', otpId);
    const otpDoc = await getDoc(otpRef);

    if (!otpDoc.exists()) {
      return { verified: false };
    }

    const otpData = otpDoc.data() as OTPData;
    return { verified: otpData.verified };
  } catch (error: any) {
    console.error('Error checking email verification:', error);
    return { 
      verified: false, 
      error: 'Gagal mengecek status verifikasi' 
    };
  }
};

// Delete OTP after successful verification
export const deleteOTP = async (email: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const otpId = `otp_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const otpRef = doc(db, 'otp_codes', otpId);
    await deleteDoc(otpRef);
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting OTP:', error);
    return { 
      success: false, 
      error: 'Gagal menghapus kode verifikasi' 
    };
  }
};

// Send OTP via email (using Gmail SMTP or console fallback)
export const sendOTPEmailToUser = async (email: string, code: string): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('📧 sendOTPEmailToUser called with:', { email, code });
    const result = await sendOTPEmail(email, code);
    console.log('📧 sendOTPEmail result:', result);
    return result;
  } catch (error: any) {
    console.error('Error sending OTP email:', error);
    return { 
      success: false, 
      error: 'Gagal mengirim email verifikasi' 
    };
  }
};
