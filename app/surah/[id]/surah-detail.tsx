"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, X, Play, Pause, SkipBack, SkipForward, Shuffle, Info, Menu, ChevronRight, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import LayoutToggle from "@/components/layout-toggle";
import MushafLayout from "@/components/mushaf-layout";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useHistory } from "@/lib/contexts/HistoryContext";
import { useLoading } from "@/lib/contexts/LoadingContext";
import { saveReadingHistory } from "@/lib/services/history";

interface SurahDetailProps {
  initialData: {
    id: number;
    nameEn: string;
    nameAr: string;
    meaning: string;
    verses: number;
    revelationType: string;
    translationBy: string;
    ayat: Array<{
      number: number;
      arabic: string;
      translation: string;
    }>;
    audioUrl: string;
  };
}

export default function SurahDetail({ initialData }: SurahDetailProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { updateLatestHistory } = useHistory();
  const { setLoading } = useLoading();
  const [mounted, setMounted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentAyah, setCurrentAyah] = useState<number>(1);
  const [showMushafView, setShowMushafView] = useState(false);
  const [lastTrackedAyah, setLastTrackedAyah] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const ayahRefs = useRef<{ [key: number]: HTMLElement | null }>({});
  const translationScrollRef = useRef<HTMLDivElement>(null);
  const arabicScrollRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const trackingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    setMounted(true);
    // Hide loading when component is mounted
    setLoading(false);
  }, [setLoading]);

  // Initialize currentAyah from URL parameter
  useEffect(() => {
    const ayahParam = searchParams.get('ayah');
    if (ayahParam) {
      const ayahNumber = parseInt(ayahParam);
      if (ayahNumber >= 1 && ayahNumber <= initialData.verses) {
        setCurrentAyah(ayahNumber);
        setLastTrackedAyah(ayahNumber);
      }
    }
  }, [searchParams, initialData.verses]);

  // Track reading progress with immediate update and debounced save
  const trackReadingProgress = async (ayahNumber: number) => {
    if (!user?.uid || ayahNumber === lastTrackedAyah) return;

    // Update UI immediately for better UX
    const historyData = {
      userId: user.uid,
      surahNumber: initialData.id,
      surahName: initialData.nameEn,
      surahEnglishName: initialData.nameEn,
      surahArabicName: initialData.nameAr,
      ayahNumber,
      totalAyahs: initialData.verses,
      progress: Math.round((ayahNumber / initialData.verses) * 100),
      lastReadAt: new Date()
    };

    // Update context immediately
    updateLatestHistory(historyData);
    setLastTrackedAyah(ayahNumber);

    // Clear existing timeout
    if (trackingTimeoutRef.current) {
      clearTimeout(trackingTimeoutRef.current);
    }

    // Set new timeout to save to Firebase after 1 second (reduced from 2 seconds)
    trackingTimeoutRef.current = setTimeout(async () => {
      try {
        const result = await saveReadingHistory(
          user.uid,
          initialData.id,
          initialData.nameEn, // surahName should be English name
          initialData.nameEn, // surahEnglishName
          initialData.nameAr, // surahArabicName
          ayahNumber,
          initialData.verses,
          undefined // juzNumber - could be calculated if needed
        );

        if (result.success) {
          console.log('Reading history saved successfully:', ayahNumber);
        } else {
          console.error('Failed to save reading history:', result.error);
        }
      } catch (error) {
        console.error('Error tracking reading progress:', error);
      }
    }, 1000); // Reduced timeout for faster saving
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (trackingTimeoutRef.current) {
        clearTimeout(trackingTimeoutRef.current);
      }
    };
  }, []);

  // Reset to split view on mobile screens
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024 && showMushafView) {
        setShowMushafView(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showMushafView]);

  // Handle audio time update
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  // Handle audio load
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  // Handle play/pause
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const bounds = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - bounds.left;
      const width = bounds.width;
      const percentage = x / width;
      const newTime = percentage * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Format time in MM:SS
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle synchronized scrolling with tracking
  const handleTranslationScroll = () => {
    if (isScrollingRef.current) return;
    
    isScrollingRef.current = true;
    if (translationScrollRef.current && arabicScrollRef.current) {
      const translationScrollTop = translationScrollRef.current.scrollTop;
      const translationScrollHeight = translationScrollRef.current.scrollHeight - translationScrollRef.current.clientHeight;
      const arabicScrollHeight = arabicScrollRef.current.scrollHeight - arabicScrollRef.current.clientHeight;
      
      const scrollPercentage = translationScrollTop / translationScrollHeight;
      arabicScrollRef.current.scrollTop = scrollPercentage * arabicScrollHeight;
      
      // Do not change currentAyah on scroll to avoid highlight following scroll
    }
    
    setTimeout(() => {
      isScrollingRef.current = false;
    }, 10);
  };

  const handleArabicScroll = () => {
    if (isScrollingRef.current) return;
    
    isScrollingRef.current = true;
    if (arabicScrollRef.current && translationScrollRef.current) {
      const arabicScrollTop = arabicScrollRef.current.scrollTop;
      const arabicScrollHeight = arabicScrollRef.current.scrollHeight - arabicScrollRef.current.clientHeight;
      const translationScrollHeight = translationScrollRef.current.scrollHeight - translationScrollRef.current.clientHeight;
      
      const scrollPercentage = arabicScrollTop / arabicScrollHeight;
      translationScrollRef.current.scrollTop = scrollPercentage * translationScrollHeight;
      
      // Do not change currentAyah on scroll to avoid highlight following scroll
    }
    
    setTimeout(() => {
      isScrollingRef.current = false;
    }, 10);
  };

  // Handle shuffle - navigate to random surah
  const handleShuffle = () => {
    // Generate random surah number (1-114)
    const randomSurahNumber = Math.floor(Math.random() * 114) + 1;
    router.push(`/surah/${randomSurahNumber}`);
  };

  // Handle ayah click for tracking
  const handleAyahClick = (ayahNumber: number) => {
    setCurrentAyah(ayahNumber);
    trackReadingProgress(ayahNumber);
  };

  if (!mounted) return null;

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
                  <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                    <X className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <span className="font-arabic text-sky-700">{initialData.nameAr}</span>
                  <span>{initialData.nameEn}</span>
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{initialData.meaning}</p>
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
                    className="text-gray-600 hover:text-sky-600"
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
                      <span className="text-xl md:text-2xl font-arabic text-sky-700">{initialData.nameAr}</span>
                      <span className="text-lg md:text-xl">{initialData.nameEn}</span>
                    </DialogTitle>
                    <DialogDescription asChild>
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Meaning</div>
                            <div className="text-sm md:text-base text-gray-700 dark:text-gray-200">{initialData.meaning}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Number of Verses</div>
                            <div className="text-sm md:text-base text-gray-700 dark:text-gray-200">{initialData.verses} verses</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Revelation Type</div>
                            <div className="text-sm md:text-base text-gray-700 dark:text-gray-200">{initialData.revelationType}</div>
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
                <h2 className="font-arabic text-4xl text-sky-600 mb-2">{initialData.nameAr}</h2>
                <p className="text-xl text-gray-600 dark:text-gray-300">{initialData.nameEn}</p>
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
                    <div className="space-y-6">
                      {initialData.ayat.map((ayah) => (
                        <div 
                          key={ayah.number}
                          className={`transition-colors duration-300 cursor-pointer ${
                            currentAyah === ayah.number 
                              ? 'text-sky-900' 
                              : 'text-gray-700 dark:text-gray-300 hover:text-sky-800'
                          }`}
                          onClick={() => handleAyahClick(ayah.number)}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <span 
                              className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm border cursor-pointer transition-colors ${
                                currentAyah === ayah.number 
                                  ? 'bg-sky-100 text-sky-600 border-sky-300' 
                                  : 'bg-sky-50 dark:bg-neutral-800 text-sky-600 border-sky-200 dark:border-gray-700 hover:bg-sky-100'
                              }`}
                              onClick={() => handleAyahClick(ayah.number)}
                            >
                              {ayah.number}
                            </span>
                            <div className="h-px flex-1 bg-gray-200"></div>
                          </div>
                          <p 
                            className="text-lg leading-relaxed cursor-pointer hover:text-sky-800"
                            onClick={() => handleAyahClick(ayah.number)}
                          >
                            {ayah.translation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Arabic Text Card */}
                  <div 
                    ref={arabicScrollRef}
                    className="bg-gray-50 dark:bg-neutral-900 rounded-2xl p-8 shadow-sm overflow-y-auto border border-gray-200 dark:border-gray-800"
                    onScroll={handleArabicScroll}
                  >
                    <div className="text-right font-arabic text-3xl leading-[2] tracking-wide" dir="rtl">
                      {initialData.ayat.map((ayah) => (
                        <div 
                          key={ayah.number} 
                          ref={(el) => {
                            ayahRefs.current[ayah.number] = el;
                          }}
                          className={`mb-6 transition-colors duration-300 cursor-pointer ${
                            currentAyah === ayah.number 
                              ? 'text-sky-600' 
                              : 'text-gray-800 dark:text-gray-200 hover:text-sky-600'
                          }`}
                          onClick={() => handleAyahClick(ayah.number)}
                        >
                          {ayah.arabic}
                          <span className={`inline-block mr-2 ${
                            currentAyah === ayah.number 
                              ? 'text-sky-600' 
                              : 'text-sky-500'
                          }`}>﴿{ayah.number}﴾</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Audio Player */}
            <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-neutral-900">
              <div className="px-6 py-3">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{initialData.nameEn}</span>
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
                  <div className="flex items-center justify-center space-x-6">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                      onClick={handleShuffle}
                      title="Random Surah"
                    >
                      <Shuffle className="h-4 w-4" />
                    </Button>
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
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                      onClick={handleShuffle}
                      title="Random Surah"
                    >
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
        ) : (
          <>
            {/* Split View Content */}
            <div className="flex-1 overflow-y-auto pb-32">
              <div className="space-y-8 py-6">
                {initialData.ayat.map((ayah) => (
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
                        <p 
                          className={`text-2xl font-arabic leading-relaxed text-right flex-1 cursor-pointer ${
                            currentAyah === ayah.number ? 'text-sky-900' : 'text-gray-800 dark:text-gray-200 hover:text-sky-600'
                          }`} 
                          style={{ direction: 'rtl' }}
                          onClick={() => handleAyahClick(ayah.number)}
                        >
                          {ayah.arabic}
                        </p>
                        <div className="flex-shrink-0">
                          <span 
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm border cursor-pointer transition-colors ${
                              currentAyah === ayah.number 
                                ? 'bg-sky-100 text-sky-600 border-sky-300' 
                                : 'bg-sky-50 text-sky-600 border-sky-200 hover:bg-sky-100'
                            }`}
                            onClick={() => handleAyahClick(ayah.number)}
                          >
                            {ayah.number}
                          </span>
                        </div>
                      </div>
                      
                      {/* Translation - Bottom */}
                      <p 
                        className={`text-base leading-relaxed cursor-pointer ${
                          currentAyah === ayah.number ? 'text-sky-900' : 'text-gray-700 dark:text-gray-300 hover:text-sky-800'
                        }`}
                        onClick={() => handleAyahClick(ayah.number)}
                      >
                        {ayah.translation}
                      </p>
                    </div>

                    {/* Desktop Layout: Horizontal Split */}
                    <div className="hidden lg:flex items-start">
                      {/* Translation - Left Side */}
                      <div className="w-[50%] pl-6 py-4">
                        <p 
                          className={`text-lg leading-relaxed pr-4 cursor-pointer ${
                            currentAyah === ayah.number ? 'text-sky-900' : 'text-gray-700 dark:text-gray-300 hover:text-sky-800'
                          }`}
                          onClick={() => handleAyahClick(ayah.number)}
                        >
                          {ayah.translation}
                        </p>
                      </div>

                      {/* Arabic - Right Side */}
                      <div className="w-[50%] flex items-start justify-end pr-6 py-4">
                        <div className="flex items-start gap-4">
                          <p 
                            className={`text-3xl font-arabic leading-relaxed text-right cursor-pointer ${
                              currentAyah === ayah.number ? 'text-sky-900' : 'text-gray-800 dark:text-gray-200 hover:text-sky-600'
                            }`} 
                            style={{ direction: 'rtl' }}
                            onClick={() => handleAyahClick(ayah.number)}
                          >
                            {ayah.arabic}
                          </p>
                          <div className="flex-shrink-0 mt-2">
                            <span 
                              className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm border cursor-pointer transition-colors ${
                                currentAyah === ayah.number 
                                  ? 'bg-sky-100 text-sky-600 border-sky-300' 
                                  : 'bg-sky-50 text-sky-600 border-sky-200 hover:bg-sky-100'
                              }`}
                              onClick={() => handleAyahClick(ayah.number)}
                            >
                              {ayah.number}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Audio Player */}
            <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-neutral-900">
              <div className="px-6 py-3">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{initialData.nameEn}</span>
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
                  <div className="flex items-center justify-center space-x-6">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                      onClick={handleShuffle}
                      title="Random Surah"
                    >
                      <Shuffle className="h-4 w-4" />
                    </Button>
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
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                      onClick={handleShuffle}
                      title="Random Surah"
                    >
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
          </>
        )}
      </div>
    </div>
  );
} 