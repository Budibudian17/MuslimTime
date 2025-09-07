"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Play, SkipBack, SkipForward, History, Search, MoreVertical } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { useState, useEffect } from "react"
import { useHistory } from "@/lib/contexts/HistoryContext"
import { useAuth } from "@/lib/contexts/AuthContext"
import Link from "next/link"

const reciters = [
  { name: "Mishary Bin Rashid Alafasy", img: "/placeholder.svg?width=80&height=80&circle=true&text=MRA" },
  { name: "Abdul Rahman Al-Sudais", img: "/placeholder.svg?width=80&height=80&circle=true&text=ARS" },
  { name: "Abdul-Basit Abdul-Samad", img: "/placeholder.svg?width=80&height=80&circle=true&text=AAS" },
  { name: "Yasser Al Dosari", img: "/placeholder.svg?width=80&height=80&circle=true&text=YAD" },
  { name: "Abdul Aziz Bin Bandar Baleela", img: "/placeholder.svg?width=80&height=80&circle=true&text=AAB" },
  { name: "Abdur Rahman Al Ossi", img: "/placeholder.svg?width=80&height=80&circle=true&text=ARO" },
]

const learningMaterials = [
  { title: "Grand Mosque", img: "/placeholder.svg?width=100&height=100&text=Mosque" },
  { title: "Kaaba", img: "/placeholder.svg?width=100&height=100&text=Kaaba" },
  { title: "Holy Quran", img: "/placeholder.svg?width=100&height=100&text=Quran" },
]

export default function Sidebar() {
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { latestHistory, isLoading: historyLoading } = useHistory()
  const { user } = useAuth()

  useEffect(() => {
    setMounted(true)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  if (!mounted) return null

  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Translation Section Skeleton */}
        <Card className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-24" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-16 w-full" />
              <div className="border border-gray-200 dark:border-gray-800 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-4" />
                </div>
                <Skeleton className="h-1 w-full mb-1" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <div className="flex items-center justify-center space-x-4 mt-3">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <Skeleton className="h-5 w-5" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reciters Section Skeleton */}
        <Card className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
          <CardHeader>
            <Skeleton className="h-6 w-3/4 mb-4" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-10 w-full mr-4" />
              <Skeleton className="h-4 w-32" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="text-center">
                  <Skeleton className="h-20 w-20 rounded-full mx-auto mb-2" />
                  <Skeleton className="h-4 w-24 mx-auto" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Learning Section Skeleton */}
        <Card className="bg-white rounded-2xl shadow-sm">
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Translation Section */}
      <Card className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <p>
              Translation by Dr. Mustafa Khattab, the Clear Quran{" "}
              <a href="#" className="text-sky-600">
                (Change)
              </a>
            </p>
            <Link href="/explore" className="flex items-center text-sky-600">
              <History className="h-3 w-3 mr-1" /> Reading History
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : latestHistory ? (
            <>
              <div className="text-right font-arabic text-2xl text-sky-700 my-4">
                <p>بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ</p>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                In the Name of Allah—the Most Compassionate, Most Merciful.
              </p>
              {/* Mini Player for Latest Reading */}
              <div className="border border-gray-200 dark:border-gray-700 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <Link 
                    href={`/surah/${latestHistory.surahNumber}`}
                    className="font-semibold text-sm text-gray-700 hover:text-sky-600 dark:text-gray-200 dark:hover:text-sky-400"
                  >
                    {latestHistory.surahEnglishName} ({latestHistory.surahName})
                  </Link>
                  <MoreVertical className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Last read: Ayah {latestHistory.ayahNumber} of {latestHistory.totalAyahs}
                </div>
                <Progress 
                  value={latestHistory.progress || 0} 
                  className="w-full h-1 bg-sky-100 dark:bg-sky-900 [&>div]:bg-sky-500" 
                />
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>{latestHistory.progress || 0}%</span>
                  <span>Continue reading</span>
                </div>
                <div className="flex items-center justify-center space-x-4 mt-3 text-gray-600 dark:text-gray-300">
                  <SkipBack className="h-5 w-5 cursor-pointer hover:text-sky-600 dark:hover:text-sky-400" />
                  <Link 
                    href={`/surah/${latestHistory.surahNumber}?ayah=${latestHistory.ayahNumber}`}
                    className="bg-sky-500 text-white rounded-full p-2 hover:bg-sky-600 dark:bg-sky-600"
                  >
                    <Play className="h-5 w-5 fill-white" />
                  </Link>
                  <SkipForward className="h-5 w-5 cursor-pointer hover:text-sky-600 dark:hover:text-sky-400" />
                </div>
              </div>
            </>
          ) : user ? (
            <div className="text-center py-8 text-gray-500">
              <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-sm">No reading history yet</p>
              <p className="text-xs text-gray-400 mt-1">Start reading Quran to see your progress here</p>
              <Link 
                href="/explore"
                className="inline-block mt-4 text-sky-600 hover:text-sky-700 text-sm font-medium"
              >
                Explore Quran →
              </Link>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-sm">Sign in to track your reading progress</p>
              <Link 
                href="/login"
                className="inline-block mt-4 text-sky-600 hover:text-sky-700 text-sm font-medium"
              >
                Sign In →
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reciters Section */}
      <Card className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Enjoy Holy Quran recited by your preferred reciters.</CardTitle>
          <div className="flex justify-between items-center mt-2">
            <div className="relative w-full sm:w-auto flex-grow mr-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Find your favorite reciter"
                className="pl-10 rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 w-full text-sm"
              />
            </div>
            <a href="#" className="text-sky-600 hover:text-sky-700 font-medium text-sm whitespace-nowrap">
              See All Reciters &gt;
            </a>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {reciters.map((reciter) => (
              <div key={reciter.name} className="text-center">
                <Avatar className="h-20 w-20 mx-auto mb-2 border-2 border-gray-200">
                  <AvatarImage src={reciter.img || "/placeholder.svg"} alt={reciter.name} />
                  <AvatarFallback>{reciter.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <p className="text-xs font-medium text-gray-700 dark:text-gray-200">{reciter.name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Learning Section */}
      <Card className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Learn Quran and Islam basics everyday.</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {learningMaterials.map((item) => (
              <div key={item.title} className="text-center">
                <img
                  src={item.img || "/placeholder.svg"}
                  alt={item.title}
                  className="rounded-lg mb-2 mx-auto w-full h-auto aspect-square object-cover"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
