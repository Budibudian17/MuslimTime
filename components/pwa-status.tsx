"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Wifi, WifiOff, Download, Trash2, RefreshCw, CheckCircle, Smartphone } from 'lucide-react'
import { offlineStorage } from '@/lib/services/offline-storage'
import { usePWAInstall } from '@/hooks/use-pwa-install'

interface PWAStatusProps {
  className?: string
}

export default function PWAStatus({ className }: PWAStatusProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [cacheInfo, setCacheInfo] = useState({ totalSize: 0, itemCount: 0, items: [] })
  const [isLoading, setIsLoading] = useState(false)
  const { isInstalled, canInstall, installPWA } = usePWAInstall()

  useEffect(() => {
    // Check online status
    setIsOnline(navigator.onLine)
    
    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Update cache info
    updateCacheInfo()
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const updateCacheInfo = () => {
    const info = offlineStorage.getCacheInfo()
    setCacheInfo(info)
  }

  const handleClearCache = async () => {
    setIsLoading(true)
    try {
      await offlineStorage.clearAllCache()
      updateCacheInfo()
      console.log('Cache cleared successfully')
    } catch (error) {
      console.error('Error clearing cache:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreloadData = async () => {
    setIsLoading(true)
    try {
      await offlineStorage.preloadEssentialData()
      updateCacheInfo()
      console.log('Essential data preloaded')
    } catch (error) {
      console.error('Error preloading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getCacheProgress = () => {
    // Calculate progress based on cache size (assuming 10MB is full)
    const maxSize = 10 * 1024 * 1024 // 10MB
    return Math.min((cacheInfo.totalSize / maxSize) * 100, 100)
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className={`p-2 rounded-full ${isOnline ? 'bg-green-100 dark:bg-green-900/30' : 'bg-orange-100 dark:bg-orange-900/30'}`}>
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-600 dark:text-green-400" />
            ) : (
              <WifiOff className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            )}
          </div>
          Status Aplikasi
        </CardTitle>
        <CardDescription>
          Informasi koneksi dan cache untuk penggunaan offline
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status Koneksi</span>
          <Badge variant={isOnline ? "default" : "secondary"}>
            {isOnline ? "Online" : "Offline"}
          </Badge>
        </div>

        {/* PWA Installation Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Mode Aplikasi</span>
          <Badge variant={isInstalled ? "default" : "outline"}>
            {isInstalled ? "PWA Terinstall" : "Browser"}
          </Badge>
        </div>

        {/* Cache Information */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Cache Offline</span>
            <span className="text-sm text-gray-500">
              {formatBytes(cacheInfo.totalSize)} ({cacheInfo.itemCount} item)
            </span>
          </div>
          
          <Progress value={getCacheProgress()} className="h-2" />
          
          <div className="text-xs text-gray-500">
            {cacheInfo.items.length > 0 ? (
              <div>
                <p className="font-medium mb-1">Data tersimpan:</p>
                <ul className="list-disc list-inside space-y-1">
                  {cacheInfo.items.slice(0, 5).map((item, index) => (
                    <li key={index} className="truncate">{item}</li>
                  ))}
                  {cacheInfo.items.length > 5 && (
                    <li>... dan {cacheInfo.items.length - 5} item lainnya</li>
                  )}
                </ul>
              </div>
            ) : (
              <p>Tidak ada data tersimpan</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handlePreloadData}
            disabled={isLoading}
            className="flex-1"
          >
            <Download className="h-3 w-3 mr-1" />
            Preload Data
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={handleClearCache}
            disabled={isLoading || cacheInfo.itemCount === 0}
            className="flex-1"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Hapus Cache
          </Button>
        </div>

        {/* Offline Features Info */}
        {!isOnline && (
          <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-orange-800 dark:text-orange-200 mb-1">
                  Mode Offline Aktif
                </p>
                <p className="text-orange-700 dark:text-orange-300">
                  Anda dapat membaca Al-Quran dan melihat waktu sholat yang sudah di-cache.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* PWA Installation Prompt */}
        {canInstall && isOnline && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-2">
              <Smartphone className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm flex-1">
                <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                  Install Aplikasi
                </p>
                <p className="text-blue-700 dark:text-blue-300 mb-2">
                  Install MuslimTime sebagai aplikasi untuk pengalaman yang lebih baik.
                </p>
                <Button
                  size="sm"
                  onClick={installPWA}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Install Sekarang
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
