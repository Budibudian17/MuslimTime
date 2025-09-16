// Offline Prayer Times Calculator
// Based on Islamic astronomical calculations

interface PrayerTimes {
  fajr: string
  sunrise: string
  dhuhr: string
  asr: string
  maghrib: string
  isha: string
}

interface Location {
  latitude: number
  longitude: number
  city: string
  country: string
}

export class OfflinePrayerCalculator {
  private static instance: OfflinePrayerCalculator

  static getInstance(): OfflinePrayerCalculator {
    if (!OfflinePrayerCalculator.instance) {
      OfflinePrayerCalculator.instance = new OfflinePrayerCalculator()
    }
    return OfflinePrayerCalculator.instance
  }

  // Calculate prayer times for a given date and location
  calculatePrayerTimes(
    latitude: number,
    longitude: number,
    date: Date = new Date(),
    timezone: number = 7 // Default to Indonesia timezone
  ): PrayerTimes {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()

    // Calculate Julian day
    const julianDay = this.calculateJulianDay(year, month, day)
    
    // Calculate sun declination
    const sunDeclination = this.calculateSunDeclination(julianDay)
    
    // Calculate equation of time
    const equationOfTime = this.calculateEquationOfTime(julianDay)
    
    // Calculate Fajr time
    const fajrAngle = 20 // Standard angle for Fajr
    const fajrTime = this.calculatePrayerTime(
      latitude, longitude, fajrAngle, sunDeclination, equationOfTime, timezone, julianDay
    )
    
    // Calculate Sunrise time
    const sunriseAngle = -0.833 // Standard angle for sunrise
    const sunriseTime = this.calculatePrayerTime(
      latitude, longitude, sunriseAngle, sunDeclination, equationOfTime, timezone, julianDay
    )
    
    // Calculate Dhuhr time (midday)
    const dhuhrTime = this.calculateDhuhrTime(longitude, equationOfTime, timezone)
    
    // Calculate Asr time
    const asrAngle = this.calculateAsrAngle(sunDeclination, latitude)
    const asrTime = this.calculatePrayerTime(
      latitude, longitude, asrAngle, sunDeclination, equationOfTime, timezone, julianDay
    )
    
    // Calculate Maghrib time
    const maghribAngle = -0.833 // Standard angle for sunset
    const maghribTime = this.calculatePrayerTime(
      latitude, longitude, maghribAngle, sunDeclination, equationOfTime, timezone, julianDay
    )
    
    // Calculate Isha time
    const ishaAngle = 18 // Standard angle for Isha
    const ishaTime = this.calculatePrayerTime(
      latitude, longitude, ishaAngle, sunDeclination, equationOfTime, timezone, julianDay
    )

    return {
      fajr: this.formatTime(fajrTime),
      sunrise: this.formatTime(sunriseTime),
      dhuhr: this.formatTime(dhuhrTime),
      asr: this.formatTime(asrTime),
      maghrib: this.formatTime(maghribTime),
      isha: this.formatTime(ishaTime)
    }
  }

  private calculateJulianDay(year: number, month: number, day: number): number {
    if (month <= 2) {
      year -= 1
      month += 12
    }
    
    const a = Math.floor(year / 100)
    const b = 2 - a + Math.floor(a / 4)
    
    return Math.floor(365.25 * (year + 4716)) + 
           Math.floor(30.6001 * (month + 1)) + 
           day + b - 1524.5
  }

  private calculateSunDeclination(julianDay: number): number {
    const n = julianDay - 2451545.0
    const L = (280.460 + 0.9856474 * n) % 360
    const g = (357.528 + 0.9856003 * n) % 360
    
    const lambda = L + 1.915 * Math.sin(this.toRadians(g)) + 
                   0.020 * Math.sin(this.toRadians(2 * g))
    
    const declination = Math.asin(Math.sin(this.toRadians(23.439)) * 
                                 Math.sin(this.toRadians(lambda)))
    
    return this.toDegrees(declination)
  }

  private calculateEquationOfTime(julianDay: number): number {
    const n = julianDay - 2451545.0
    const L = (280.460 + 0.9856474 * n) % 360
    const g = (357.528 + 0.9856003 * n) % 360
    
    const lambda = L + 1.915 * Math.sin(this.toRadians(g)) + 
                   0.020 * Math.sin(this.toRadians(2 * g))
    
    const alpha = Math.atan2(
      Math.cos(this.toRadians(23.439)) * Math.sin(this.toRadians(lambda)),
      Math.cos(this.toRadians(lambda))
    )
    
    const equationOfTime = L - this.toDegrees(alpha)
    
    return equationOfTime
  }

