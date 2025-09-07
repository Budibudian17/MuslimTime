"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { getUserReadingHistory, getLatestReadingHistory, ReadingHistory } from '@/lib/services/history'

interface HistoryContextType {
  latestHistory: ReadingHistory | null
  allHistory: ReadingHistory[]
  isLoading: boolean
  error: string | null
  refreshHistory: () => Promise<void>
  updateLatestHistory: (history: ReadingHistory) => void
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined)

export function useHistory() {
  const context = useContext(HistoryContext)
  if (context === undefined) {
    throw new Error('useHistory must be used within a HistoryProvider')
  }
  return context
}

interface HistoryProviderProps {
  children: ReactNode
}

export function HistoryProvider({ children }: HistoryProviderProps) {
  const { user } = useAuth()
  const [latestHistory, setLatestHistory] = useState<ReadingHistory | null>(null)
  const [allHistory, setAllHistory] = useState<ReadingHistory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastFetchTime, setLastFetchTime] = useState<number>(0)

  // Load from session storage
  const loadFromSession = () => {
    if (typeof window === 'undefined') return null
    
    try {
      const cached = sessionStorage.getItem(`history_${user?.uid}`)
      if (cached) {
        const { data, timestamp } = JSON.parse(cached)
        // Cache valid for 5 minutes
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          return data
        }
      }
    } catch (error) {
      console.error('Error loading from session storage:', error)
    }
    return null
  }

  // Save to session storage
  const saveToSession = (data: { latestHistory: ReadingHistory | null, allHistory: ReadingHistory[] }) => {
    if (typeof window === 'undefined') return
    
    try {
      sessionStorage.setItem(`history_${user?.uid}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }))
    } catch (error) {
      console.error('Error saving to session storage:', error)
    }
  }

  const fetchHistory = async (forceRefresh = false) => {
    if (!user?.uid) {
      setLatestHistory(null)
      setAllHistory([])
      return
    }

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = loadFromSession()
      if (cached) {
        setLatestHistory(cached.latestHistory)
        setAllHistory(cached.allHistory)
        return
      }
    }

    // Check if we fetched recently (within 30 seconds)
    const now = Date.now()
    if (!forceRefresh && now - lastFetchTime < 30000) {
      return
    }

    setIsLoading(true)
    setError(null)
    setLastFetchTime(now)

    try {
      // Only fetch latest history for sidebar (more efficient)
      const latestResponse = await getLatestReadingHistory(user.uid)
      console.log('History fetch response:', latestResponse) // Debug log
      
      if (latestResponse.success && latestResponse.data) {
        const latest = latestResponse.data[0] || null
        console.log('Latest history found:', latest) // Debug log
        setLatestHistory(latest)
        
        // Save to session storage
        saveToSession({
          latestHistory: latest,
          allHistory: [latest].filter(Boolean) // Only save latest for now
        })
      } else {
        console.log('No history found or error:', latestResponse.error) // Debug log
      }

      if (latestResponse.error) {
        setError(latestResponse.error)
      }
    } catch (err) {
      console.error('History fetch error:', err) // Debug log
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  const refreshHistory = async () => {
    await fetchHistory(true) // Force refresh
  }

  const updateLatestHistory = (history: ReadingHistory) => {
    setLatestHistory(history)
    // Also update in allHistory if it exists
    setAllHistory(prev => {
      const filtered = prev.filter(h => h.surahNumber !== history.surahNumber)
      return [history, ...filtered].slice(0, 10)
    })
    
    // Update session storage
    saveToSession({
      latestHistory: history,
      allHistory: [history, ...allHistory.filter(h => h.surahNumber !== history.surahNumber)].slice(0, 10)
    })
  }

  useEffect(() => {
    fetchHistory()
  }, [user?.uid])

  const value: HistoryContextType = {
    latestHistory,
    allHistory,
    isLoading,
    error,
    refreshHistory,
    updateLatestHistory
  }

  return (
    <HistoryContext.Provider value={value}>
      {children}
    </HistoryContext.Provider>
  )
}
