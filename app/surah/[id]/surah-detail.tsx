"use client";

import React, { useState, useRef } from "react";
import { ChevronLeft, X, Play, Pause, SkipBack, SkipForward, Shuffle, Info, Menu, ChevronRight, LayoutGrid } from "lucide-react";
import Link from "next/link";
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
  const [mounted, setMounted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentAyah, setCurrentAyah] = useState<number>(1);
  const [showMushafView, setShowMushafView] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const ayahRefs = useRef<{ [key: number]: HTMLElement | null }>({});

  React.useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted) return null;

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
                  <span className="font-arabic text-sky-700">{initialData.nameAr}</span>
                  <span>{initialData.nameEn}</span>
                </h1>
                <p className="text-xs sm:text-sm text-gray-500">{initialData.meaning}</p>
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
                      <span className="text-xl md:text-2xl font-arabic text-sky-700">{initialData.nameAr}</span>
                      <span className="text-lg md:text-xl">{initialData.nameEn}</span>
                    </DialogTitle>
                    <DialogDescription asChild>
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-500">Meaning</div>
                            <div className="text-sm md:text-base text-gray-700">{initialData.meaning}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-500">Number of Verses</div>
                            <div className="text-sm md:text-base text-gray-700">{initialData.verses} verses</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-500">Revelation Type</div>
                            <div className="text-sm md:text-base text-gray-700">{initialData.revelationType}</div>
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
                <h2 className="font-arabic text-4xl text-sky-600 mb-2">{initialData.nameAr}</h2>
                <p className="text-xl text-gray-600">{initialData.nameEn}</p>
              </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-hidden px-4">
              <div className="h-full max-w-7xl mx-auto">
                {/* Quran Text and Translation */}
                <div className="grid h-full grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Translation Card */}
                  <div className="bg-gray-50 rounded-2xl p-8 shadow-sm overflow-y-auto">
                    <div className="space-y-6">
                      {initialData.ayat.map((ayah) => (
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
                              {ayah.number}
                            </span>
                            <div className="h-px flex-1 bg-gray-200"></div>
                          </div>
                          <p className="text-lg leading-relaxed">
                            {ayah.translation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Arabic Text Card */}
                  <div className="bg-gray-50 rounded-2xl p-8 shadow-sm overflow-y-auto">
                    <div className="text-right font-arabic text-3xl leading-[2] tracking-wide" dir="rtl">
                      {initialData.ayat.map((ayah) => (
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
            <div className="border-t bg-white">
              <div className="px-6 py-3">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-800">{initialData.nameEn}</span>
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
                  <div className="flex items-center justify-center space-x-6">
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
        ) : (
          <>
            {/* Split View Content */}
            <div className="flex-1 overflow-y-auto pb-32">
              <div className="space-y-10 py-8">
                {initialData.ayat.map((ayah) => (
                  <div 
                    key={ayah.number} 
                    ref={(el) => {
                      ayahRefs.current[ayah.number] = el;
                    }}
                    className={`flex items-start transition-colors duration-300 ${
                      currentAyah === ayah.number ? 'bg-sky-50/80 rounded-lg' : ''
                    }`}
                  >
                    {/* Translation - Left Side */}
                    <div className="w-[50%] pl-6 py-4">
                      <p className={`text-lg leading-relaxed pr-4 ${
                        currentAyah === ayah.number ? 'text-sky-900' : 'text-gray-700'
                      }`}>
                        {ayah.translation}
                      </p>
                    </div>

                    {/* Arabic - Right Side */}
                    <div className="w-[50%] flex items-start justify-end pr-6 py-4">
                      <div className="flex items-start gap-4">
                        <p className={`text-3xl font-arabic leading-relaxed text-right ${
                          currentAyah === ayah.number ? 'text-sky-900' : 'text-gray-800'
                        }`} style={{ direction: 'rtl' }}>
                          {ayah.arabic}
                        </p>
                        <div className="flex-shrink-0 mt-2">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm border ${
                            currentAyah === ayah.number 
                              ? 'bg-sky-100 text-sky-600 border-sky-300' 
                              : 'bg-sky-50 text-sky-600 border-sky-200'
                          }`}>
                            {ayah.number}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Audio Player */}
            <div className="border-t bg-white">
              <div className="px-6 py-3">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-800">{initialData.nameEn}</span>
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
                  <div className="flex items-center justify-center space-x-6">
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
          </>
        )}
      </div>
    </div>
  );
} 