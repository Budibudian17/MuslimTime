import { db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export interface UserVerificationData {
  email: string;
  isEmailVerified: boolean;
  verifiedAt: Date;
  verificationMethod: 'otp' | 'email_link';
}

// Mark user email as verified after OTP verification
export const markEmailAsVerified = async (email: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const verificationId = `verification_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const verificationRef = doc(db, 'user_verifications', verificationId);
    
    const verificationData: UserVerificationData = {
      email,
      isEmailVerified: true,
      verifiedAt: new Date(),
      verificationMethod: 'otp'
    };

    await setDoc(verificationRef, verificationData);
    console.log('✅ Email marked as verified:', email);
    
    return { success: true };
  } catch (error: any) {
    console.error('Error marking email as verified:', error);
    return { 
      success: false, 
      error: 'Gagal menandai email sebagai terverifikasi' 
    };
  }
};

// Check if user email is verified
export const isEmailVerified = async (email: string): Promise<{ verified: boolean; error?: string }> => {
  try {
    console.log('🔍 isEmailVerified called for:', email);
    const verificationId = `verification_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
    console.log('🔍 Looking for verification document:', verificationId);
    
    const verificationRef = doc(db, 'user_verifications', verificationId);
    const verificationDoc = await getDoc(verificationRef);

    if (!verificationDoc.exists()) {
      console.log('❌ Verification document not found');
      // For existing users who registered before OTP system, auto-mark as verified
      console.log('🔧 Auto-marking existing user as verified:', email);
      await markEmailAsVerified(email);
      return { verified: true };
    }

    const verificationData = verificationDoc.data() as UserVerificationData;
    console.log('📄 Verification data found:', verificationData);
    console.log('✅ Email verification status:', verificationData.isEmailVerified);
    
    return { verified: verificationData.isEmailVerified };
  } catch (error: any) {
    console.error('❌ Error checking email verification:', error);
    return { 
      verified: false, 
      error: 'Gagal mengecek status verifikasi email' 
    };
  }
};
