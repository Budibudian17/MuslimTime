"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ChevronDown, Search } from "lucide-react"
import { getAllSurahs, setPreferredReciterId, fetchReciters } from "@/lib/services/quran"
import { useNavigationLoading } from "@/hooks/use-navigation-loading"

export default function ReciterDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { navigateWithLoading } = useNavigationLoading()
  const reciterId = params?.id as string
  const [loading, setLoading] = useState(true)
  const [surahs, setSurahs] = useState<any[]>([])
  const [query, setQuery] = useState("")
  const [isAsc, setIsAsc] = useState(true)
  const [reciterName, setReciterName] = useState<string>("")

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        if (!reciterId) return
        await setPreferredReciterId(reciterId as any)
        // Resolve nice display name for reciter
        try {
          const list = await fetchReciters().catch(() => [])
          const match = Array.isArray(list) ? list.find((r: any) => r.identifier === reciterId) : null
          setReciterName(match?.englishName || match?.name || reciterId)
        } catch {
          setReciterName(reciterId)
        }

        const surahResp = await getAllSurahs().catch(() => null)
        if (!mounted) return
        if (surahResp?.data) {
          setSurahs(surahResp.data)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [reciterId])

  if (!reciterId) return null

  const filtered = surahs
    .filter((s: any) => {
      const q = query.trim().toLowerCase()
      if (!q) return true
      return (
        String(s.number).includes(q) ||
        s.englishName.toLowerCase().includes(q) ||
        s.englishNameTranslation.toLowerCase().includes(q)
      )
    })
    .sort((a: any, b: any) => (isAsc ? a.number - b.number : b.number - a.number))

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 dark:bg-neutral-950 dark:text-gray-100">
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-sky-600 to-sky-400 bg-clip-text text-transparent">
              Surahs by {reciterName || reciterId}
            </h1>
            <div className="w-24 h-1 bg-sky-500 mx-auto rounded-full mb-4"></div>
            <p className="text-muted-foreground dark:text-gray-400 max-w-2xl mx-auto">
              Choose a surah to play with your selected reciter.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
            <button
              className="text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-200"
              onClick={() => setIsAsc(v => !v)}
            >
              Sort by: {isAsc ? 'Ascending' : 'Descending'} <ChevronDown className="inline ml-2 h-4 w-4" />
            </button>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search Surah..."
                className="pl-10 rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 w-full sm:w-64"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Link href="/reciters" className="text-sky-600 hover:text-sky-700 font-medium text-sm">Change Reciter</Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="p-4 rounded-xl border bg-gray-50 dark:bg-neutral-800/60 border-gray-200 dark:border-gray-800">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="h-3 w-6 bg-gray-200 dark:bg-neutral-700 rounded" />
                      <div className="h-5 w-24 bg-gray-200 dark:bg-neutral-700 rounded" />
                      <div className="h-3 w-16 bg-gray-200 dark:bg-neutral-700 rounded" />
                    </div>
                    <div className="text-right space-y-2">
                      <div className="h-6 w-16 ml-auto bg-gray-200 dark:bg-neutral-700 rounded" />
                      <div className="h-3 w-12 ml-auto bg-gray-200 dark:bg-neutral-700 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((surah: any) => (
                <div
                  key={surah.number}
                  onClick={() => navigateWithLoading(`/surah/${surah.number}?reciter=${encodeURIComponent(reciterId)}`, `Loading ${surah.englishName}...`)}
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
          )}
        </div>
      </main>
    </div>
  )
}


