import { db } from '@/lib/firebase'
import { collection, getCountFromServer, query, onSnapshot, doc, setDoc } from 'firebase/firestore'

export interface UserCountResponse {
  success: boolean
  count?: number
  error?: string
}

// Get total user count from database
export async function getUserCount(): Promise<UserCountResponse> {
  try {
    // Count users from the 'users' collection
    const usersRef = collection(db, 'users')
    const snapshot = await getCountFromServer(usersRef)
    const count = snapshot.data().count

    return {
      success: true,
      count
    }
  } catch (error) {
    console.error('Error getting user count:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Format number with K/M suffix
export function formatUserCount(count: number): string {
  if (count >= 1000000) {
    return `${Math.floor(count / 100000) / 10}M+`
  } else if (count >= 1000) {
    return `${Math.floor(count / 100) / 10}K+`
  } else {
    return `${count}+`
  }
}

// Get user count with caching
let cachedUserCount: { count: number; timestamp: number } | null = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function getCachedUserCount(): Promise<UserCountResponse> {
  // Check cache first
  if (cachedUserCount && Date.now() - cachedUserCount.timestamp < CACHE_DURATION) {
    return {
      success: true,
      count: cachedUserCount.count
    }
  }

  // Fetch from database
  const result = await getUserCount()
  
  if (result.success && result.count !== undefined) {
    // Update cache
    cachedUserCount = {
      count: result.count,
      timestamp: Date.now()
    }
  }

  return result
}

// Realtime user count listener
export function subscribeToUserCount(
  onUpdate: (count: number) => void,
  onError: (error: string) => void
): () => void {
  const usersRef = collection(db, 'users')
  
  const unsubscribe = onSnapshot(
    usersRef,
    (snapshot) => {
      const count = snapshot.size
      onUpdate(count)
    },
    (error) => {
      console.error('Error listening to user count:', error)
      onError(error.message)
    }
  )

  return unsubscribe
}

// Create user document when user registers
export async function createUserDocument(userId: string, userData: {
  email: string
  displayName?: string
  photoURL?: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    const userDoc = doc(db, 'users', userId)
    await setDoc(userDoc, {
      ...userData,
      createdAt: new Date(),
      lastLoginAt: new Date()
    })
    
    return { success: true }
  } catch (error) {
    console.error('Error creating user document:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
