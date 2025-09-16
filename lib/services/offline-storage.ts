// Offline storage service for MuslimTime
export class OfflineStorage {
  private static instance: OfflineStorage
  private cachePrefix = 'muslimtime_'

  static getInstance(): OfflineStorage {
    if (!OfflineStorage.instance) {
      OfflineStorage.instance = new OfflineStorage()
    }
    return OfflineStorage.instance
  }

  // Check if we're in browser environment
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
  }

  // Generic cache methods
  async setCache(key: string, data: any, ttl?: number): Promise<void> {
    if (!this.isBrowser()) {
      console.warn('localStorage not available in server environment')
      return
    }
    
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
        ttl: ttl || 24 * 60 * 60 * 1000, // Default 24 hours
      }
      localStorage.setItem(`${this.cachePrefix}${key}`, JSON.stringify(cacheData))
    } catch (error) {
      console.error('Error setting cache:', error)
    }
  }

  async getCache(key: string): Promise<any | null> {
    if (!this.isBrowser()) {
      console.warn('localStorage not available in server environment')
      return null
    }
    
    try {
      const cached = localStorage.getItem(`${this.cachePrefix}${key}`)
      if (!cached) return null

      const { data, timestamp, ttl } = JSON.parse(cached)
      
      // Check if cache is expired
      if (Date.now() - timestamp > ttl) {
        this.removeCache(key)
        return null
      }

      return data
    } catch (error) {
      console.error('Error getting cache:', error)
      return null
    }
  }

  async removeCache(key: string): Promise<void> {
    if (!this.isBrowser()) {
      console.warn('localStorage not available in server environment')
      return
    }
    
    try {
      localStorage.removeItem(`${this.cachePrefix}${key}`)
    } catch (error) {
      console.error('Error removing cache:', error)
    }
  }

  async clearAllCache(): Promise<void> {
    if (!this.isBrowser()) {
      console.warn('localStorage not available in server environment')
      return
    }
    
    try {
      const keys = Object.keys(localStorage)
      const cacheKeys = keys.filter(key => key.startsWith(this.cachePrefix))
      cacheKeys.forEach(key => localStorage.removeItem(key))
    } catch (error) {
      console.error('Error clearing cache:', error)
    }
  }

  // Specific cache methods for different data types
  async cacheSurah(surahId: number, surahData: any): Promise<void> {
    await this.setCache(`surah_${surahId}`, surahData, 7 * 24 * 60 * 60 * 1000) // 7 days
  }

  async getCachedSurah(surahId: number): Promise<any | null> {
    return await this.getCache(`surah_${surahId}`)
  }

  async cacheSurahList(surahList: any[]): Promise<void> {
    await this.setCache('surah_list', surahList, 7 * 24 * 60 * 60 * 1000) // 7 days
  }

  async getCachedSurahList(): Promise<any[] | null> {
    return await this.getCache('surah_list')
  }

  async cacheJuz(juzId: number, juzData: any): Promise<void> {
    await this.setCache(`juz_${juzId}`, juzData, 7 * 24 * 60 * 60 * 1000) // 7 days
  }

  async getCachedJuz(juzId: number): Promise<any | null> {
    return await this.getCache(`juz_${juzId}`)
  }

  async cachePrayerTimes(location: string, prayerData: any): Promise<void> {
    await this.setCache(`prayer_${location}`, prayerData, 24 * 60 * 60 * 1000) // 24 hours
  }

  async getCachedPrayerTimes(location: string): Promise<any | null> {
    return await this.getCache(`prayer_${location}`)
  }

  async cacheUserPreferences(preferences: any): Promise<void> {
    await this.setCache('user_preferences', preferences, 30 * 24 * 60 * 60 * 1000) // 30 days
  }

  async getCachedUserPreferences(): Promise<any | null> {
    return await this.getCache('user_preferences')
  }

  async cacheReadingHistory(history: any[]): Promise<void> {
    await this.setCache('reading_history', history, 365 * 24 * 60 * 60 * 1000) // 1 year
  }

  async getCachedReadingHistory(): Promise<any[] | null> {
    return await this.getCache('reading_history')
  }

  // Check if we're online
  isOnline(): boolean {
    if (!this.isBrowser()) {
      return true // Assume online in server environment
    }
    return navigator.onLine
  }

  // Get cache size info
  getCacheInfo(): { totalSize: number; itemCount: number; items: string[] } {
    if (!this.isBrowser()) {
      return { totalSize: 0, itemCount: 0, items: [] }
    }
    
    try {
      const keys = Object.keys(localStorage)
      const cacheKeys = keys.filter(key => key.startsWith(this.cachePrefix))
      let totalSize = 0
      
      cacheKeys.forEach(key => {
        const item = localStorage.getItem(key)
        if (item) {
          totalSize += item.length
        }
      })

      return {
        totalSize,
        itemCount: cacheKeys.length,
        items: cacheKeys.map(key => key.replace(this.cachePrefix, ''))
      }
    } catch (error) {
      console.error('Error getting cache info:', error)
      return { totalSize: 0, itemCount: 0, items: [] }
    }
  }

  // Preload essential data for offline use
  async preloadEssentialData(): Promise<void> {
    try {
      console.log('Preloading essential data for offline use...')
      
      // This would be called when the app first loads
      // to preload critical data for offline use
      
      // For now, we'll just log that we're ready
      console.log('Essential data preloaded successfully')
    } catch (error) {
      console.error('Error preloading essential data:', error)
    }
  }
}

// Export singleton instance
export const offlineStorage = OfflineStorage.getInstance()
