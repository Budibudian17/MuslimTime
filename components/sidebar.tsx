"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Play, SkipBack, SkipForward, History, Search, MoreVertical } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { useState, useEffect } from "react"
import { useHistory } from "@/lib/contexts/HistoryContext"
import { useAuth } from "@/lib/contexts/AuthContext"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  fetchReciters,
  getPreferredReciterId,
  setPreferredReciterId,
  buildSurahAudioUrl,
  getAllSurahs
} from "@/lib/services/quran"

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
        </CardHeader>
        <CardContent>
          <RecitersBrowser />
        </CardContent>
      </Card>

      {/* Learning Section */}
      <Card className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Learn Quran and Islam basics everyday.</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-gray-600 dark:text-gray-300">Coming Soon</div>
        </CardContent>
      </Card>
    </div>
  )
}

function RecitersBrowser() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [reciters, setReciters] = useState<Array<{ identifier: string; englishName: string; name: string }>>([])
  const [filter, setFilter] = useState("")
  const [selected, setSelected] = useState<string | null>(null)
  const [surahList, setSurahList] = useState<Array<{ number: number; englishName: string; name: string }>>([])
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const [list, preferred, surahs] = await Promise.all([
          fetchReciters().catch(() => []),
          getPreferredReciterId().catch(() => null),
          getAllSurahs().catch(() => null)
        ])
        if (!mounted) return
        setReciters(list.map((r: any) => ({ identifier: r.identifier, englishName: r.englishName, name: r.name })))
        if (surahs?.data) {
          setSurahList(surahs.data.map((s: any) => ({ number: s.number, englishName: s.englishName, name: s.name })))
        }
        setSelected(preferred || null)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const filtered = filter
    ? reciters.filter(r => (r.englishName + " " + r.name + " " + r.identifier).toLowerCase().includes(filter.toLowerCase()))
    : reciters
  const displayed = (showAll ? filtered : filtered.slice(0, 5))

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        <Input
          placeholder="Search reciters..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        {selected && (
          <span className="text-xs text-gray-600 dark:text-gray-300">Selected: {selected}</span>
        )}
      </div>

      {loading ? (
        <div className="text-sm text-gray-500">Loading reciters...</div>
      ) : (
        <div className="grid grid-cols-1 gap-2">
          {displayed.map((r) => (
            <button
              key={r.identifier}
              onClick={async () => {
                setSelected(r.identifier)
                await setPreferredReciterId(r.identifier as any)
                router.push(`/reciters/${r.identifier}`)
              }}
              className={`text-left px-3 py-2 rounded border text-sm transition-all duration-200 hover:bg-sky-500 hover:text-white hover:shadow-2xl hover:scale-105 group ${
                selected === r.identifier ? 'border-sky-500 text-sky-700 dark:text-sky-400' : 'border-gray-200 dark:border-gray-800'
              }`}
            >
              <div className="font-medium transition-colors duration-200 group-hover:text-white">{r.englishName || r.name}</div>
              <div className="text-xs text-gray-500 transition-colors duration-200 group-hover:text-white">{r.identifier}</div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="text-xs text-gray-500">No reciters found</div>
          )}
          {!showAll && filtered.length > 5 && (
            <Link
              href="/reciters"
              className="text-xs text-sky-600 hover:text-sky-700 self-start"
            >
              See All Reciters
            </Link>
          )}
        </div>
      )}

      {/* Surah list moved to /reciters/[id] page */}
    </div>
  )
}
