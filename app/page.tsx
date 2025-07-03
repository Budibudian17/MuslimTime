import HeroSection from "@/components/hero-section"
import SurahList, { SurahListItem } from "@/components/surah-list"
import Sidebar from "@/components/sidebar"
import PrayerTimes from "@/components/prayer-times"
import { getAllSurahs } from "@/lib/services/quran"
import Footer from "@/components/footer"

export default async function HomePage() {
  let surahs: SurahListItem[] = []
  let isError = false
  try {
    const response = await getAllSurahs()
    surahs = response.data
  } catch (e) {
    isError = true
  }

  // Batasi hanya 18 surah pertama
  const limitedSurahs = surahs.slice(0, 18)

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <main className="container mx-auto px-4 py-8">
        <HeroSection />
        <div className="mt-12 lg:flex lg:space-x-8">
          <div className="lg:w-2/3">
            <div className="space-y-8">
              <PrayerTimes />
              <SurahList surahs={limitedSurahs} isLoading={isError || surahs.length === 0} showSeeAllSurah />
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
