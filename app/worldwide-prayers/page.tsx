"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { CalendarIcon, ArrowLeft, Loader2, MapPin, Clock, RefreshCw, Search } from "lucide-react"
import { format, isValid } from "date-fns"
import { id } from "date-fns/locale"
import Link from "next/link"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

interface PrayerTimesData {
  Fajr: string
  Sunrise: string
  Dhuhr: string
  Asr: string
  Maghrib: string
  Isha: string
}

interface ApiPrayerTimesResponse {
  timings: PrayerTimesData
  date: {
    readable: string
  }
  meta: {
    timezone: string
  }
}

const prayerNameMapping: { key: keyof PrayerTimesData; displayName: string }[] = [
  { key: "Fajr", displayName: "Subuh (Fajr)" },
  { key: "Sunrise", displayName: "Terbit (Sunrise)" },
  { key: "Dhuhr", displayName: "Dzuhur (Dhuhr)" },
  { key: "Asr", displayName: "Ashar (Asr)" },
  { key: "Maghrib", displayName: "Maghrib" },
  { key: "Isha", displayName: "Isya (Isha)" },
]

interface CityInfo {
  city: string
  country: string
  label: string
}

interface CityPrayerTimes {
  city: string
  country: string
  label: string
  timezone: string
  date: string
  times: {
    [key: string]: string
  }
}

const worldCities: CityInfo[] = [
  { city: "Tokyo", country: "Japan", label: "Tokyo" },
  { city: "Jakarta", country: "Indonesia", label: "Jakarta" },
  { city: "New York", country: "United States", label: "New York" },
  { city: "London", country: "United Kingdom", label: "London" },
  { city: "Paris", country: "France", label: "Paris" },
  { city: "Dubai", country: "UAE", label: "Dubai" },
  { city: "Singapore", country: "Singapore", label: "Singapore" },
  { city: "Seoul", country: "South Korea", label: "Seoul" },
  { city: "Mumbai", country: "India", label: "Mumbai" },
  { city: "Istanbul", country: "Turkey", label: "Istanbul" },
  { city: "Moscow", country: "Russia", label: "Moscow" },
  { city: "Berlin", country: "Germany", label: "Berlin" },
  { city: "Madrid", country: "Spain", label: "Madrid" },
  { city: "Rome", country: "Italy", label: "Rome" },
  { city: "Cairo", country: "Egypt", label: "Cairo" },
  // Tambahkan lebih banyak kota sesuai kebutuhan
]

const popularCities: CityInfo[] = [
  { city: "Mecca", country: "Saudi Arabia", label: "Makkah Al Mukarramah" },
  { city: "Medina", country: "Saudi Arabia", label: "Madinah Al Munawwarah" },
  { city: "Jakarta", country: "Indonesia", label: "Jakarta" },
  { city: "Istanbul", country: "Turkey", label: "Istanbul" },
  { city: "Dubai", country: "UAE", label: "Dubai" },
  { city: "Kuala Lumpur", country: "Malaysia", label: "Kuala Lumpur" },
]

