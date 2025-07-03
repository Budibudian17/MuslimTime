"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ChevronDown, Search } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { useEffect, useState } from "react"
import { getJuzById } from "@/lib/services/quran"

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

interface SurahListProps {
  surahs: SurahListItem[]
  isLoading?: boolean
  showSeeAllSurah?: boolean
}

const JuzList = () => {
  const [juzData, setJuzData] = useState<JuzData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAllJuz = async () => {
      try {
        const promises = Array.from({ length: 30 }, (_, i) => getJuzById(i + 1))
        const results = await Promise.all(promises)
        setJuzData(results)
      } catch (error) {
        console.error("Error fetching juz data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllJuz()
  }, [])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
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
    )
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
        <Button variant="outline" className="text-gray-600 border-gray-300 rounded-lg">
          Sort by: Ascending <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search Juz..."
            className="pl-10 rounded-lg border-gray-300 w-full sm:w-64"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {juzData.map((juz) => (
          <Link
            key={juz.number}
            href={`/juz/${juz.number}`}
            className="block"
            passHref
          >
            <div
              className="p-4 rounded-xl border bg-gray-50 border-gray-200 transition-all duration-200 cursor-pointer hover:bg-sky-500 hover:text-white hover:shadow-2xl hover:scale-105 group"
              style={{ willChange: 'transform' }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-gray-500 transition-colors duration-200 group-hover:text-white">
                    {String(juz.number).padStart(2, "0")}
                  </p>
                  <h3 className="font-semibold mt-1 text-gray-800 transition-colors duration-200 group-hover:text-white">
                    Juz {juz.number}
                  </h3>
                  <p className="text-xs text-gray-500 transition-colors duration-200 group-hover:text-white">
                    Starts from {juz.startSurah.englishName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-arabic text-sky-700 transition-colors duration-200 group-hover:text-white">
                    {juz.startSurah.name}
                  </p>
                  <p className="text-xs mt-1 text-gray-500 transition-colors duration-200 group-hover:text-white">
                    {juz.totalAyahs} verses
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}

export default function SurahList({ surahs, isLoading, showSeeAllSurah = false }: SurahListProps) {
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

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm">
      <h2 className="text-3xl font-bold mb-6">Explore the Holy Quran</h2>
      <Tabs defaultValue="surah" className="mb-6">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100 rounded-full p-1">
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
            <Button variant="outline" className="text-gray-600 border-gray-300 rounded-lg">
              Sort by: Ascending <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search Surah..."
                className="pl-10 rounded-lg border-gray-300 w-full sm:w-64"
              />
            </div>
            {showSeeAllSurah && (
              <a href="/explore" className="text-sky-600 hover:text-sky-700 font-medium text-sm">
                See All Surah &gt;
              </a>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {surahs.map((surah) => (
              <Link
                key={surah.number}
                href={`/surah/${surah.number}`}
                className="block"
                passHref
              >
                <div
                  className="p-4 rounded-xl border bg-gray-50 border-gray-200 transition-all duration-200 cursor-pointer hover:bg-sky-500 hover:text-white hover:shadow-2xl hover:scale-105 group"
                  style={{ willChange: 'transform' }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-gray-500 transition-colors duration-200 group-hover:text-white">
                        {String(surah.number).padStart(2, "0")}
                      </p>
                      <h3 className="font-semibold mt-1 text-gray-800 transition-colors duration-200 group-hover:text-white">{surah.englishName}</h3>
                      <p className="text-xs text-gray-500 transition-colors duration-200 group-hover:text-white">{surah.englishNameTranslation}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-arabic text-sky-700 transition-colors duration-200 group-hover:text-white">{surah.name}</p>
                      <p className="text-xs mt-1 text-gray-500 transition-colors duration-200 group-hover:text-white">
                        {surah.numberOfAyahs} verses
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="juz">
          <JuzList />
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