  private calculatePrayerTime(
    latitude: number,
    longitude: number,
    angle: number,
    sunDeclination: number,
    equationOfTime: number,
    timezone: number,
    julianDay: number
  ): number {
    const latRad = this.toRadians(latitude)
    const decRad = this.toRadians(sunDeclination)
    const angleRad = this.toRadians(angle)
    
    const hourAngle = Math.acos(
      (Math.sin(angleRad) - Math.sin(latRad) * Math.sin(decRad)) /
      (Math.cos(latRad) * Math.cos(decRad))
    )
    
    const time = 12 + (this.toDegrees(hourAngle) / 15) - 
                 (equationOfTime / 15) - (longitude / 15) + timezone
    
    return time
  }

  private calculateDhuhrTime(longitude: number, equationOfTime: number, timezone: number): number {
    return 12 - (equationOfTime / 15) - (longitude / 15) + timezone
  }

  private calculateAsrAngle(sunDeclination: number, latitude: number): number {
    const latRad = this.toRadians(latitude)
    const decRad = this.toRadians(sunDeclination)
    
    const shadowLength = 1 + Math.tan(Math.abs(latRad - decRad))
    const angle = Math.atan(1 / shadowLength)
    
    return this.toDegrees(angle)
  }

  private formatTime(time: number): string {
    const hours = Math.floor(time)
    const minutes = Math.floor((time - hours) * 60)
    
    const formattedHours = hours.toString().padStart(2, '0')
    const formattedMinutes = minutes.toString().padStart(2, '0')
    
    return `${formattedHours}:${formattedMinutes}`
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180)
  }

  private toDegrees(radians: number): number {
    return radians * (180 / Math.PI)
  }

  // Get prayer times for multiple days (useful for caching)
  calculatePrayerTimesForWeek(
    latitude: number,
    longitude: number,
    startDate: Date = new Date(),
    timezone: number = 7
  ): { date: string; times: PrayerTimes }[] {
    const results = []
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      
      const times = this.calculatePrayerTimes(latitude, longitude, date, timezone)
      
      results.push({
        date: date.toISOString().split('T')[0],
        times
      })
    }
    
    return results
  }

  // Get current prayer time status
  getCurrentPrayerStatus(prayerTimes: PrayerTimes): {
    current: string | null
    next: string | null
    timeUntilNext: string | null
  } {
    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    
    const prayers = [
      { name: 'Fajr', time: this.timeToMinutes(prayerTimes.fajr) },
      { name: 'Sunrise', time: this.timeToMinutes(prayerTimes.sunrise) },
      { name: 'Dhuhr', time: this.timeToMinutes(prayerTimes.dhuhr) },
      { name: 'Asr', time: this.timeToMinutes(prayerTimes.asr) },
      { name: 'Maghrib', time: this.timeToMinutes(prayerTimes.maghrib) },
      { name: 'Isha', time: this.timeToMinutes(prayerTimes.isha) }
    ]
    
    // Find current and next prayer
    let current = null
    let next = null
    
    for (let i = 0; i < prayers.length; i++) {
      if (currentTime >= prayers[i].time) {
        current = prayers[i].name
        next = prayers[(i + 1) % prayers.length].name
      }
    }
    
    // If no current prayer found, next prayer is Fajr
    if (!current) {
      next = 'Fajr'
    }
    
    // Calculate time until next prayer
    let timeUntilNext = null
    if (next) {
      const nextPrayer = prayers.find(p => p.name === next)
      if (nextPrayer) {
        let minutesUntil = nextPrayer.time - currentTime
        if (minutesUntil < 0) {
          minutesUntil += 24 * 60 // Next day
        }
        
        const hours = Math.floor(minutesUntil / 60)
        const mins = minutesUntil % 60
        
        timeUntilNext = `${hours}h ${mins}m`
      }
    }
    
    return { current, next, timeUntilNext }
  }

  private timeToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number)
    return hours * 60 + minutes
  }
}

// Export singleton instance
export const offlinePrayerCalculator = OfflinePrayerCalculator.getInstance()
