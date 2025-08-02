"use client"

import { useState, useEffect } from "react"
import ArtworkCard from "./artwork-card"
import type { Artwork } from "@/lib/mongodb"

export default function ArtworkGallery() {
  const [artwork, setArtwork] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchArtwork()
  }, [])

  const fetchArtwork = async () => {
    try {
      const response = await fetch("/api/artwork")
      const data = await response.json()
      setArtwork(data)
    } catch (error) {
      console.error("Failed to fetch artwork:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
            <div className="w-full h-64 bg-gray-200"></div>
            <div className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (artwork.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-4">No artwork found</div>
        <p className="text-gray-400">Be the first to upload some amazing artwork!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {artwork.map((art) => (
        <ArtworkCard key={art._id} artwork={art} />
      ))}
    </div>
  )
}