export default function WorldwidePrayersPage() {
  const [date, setDate] = useState<Date>(new Date())
  const [prayerTimes, setPrayerTimes] = useState<CityPrayerTimes[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [citySearchOpen, setCitySearchOpen] = useState(false)
  const [selectedCity, setSelectedCity] = useState<CityInfo | null>(null)
  const [searchResult, setSearchResult] = useState<CityPrayerTimes | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  const handleCitySelect = (city: CityInfo) => {
    setSelectedCity(city)
    setCitySearchOpen(false)
  }

  const handleSearch = async () => {
    if (!selectedCity) {
      setError("Mohon pilih kota terlebih dahulu")
      return
    }
    
    setError(null)
    setIsSearching(true)
    setSearchResult(null)

    try {
      const formattedDate = format(date, "dd-MM-yyyy")
      const apiUrl = `https://api.aladhan.com/v1/timingsByCity/${formattedDate}?city=${encodeURIComponent(selectedCity.city)}&country=${encodeURIComponent(selectedCity.country)}&method=2`
      
      const response = await fetch(apiUrl)
      if (!response.ok) {
        throw new Error(`Gagal mengambil data (status: ${response.status})`)
      }
      
      const data = await response.json()
      if (data.code === 200 && data.data) {
        setSearchResult({
          city: selectedCity.city,
          country: selectedCity.country,
          label: selectedCity.label,
          timezone: data.data.meta.timezone,
          date: data.data.date.readable,
          times: data.data.timings
        })
      } else {
        throw new Error("Format respons tidak valid.")
      }
    } catch (err) {
      console.error("Search error:", err)
      setError("Gagal mengambil jadwal sholat. Silakan coba lagi.")
    } finally {
      setIsSearching(false)
    }
  }

  const fetchAllPrayerTimes = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const formattedDate = format(date, "dd-MM-yyyy")
      
      const prayerTimesPromises = popularCities.map(async (city) => {
        const apiUrl = `https://api.aladhan.com/v1/timingsByCity/${formattedDate}?city=${encodeURIComponent(city.city)}&country=${encodeURIComponent(city.country)}&method=2`
        
        const response = await fetch(apiUrl)
        if (!response.ok) {
          throw new Error(`Failed to fetch data for ${city.city}`)
        }
        
        const data = await response.json()
        if (data.code === 200 && data.data) {
          return {
            city: city.city,
            country: city.country,
            label: city.label,
            timezone: data.data.meta.timezone,
            date: data.data.date.readable,
            times: data.data.timings
          }
        }
        throw new Error(`Invalid response format for ${city.city}`)
      })

      const results = await Promise.all(prayerTimesPromises)
      setPrayerTimes(results)
    } catch (err) {
      console.error("Failed to fetch prayer times:", err)
      setError("Terjadi kesalahan saat mengambil data waktu sholat. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAllPrayerTimes()
  }, [date])

  const filteredCities = prayerTimes.filter(city => {
    const searchLower = searchQuery.toLowerCase()
    return (
      city.label.toLowerCase().includes(searchLower) ||
      city.country.toLowerCase().includes(searchLower)
    )
  })

  const renderPrayerTimeCard = (cityData: CityPrayerTimes, isSearchResult = false) => (
    <div
      className={cn(
        "p-4 rounded-xl border bg-gray-50 border-gray-200 transition-all duration-200 hover:bg-sky-500 hover:text-white hover:shadow-2xl hover:scale-105 group",
        isSearchResult && "border-sky-200 bg-sky-50"
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-gray-800 transition-colors duration-200 group-hover:text-white">
            {cityData.label}
          </h3>
          <p className="text-sm text-gray-500 flex items-center gap-1 transition-colors duration-200 group-hover:text-white">
            <MapPin className="h-3 w-3" />
            {cityData.country}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 transition-colors duration-200 group-hover:text-white">
            {cityData.timezone}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {prayerNameMapping.map((prayer) => (
          <div key={prayer.key} className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-sky-600 transition-colors duration-200 group-hover:text-white" />
            <span className="text-sm text-gray-600 transition-colors duration-200 group-hover:text-white">
              {prayer.displayName}:
            </span>
            <span className="text-sm font-medium text-sky-600 transition-colors duration-200 group-hover:text-white">
              {cityData.times[prayer.key]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100 p-2 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white p-3 sm:p-4 md:p-6 rounded-2xl shadow-sm mb-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <Link href="/">
                <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex-1 sm:flex-none">
                <h1 className="text-xl sm:text-2xl font-bold">Jadwal Sholat Seluruh Dunia</h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  {format(date, "EEEE, dd MMMM yyyy", { locale: id })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className={cn(
                      "justify-start text-left font-normal w-full sm:w-auto",
                      "text-sm sm:text-base"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(date, "dd MMM yyyy", { locale: id })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => newDate && setDate(newDate)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button
                onClick={fetchAllPrayerTimes}
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:text-gray-700"
              >
                <RefreshCw className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Search Form */}
          <Card className="mb-6 sm:mb-8 border-gray-200">
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Cari Kota
                </label>
                <Popover open={citySearchOpen} onOpenChange={setCitySearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={citySearchOpen}
                      className="w-full justify-between text-left font-normal border-gray-300"
                    >
                      {selectedCity ? selectedCity.label : "Pilih kota..."}
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Cari kota..." />
                      <CommandList>
                        <CommandEmpty>Kota tidak ditemukan.</CommandEmpty>
                        <CommandGroup>
                          {worldCities.map((city) => (
                            <CommandItem
                              key={`${city.city}-${city.country}`}
                              onSelect={() => handleCitySelect(city)}
                              className="flex items-center gap-2"
                            >
                              <MapPin className="h-4 w-4" />
                              <span>{city.label}</span>
                              <span className="text-sm text-gray-500">
                                ({city.country})
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {selectedCity && (
                  <p className="text-sm text-gray-500 mt-2">
                    Negara: {selectedCity.country}
                  </p>
                )}
              </div>
              <Button
                onClick={handleSearch}
                disabled={isSearching || !selectedCity}
                className="w-full bg-sky-500 hover:bg-sky-600 text-white text-sm sm:text-base py-2 sm:py-3"
              >
                {isSearching ? (
                  <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                ) : (
                  "Cari Jadwal Sholat"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 sm:p-4 bg-red-50 text-red-600 rounded-lg border border-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Search Result */}
          {searchResult && (
            <div className="mb-6 sm:mb-8">
              <h2 className="text-base sm:text-lg font-semibold mb-4">Hasil Pencarian</h2>
              {renderPrayerTimeCard(searchResult, true)}
            </div>
          )}

          {/* Popular Cities */}
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <h2 className="text-base sm:text-lg font-semibold">Kota Populer</h2>
              <Input
                type="text"
                placeholder="Filter kota populer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 text-sm"
              />
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="p-3 sm:p-4 rounded-xl border bg-gray-50 animate-pulse">
                    <div className="h-24"></div>
                  </div>
                ))}
              </div>
            )}

            {/* Popular Cities Grid */}
            {!isLoading && !error && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {filteredCities.map((city) => (
                  <div key={`${city.city}-${city.country}`}>
                    {renderPrayerTimeCard(city)}
                  </div>
                ))}
              </div>
            )}

            {!isLoading && !error && filteredCities.length === 0 && (
              <div className="text-center py-6 sm:py-8 text-gray-500 text-sm sm:text-base">
                Tidak ada kota yang ditemukan. Silakan coba kata kunci lain.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 