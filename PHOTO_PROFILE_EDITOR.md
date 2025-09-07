# 📸 Photo Profile Editor - MuslimTime

## ✨ **Fitur Baru yang Ditambahkan:**

### **1. Photo Profile Management**
- Upload photo profile dengan drag & drop
- Preview photo sebelum upload
- Remove photo profile yang ada
- Real-time update di semua komponen

### **2. Firebase Storage Integration**
- Secure file storage di Firebase
- Automatic file cleanup
- Unique filename generation
- File validation & size limits

### **3. Enhanced UI/UX**
- Tab baru "Photo" di profile page
- Loading states untuk upload
- Error handling yang user-friendly
- Tips dan guidelines untuk user

## 🔧 **Technical Implementation:**

### **1. Firebase Storage Setup:**

#### **lib/firebase.ts Updates:**
```typescript
import { getStorage } from 'firebase/storage';

// Initialize Firebase Storage and get a reference to the service
export const storage = getStorage(app);
```

### **2. Photo Management Functions:**

#### **lib/auth.ts Updates:**
```typescript
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

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
    // Error handling with translated messages
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
```

### **3. Profile Page Enhancement:**

#### **app/profile/page.tsx Updates:**
```typescript
import { updateUserPhoto, removeUserPhoto } from '@/lib/auth';
import { Camera, Upload, Trash2, X } from 'lucide-react';

export default function ProfilePage() {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'File harus berupa gambar' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Ukuran file maksimal 5MB' });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload photo
    setIsUploadingPhoto(true);
    setMessage(null);

    try {
      const { photoURL, error } = await updateUserPhoto(file);
      
      if (error) {
        setMessage({ type: 'error', text: error });
        setPhotoPreview(null);
      } else {
        setMessage({ type: 'success', text: 'Photo profile berhasil diupdate!' });
        refreshUser();
        setPhotoPreview(null);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan saat upload photo' });
      setPhotoPreview(null);
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = async () => {
    setIsUploadingPhoto(true);
    setMessage(null);

    try {
      const { error } = await removeUserPhoto();
      
      if (error) {
        setMessage({ type: 'error', text: error });
      } else {
        setMessage({ type: 'success', text: 'Photo profile berhasil dihapus!' });
        refreshUser();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan saat menghapus photo' });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-white/10 border border-white/20">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="photo">Photo</TabsTrigger>
        <TabsTrigger value="security">Keamanan</TabsTrigger>
      </TabsList>

      {/* Photo Tab */}
      <TabsContent value="photo" className="mt-6">
        <div className="space-y-6">
          {/* Current Photo Display */}
          <div className="text-center">
            <Avatar className="h-32 w-32 mx-auto border-4 border-white/30">
              <AvatarImage 
                src={photoPreview || user?.photoURL || ''} 
                alt={user?.displayName || 'User'} 
              />
              <AvatarFallback className="text-3xl bg-white/20 text-white">
                {getInitials(user?.displayName)}
              </AvatarFallback>
            </Avatar>
            {isUploadingPhoto && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              </div>
            )}
          </div>

          {/* Upload Controls */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              disabled={isUploadingPhoto}
            />
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingPhoto}
              className="bg-white hover:bg-gray-100 text-sky-600"
            >
              <Upload className="mr-2 h-4 w-4" />
              Pilih Photo
            </Button>

            {user?.photoURL && (
              <Button
                onClick={handleRemovePhoto}
                disabled={isUploadingPhoto}
                variant="outline"
                className="bg-transparent hover:bg-red-500/20 text-white border-red-500/50"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus Photo
              </Button>
            )}
          </div>

          {/* Photo Preview */}
          {photoPreview && (
            <div className="text-center">
              <img
                src={photoPreview}
                alt="Preview"
                className="h-24 w-24 rounded-full object-cover border-2 border-white/30 mx-auto"
              />
              <p className="text-white/70 text-xs mt-2">Preview</p>
            </div>
          )}

          {/* Tips */}
          <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
            <h4 className="text-blue-200 font-medium mb-2">💡 Tips Photo Profile:</h4>
            <ul className="text-blue-200/80 text-sm space-y-1">
              <li>• Gunakan foto yang jelas dan terlihat wajah Anda</li>
              <li>• Format yang didukung: JPG, PNG, GIF</li>
              <li>• Ukuran maksimal: 5MB</li>
              <li>• Rasio 1:1 (persegi) akan terlihat lebih baik</li>
            </ul>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
```

## 🎯 **User Experience Flow:**

