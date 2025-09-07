"use client"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Pause, Play, SkipBack, SkipForward, Volume2 } from "lucide-react"
import { useState, useEffect } from "react"

export default function AudioPlayer() {
  const [mounted, setMounted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(100)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="flex-1 mx-4">
          <div className="h-2 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-2 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
          <SkipBack className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
        </Button>
        <Button variant="ghost" size="icon">
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 mx-4">
        <Slider
          defaultValue={[0]}
          max={100}
          step={1}
          className="w-full"
        />
      </div>

      <div className="flex items-center gap-2">
        <Volume2 className="h-4 w-4" />
        <Slider
          defaultValue={[volume]}
          max={100}
          step={1}
          className="w-24"
          onValueChange={([value]) => setVolume(value)}
        />
      </div>
    </div>
  )
} 