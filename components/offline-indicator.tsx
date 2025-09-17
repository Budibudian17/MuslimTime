"use client"

import { useState, useEffect } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Wifi, WifiOff, RefreshCw } from 'lucide-react'

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [showOfflineAlert, setShowOfflineAlert] = useState(false)
  const [showOnlineAlert, setShowOnlineAlert] = useState(false)

  useEffect(() => {
    // Set initial online status
    const initialOnlineStatus = navigator.onLine
    setIsOnline(initialOnlineStatus)
    
    // If user starts offline, show alert immediately
    if (!initialOnlineStatus) {
      setShowOfflineAlert(true)
    }
    
    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true)
      setShowOfflineAlert(false)
      setShowOnlineAlert(true)
      console.log('App is back online')
      
      // Auto hide online alert after 3 seconds
      setTimeout(() => {
        setShowOnlineAlert(false)
      }, 3000)
    }
    
    const handleOffline = () => {
      setIsOnline(false)
      setShowOfflineAlert(true)
      setShowOnlineAlert(false)
      console.log('App is offline')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleRefresh = () => {
    window.location.reload()
  }

  const handleDismissOffline = () => {
    setShowOfflineAlert(false)
  }

  const handleDismissOnline = () => {
    setShowOnlineAlert(false)
  }

  // Show offline alert
  if (!isOnline && showOfflineAlert) {
    return (
      <div className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md">
        <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800">
          <WifiOff className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <p className="font-medium text-orange-800 dark:text-orange-200">
                Anda sedang offline
              </p>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                Beberapa fitur mungkin tidak tersedia. Data yang sudah di-cache tetap bisa diakses.
              </p>
            </div>
            <div className="flex gap-2 ml-4">
              <Button
                size="sm"
                variant="outline"
                onClick={handleRefresh}
                className="text-orange-700 border-orange-300 hover:bg-orange-100 dark:text-orange-300 dark:border-orange-600 dark:hover:bg-orange-800/30"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Refresh
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismissOffline}
                className="text-orange-700 hover:bg-orange-100 dark:text-orange-300 dark:hover:bg-orange-800/30"
              >
                ×
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Show online alert (when coming back online)
  if (isOnline && showOnlineAlert) {
    return (
      <div className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md">
        <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
          <Wifi className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <p className="font-medium text-green-800 dark:text-green-200">
                Koneksi internet kembali normal
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                Semua fitur sekarang tersedia.
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismissOnline}
              className="text-green-700 hover:bg-green-100 dark:text-green-300 dark:hover:bg-green-800/30"
            >
              ×
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return null
}
