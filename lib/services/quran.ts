import { QuranResponse } from '../types/quran';
import { offlineStorage } from './offline-storage';

// Reciters and audio helpers
type ReciterId =
  | 'ar.alafasy'
  | 'ar.abdulbasit'
  | 'ar.hudhaify'
  | 'ar.mahermuaiqly'
  | 'ar.minshawi'
  | 'ar.sudais';

type Bitrate = 32 | 64 | 128;

interface Reciter {
  id: ReciterId;
  name: string;
}

const DEFAULT_RECITER: ReciterId = 'ar.alafasy';
const DEFAULT_BITRATE: Bitrate = 128;

const SUPPORTED_RECITERS: Reciter[] = [
  { id: 'ar.alafasy', name: 'Mishary Rashid Alafasy' },
  { id: 'ar.sudais', name: 'Abdul Rahman Al-Sudais' },
  { id: 'ar.abdulbasit', name: 'Abdul Basit Abdus Samad' },
  { id: 'ar.minshawi', name: 'Muhammad Siddiq Al-Minshawi' },
  { id: 'ar.hudhaify', name: 'Ali Al-Hudhaify' },
  { id: 'ar.mahermuaiqly', name: 'Maher Al-Muaiqly' }
];

export function getSupportedReciters(): Reciter[] {
  return SUPPORTED_RECITERS;
}

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export async function getPreferredReciterId(): Promise<ReciterId> {
  try {
    const prefs = await offlineStorage.getCachedUserPreferences();
    const reciterId = prefs?.quran?.preferredReciter as ReciterId | undefined;
    if (reciterId && SUPPORTED_RECITERS.some(r => r.id === reciterId)) {
      return reciterId;
    }
  } catch {}
  return DEFAULT_RECITER;
}

export async function setPreferredReciterId(reciterId: ReciterId): Promise<void> {
  // Store inside user_preferences under quran.preferredReciter
  try {
    const current = (await offlineStorage.getCachedUserPreferences()) || {};
    const next = {
      ...current,
      quran: {
        ...(current.quran || {}),
        preferredReciter: reciterId
      }
    };
    await offlineStorage.cacheUserPreferences(next);
  } catch (e) {
    console.error('Failed to set preferred reciter:', e);
  }
}

export function buildSurahAudioUrl(
  surahId: number,
  reciterId: ReciterId = DEFAULT_RECITER,
  bitrate: Bitrate = DEFAULT_BITRATE
): string {
  return `https://cdn.islamic.network/quran/audio-surah/${bitrate}/${reciterId}/${surahId}.mp3`;
}

// Fetch reciters list (editions) from API and cache
export interface ReciterEdition {
  identifier: string;
  language: string;
  name: string;
  englishName: string;
  format: string; // audio
  type: string;   // versebyverse or surah
  direction?: string;
}

export async function fetchReciters(options?: { useCacheFirst?: boolean }): Promise<ReciterEdition[]> {
  const useCacheFirst = options?.useCacheFirst !== false;
  // Try cache first when offline or when requested
  if (!offlineStorage.isOnline() || useCacheFirst) {
    const cached = await offlineStorage.getCachedRecitersList();
    if (cached && Array.isArray(cached) && cached.length > 0) {
      return cached as ReciterEdition[];
    }
  }

  const res = await fetch(`${QURAN_API_BASE_URL}/edition?format=audio&type=versebyverse`, {
    next: { revalidate: 24 * 60 * 60 }
  });
  if (!res.ok) throw new Error(`Failed to fetch reciters: ${res.status}`);
  const json = await res.json();
  const list = Array.isArray(json?.data) ? (json.data as ReciterEdition[]) : [];
  if (list.length) {
    await offlineStorage.cacheRecitersList(list);
  }
  return list;
}

// Fetch a surah audio (ayah-by-ayah) for a specific reciter identifier
export interface SurahAudioAyah {
  number: number;
  text?: string;
  audio: string;
  numberInSurah: number;
}

export interface SurahAudioResponse {
  surahId: number;
  reciterIdentifier: string;
  ayahs: SurahAudioAyah[];
}

export async function fetchSurahAudioByReciter(surahId: number, reciterIdentifier: string): Promise<SurahAudioResponse> {
  const res = await fetch(`${QURAN_API_BASE_URL}/surah/${surahId}/${reciterIdentifier}`, {
    next: { revalidate: 60 * 60 }
  });
  if (!res.ok) throw new Error(`Failed to fetch surah audio: ${res.status}`);
  const json = await res.json();
  const data = json?.data;
  const ayahs: SurahAudioAyah[] = Array.isArray(data?.ayahs)
    ? data.ayahs.map((a: any) => ({
        number: a.number,
        numberInSurah: a.numberInSurah,
        audio: a.audio,
        text: a.text
      }))
    : [];
  return { surahId, reciterIdentifier, ayahs };
}

const QURAN_API_BASE_URL = 'https://api.alquran.cloud/v1';

