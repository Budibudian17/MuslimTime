"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Clock, MapPin, RefreshCw, Globe2 } from "lucide-react"
import Link from "next/link"

interface PrayerTime {
  name: string
  time: string
  arabicName: string
}

interface Location {
  latitude: number
  longitude: number
  city: string
  country: string
}

export default function PrayerTimes() {
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([])
  const [location, setLocation] = useState<Location | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchPrayerTimes = async (latitude: number, longitude: number) => {
    try {
      const date = new Date()
      const response = await fetch(
        `https://api.aladhan.com/v1/timings/${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}?latitude=${latitude}&longitude=${longitude}&method=2`
      )
      const data = await response.json()

      if (data.code === 200) {
        const timings = data.data.timings
        setPrayerTimes([
          { name: "Fajr", arabicName: "الفجر", time: timings.Fajr },
          { name: "Sunrise", arabicName: "الشروق", time: timings.Sunrise },
          { name: "Dhuhr", arabicName: "الظهر", time: timings.Dhuhr },
          { name: "Asr", arabicName: "العصر", time: timings.Asr },
          { name: "Maghrib", arabicName: "المغرب", time: timings.Maghrib },
          { name: "Isha", arabicName: "العشاء", time: timings.Isha },
        ])
      }
    } catch (err) {
      setError("Failed to fetch prayer times")
    }
  }

  const fetchLocation = async () => {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        })
      })

      await fetchPrayerTimes(position.coords.latitude, position.coords.longitude)

      try {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`
        )
        const data = await response.json()

        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          city: data.city || "Unknown City",
          country: data.countryName || "Unknown Country"
        })
      } catch (geoErr) {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          city: `${position.coords.latitude.toFixed(4)}°, ${position.coords.longitude.toFixed(4)}°`,
          country: "Coordinates"
        })
      }
    } catch (err) {
      if (err instanceof GeolocationPositionError) {
        switch(err.code) {
          case err.PERMISSION_DENIED:
            setError("Location access was denied. Please enable location access in your browser settings and refresh the page.")
            break
          case err.POSITION_UNAVAILABLE:
            setError("Location information is unavailable. Please check your device's location settings.")
            break
          case err.TIMEOUT:
            setError("Location request timed out. Please check your internet connection and try again.")
            break
          default:
            setError("An unknown error occurred while getting location. Please try again.")
        }
      } else {
        setError("Failed to get location. Please check your internet connection and try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setMounted(true)
    fetchLocation()
  }, [])

  const handleRefresh = () => {
    setIsLoading(true)
    fetchLocation()
  }

  if (!mounted) return null

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Skeleton className="h-8 w-36" />
            <div className="flex items-center gap-1 mt-1">
              <Skeleton className="h-3 w-3" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-9 w-9 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-4 rounded-xl border border-gray-200 bg-gray-50">
              <div className="space-y-2">
                <div>
                  <Skeleton className="h-5 w-16 mb-1" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-14" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm">
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" /> Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Prayer Times</h2>
          {location && (
            <>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" />
                {location.city}, {location.country}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </>
          )}
        </div>
        <div className="flex gap-2">
          <Link href="/worldwide-prayers">
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700" title="View worldwide prayer times">
              <Globe2 className="h-5 w-5" />
            </Button>
          </Link>
          <Button onClick={handleRefresh} variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
            <RefreshCw className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {prayerTimes.map((prayer) => (
          <div
            key={prayer.name}
            className="p-4 rounded-xl border bg-gray-50 transition-all duration-200 hover:bg-sky-500 hover:text-white hover:shadow-2xl hover:scale-105 group"
          >
            <div className="space-y-2">
              <div>
                <h3 className="font-semibold text-gray-800 transition-colors duration-200 group-hover:text-white">
                  {prayer.name}
                </h3>
                <p className="text-sm text-gray-500 font-arabic transition-colors duration-200 group-hover:text-white">
                  {prayer.arabicName}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sky-600 transition-colors duration-200 group-hover:text-white">
                <Clock className="h-4 w-4" />
                <span className="font-medium">{prayer.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 