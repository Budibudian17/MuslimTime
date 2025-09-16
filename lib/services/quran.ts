import { QuranResponse } from '../types/quran';
import { offlineStorage } from './offline-storage';

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
      audioUrl: `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${id}.mp3`
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
      
      return {
        number: data.data.number,
        startSurah: data.data.ayahs[0].surah,
        totalAyahs: data.data.ayahs.length,
        ayahs: data.data.ayahs,
        audioUrl: `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${firstSurah.number}.mp3`
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