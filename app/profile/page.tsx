'use client';

import React, { useState, useRef } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { updateUserProfile, updateUserPhoto, removeUserPhoto } from '@/lib/auth';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Key, 
  Save, 
  Loader2,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Camera,
  Upload,
  Trash2,
  X
} from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile form data
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
  });

  // Update profileData when user changes
  React.useEffect(() => {
    if (user) {
      setProfileData({
        displayName: user.displayName || '',
        email: user.email || '',
      });
    }
  }, [user]);

  // Password change form data
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const { error } = await updateUserProfile(profileData.displayName);
      
      if (error) {
        setMessage({ 
          type: 'error', 
          text: error 
        });
      } else {
        setMessage({ 
          type: 'success', 
          text: 'Profile updated successfully!' 
        });
        
        // Refresh user data to update UI
        refreshUser();
        
        // Update local state
        setProfileData(prev => ({
          ...prev,
          displayName: profileData.displayName
        }));
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'An error occurred while updating profile' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ 
        type: 'error', 
        text: 'New password and confirmation do not match' 
      });
      setIsLoading(false);
      return;
    }

    try {
      setMessage({ 
        type: 'error', 
        text: 'Password change feature is not available yet' 
      });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'An error occurred while changing password' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Compress image function
  const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'File must be an image' });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // Increased to 10MB for original file
      setMessage({ type: 'error', text: 'Maximum file size is 10MB' });
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
      // Compress image before upload
      const compressedFile = await compressImage(file, 800, 0.8);
      
      const { photoURL, error } = await updateUserPhoto(compressedFile);
      
      if (error) {
        setMessage({ type: 'error', text: error });
        setPhotoPreview(null);
      } else {
        setMessage({ type: 'success', text: 'Profile photo updated successfully!' });
        refreshUser();
        setPhotoPreview(null);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while uploading photo' });
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
        setMessage({ type: 'success', text: 'Profile photo removed successfully!' });
        refreshUser();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while removing photo' });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen relative overflow-hidden">
        {/* Background adaptif tema */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-400 to-blue-500 dark:from-slate-900 dark:to-slate-800">
          {/* Pattern overlay */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          
          {/* Decorative elements */}
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 dark:bg-white/5 rounded-full blur-xl"></div>
          <div className="absolute top-1/4 right-10 w-24 h-24 bg-blue-400/20 dark:bg-blue-300/10 rounded-full blur-lg"></div>
          <div className="absolute bottom-1/4 left-1/4 w-40 h-40 bg-sky-400/20 dark:bg-sky-300/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 right-1/4 w-28 h-28 bg-blue-300/20 dark:bg-blue-200/10 rounded-full blur-xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 min-h-screen p-4 sm:p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full mb-4 border border-white/20">
                <User className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 drop-shadow-lg">
                My Profile
              </h1>
              <p className="text-white/80 text-base sm:text-lg px-4">
                Manage your account information and security
              </p>
            </div>

            {/* Profile Card */}
            <div className="backdrop-blur-md bg-white/20 dark:bg-white/5 rounded-2xl border border-white/30 dark:border-white/10 shadow-2xl p-6 sm:p-8">
              {/* User Info Header */}
              <div className="text-center mb-8">
                <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-white/30">
                  <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || 'User'} />
                  <AvatarFallback className="text-2xl bg-white/20 text-white">
                    {getInitials(user?.displayName)}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {user?.displayName || 'User'}
                </h2>
                <p className="text-white/70 mb-2">{user?.email}</p>
                <div className="flex items-center justify-center space-x-2">
                  {user?.emailVerified ? (
                    <div className="flex items-center space-x-1 text-green-300">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Email Verified</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-yellow-300">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">Email Not Verified</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Message */}
              {message && (
                <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className="mb-6">
                  <AlertDescription className={message.type === 'error' ? 'text-red-200' : 'text-green-200'}>
                    {message.text}
                  </AlertDescription>
                </Alert>
              )}

              {/* Tabs */}
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-white/10 border border-white/20">
                  <TabsTrigger 
                    value="profile" 
                    className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </TabsTrigger>
                  <TabsTrigger 
                    value="photo" 
                    className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Photo
                  </TabsTrigger>
                  <TabsTrigger 
                    value="security" 
                    className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Security
                  </TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile" className="mt-6">
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="displayName" className="text-white/90 font-medium">
                          Full Name
                        </Label>
                        <Input
                          id="displayName"
                          type="text"
                          value={profileData.displayName}
                          onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                          className="bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:border-white/50 focus:ring-white/30"
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-white/90 font-medium">
                          Email
                        </Label>
                        <div className="relative">
                          <Input
                            id="email"
                            type="email"
                            value={profileData.email}
                            className="bg-white/10 border-white/20 text-white/70 placeholder:text-white/50 focus:border-white/40 focus:ring-white/20 pr-10"
                            disabled
                          />
                          <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                        </div>
                        <p className="text-white/60 text-sm">
                          Email cannot be changed. Contact an administrator if you need updates.
                        </p>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-white hover:bg-gray-100 text-sky-600 border border-white hover:border-gray-200 transition-all duration-200 font-medium" 
                      disabled={isLoading}
                    >
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </form>
                </TabsContent>

                {/* Photo Tab */}
                <TabsContent value="photo" className="mt-6">
                  <div className="space-y-6">
                    {/* Current Photo */}
                    <div className="text-center">
                      <div className="relative inline-block">
                        <Avatar className="h-32 w-32 mx-auto border-4 border-white/30">
                          <AvatarImage 
                            src={photoPreview || user?.photoURL || undefined} 
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
                      <p className="text-white/70 text-sm mt-2">
                        {user?.photoURL ? 'Current profile photo' : 'No profile photo yet'}
                      </p>
                    </div>

                    {/* Upload Section */}
                    <div className="space-y-4">
                      <div className="text-center">
                        <h3 className="text-lg font-semibold text-white mb-2">Upload New Photo</h3>
                        <p className="text-white/70 text-sm mb-4">
                          Choose JPG, PNG, or GIF up to 10MB (will be compressed automatically).
                        </p>
                        {isUploadingPhoto && (
                          <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-3 mb-4">
                            <p className="text-blue-200 text-sm">
                              🔄 Sedang mengompres dan mengupload photo...
                            </p>
                          </div>
                        )}
                      </div>

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
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingPhoto}
                          className="bg-white hover:bg-gray-100 text-sky-600 border border-white hover:border-gray-200 transition-all duration-200 font-medium"
                        >
                          {isUploadingPhoto ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="mr-2 h-4 w-4" />
                          )}
                          Choose Photo
                        </Button>

                        {user?.photoURL && (
                          <Button
                            type="button"
                            onClick={handleRemovePhoto}
                            disabled={isUploadingPhoto}
                            variant="outline"
                            className="bg-transparent hover:bg-red-500/20 text-white border-red-500/50 hover:border-red-500 transition-all duration-200"
                          >
                            {isUploadingPhoto ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="mr-2 h-4 w-4" />
                            )}
                            Remove Photo
                          </Button>
                        )}
                      </div>

                      {/* Photo Preview */}
                      {photoPreview && (
                        <div className="text-center">
                          <div className="relative inline-block">
                            <img
                              src={photoPreview}
                              alt="Preview"
                              className="h-24 w-24 rounded-full object-cover border-2 border-white/30"
                            />
                            <Button
                              type="button"
                              onClick={() => setPhotoPreview(null)}
                              size="sm"
                              variant="outline"
                              className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 hover:bg-red-600 text-white border-red-500 p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-white/70 text-xs mt-2">Preview</p>
                        </div>
                      )}
                    </div>

                    {/* Tips */}
                    <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
                      <h4 className="text-blue-200 font-medium mb-2">💡 Profile Photo Tips:</h4>
                      <ul className="text-blue-200/80 text-sm space-y-1">
                        <li>• Use a clear photo with your face visible</li>
                        <li>• Supported formats: JPG, PNG, GIF</li>
                        <li>• Max size: 10MB (will be compressed automatically)</li>
                        <li>• 1:1 ratio (square) looks best</li>
                        <li>• Photo will be compressed to 800px for optimal performance</li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security" className="mt-6">
                  <form onSubmit={handlePasswordChange} className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword" className="text-white/90 font-medium">
                          Current Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            type={showPassword ? 'text' : 'password'}
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            className="bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:border-white/50 focus:ring-white/30 pr-10"
                            disabled={isLoading}
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
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newPassword" className="text-white/90 font-medium">
                          New Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="newPassword"
                            type={showNewPassword ? 'text' : 'password'}
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            className="bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:border-white/50 focus:ring-white/30 pr-10"
                            disabled={isLoading}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-white/70 hover:text-white"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            disabled={isLoading}
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-white/90 font-medium">
                          Confirm New Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            className="bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:border-white/50 focus:ring-white/30 pr-10"
                            disabled={isLoading}
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
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-white hover:bg-gray-100 text-sky-600 border border-white hover:border-gray-200 transition-all duration-200 font-medium" 
                      disabled={isLoading}
                    >
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <Key className="mr-2 h-4 w-4" />
                      Change Password
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              {/* Back to Home */}
              <div className="mt-8 text-center">
                <Button asChild variant="ghost" className="text-white/70 hover:text-white">
                  <Link href="/">
                    ← Back to Home
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
