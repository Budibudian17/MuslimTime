import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from 'firebase/auth';
import { auth, storage } from './firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { generateOTP, storeOTP, sendOTPEmailToUser, verifyOTP, deleteOTP } from './services/otp';
import { markEmailAsVerified, isEmailVerified } from './services/userVerification';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

// Register new user with OTP verification
export const registerUser = async (email: string, password: string, displayName: string) => {
  try {
    console.log('🚀 registerUser called with:', { email, displayName });
    
    // Generate OTP code
    const otpCode = generateOTP();
    console.log('🔐 Generated OTP code:', otpCode);
    
    // Store OTP in database
    console.log('💾 Storing OTP in database...');
    const storeResult = await storeOTP(email, otpCode);
    console.log('💾 Store result:', storeResult);
    
    if (!storeResult.success) {
      return { user: null, error: storeResult.error || 'Gagal menyimpan kode verifikasi' };
    }
    
    // Send OTP via email
    console.log('📧 Sending OTP via email...');
    const emailResult = await sendOTPEmailToUser(email, otpCode);
    console.log('📧 Email result:', emailResult);
    
    if (!emailResult.success) {
      return { user: null, error: emailResult.error || 'Gagal mengirim email verifikasi' };
    }
    
    console.log('✅ Registration process completed successfully');
    return { 
      user: null, 
      error: null, 
      otpSent: true,
      message: 'Kode verifikasi telah dikirim ke email Anda. Silakan cek email dan masukkan kode 6 digit.' 
    };
  } catch (error: any) {
    let errorMessage = error.message;
    
    // Translate Firebase error messages to Indonesian
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'Email sudah terdaftar. Silakan gunakan email lain atau coba login.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Format email tidak valid. Silakan periksa kembali email Anda.';
        break;
      case 'auth/weak-password':
        errorMessage = 'Password terlalu lemah. Minimal 6 karakter.';
        break;
      case 'auth/operation-not-allowed':
        errorMessage = 'Operasi tidak diizinkan. Silakan hubungi administrator.';
        break;
      case 'auth/invalid-credential':
        errorMessage = 'Kredensial tidak valid. Email mungkin sudah terdaftar atau password terlalu lemah.';
        break;
      default:
        errorMessage = `Terjadi kesalahan: ${error.message}`;
    }
    
    return { user: null, error: errorMessage };
  }
};

// Complete registration with OTP verification
export const completeRegistration = async (email: string, password: string, displayName: string, otpCode: string) => {
  try {
    console.log('🚀 completeRegistration called with:', { email, displayName, otpCode });
    
    // Verify OTP first
    const verifyResult = await verifyOTP(email, otpCode);
    if (!verifyResult.success) {
      console.log('❌ OTP verification failed:', verifyResult.error);
      return { user: null, error: verifyResult.error };
    }
    
    console.log('✅ OTP verification successful');
    
    // Create user account
    console.log('👤 Creating user account...');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update the user's display name
    console.log('📝 Updating user profile...');
    await updateProfile(user, {
      displayName: displayName,
    });
    
    // Mark email as verified in our custom system
    console.log('✅ Marking email as verified...');
    await markEmailAsVerified(email);
    
    // Delete OTP after successful registration
    console.log('🗑️ Deleting OTP...');
    await deleteOTP(email);
    
    console.log('✅ Registration completed successfully');
    return { user: user, error: null };
  } catch (error: any) {
    console.error('❌ Error in completeRegistration:', error);
    let errorMessage = error.message;
    
    // Translate Firebase error messages to Indonesian
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'Email sudah terdaftar. Silakan gunakan email lain atau coba login.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Format email tidak valid. Silakan periksa kembali email Anda.';
        break;
      case 'auth/weak-password':
        errorMessage = 'Password terlalu lemah. Minimal 6 karakter.';
        break;
      case 'auth/operation-not-allowed':
        errorMessage = 'Operasi tidak diizinkan. Silakan hubungi administrator.';
        break;
      case 'auth/invalid-credential':
        errorMessage = 'Kredensial tidak valid. Email mungkin sudah terdaftar atau password terlalu lemah.';
        break;
      default:
        errorMessage = `Terjadi kesalahan: ${error.message}`;
    }
    
    return { user: null, error: errorMessage };
  }
};

// Sign in user with Remember Me option
export const signInUser = async (email: string, password: string, rememberMe: boolean = false) => {
  try {
    // Set persistence based on Remember Me option
    if (rememberMe) {
      await setPersistence(auth, browserLocalPersistence);
    } else {
      await setPersistence(auth, browserSessionPersistence);
    }
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    let errorMessage = error.message;
    
    // Translate Firebase error messages to Indonesian
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'Email tidak terdaftar. Silakan daftar terlebih dahulu.';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Password salah. Silakan periksa kembali password Anda.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Format email tidak valid. Silakan periksa kembali email Anda.';
        break;
      case 'auth/user-disabled':
        errorMessage = 'Akun telah dinonaktifkan. Silakan hubungi administrator.';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Terlalu banyak percobaan login. Silakan coba lagi nanti.';
        break;
      case 'auth/invalid-credential':
        errorMessage = 'Email atau password salah. Silakan periksa kembali.';
        break;
      default:
        errorMessage = `Terjadi kesalahan: ${error.message}`;
    }
    
    return { user: null, error: errorMessage };
  }
};

