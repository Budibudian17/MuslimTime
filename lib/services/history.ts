import { db } from '@/lib/firebase'
import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore'

export interface ReadingHistory {
  id?: string
  userId: string
  surahNumber: number
  surahName: string
  surahEnglishName: string
  surahArabicName: string
  ayahNumber: number
  juzNumber?: number
  lastReadAt: any // Firestore timestamp
  progress?: number // percentage of surah read
  totalAyahs: number
}

export interface HistoryResponse {
  success: boolean
  data?: ReadingHistory[]
  error?: string
}

// Save reading progress
export async function saveReadingHistory(
  userId: string,
  surahNumber: number,
  surahName: string,
  surahEnglishName: string,
  surahArabicName: string,
  ayahNumber: number,
  totalAyahs: number,
  juzNumber?: number
): Promise<{ success: boolean; error?: string }> {
  try {
    // Build payload without undefined fields (Firestore rejects undefined)
    const historyData: Omit<ReadingHistory, 'id'> = {
      userId,
      surahNumber,
      surahName,
      surahEnglishName,
      surahArabicName,
      ayahNumber,
      totalAyahs,
      lastReadAt: serverTimestamp(),
      progress: Math.round((ayahNumber / totalAyahs) * 100)
    }
    if (typeof juzNumber === 'number') {
      (historyData as any).juzNumber = juzNumber
    }

    // Check if history already exists for this surah
    const existingQuery = query(
      collection(db, 'readingHistory'),
      where('userId', '==', userId),
      where('surahNumber', '==', surahNumber)
    )
    
    const existingDocs = await getDocs(existingQuery)
    
    if (!existingDocs.empty) {
      // Update existing record
      const docRef = existingDocs.docs[0].ref
      const updateData: any = {
        ayahNumber,
        lastReadAt: serverTimestamp(),
        progress: Math.round((ayahNumber / totalAyahs) * 100)
      }
      if (typeof juzNumber === 'number') {
        updateData.juzNumber = juzNumber
      }
      await updateDoc(docRef, updateData)
    } else {
      // Create new record
      await addDoc(collection(db, 'readingHistory'), historyData)
    }

    return { success: true }
  } catch (error) {
    console.error('Error saving reading history:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

// Get user's reading history
export async function getUserReadingHistory(
  userId: string, 
  limitCount: number = 5
): Promise<HistoryResponse> {
  try {
    const q = query(
      collection(db, 'readingHistory'),
      where('userId', '==', userId),
      orderBy('lastReadAt', 'desc'),
      limit(limitCount)
    )

    const querySnapshot = await getDocs(q)
    const history: ReadingHistory[] = []

    querySnapshot.forEach((doc) => {
      history.push({
        id: doc.id,
        ...doc.data()
      } as ReadingHistory)
    })

    return {
      success: true,
      data: history
    }
  } catch (error) {
    console.error('Error getting reading history:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Get latest reading history (for sidebar)
export async function getLatestReadingHistory(userId: string): Promise<HistoryResponse> {
  try {
    // Simplified query without orderBy to avoid index requirement
    const q = query(
      collection(db, 'readingHistory'),
      where('userId', '==', userId),
      limit(1)
    )

    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      return {
        success: true,
        data: []
      }
    }

    const latestDoc = querySnapshot.docs[0]
    const history: ReadingHistory = {
      id: latestDoc.id,
      ...latestDoc.data()
    } as ReadingHistory

    return {
      success: true,
      data: [history]
    }
  } catch (error) {
    console.error('Error getting latest reading history:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
