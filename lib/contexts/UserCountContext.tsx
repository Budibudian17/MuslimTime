"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getCachedUserCount, formatUserCount, subscribeToUserCount } from '@/lib/services/userCount'

interface UserCountContextType {
  userCount: number | null
  formattedCount: string
  isLoading: boolean
  error: string | null
  refreshUserCount: () => Promise<void>
}

const UserCountContext = createContext<UserCountContextType | undefined>(undefined)

export function useUserCount() {
  const context = useContext(UserCountContext)
  if (context === undefined) {
    throw new Error('useUserCount must be used within a UserCountProvider')
  }
  return context
}

interface UserCountProviderProps {
  children: ReactNode
}

export function UserCountProvider({ children }: UserCountProviderProps) {
  const [userCount, setUserCount] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUserCount = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await getCachedUserCount()
      
      if (result.success && result.count !== undefined) {
        setUserCount(result.count)
      } else {
        setError(result.error || 'Failed to fetch user count')
        // Fallback to default count
        setUserCount(354000) // Default fallback
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      // Fallback to default count
      setUserCount(354000) // Default fallback
    } finally {
      setIsLoading(false)
    }
  }

  // Setup realtime listener
  useEffect(() => {
    const unsubscribe = subscribeToUserCount(
      (count) => {
        console.log('Realtime user count update:', count)
        setUserCount(count)
        setIsLoading(false)
      },
      (error) => {
        console.error('Realtime user count error:', error)
        setError(error)
        setIsLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  const refreshUserCount = async () => {
    await fetchUserCount()
  }

  useEffect(() => {
    fetchUserCount()
  }, [])

  const formattedCount = userCount ? formatUserCount(userCount) : '354K+'

  const value: UserCountContextType = {
    userCount,
    formattedCount,
    isLoading,
    error,
    refreshUserCount
  }

  return (
    <UserCountContext.Provider value={value}>
      {children}
    </UserCountContext.Provider>
  )
}