// Sign out user
export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Get current user
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// Listen to auth state changes
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Convert Firebase User to AuthUser
export const convertToAuthUser = (user: User): AuthUser => {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    emailVerified: user.emailVerified,
  };
};

// Convert Firebase User to AuthUser with custom email verification
export const convertToAuthUserWithCustomVerification = async (user: User): Promise<AuthUser> => {
  console.log('🔄 convertToAuthUserWithCustomVerification called for:', user.email);
  console.log('🔍 Firebase emailVerified:', user.emailVerified);
  
  let customEmailVerified = user.emailVerified;
  
  // Check our custom verification system if Firebase emailVerified is false
  if (!user.emailVerified && user.email) {
    try {
      console.log('🔍 Checking custom verification for:', user.email);
      const { verified, error } = await isEmailVerified(user.email);
      console.log('🔍 Custom verification result:', { verified, error });
      customEmailVerified = verified;
    } catch (error) {
      console.error('❌ Error checking custom email verification:', error);
    }
  } else {
    console.log('✅ Firebase email already verified or no email');
  }
  
  console.log('✅ Final emailVerified status:', customEmailVerified);
  
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    emailVerified: customEmailVerified,
  };
};

// Send email verification
export const sendVerificationEmail = async (user: User) => {
  try {
    await sendEmailVerification(user);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Send password reset email
export const sendPasswordReset = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { error: null };
  } catch (error: any) {
    let errorMessage = error.message;
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'Email tidak terdaftar.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Format email tidak valid.';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Terlalu banyak percobaan. Silakan coba lagi nanti.';
        break;
      default:
        errorMessage = `Terjadi kesalahan: ${error.message}`;
    }
    
    return { error: errorMessage };
  }
};

// Update user profile
export const updateUserProfile = async (displayName: string) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { error: 'User tidak ditemukan' };
    }

    await updateProfile(currentUser, {
      displayName: displayName,
    });

    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Set authentication persistence
export const setAuthPersistence = async (rememberMe: boolean) => {
  try {
    if (rememberMe) {
      await setPersistence(auth, browserLocalPersistence);
    } else {
      await setPersistence(auth, browserSessionPersistence);
    }
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Check if user session is still valid
export const checkSessionValidity = async (): Promise<boolean> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) return false;
    
    // Check if token is still valid by refreshing it
    await currentUser.getIdToken(true);
    return true;
  } catch (error) {
    return false;
  }
};

// Upload and update user profile photo
export const updateUserPhoto = async (file: File) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { error: 'User tidak ditemukan' };
    }

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      return { error: 'File harus berupa gambar' };
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      return { error: 'Ukuran file maksimal 5MB' };
    }

    // Delete old photo if exists
    if (currentUser.photoURL) {
      try {
        const oldPhotoRef = ref(storage, currentUser.photoURL);
        await deleteObject(oldPhotoRef);
      } catch (error) {
        // Ignore error if old photo doesn't exist
        console.log('Old photo not found, continuing...');
      }
    }

    // Create unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = `profile-photos/${currentUser.uid}-${Date.now()}.${fileExtension}`;
    
    // Upload new photo
    const photoRef = ref(storage, fileName);
    const uploadResult = await uploadBytes(photoRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(uploadResult.ref);
    
    // Update user profile with new photo URL
    await updateProfile(currentUser, {
      photoURL: downloadURL,
    });

    return { photoURL: downloadURL, error: null };
  } catch (error: any) {
    let errorMessage = error.message;
    
    switch (error.code) {
      case 'storage/unauthorized':
        errorMessage = 'Tidak memiliki izin untuk upload file';
        break;
      case 'storage/canceled':
        errorMessage = 'Upload dibatalkan';
        break;
      case 'storage/unknown':
        errorMessage = 'Terjadi kesalahan saat upload';
        break;
      default:
        errorMessage = `Terjadi kesalahan: ${error.message}`;
    }
    
    return { photoURL: null, error: errorMessage };
  }
};

// Remove user profile photo
export const removeUserPhoto = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { error: 'User tidak ditemukan' };
    }

    // Delete photo from storage if exists
    if (currentUser.photoURL) {
      try {
        const photoRef = ref(storage, currentUser.photoURL);
        await deleteObject(photoRef);
      } catch (error) {
        console.log('Photo not found in storage, continuing...');
      }
    }

    // Update user profile to remove photo URL
    await updateProfile(currentUser, {
      photoURL: null,
    });

    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};
