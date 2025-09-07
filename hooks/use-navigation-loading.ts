"use client"

import { useRouter } from 'next/navigation'
import { useLoading } from '@/lib/contexts/LoadingContext'
import { useCallback } from 'react'

export function useNavigationLoading() {
  const router = useRouter()
  const { setLoading, setLoadingMessage } = useLoading()

  const navigateWithLoading = useCallback((
    href: string, 
    message: string = 'Loading...'
  ) => {
    setLoadingMessage(message)
    setLoading(true)
    
    // Navigate after a short delay to show loading
    setTimeout(() => {
      router.push(href)
    }, 100)
    
    // Auto-hide loading after 3 seconds as fallback
    setTimeout(() => {
      setLoading(false)
    }, 3000)
  }, [router, setLoading, setLoadingMessage])

  return { navigateWithLoading }
}
