"use client"

import { useEffect, useState } from "react"

export default function Footer() {
  const [mounted, setMounted] = useState(false)
  const [year, setYear] = useState<number>()

  useEffect(() => {
    setMounted(true)
    setYear(new Date().getFullYear())
  }, [])

  return (
    <footer className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
      <p>&copy; {mounted ? year : ''} MuslimTime. All rights reserved.</p>
    </footer>
  )
} 