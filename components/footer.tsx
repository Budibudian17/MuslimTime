"use client"

import { useEffect, useState } from "react"

export default function Footer() {
  const [year, setYear] = useState<number>()

  useEffect(() => {
    setYear(new Date().getFullYear())
  }, [])

  return (
    <footer className="text-center py-8 text-sm text-gray-500">
      <p>&copy; {year} MuslimTime. All rights reserved.</p>
    </footer>
  )
} 