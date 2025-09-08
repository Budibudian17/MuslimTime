"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ChevronDown, Search } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { useEffect, useState } from "react"
import { getJuzById } from "@/lib/services/quran"
import { useNavigationLoading } from "@/hooks/use-navigation-loading"

export interface SurahListItem {
  number: number
  name: string
  englishName: string
  englishNameTranslation: string
  numberOfAyahs: number
  revelationType: string
}

interface JuzData {
  number: number
  startSurah: {
    name: string
    englishName: string
    englishNameTranslation: string
    number: number
  }
  totalAyahs: number
}

// Static Juz data as fallback - all 30 Juz
const STATIC_JUZ_DATA: JuzData[] = [
  { number: 1, startSurah: { name: "الفاتحة", englishName: "Al-Fatihah", englishNameTranslation: "The Opening", number: 1 }, totalAyahs: 148 },
  { number: 2, startSurah: { name: "البقرة", englishName: "Al-Baqarah", englishNameTranslation: "The Cow", number: 2 }, totalAyahs: 111 },
  { number: 3, startSurah: { name: "البقرة", englishName: "Al-Baqarah", englishNameTranslation: "The Cow", number: 2 }, totalAyahs: 111 },
  { number: 4, startSurah: { name: "البقرة", englishName: "Al-Baqarah", englishNameTranslation: "The Cow", number: 2 }, totalAyahs: 111 },
  { number: 5, startSurah: { name: "البقرة", englishName: "Al-Baqarah", englishNameTranslation: "The Cow", number: 2 }, totalAyahs: 111 },
  { number: 6, startSurah: { name: "البقرة", englishName: "Al-Baqarah", englishNameTranslation: "The Cow", number: 2 }, totalAyahs: 111 },
  { number: 7, startSurah: { name: "البقرة", englishName: "Al-Baqarah", englishNameTranslation: "The Cow", number: 2 }, totalAyahs: 111 },
  { number: 8, startSurah: { name: "البقرة", englishName: "Al-Baqarah", englishNameTranslation: "The Cow", number: 2 }, totalAyahs: 111 },
  { number: 9, startSurah: { name: "البقرة", englishName: "Al-Baqarah", englishNameTranslation: "The Cow", number: 2 }, totalAyahs: 111 },
  { number: 10, startSurah: { name: "البقرة", englishName: "Al-Baqarah", englishNameTranslation: "The Cow", number: 2 }, totalAyahs: 111 },
  { number: 11, startSurah: { name: "التوبة", englishName: "At-Tawbah", englishNameTranslation: "The Repentance", number: 9 }, totalAyahs: 149 },
  { number: 12, startSurah: { name: "هود", englishName: "Hud", englishNameTranslation: "Hud", number: 11 }, totalAyahs: 123 },
  { number: 13, startSurah: { name: "يوسف", englishName: "Yusuf", englishNameTranslation: "Joseph", number: 12 }, totalAyahs: 111 },
  { number: 14, startSurah: { name: "الحجر", englishName: "Al-Hijr", englishNameTranslation: "The Rocky Tract", number: 15 }, totalAyahs: 99 },
  { number: 15, startSurah: { name: "الإسراء", englishName: "Al-Isra", englishNameTranslation: "The Night Journey", number: 17 }, totalAyahs: 111 },
  { number: 16, startSurah: { name: "الكهف", englishName: "Al-Kahf", englishNameTranslation: "The Cave", number: 18 }, totalAyahs: 110 },
  { number: 17, startSurah: { name: "الأنبياء", englishName: "Al-Anbiya", englishNameTranslation: "The Prophets", number: 21 }, totalAyahs: 112 },
  { number: 18, startSurah: { name: "المؤمنون", englishName: "Al-Mu'minun", englishNameTranslation: "The Believers", number: 23 }, totalAyahs: 118 },
  { number: 19, startSurah: { name: "الفرقان", englishName: "Al-Furqan", englishNameTranslation: "The Criterion", number: 25 }, totalAyahs: 77 },
  { number: 20, startSurah: { name: "النمل", englishName: "An-Naml", englishNameTranslation: "The Ant", number: 27 }, totalAyahs: 93 },
  { number: 21, startSurah: { name: "العنكبوت", englishName: "Al-Ankabut", englishNameTranslation: "The Spider", number: 29 }, totalAyahs: 69 },
  { number: 22, startSurah: { name: "الأحزاب", englishName: "Al-Ahzab", englishNameTranslation: "The Clans", number: 33 }, totalAyahs: 73 },
  { number: 23, startSurah: { name: "يس", englishName: "Ya-Sin", englishNameTranslation: "Ya-Sin", number: 36 }, totalAyahs: 83 },
  { number: 24, startSurah: { name: "الزمر", englishName: "Az-Zumar", englishNameTranslation: "The Groups", number: 39 }, totalAyahs: 75 },
  { number: 25, startSurah: { name: "فصلت", englishName: "Fussilat", englishNameTranslation: "Explained in Detail", number: 41 }, totalAyahs: 54 },
  { number: 26, startSurah: { name: "الجاثية", englishName: "Al-Jathiyah", englishNameTranslation: "The Crouching", number: 45 }, totalAyahs: 37 },
  { number: 27, startSurah: { name: "الذاريات", englishName: "Adh-Dhariyat", englishNameTranslation: "The Winnowing Winds", number: 51 }, totalAyahs: 60 },
  { number: 28, startSurah: { name: "المجادلة", englishName: "Al-Mujadila", englishNameTranslation: "The Pleading Woman", number: 58 }, totalAyahs: 22 },
  { number: 29, startSurah: { name: "الملك", englishName: "Al-Mulk", englishNameTranslation: "The Sovereignty", number: 67 }, totalAyahs: 30 },
  { number: 30, startSurah: { name: "المعارج", englishName: "Al-Ma'arij", englishNameTranslation: "The Ascending Stairways", number: 70 }, totalAyahs: 44 },
]