export async function getAllSurahs(): Promise<QuranResponse> {
  try {
    // Check if we're online
    if (!offlineStorage.isOnline()) {
      console.log('Offline mode: Getting cached surah list');
      const cachedData = await offlineStorage.getCachedSurahList();
      if (cachedData) {
        return { data: cachedData, code: 200, status: 'OK' };
      }
      throw new Error('No cached data available offline');
    }

    const response = await fetch(`${QURAN_API_BASE_URL}/surah`, {
      next: {
        revalidate: 3600 // Cache for 1 hour
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch surahs: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data || !data.data || !Array.isArray(data.data)) {
      throw new Error('Invalid response format from Quran API');
    }

    // Cache the data for offline use
    await offlineStorage.cacheSurahList(data.data);
    console.log('Surah list cached for offline use');

    return data;
  } catch (error) {
    console.error('Error fetching surahs:', error);
    
    // Try to get cached data as fallback
    if (offlineStorage.isOnline()) {
      console.log('Online but API failed, trying cached data');
      const cachedData = await offlineStorage.getCachedSurahList();
      if (cachedData) {
        return { data: cachedData, code: 200, status: 'OK' };
      }
    }
    
    throw error;
  }
}

export async function getSurahById(id: number) {
  try {
    // Check if we're online
    if (!offlineStorage.isOnline()) {
      console.log('Offline mode: Getting cached surah data');
      const cachedData = await offlineStorage.getCachedSurah(id);
      if (cachedData) {
        return cachedData;
      }
      throw new Error('No cached surah data available offline');
    }

    // Fetch surah data
    const surahResponse = await fetch(`${QURAN_API_BASE_URL}/surah/${id}`, {
      next: {
        revalidate: 3600 // Cache for 1 hour
      }
    });

    if (!surahResponse.ok) {
      throw new Error(`Failed to fetch surah: ${surahResponse.status} ${surahResponse.statusText}`);
    }

    const surahData = await surahResponse.json();

    // Fetch translation
    const translationResponse = await fetch(`${QURAN_API_BASE_URL}/surah/${id}/en.ahmedali`, {
      next: {
        revalidate: 3600 // Cache for 1 hour
      }
    });

    if (!translationResponse.ok) {
      throw new Error(`Failed to fetch translation: ${translationResponse.status} ${translationResponse.statusText}`);
    }

    const translationData = await translationResponse.json();

    // Combine the data
    const surah = surahData.data;
    const translation = translationData.data;

    // Determine reciter for audio URL
    let reciterId: ReciterId = DEFAULT_RECITER;
    if (isBrowser()) {
      try {
        reciterId = await getPreferredReciterId();
      } catch {}
    }

    const surahDataCombined = {
      id: surah.number,
      nameEn: surah.englishName,
      nameAr: surah.name,
      meaning: surah.englishNameTranslation,
      verses: surah.numberOfAyahs,
      revelationType: surah.revelationType,
      translationBy: "Ahmed Ali",
      story: "Coming soon...", // We can add this later from another API
      ayat: surah.ayahs.map((ayah: any, index: number) => ({
        number: index + 1,
        arabic: ayah.text,
        translation: translation.ayahs[index].text
      })),
      audioUrl: buildSurahAudioUrl(id, reciterId, DEFAULT_BITRATE)
    };

    // Cache the data for offline use
    await offlineStorage.cacheSurah(id, surahDataCombined);
    console.log(`Surah ${id} cached for offline use`);

    return surahDataCombined;
  } catch (error) {
    console.error('Error fetching surah:', error);
    
    // Try to get cached data as fallback
    if (offlineStorage.isOnline()) {
      console.log('Online but API failed, trying cached data');
      const cachedData = await offlineStorage.getCachedSurah(id);
      if (cachedData) {
        return cachedData;
      }
    }
    
    throw error;
  }
}

interface JuzAyah {
  number: number;
  text: string;
  surah: {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    revelationType: string;
    numberOfAyahs: number;
  };
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean;
}

interface JuzResponse {
  code: number;
  status: string;
  data: {
    number: number;
    ayahs: JuzAyah[];
  };
}

export const getJuzById = async (juzNumber: number) => {
  try {
    const response = await fetch(`https://api.alquran.cloud/v1/juz/${juzNumber}/quran-uthmani`);
    const data: JuzResponse = await response.json();
    
    if (data.code === 200 && data.status === "OK") {
      // Get the first surah in the juz for audio
      const firstSurah = data.data.ayahs[0].surah;
      
      // Determine reciter for audio URL (browser only)
      let reciterId: ReciterId = DEFAULT_RECITER;
      if (isBrowser()) {
        try {
          reciterId = await getPreferredReciterId();
        } catch {}
      }

      return {
        number: data.data.number,
        startSurah: data.data.ayahs[0].surah,
        totalAyahs: data.data.ayahs.length,
        ayahs: data.data.ayahs,
        audioUrl: buildSurahAudioUrl(firstSurah.number, reciterId, DEFAULT_BITRATE)
      };
    }
    
    throw new Error("Failed to fetch juz data");
  } catch (error) {
    console.error("Error fetching juz:", error);
    throw error;
  }
};

interface JuzTranslationResponse {
  code: number;
  status: string;
  data: {
    number: number;
    ayahs: Array<{
      number: number;
      text: string;
      surah: {
        number: number;
        name: string;
        englishName: string;
        englishNameTranslation: string;
        numberOfAyahs: number;
        revelationType: string;
      };
      numberInSurah: number;
      juz: number;
    }>;
  };
}

export const getJuzTranslation = async (juzNumber: number) => {
  try {
    const response = await fetch(`https://api.alquran.cloud/v1/juz/${juzNumber}/en.asad`);
    const data: JuzTranslationResponse = await response.json();
    
    if (data.code === 200 && data.status === "OK") {
      return data.data;
    }
    
    throw new Error("Failed to fetch juz translation");
  } catch (error) {
    console.error("Error fetching juz translation:", error);
    throw error;
  }
}; 