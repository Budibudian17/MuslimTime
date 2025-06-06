"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronDown, Search } from "lucide-react"
import { useEffect, useState } from "react"

interface Surah {
  id: number
  nameEn: string
  nameAr: string
  verses: number
  meaning: string
  isHighlighted?: boolean
}

const surahs: Surah[] = [
  { id: 1, nameEn: "Al-Fatihah", nameAr: "ٱلْفَاتِحَة", verses: 7, meaning: "The Opener" },
  { id: 2, nameEn: "Al-Baqarah", nameAr: "ٱلْبَقَرَة", verses: 286, meaning: "The Cow" },
  { id: 3, nameEn: "Al-Imran", nameAr: "آلِ عِمْرَان", verses: 200, meaning: "The Family of Imran" },
  { id: 4, nameEn: "An-Nisa'", nameAr: "ٱلنِّسَاء", verses: 176, meaning: "The Women" },
  { id: 5, nameEn: "Al-Ma'idah", nameAr: "ٱلْمَائِدَة", verses: 120, meaning: "The Table Spread", isHighlighted: true },
  { id: 6, nameEn: "Al-An'am", nameAr: "ٱلْأَنْعَام", verses: 165, meaning: "The Cattle" },
  { id: 7, nameEn: "Al-A'raf", nameAr: "ٱلْأَعْرَاف", verses: 206, meaning: "The Heights" },
  { id: 8, nameEn: "Al-Anfal", nameAr: "ٱلْأَنْفَال", verses: 75, meaning: "The Spoils of War" },
  { id: 9, nameEn: "At-Tawbah", nameAr: "ٱلتَّوْبَة", verses: 129, meaning: "The Repentance" },
  { id: 10, nameEn: "Yunus", nameAr: "يُونُس", verses: 109, meaning: "Jonah" },
  { id: 11, nameEn: "Hud", nameAr: "هُود", verses: 123, meaning: "Hud" },
  { id: 12, nameEn: "Yusuf", nameAr: "يُوسُف", verses: 111, meaning: "Joseph" },
]

export default function SurahList() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
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
      </Tabs>

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
        <a href="#" className="text-sky-600 hover:text-sky-700 font-medium text-sm">
          See All Surah &gt;
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {surahs.map((surah) => (
          <div
            key={surah.id}
            className="p-4 rounded-xl border bg-gray-50 border-gray-200 transition-all duration-200 cursor-pointer hover:bg-sky-500 hover:text-white hover:shadow-2xl hover:scale-105 group"
            style={{ willChange: 'transform' }}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-500 transition-colors duration-200 group-hover:text-white">
                  {String(surah.id).padStart(2, "0")}
                </p>
                <h3 className="font-semibold mt-1 text-gray-800 transition-colors duration-200 group-hover:text-white">{surah.nameEn}</h3>
                <p className="text-xs text-gray-500 transition-colors duration-200 group-hover:text-white">{surah.meaning}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-arabic text-sky-700 transition-colors duration-200 group-hover:text-white">{surah.nameAr}</p>
                <p className="text-xs mt-1 text-gray-500 transition-colors duration-200 group-hover:text-white">
                  {surah.verses} verses
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
