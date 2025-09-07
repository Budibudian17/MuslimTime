"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface LoadingContextType {
  isLoading: boolean
  setLoading: (loading: boolean) => void
  loadingMessage: string
  setLoadingMessage: (message: string) => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function useLoading() {
  const context = useContext(LoadingContext)
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}

interface LoadingProviderProps {
  children: ReactNode
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('Loading...')

  const setLoading = (loading: boolean) => {
    setIsLoading(loading)
  }

  const value: LoadingContextType = {
    isLoading,
    setLoading,
    loadingMessage,
    setLoadingMessage
  }

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center space-y-4 min-w-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
            <p className="text-gray-700 font-medium">{loadingMessage}</p>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  )
}