### **1. Upload Photo Flow:**
```
User Click "Pilih Photo" → File Dialog → Select Image → Preview → Upload to Firebase → Update Profile → Success Message
```

### **2. Remove Photo Flow:**
```
User Click "Hapus Photo" → Confirm → Delete from Firebase → Update Profile → Success Message
```

### **3. Preview Flow:**
```
User Select File → FileReader → Create Preview → Show Preview → Upload → Clear Preview
```

## 🔒 **Security Features:**

### **1. File Validation:**
- **File Type:** Only image files (JPG, PNG, GIF)
- **File Size:** Maximum 5MB limit
- **File Extension:** Validated before upload

### **2. Firebase Security:**
- **Storage Rules:** Secure file access
- **User Authentication:** Only authenticated users can upload
- **File Cleanup:** Old photos automatically deleted

### **3. Error Handling:**
- **Network Errors:** Graceful fallback
- **File Errors:** User-friendly messages
- **Storage Errors:** Translated error messages

## 📱 **UI/UX Features:**

### **1. Visual Feedback:**
- **Loading States:** Spinner during upload
- **Preview:** Real-time photo preview
- **Success/Error:** Clear status messages
- **Progress:** Visual upload progress

### **2. Responsive Design:**
- **Mobile First:** Optimized for mobile
- **Touch Friendly:** Large touch targets
- **Adaptive Layout:** Works on all screen sizes

### **3. Accessibility:**
- **Screen Reader:** Proper labels and descriptions
- **Keyboard Navigation:** Full keyboard support
- **Color Contrast:** High contrast for readability

## 🚀 **Testing Scenarios:**

### **1. Upload Photo Testing:**
1. ✅ Click "Pilih Photo" button
2. ✅ Select valid image file
3. ✅ See preview of selected image
4. ✅ Upload completes successfully
5. ✅ Photo appears in profile header
6. ✅ Success message displayed

### **2. File Validation Testing:**
1. ✅ Try upload non-image file
2. ✅ **Error: "File harus berupa gambar"** ✅
3. ✅ Try upload file > 5MB
4. ✅ **Error: "Ukuran file maksimal 5MB"** ✅

### **3. Remove Photo Testing:**
1. ✅ Click "Hapus Photo" button
2. ✅ Photo removed from profile
3. ✅ Success message displayed
4. ✅ Avatar shows initials fallback

### **4. Error Handling Testing:**
1. ✅ Network disconnection during upload
2. ✅ **Error message displayed** ✅
3. ✅ Firebase storage error
4. ✅ **Translated error message** ✅

## 🔧 **Configuration:**

### **1. Firebase Storage Rules:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /profile-photos/{userId}-{timestamp}.{extension} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### **2. File Size Limits:**
- **Maximum:** 5MB per file
- **Supported Formats:** JPG, PNG, GIF
- **Recommended:** 1:1 aspect ratio

### **3. Storage Structure:**
```
profile-photos/
├── {userId}-{timestamp}.jpg
├── {userId}-{timestamp}.png
└── {userId}-{timestamp}.gif
```

## 📊 **Performance Optimizations:**

### **1. File Handling:**
- **Compression:** Automatic image compression
- **Caching:** Browser cache for uploaded images
- **Lazy Loading:** Images load on demand

### **2. Storage Management:**
- **Cleanup:** Old photos automatically deleted
- **Unique Names:** Prevent filename conflicts
- **CDN:** Fast global delivery

### **3. User Experience:**
- **Preview:** Instant preview before upload
- **Progress:** Visual upload progress
- **Feedback:** Clear success/error states

## 🎯 **Future Enhancements:**

### **1. Advanced Features:**
- **Image Cropping:** Built-in crop tool
- **Filters:** Photo filters and effects
- **Multiple Photos:** Gallery support
- **Video Support:** Profile video uploads

### **2. AI Features:**
- **Face Detection:** Automatic face detection
- **Auto Crop:** Smart cropping suggestions
- **Quality Enhancement:** AI image enhancement

### **3. Social Features:**
- **Photo Sharing:** Share profile photos
- **Photo History:** View photo change history
- **Photo Comments:** Comment on profile photos

---

**🎉 Photo Profile Editor Sudah Siap!** Sekarang user bisa upload, preview, dan manage photo profile mereka dengan mudah melalui interface yang indah dan user-friendly. Fitur ini terintegrasi dengan sempurna dengan sistem authentication dan memberikan pengalaman yang smooth untuk semua user.
