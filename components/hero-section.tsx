"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import MiniMusicPlayer from "@/components/mini-music-player"
import { Moon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useState, useEffect } from "react"

export default function HeroSection() {
  const [isLoading, setIsLoading] = useState(true)

  const tags = [
    "Daily Prayer Times",
    "Quran Recitation",
    "Famous Reciters",
    "Juz by Juz Reading",
  ]

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <section className="relative bg-gradient-to-br from-sky-400 to-blue-500 text-white p-8 md:p-12 rounded-3xl overflow-hidden min-h-[550px] flex flex-col">
        <div className="relative z-10 flex items-center justify-between mb-8 -mt-10">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-20 w-20 rounded-lg" />
            <Skeleton className="h-8 w-32" />
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-4 w-16" />
            ))}
          </nav>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-24 rounded-full" />
          </div>
        </div>

        <div className="relative z-10 flex-grow flex flex-col justify-center mt-10">
          <Skeleton className="h-16 w-3/4 mb-2" />
          <Skeleton className="h-16 w-1/2" />
          
          <div className="mt-4 flex items-center space-x-2">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-8 w-8 rounded-full border-2 border-white" />
              ))}
            </div>
            <Skeleton className="h-4 w-48" />
          </div>
          
          <Skeleton className="mt-6 h-10 w-48 rounded-full" />
        </div>

        <div className="relative z-10 mt-8 grid md:grid-cols-2 gap-6 items-end">
          <Skeleton className="h-32 w-full rounded-xl" />
          <div className="ml-auto">
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-5/6" />
            <div className="h-[1px] w-full bg-white/80 my-3"></div>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-6 w-24 rounded-full" />
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative bg-gradient-to-br from-sky-400 to-blue-500 text-white p-8 md:p-12 rounded-3xl overflow-hidden min-h-[550px] flex flex-col">
      {/* Background mosque silhouette - simplified */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url('/5.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Integrated Navbar */}
      <div className="relative z-10 flex items-center justify-between mb-8 -mt-10">
        <div className="flex items-center space-x-2">
          <img
            src="/logo.png"
            alt="Qolb Logo"
            className="h-20 w-20"
          />
          <span className="font-bold text-3xl text-white">MuslimTime</span>
        </div>
        <nav className="hidden md:flex items-center space-x-6 text-white/90">
          <a href="#" className="hover:text-white">
            Reciters
          </a>
          <a href="#" className="hover:text-white">
            Music
          </a>
          <a href="#" className="hover:text-white">
            About Us
          </a>
          <a href="#" className="hover:text-white">
            Blog
          </a>
        </nav>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="text-white/90 hover:text-white">
            <Moon className="h-5 w-5" />
          </Button>
          <Button className="bg-white hover:bg-gray-100 text-sky-600 rounded-full px-6 py-2 text-sm font-semibold">
            Sign In
          </Button>
        </div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex-grow flex flex-col justify-center mt-10">
        <h1 className="text-4xl md:text-5xl font-bold max-w-2xl">Read Quran, Listen to Murottal, and Track Prayer Times.</h1>
        <div className="mt-4 flex items-center space-x-2">
          <div className="flex -space-x-2">
            <Avatar className="h-8 w-8 border-2 border-white">
              <AvatarImage src="/people.png" />
              <AvatarFallback>U1</AvatarFallback>
            </Avatar>
            <Avatar className="h-8 w-8 border-2 border-white">
              <AvatarImage src="/people.png" />
              <AvatarFallback>U2</AvatarFallback>
            </Avatar>
            <Avatar className="h-8 w-8 border-2 border-white">
              <AvatarImage src="/people.png" />
              <AvatarFallback>U3</AvatarFallback>
            </Avatar>
          </div>
          <p className="text-sm">354k+ Muslims Using MuslimTime Daily</p>
        </div>
        <Button className="mt-6 bg-white text-sky-600 hover:bg-gray-100 rounded-full px-6 py-2 font-semibold w-fit">
          Start Your Spiritual Journey
        </Button>
      </div>

      {/* Bottom Content */}
      <div className="relative z-10 mt-8 grid md:grid-cols-2 gap-6 items-end">
        <MiniMusicPlayer />
        <div className="ml-auto">
          <p className="text-sm mb-3 max-w-md">
            Access the complete Quran, listen to beautiful recitations from renowned reciters, and never miss a prayer with our accurate prayer time schedules.
          </p>
          <div className="h-[1px] w-full bg-white/80 mb-3"></div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <Button
                key={index}
                variant="outline"
                className="bg-white/20 hover:bg-white/30 border-white/30 text-white rounded-full text-xs px-3 py-1 h-auto"
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
