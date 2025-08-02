"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Star, Edit, Trash2, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Artwork } from "@/lib/mongodb"
import RatingComponent from "./rating-component"
import EditArtworkModal from "./edit-artwork-modal"

interface Props {
  artwork: Artwork
}

export default function ArtworkViewer({ artwork: initialArtwork }: Props) {
  const [artwork, setArtwork] = useState(initialArtwork)
  const [showEditModal, setShowEditModal] = useState(false)
  const [sessionId, setSessionId] = useState("")

  useEffect(() => {
    // Generate or get session ID
    let id = localStorage.getItem("sessionId")
    if (!id) {
      id = Math.random().toString(36).substring(2, 15)
      localStorage.setItem("sessionId", id)
    }
    setSessionId(id)
  }, [])

  const handleRatingUpdate = (updatedArtwork: Artwork) => {
    setArtwork(updatedArtwork)
  }

  const handleEdit = (updatedArtwork: Artwork) => {
    setArtwork(updatedArtwork)
    setShowEditModal(false)
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this artwork?")) return

    try {
      const response = await fetch(`/api/artwork/${artwork._id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        window.location.href = "/"
      } else {
        alert("Failed to delete artwork")
      }
    } catch (error) {
      alert("Failed to delete artwork")
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: artwork.title,
          text: artwork.description,
          url: url,
        })
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(url)
        alert("Link copied to clipboard!")
      }
    } else {
      navigator.clipboard.writeText(url)
      alert("Link copied to clipboard!")
    }
  }

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < Math.floor(rating)
            ? "fill-yellow-400 text-yellow-400"
            : i < rating
              ? "fill-yellow-200 text-yellow-400"
              : "text-gray-300"
        }`}
      />
    ))
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="overflow-hidden">
        <div className="relative w-full h-96 md:h-[500px]">
          <Image
            src={artwork.imageUrl || "/placeholder.svg"}
            alt={artwork.title}
            fill
            className="object-contain bg-gray-100"
            sizes="(max-width: 768px) 100vw, 80vw"
            priority
          />
        </div>

        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{artwork.title}</h1>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">{renderStars(artwork.averageRating)}</div>
                <span className="text-lg font-medium text-gray-700">{artwork.averageRating.toFixed(1)}</span>
                <span className="text-gray-500">
                  ({artwork.totalRatings} {artwork.totalRatings === 1 ? "rating" : "ratings"})
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowEditModal(true)}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <p className="text-gray-700 text-lg mb-6 leading-relaxed">{artwork.description}</p>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Rate this artwork</h3>
            <RatingComponent
              artworkId={artwork._id!.toString()}
              sessionId={sessionId}
              onRatingUpdate={handleRatingUpdate}
            />
          </div>

          <div className="mt-6 text-sm text-gray-500">
            <p>Created: {new Date(artwork.createdAt).toLocaleDateString()}</p>
            <p>Creator ID: {artwork.creatorId}</p>
          </div>
        </CardContent>
      </Card>

      {showEditModal && (
        <EditArtworkModal artwork={artwork} onClose={() => setShowEditModal(false)} onUpdate={handleEdit} />
      )}
    </div>
  )
}
