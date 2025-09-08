"use client"

import { Play, Pause, Shuffle, MoreVertical } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import React from "react"
import { getSurahById } from "@/lib/services/quran"
import Link from "next/link"

function formatTime(seconds: number) {
  if (!isFinite(seconds) || seconds < 0) return "0:00"
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

function getDailySurahNumber(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = (now.getTime() - start.getTime()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000)
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))
  // Map day to 1..114 deterministically
  return (dayOfYear % 114) + 1
}

export default function MiniMusicPlayer() {
  const [title, setTitle] = React.useState<string>("Surah Al-Fatihah (The Opener)")
  const [surahNumber, setSurahNumber] = React.useState<number>(1)
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null)
  const [isPlaying, setIsPlaying] = React.useState<boolean>(false)
  const [currentTime, setCurrentTime] = React.useState<number>(0)
  const [duration, setDuration] = React.useState<number>(0)
  const audioRef = React.useRef<HTMLAudioElement>(null)

  // Load daily surah once on mount
  React.useEffect(() => {
    const load = async () => {
      try {
        const n = getDailySurahNumber()
        setSurahNumber(n)
        const surah = await getSurahById(n)
        setTitle(`${surah.nameEn} (${surah.meaning})`)
        setAudioUrl(surah.audioUrl)
      } catch (e) {
        // fallback to Al-Fatihah audio
        setSurahNumber(1)
        setTitle("Surah Al-Fatihah (The Opener)")
        setAudioUrl("https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/1.mp3")
      }
    }
    load()
  }, [])

  const togglePlay = () => {
    const el = audioRef.current
    if (!el || !audioUrl) return
    if (isPlaying) {
      el.pause()
      setIsPlaying(false)
    } else {
      el.play()
      setIsPlaying(true)
    }
  }

  const handleShuffle = async () => {
    try {
      const random = Math.floor(Math.random() * 114) + 1
      setSurahNumber(random)
      const surah = await getSurahById(random)
      setTitle(`${surah.nameEn} (${surah.meaning})`)
      setAudioUrl(surah.audioUrl)
      setCurrentTime(0)
      setDuration(0)
      setIsPlaying(false)
    } catch {}
  }

  return (
    <div className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm p-4 rounded-xl shadow-lg text-gray-700 dark:text-gray-200 max-w-sm border border-gray-200 dark:border-gray-800">
      <div className="flex justify-between items-center mb-2">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Relaxation Radio (Surah)</p>
          <p className="font-semibold text-sm text-gray-800 dark:text-gray-100 truncate max-w-[16rem]">
            <Link href={`/surah/${surahNumber}`} className="hover:underline">
              {title}
            </Link>
          </p>
        </div>
        <MoreVertical className="h-5 w-5 text-gray-500 dark:text-gray-400" />
      </div>

      <Progress 
        value={duration ? Math.min(100, (currentTime / duration) * 100) : 0} 
        className="w-full h-1 bg-sky-100 dark:bg-neutral-800 [&>div]:bg-sky-500" 
      />
      <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
      <div className="flex items-center justify-between mt-3 text-gray-600 dark:text-gray-300">
        <button aria-label="Shuffle Surah" className="p-2 hover:text-sky-600" onClick={handleShuffle}>
          <Shuffle className="h-5 w-5" />
        </button>
        <button 
          aria-label={isPlaying ? "Pause" : "Play"}
          className="bg-sky-500 text-white rounded-full p-2 hover:bg-sky-600 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!audioUrl}
          onClick={togglePlay}
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </button>
        <div className="p-2 opacity-0 pointer-events-none" />
      </div>

      {audioUrl && (
        <audio 
          ref={audioRef} 
          src={audioUrl}
          onTimeUpdate={(e) => setCurrentTime((e.target as HTMLAudioElement).currentTime)}
          onLoadedMetadata={(e) => setDuration((e.target as HTMLAudioElement).duration)}
          onEnded={() => setIsPlaying(false)}
        />
      )}
    </div>
  )
}
