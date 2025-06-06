"use client"

import HeroSection from "@/components/hero-section"
import SurahList from "@/components/surah-list"
import Sidebar from "@/components/sidebar"
import { useEffect, useState } from "react"

export default function HomePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <main className="container mx-auto px-4 py-8">
        <HeroSection />
        <div className="mt-12 lg:flex lg:space-x-8">
          <div className="lg:w-2/3">
            <SurahList />
          </div>
          <div className="lg:w-1/3 mt-8 lg:mt-0">
            <Sidebar />
          </div>
        </div>
      </main>
      <footer className="text-center py-8 text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} MuslimTime. All rights reserved.</p>
      </footer>
    </div>
  )
}