interface SurahListProps {
  surahs: SurahListItem[]
  isLoading?: boolean
  showSeeAllSurah?: boolean
  limitJuz?: number // Limit number of Juz to display (for homepage vs explore page)
  preloadedJuzData?: JuzData[] // Pre-loaded Juz data from server
  juzLoadingError?: boolean // Whether Juz loading failed
}

const JuzList = ({ limitJuz, preloadedJuzData, juzLoadingError }: { 
  limitJuz?: number
  preloadedJuzData?: JuzData[]
  juzLoadingError?: boolean
}) => {
  const [mounted, setMounted] = useState(false)
  const [juzData, setJuzData] = useState<JuzData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { navigateWithLoading } = useNavigationLoading()
  const [juzQuery, setJuzQuery] = useState("")
  const [isJuzAsc, setIsJuzAsc] = useState(true)

  useEffect(() => {
    setMounted(true)
    
    // If we have pre-loaded data, use it immediately
    if (preloadedJuzData && preloadedJuzData.length > 0) {
      setJuzData(preloadedJuzData)
      setIsLoading(false)
      return
    }
    
    // If pre-loading failed, use static data
    if (juzLoadingError) {
      const limitedStaticData = limitJuz ? STATIC_JUZ_DATA.slice(0, limitJuz) : STATIC_JUZ_DATA
      setJuzData(limitedStaticData)
      setIsLoading(false)
      return
    }
    
    // Otherwise, fetch from API (for explore page)
    const fetchAllJuz = async () => {
      try {
        // For homepage (limited Juz), try to fetch with shorter timeout
        // For explore page, use batch loading
        const totalJuz = limitJuz || 30
        const results: JuzData[] = []
        
        if (limitJuz && limitJuz <= 18) {
          // Homepage: Try to fetch all at once with timeout
          try {
            const promises = Array.from({ length: totalJuz }, (_, i) => getJuzById(i + 1))
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('API timeout')), 5000) // 5 second timeout
            )
            
            const apiResults = await Promise.race([
              Promise.all(promises),
              timeoutPromise
            ]) as JuzData[]
            
            results.push(...apiResults)
          } catch (apiError) {
            console.log("API fetch failed, using static data")
            // Fall through to static data
          }
        } else {
          // Explore page: Use batch loading
          const batchSize = 5
          for (let i = 0; i < totalJuz; i += batchSize) {
            const batch = Array.from({ length: Math.min(batchSize, totalJuz - i) }, (_, j) => 
              getJuzById(i + j + 1)
            )
            
            try {
              const batchResults = await Promise.all(batch)
              results.push(...batchResults)
              
              // Small delay between batches to avoid rate limiting
              if (i + batchSize < totalJuz) {
                await new Promise(resolve => setTimeout(resolve, 500))
              }
            } catch (batchError) {
              console.error(`Error fetching batch ${i + 1}-${i + batchSize}:`, batchError)
              // Continue with next batch even if one fails
            }
          }
        }
        
        if (results.length > 0) {
          setJuzData(results)
        } else {
          // If no API data was fetched, use static data with limit
          const limitedStaticData = limitJuz ? STATIC_JUZ_DATA.slice(0, limitJuz) : STATIC_JUZ_DATA
          setJuzData(limitedStaticData)
        }
      } catch (error) {
        console.error("Error fetching juz data:", error)
        // Use static data as fallback with limit
        const limitedStaticData = limitJuz ? STATIC_JUZ_DATA.slice(0, limitJuz) : STATIC_JUZ_DATA
        setJuzData(limitedStaticData)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllJuz()
  }, [preloadedJuzData, juzLoadingError, limitJuz])

  if (!mounted || isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="p-4 rounded-xl border bg-gray-50 dark:bg-neutral-800/60 border-gray-200 dark:border-gray-800">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Skeleton className="h-3 w-6" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="text-right space-y-2">
                <Skeleton className="h-6 w-16 ml-auto" />
                <Skeleton className="h-3 w-12 ml-auto" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const filteredJuz = juzData
    .filter((juz) => {
      const q = juzQuery.trim().toLowerCase()
      if (!q) return true
      return (
        String(juz.number).includes(q) ||
        juz.startSurah.englishName.toLowerCase().includes(q)
      )
    })
    .sort((a, b) => (isJuzAsc ? a.number - b.number : b.number - a.number))


  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
        <Button
          variant="outline"
          className="text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-700 bg-white dark:bg-neutral-800 rounded-lg"
          onClick={() => setIsJuzAsc((v) => !v)}
        >
          Sort by: {isJuzAsc ? "Ascending" : "Descending"} <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search Juz..."
            className="pl-10 rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 w-full sm:w-64"
            value={juzQuery}
            onChange={(e) => setJuzQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredJuz.map((juz) => (
          <div
            key={juz.number}
            onClick={() => navigateWithLoading(`/juz/${juz.number}`, `Loading Juz ${juz.number}...`)}
            className="block cursor-pointer"
          >
            <div
              className="p-4 rounded-xl border bg-gray-50 dark:bg-neutral-800/60 border-gray-200 dark:border-gray-800 transition-all duration-200 cursor-pointer hover:bg-sky-500 hover:text-white hover:shadow-2xl hover:scale-105 group"
              style={{ willChange: 'transform' }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200 group-hover:text-white">
                    {String(juz.number).padStart(2, "0")}
                  </p>
                  <h3 className="font-semibold mt-1 text-gray-800 dark:text-gray-100 transition-colors duration-200 group-hover:text-white">
                    Juz {juz.number}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200 group-hover:text-white">
                    Starts from {juz.startSurah.englishName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-arabic text-sky-700 transition-colors duration-200 group-hover:text-white">
                    {juz.startSurah.name}
                  </p>
                  <p className="text-xs mt-1 text-gray-500 dark:text-gray-400 transition-colors duration-200 group-hover:text-white">
                    {juz.totalAyahs} verses
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default function SurahList({ surahs, isLoading, showSeeAllSurah = false, limitJuz, preloadedJuzData, juzLoadingError }: SurahListProps) {
  const { navigateWithLoading } = useNavigationLoading()
  const [mounted, setMounted] = useState(false)
  const [surahQuery, setSurahQuery] = useState("")
  const [isSurahAsc, setIsSurahAsc] = useState(true)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
        <Skeleton className="h-10 w-64 mb-6" />
        <div className="mb-6">
          <div className="grid w-full grid-cols-3 bg-gray-100 dark:bg-neutral-800 rounded-full p-1">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-9 rounded-full mx-1" />
            ))}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <div key={i} className="p-4 rounded-xl border bg-gray-50 dark:bg-neutral-800/60 border-gray-200 dark:border-gray-800">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-6" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-6 w-16 ml-auto" />
                  <Skeleton className="h-3 w-12 ml-auto" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm">
        <Skeleton className="h-10 w-64 mb-6" />
        <div className="mb-6">
          <div className="grid w-full grid-cols-3 bg-gray-100 rounded-full p-1">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-9 rounded-full mx-1" />
            ))}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <div key={i} className="p-4 rounded-xl border bg-gray-50 border-gray-200">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-6" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-6 w-16 ml-auto" />
                  <Skeleton className="h-3 w-12 ml-auto" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const filteredSurahs = surahs
    .filter((s) => {
      const q = surahQuery.trim().toLowerCase()
      if (!q) return true
      return (
        String(s.number).includes(q) ||
        s.englishName.toLowerCase().includes(q) ||
        s.englishNameTranslation.toLowerCase().includes(q)
      )
    })
    .sort((a, b) => (isSurahAsc ? a.number - b.number : b.number - a.number))

  return (
    <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
      <h2 className="text-3xl font-bold mb-6">Explore the Holy Quran</h2>
      <Tabs defaultValue="surah" className="mb-6">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-neutral-800 rounded-full p-1">
          <TabsTrigger
            value="surah"
            className="rounded-full data-[state=active]:bg-sky-500 data-[state=active]:text-white"
          >
            Surah
          </TabsTrigger>
          <TabsTrigger
            value="juz"
            className="rounded-full data-[state=active]:bg-sky-500 data-[state=active]:text-white"
          >
            Juz
          </TabsTrigger>
          <TabsTrigger
            value="hadith"
            className="rounded-full data-[state=active]:bg-sky-500 data-[state=active]:text-white"
          >
            Hadith
          </TabsTrigger>
        </TabsList>
        <TabsContent value="surah">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
            <Button
              variant="outline"
              className="text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-700 bg-white dark:bg-neutral-800 rounded-lg"
              onClick={() => setIsSurahAsc((v) => !v)}
            >
              Sort by: {isSurahAsc ? "Ascending" : "Descending"} <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search Surah..."
                className="pl-10 rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 w-full sm:w-64"
                value={surahQuery}
                onChange={(e) => setSurahQuery(e.target.value)}
              />
            </div>
            {showSeeAllSurah && (
              <a href="/explore" className="text-sky-600 hover:text-sky-700 font-medium text-sm">
                See All Surah &gt;
              </a>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSurahs.map((surah) => (
              <div
                key={surah.number}
                onClick={() => navigateWithLoading(`/surah/${surah.number}`, `Loading ${surah.englishName}...`)}
                className="block cursor-pointer"
              >
                <div
                  className="p-4 rounded-xl border bg-gray-50 dark:bg-neutral-800/60 border-gray-200 dark:border-gray-800 transition-all duration-200 cursor-pointer hover:bg-sky-500 hover:text-white hover:shadow-2xl hover:scale-105 group"
                  style={{ willChange: 'transform' }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200 group-hover:text-white">
                        {String(surah.number).padStart(2, "0")}
                      </p>
                      <h3 className="font-semibold mt-1 text-gray-800 dark:text-gray-100 transition-colors duration-200 group-hover:text-white">{surah.englishName}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200 group-hover:text-white">{surah.englishNameTranslation}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-arabic text-sky-700 transition-colors duration-200 group-hover:text-white">{surah.name}</p>
                      <p className="text-xs mt-1 text-gray-500 dark:text-gray-400 transition-colors duration-200 group-hover:text-white">
                        {surah.numberOfAyahs} verses
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="juz">
          <JuzList 
            limitJuz={limitJuz} 
            preloadedJuzData={preloadedJuzData}
            juzLoadingError={juzLoadingError}
          />
        </TabsContent>
        <TabsContent value="hadith">
          <div className="text-center py-8 text-gray-500">
            Coming soon...
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
