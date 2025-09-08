"use client"

import React, { useState, useRef, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, X, Play, Pause, SkipBack, SkipForward, Shuffle, Info, Menu, ChevronRight, LayoutGrid } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useLoading } from "@/lib/contexts/LoadingContext"
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
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentAyah, setCurrentAyah] = useState<number>(1)
  const [showMushafView, setShowMushafView] = useState(false)
  const [currentSurahIndex, setCurrentSurahIndex] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)
  const ayahRefs = useRef<{ [key: number]: HTMLElement | null }>({})
  const translationScrollRef = useRef<HTMLDivElement>(null)
  const arabicScrollRef = useRef<HTMLDivElement>(null)
  const isScrollingRef = useRef(false)
  const { setLoading } = useLoading()

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
      try {
        window.scrollTo({ top: 0, behavior: 'auto' })
        translationScrollRef.current?.scrollTo({ top: 0, behavior: 'auto' })
        arabicScrollRef.current?.scrollTo({ top: 0, behavior: 'auto' })
      } catch {}
    }
  }

  const handlePrevSurah = () => {
    if (hasPrevSurah) {
      setCurrentSurahIndex(prev => prev - 1)
      setCurrentAyah(surahGroups[currentSurahIndex - 1].ayahs[0].number)
      try {
        window.scrollTo({ top: 0, behavior: 'auto' })
        translationScrollRef.current?.scrollTo({ top: 0, behavior: 'auto' })
        arabicScrollRef.current?.scrollTo({ top: 0, behavior: 'auto' })
      } catch {}
    }
  }

  // Navigate to previous/next Juz (1-30)
  const handlePrevJuz = () => {
    if (initialData.number > 1) {
      try {
        window.scrollTo({ top: 0, behavior: 'auto' })
      } catch {}
      router.push(`/juz/${initialData.number - 1}`)
    }
  }

  const handleNextJuz = () => {
    if (initialData.number < 30) {
      try {
        window.scrollTo({ top: 0, behavior: 'auto' })
      } catch {}
      router.push(`/juz/${initialData.number + 1}`)
    }
  }

  React.useEffect(() => {
    setMounted(true)
    // Hide loading when component is mounted
    setLoading(false)
  }, [setLoading])

  // Reset to split view on mobile screens
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024 && showMushafView) {
        setShowMushafView(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [showMushafView])

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

  // Handle synchronized scrolling
  const handleTranslationScroll = () => {
    if (isScrollingRef.current) return
    
    isScrollingRef.current = true
    if (translationScrollRef.current && arabicScrollRef.current) {
      const translationScrollTop = translationScrollRef.current.scrollTop
      const translationScrollHeight = translationScrollRef.current.scrollHeight - translationScrollRef.current.clientHeight
      const arabicScrollHeight = arabicScrollRef.current.scrollHeight - arabicScrollRef.current.clientHeight
      
      const scrollPercentage = translationScrollTop / translationScrollHeight
      arabicScrollRef.current.scrollTop = scrollPercentage * arabicScrollHeight
    }
    
    setTimeout(() => {
      isScrollingRef.current = false
    }, 10)
  }

  const handleArabicScroll = () => {
    if (isScrollingRef.current) return
    
    isScrollingRef.current = true
    if (arabicScrollRef.current && translationScrollRef.current) {
      const arabicScrollTop = arabicScrollRef.current.scrollTop
      const arabicScrollHeight = arabicScrollRef.current.scrollHeight - arabicScrollRef.current.clientHeight
      const translationScrollHeight = translationScrollRef.current.scrollHeight - translationScrollRef.current.clientHeight
      
      const scrollPercentage = arabicScrollTop / arabicScrollHeight
      translationScrollRef.current.scrollTop = scrollPercentage * translationScrollHeight
    }
    
    setTimeout(() => {
      isScrollingRef.current = false
    }, 10)
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
              : 'text-gray-700 dark:text-gray-300'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm border ${
              currentAyah === ayah.number 
                ? 'bg-sky-100 text-sky-600 border-sky-300' 
                : 'bg-sky-50 dark:bg-neutral-800 text-sky-600 border-sky-200 dark:border-gray-700'
            }`}>
              {ayah.numberInSurah}
            </span>
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700"></div>
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
              : 'text-gray-800 dark:text-gray-200'
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
    <div className="flex h-screen bg-white dark:bg-neutral-950 relative text-gray-900 dark:text-gray-100">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navigation Header */}
        <div className="border-b border-gray-200 dark:border-gray-800">
          <div className="px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Link href="/">
                  <Button variant="ghost" size="icon" className="hover:bg-gray-100 dark:hover:bg-neutral-800">
                    <X className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <span className="font-arabic text-sky-700">{currentSurah.name}</span>
                  <span>{currentSurah.englishName}</span>
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <span>{currentSurah.englishNameTranslation}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                  <span>Juz {initialData.number}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                  <span>Ayat {currentSurah.ayahRange.start}-{currentSurah.ayahRange.end}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Hide layout toggle on mobile/small screens */}
              <div className="hidden lg:block">
                {!showMushafView ? (
                  <LayoutToggle onMushafView={() => setShowMushafView(true)} />
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-600 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-500"
                    onClick={() => setShowMushafView(false)}
                  >
                    <LayoutGrid className="h-5 w-5" />
                  </Button>
                )}
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-gray-100 dark:hover:bg-neutral-800">
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
                            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Juz</div>
                            <div className="text-sm md:text-base text-gray-700 dark:text-gray-200">{initialData.number}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Ayat Range</div>
                            <div className="text-sm md:text-base text-gray-700 dark:text-gray-200">{currentSurah.ayahRange.start}-{currentSurah.ayahRange.end}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Translation</div>
                            <div className="text-sm md:text-base text-gray-700 dark:text-gray-200">{currentSurah.englishNameTranslation}</div>
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
            <div className="py-6 bg-white dark:bg-neutral-950">
              <div className="text-center">
                <h2 className="font-arabic text-4xl text-sky-600 mb-2">{currentSurah.name}</h2>
                <p className="text-xl text-gray-600 dark:text-gray-300">{currentSurah.englishName}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
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
                  <div 
                    ref={translationScrollRef}
                    className="bg-gray-50 dark:bg-neutral-900 rounded-2xl p-8 shadow-sm overflow-y-auto border border-gray-200 dark:border-gray-800"
                    onScroll={handleTranslationScroll}
                  >
                    {renderAyahs(currentSurah.ayahs)}
                  </div>

                  {/* Arabic Text Card */}
                  <div 
                    ref={arabicScrollRef}
                    className="bg-gray-50 dark:bg-neutral-900 rounded-2xl p-8 shadow-sm overflow-y-auto border border-gray-200 dark:border-gray-800"
                    onScroll={handleArabicScroll}
                  >
                    {renderArabicAyahs(currentSurah.ayahs)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Split View Content */}
            <div className="flex-1 overflow-y-auto pb-32">
              <div className="space-y-8 py-6">
                {currentSurah.ayahs.map((ayah) => (
                  <div 
                    key={ayah.number} 
                    ref={(el) => {
                      ayahRefs.current[ayah.number] = el;
                    }}
                    className={`transition-colors duration-300 ${
                      currentAyah === ayah.number 
                        ? 'bg-sky-500/10 dark:bg-sky-500/10 outline outline-1 outline-sky-300/40 dark:outline-sky-700/40 rounded-lg' 
                        : ''
                    }`}
                  >
                    {/* Mobile Layout: Vertical Stack */}
                    <div className="lg:hidden px-4 py-6">
                      {/* Arabic Text - Top */}
                      <div className="flex items-start justify-end gap-3 mb-4">
                        <p className={`text-2xl font-arabic leading-relaxed text-right flex-1 ${
                          currentAyah === ayah.number ? 'text-sky-900' : 'text-gray-800 dark:text-gray-200'
                        }`} style={{ direction: 'rtl' }}>
                          {ayah.text}
                        </p>
                        <div className="flex-shrink-0">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm border ${
                            currentAyah === ayah.number 
                              ? 'bg-sky-100 text-sky-600 border-sky-300' 
                              : 'bg-sky-50 dark:bg-neutral-800 text-sky-600 border-sky-200 dark:border-gray-700'
                          }`}>
                            {ayah.numberInSurah}
                          </span>
                        </div>
                      </div>
                      
                      {/* Translation - Bottom */}
                      <p className={`text-base leading-relaxed ${
                        currentAyah === ayah.number ? 'text-sky-900' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {ayah.translation}
                      </p>
                    </div>

                    {/* Desktop Layout: Horizontal Split */}
                    <div className="hidden lg:flex items-start">
                      {/* Translation - Left Side */}
                      <div className="w-[50%] pl-6 py-4">
                        <p className={`text-lg leading-relaxed pr-4 ${
                          currentAyah === ayah.number ? 'text-sky-900' : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {ayah.translation}
                        </p>
                      </div>

                      {/* Arabic - Right Side */}
                      <div className="w-[50%] flex items-start justify-end pr-6 py-4">
                        <div className="flex items-start gap-4">
                          <p className={`text-3xl font-arabic leading-relaxed text-right ${
                            currentAyah === ayah.number ? 'text-sky-900' : 'text-gray-800 dark:text-gray-200'
                          }`} style={{ direction: 'rtl' }}>
                            {ayah.text}
                          </p>
                          <div className="flex-shrink-0 mt-2">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm border ${
                              currentAyah === ayah.number 
                                ? 'bg-sky-100 text-sky-600 border-sky-300' 
                                : 'bg-sky-50 dark:bg-neutral-800 text-sky-600 border-sky-200 dark:border-gray-700'
                            }`}>
                              {ayah.numberInSurah}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* End-of-Reading Navigation within Juz (inline) */}
              <div className="px-4 pb-6">
                <div className="max-w-3xl mx-auto mt-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-neutral-900 shadow-sm p-4">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        Reached the end of this Surah part in Juz {initialData.number}.
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        {hasPrevSurah && (
                          <Button variant="outline" className="w-full sm:w-auto" onClick={handlePrevSurah}>
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Previous Surah Part
                          </Button>
                        )}
                        {hasNextSurah && (
                          <Button variant="outline" className="w-full sm:w-auto" onClick={handleNextSurah}>
                            Next Surah Part
                            <ChevronRight className="h-4 w-4 ml-2" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        Continue to another Juz?
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        {initialData.number > 1 && (
                          <Button variant="outline" className="w-full sm:w-auto" onClick={handlePrevJuz}>
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Previous Juz
                          </Button>
                        )}
                        {initialData.number < 30 && (
                          <Button variant="outline" className="w-full sm:w-auto" onClick={handleNextJuz}>
                            Next Juz
                            <ChevronRight className="h-4 w-4 ml-2" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Removed floating navigation; replaced with inline sections above */}

        {/* Audio Player */}
        <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-neutral-900">
          <div className="px-6 py-3">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{currentSurah.englishName}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
              
              {/* Progress Bar */}
              <div 
                className="relative w-full h-1 bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden cursor-pointer"
                onClick={handleProgressClick}
              >
                <div 
                  className="absolute left-0 top-0 h-full bg-sky-500 rounded-full"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                <Button variant="ghost" size="icon" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100">
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
                <Button variant="ghost" size="icon" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100">
                  <SkipForward className="h-5 w-5" />
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