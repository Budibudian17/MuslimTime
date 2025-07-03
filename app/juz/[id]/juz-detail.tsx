"use client"

import React, { useState, useRef, useMemo } from "react"
import { ChevronLeft, X, Play, Pause, SkipBack, SkipForward, Shuffle, Info, Menu, ChevronRight, LayoutGrid } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import LayoutToggle from "@/components/layout-toggle"

interface JuzAyah {
  number: number
  text: string
  translation: string
  surah: {
    number: number
    name: string
    englishName: string
    englishNameTranslation: string
    revelationType: string
    numberOfAyahs: number
  }
  numberInSurah: number
  juz: number
  manzil: number
  page: number
  ruku: number
  hizbQuarter: number
  sajda: boolean
}

interface JuzDetailProps {
  initialData: {
    number: number
    startSurah: {
      name: string
      englishName: string
      englishNameTranslation: string
      number: number
    }
    totalAyahs: number
    ayahs: JuzAyah[]
    audioUrl?: string
  }
}

export default function JuzDetail({ initialData }: JuzDetailProps) {
  const [mounted, setMounted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentAyah, setCurrentAyah] = useState<number>(1)
  const [showMushafView, setShowMushafView] = useState(false)
  const [currentSurahIndex, setCurrentSurahIndex] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)
  const ayahRefs = useRef<{ [key: number]: HTMLElement | null }>({})

  // Group ayahs by surah while maintaining Juz context
  const surahGroups = useMemo(() => {
    const groups: { [key: number]: JuzAyah[] } = {}
    initialData.ayahs.forEach(ayah => {
      if (!groups[ayah.surah.number]) {
        groups[ayah.surah.number] = []
      }
      groups[ayah.surah.number].push(ayah)
    })
    return Object.entries(groups).map(([number, ayahs]) => ({
      number: parseInt(number),
      name: ayahs[0].surah.name,
      englishName: ayahs[0].surah.englishName,
      englishNameTranslation: ayahs[0].surah.englishNameTranslation,
      ayahRange: {
        start: ayahs[0].numberInSurah,
        end: ayahs[ayahs.length - 1].numberInSurah
      },
      ayahs
    }))
  }, [initialData.ayahs])

  const currentSurah = surahGroups[currentSurahIndex]
  const hasNextSurah = currentSurahIndex < surahGroups.length - 1
  const hasPrevSurah = currentSurahIndex > 0

  const handleNextSurah = () => {
    if (hasNextSurah) {
      setCurrentSurahIndex(prev => prev + 1)
      setCurrentAyah(surahGroups[currentSurahIndex + 1].ayahs[0].number)
    }
  }

  const handlePrevSurah = () => {
    if (hasPrevSurah) {
      setCurrentSurahIndex(prev => prev - 1)
      setCurrentAyah(surahGroups[currentSurahIndex - 1].ayahs[0].number)
    }
  }

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Handle audio time update
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  // Handle audio load
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  // Handle play/pause
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  // Handle progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const bounds = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - bounds.left
      const width = bounds.width
      const percentage = x / width
      const newTime = percentage * duration
      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  // Format time in MM:SS
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (!mounted) return null

  const renderAyahs = (ayahs: JuzAyah[]) => (
    <div className="space-y-6">
      {ayahs.map((ayah) => (
        <div 
          key={ayah.number}
          className={`transition-colors duration-300 ${
            currentAyah === ayah.number 
              ? 'text-sky-900' 
              : 'text-gray-700'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm border ${
              currentAyah === ayah.number 
                ? 'bg-sky-100 text-sky-600 border-sky-300' 
                : 'bg-sky-50 text-sky-600 border-sky-200'
            }`}>
              {ayah.numberInSurah}
            </span>
            <div className="h-px flex-1 bg-gray-200"></div>
          </div>
          <p className="text-lg leading-relaxed">
            {ayah.translation}
          </p>
        </div>
      ))}
    </div>
  )

  const renderArabicAyahs = (ayahs: JuzAyah[]) => (
    <div className="text-right font-arabic text-3xl leading-[2] tracking-wide" dir="rtl">
      {ayahs.map((ayah) => (
        <div 
          key={ayah.number} 
          ref={(el) => {
            ayahRefs.current[ayah.number] = el;
          }}
          className={`mb-6 transition-colors duration-300 ${
            currentAyah === ayah.number 
              ? 'text-sky-600' 
              : 'text-gray-800'
          }`}
        >
          {ayah.text}
          <span className={`inline-block mr-2 ${
            currentAyah === ayah.number 
              ? 'text-sky-600' 
              : 'text-sky-500'
          }`}>﴿{ayah.numberInSurah}﴾</span>
        </div>
      ))}
    </div>
  )

  return (
    <div className="flex h-screen bg-white relative">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navigation Header */}
        <div className="border-b">
          <div className="px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Link href="/">
                  <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                    <X className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <span className="font-arabic text-sky-700">{currentSurah.name}</span>
                  <span>{currentSurah.englishName}</span>
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-2">
                  <span>{currentSurah.englishNameTranslation}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span>Juz {initialData.number}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span>Ayat {currentSurah.ayahRange.start}-{currentSurah.ayahRange.end}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {!showMushafView ? (
                <LayoutToggle onMushafView={() => setShowMushafView(true)} />
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-600 hover:text-sky-600"
                  onClick={() => setShowMushafView(false)}
                >
                  <LayoutGrid className="h-5 w-5" />
                </Button>
              )}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                    <Info className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl mx-4">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 mb-4">
                      <span className="text-xl md:text-2xl font-arabic text-sky-700">{currentSurah.name}</span>
                      <span className="text-lg md:text-xl">{currentSurah.englishName}</span>
                    </DialogTitle>
                    <DialogDescription asChild>
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-500">Juz</div>
                            <div className="text-sm md:text-base text-gray-700">{initialData.number}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-500">Ayat Range</div>
                            <div className="text-sm md:text-base text-gray-700">{currentSurah.ayahRange.start}-{currentSurah.ayahRange.end}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-500">Translation</div>
                            <div className="text-sm md:text-base text-gray-700">{currentSurah.englishNameTranslation}</div>
                          </div>
                        </div>
                      </div>
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Dynamic Content Area */}
        {showMushafView ? (
          <div className="flex-1 flex flex-col h-[calc(100vh-64px-88px)]">
            {/* Header with Surah Title */}
            <div className="py-6 bg-white">
              <div className="text-center">
                <h2 className="font-arabic text-4xl text-sky-600 mb-2">{currentSurah.name}</h2>
                <p className="text-xl text-gray-600">{currentSurah.englishName}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Juz {initialData.number} • Ayat {currentSurah.ayahRange.start}-{currentSurah.ayahRange.end}
                </p>
              </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-hidden px-4">
              <div className="h-full max-w-7xl mx-auto">
                {/* Quran Text and Translation */}
                <div className="grid h-full grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Translation Card */}
                  <div className="bg-gray-50 rounded-2xl p-8 shadow-sm overflow-y-auto">
                    {renderAyahs(currentSurah.ayahs)}
                  </div>

                  {/* Arabic Text Card */}
                  <div className="bg-gray-50 rounded-2xl p-8 shadow-sm overflow-y-auto">
                    {renderArabicAyahs(currentSurah.ayahs)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden px-4">
            <div className="h-full max-w-7xl mx-auto">
              {/* Quran Text and Translation */}
              <div className="grid h-full grid-cols-1 lg:grid-cols-2 gap-6 py-6">
                {/* Translation Card */}
                <div className="bg-gray-50 rounded-2xl p-8 shadow-sm overflow-y-auto">
                  {renderAyahs(currentSurah.ayahs)}
                </div>

                {/* Arabic Text Card */}
                <div className="bg-gray-50 rounded-2xl p-8 shadow-sm overflow-y-auto">
                  {renderArabicAyahs(currentSurah.ayahs)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="fixed bottom-24 left-0 right-0 flex justify-center gap-4 pointer-events-none">
          <div className="flex gap-2 pointer-events-auto">
            {hasPrevSurah && (
              <Button
                variant="outline"
                className="bg-white shadow-lg hover:bg-gray-50"
                onClick={handlePrevSurah}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous Surah
              </Button>
            )}
            {hasNextSurah && (
              <Button
                variant="outline"
                className="bg-white shadow-lg hover:bg-gray-50"
                onClick={handleNextSurah}
              >
                Next Surah
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>

        {/* Audio Player */}
        <div className="border-t bg-white">
          <div className="px-6 py-3">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-800">{currentSurah.englishName}</span>
                <span className="text-sm text-gray-500">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
              
              {/* Progress Bar */}
              <div 
                className="relative w-full h-1 bg-gray-100 rounded-full overflow-hidden cursor-pointer"
                onClick={handleProgressClick}
              >
                <div 
                  className="absolute left-0 top-0 h-full bg-sky-500 rounded-full"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-800">
                  <Shuffle className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-800">
                  <SkipBack className="h-5 w-5" />
                </Button>
                <Button 
                  variant="default" 
                  size="icon" 
                  className="h-10 w-10 bg-sky-500 hover:bg-sky-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={togglePlay}
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-800">
                  <SkipForward className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-800">
                  <Shuffle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Hidden Audio Element */}
          <audio
            ref={audioRef}
            src={initialData.audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
          />
        </div>
      </div>
    </div>
  )
} 