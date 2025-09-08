import { QuranResponse } from '../types/quran';

const QURAN_API_BASE_URL = 'https://api.alquran.cloud/v1';

export async function getAllSurahs(): Promise<QuranResponse> {
  try {
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

    return data;
  } catch (error) {
    console.error('Error fetching surahs:', error);
    throw error;
  }
}

export async function getSurahById(id: number) {
  try {
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

    return {
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
  } catch (error) {
    console.error('Error fetching surah:', error);
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