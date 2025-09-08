import HeroSection from "@/components/hero-section"
import SurahList, { SurahListItem } from "@/components/surah-list"
import Sidebar from "@/components/sidebar"
import PrayerTimes from "@/components/prayer-times"
import { getAllSurahs, getJuzById } from "@/lib/services/quran"
import Footer from "@/components/footer"

export default async function HomePage() {
  let surahs: SurahListItem[] = []
  let juzData: any[] = []
  let isError = false
  let juzError = false
  
  try {
    const response = await getAllSurahs()
    surahs = response.data
  } catch (e) {
    isError = true
  }

  // Skip server-side Juz loading to avoid API issues
  // Let client-side handle Juz loading with fallback
  juzError = false // Will use static data fallback

  // Batasi hanya 18 surah pertama
  const limitedSurahs = surahs.slice(0, 18)

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 dark:bg-neutral-950 dark:text-gray-100">
      <main className="container mx-auto px-4 py-8">
        <HeroSection />
        <div className="mt-12 lg:flex lg:space-x-8">
          <div className="lg:w-2/3">
            <div className="space-y-8">
              <PrayerTimes />
              <SurahList 
                surahs={limitedSurahs} 
                isLoading={isError || surahs.length === 0} 
                showSeeAllSurah 
                limitJuz={18}
                juzLoadingError={juzError}
              />
            </div>
          </div>
          <div className="lg:w-1/3 mt-8 lg:mt-0">
            <Sidebar />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
