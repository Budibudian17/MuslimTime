"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchReciters } from "@/lib/services/quran"

export default function RecitersPage() {
  const [loading, setLoading] = useState(true)
  const [reciters, setReciters] = useState<Array<{ identifier: string; englishName: string; name: string }>>([])
  const [filter, setFilter] = useState("")

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const list = await fetchReciters().catch(() => [])
        if (!mounted) return
        setReciters(list.map((r: any) => ({ identifier: r.identifier, englishName: r.englishName, name: r.name })))
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

  return (
    <div className="container mx-auto p-4">
      <Card className="bg-white dark:bg-neutral-900">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">All Reciters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Search reciters..." value={filter} onChange={(e) => setFilter(e.target.value)} />
          {loading ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((r) => (
                <Link
                  key={r.identifier}
                  href={`/reciters/${r.identifier}`}
                  className="block border border-gray-200 dark:border-gray-800 rounded p-3 transition-all duration-200 hover:bg-sky-500 hover:text-white hover:shadow-2xl hover:scale-105 group"
                >
                  <div className="font-medium transition-colors duration-200 group-hover:text-white">{r.englishName || r.name}</div>
                  <div className="text-xs text-gray-500 transition-colors duration-200 group-hover:text-white">{r.identifier}</div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


