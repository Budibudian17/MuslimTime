'use client'

import React, { useCallback, useMemo, useState } from 'react'
import Cropper from 'react-easy-crop'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'

interface Area {
  width: number
  height: number
  x: number
  y: number
}

function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  return new Promise(async (resolve, reject) => {
    try {
      const image = new Image()
      image.crossOrigin = 'anonymous'
      image.src = imageSrc

      image.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('No canvas context'))

        canvas.width = pixelCrop.width
        canvas.height = pixelCrop.height
        ctx.drawImage(
          image,
          pixelCrop.x,
          pixelCrop.y,
          pixelCrop.width,
          pixelCrop.height,
          0,
          0,
          pixelCrop.width,
          pixelCrop.height
        )
        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error('Failed to crop'))
          resolve(blob)
        }, 'image/jpeg', 0.9)
      }
      image.onerror = reject
    } catch (e) {
      reject(e)
    }
  })
}

export default function PhotoCropper({
  src,
  onCancel,
  onConfirm,
}: {
  src: string
  onCancel: () => void
  onConfirm: (blob: Blob) => void
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixelsParam: Area) => {
    setCroppedAreaPixels(croppedAreaPixelsParam)
  }, [])

  const handleConfirm = useCallback(async () => {
    if (!croppedAreaPixels) return
    const blob = await getCroppedImg(src, croppedAreaPixels)
    onConfirm(blob)
  }, [croppedAreaPixels, src, onConfirm])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-xl overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
        <div className="relative h-[360px] bg-black">
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <div className="p-4 space-y-4">
          <div>
            <p className="text-sm mb-2">Zoom</p>
            <Slider value={[zoom]} min={1} max={3} step={0.01} onValueChange={(v) => setZoom(v[0])} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>Batal</Button>
            <Button onClick={handleConfirm}>Simpan</Button>
          </div>
        </div>
      </div>
    </div>
  )
}


