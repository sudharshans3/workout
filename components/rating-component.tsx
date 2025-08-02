"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Artwork } from "@/lib/mongodb"

interface Props {
  artworkId: string
  sessionId: string
  onRatingUpdate: (artwork: Artwork) => void
}

export default function RatingComponent({ artworkId, sessionId, onRatingUpdate }: Props) {
  const [hoveredRating, setHoveredRating] = useState(0)
  const [selectedRating, setSelectedRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasRated, setHasRated] = useState(false)

  const handleRatingSubmit = async () => {
    if (!selectedRating || !sessionId) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/artwork/${artworkId}/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating: selectedRating,
          sessionId,
        }),
      })

      if (response.ok) {
        const updatedArtwork = await response.json()
        onRatingUpdate(updatedArtwork)
        setHasRated(true)
      } else {
        const error = await response.json()
        if (response.status === 409) {
          setHasRated(true)
        } else {
          alert(error.error || "Failed to submit rating")
        }
      }
    } catch (error) {
      alert("Failed to submit rating")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (hasRated) {
    return (
      <div className="text-center py-4">
        <p className="text-green-600 font-medium">Thank you for rating this artwork!</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            className="p-1 hover:scale-110 transition-transform"
            onMouseEnter={() => setHoveredRating(rating)}
            onMouseLeave={() => setHoveredRating(0)}
            onClick={() => setSelectedRating(rating)}
          >
            <Star
              className={`w-8 h-8 ${
                rating <= (hoveredRating || selectedRating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300 hover:text-yellow-200"
              }`}
            />
          </button>
        ))}
      </div>

      {selectedRating > 0 && (
        <Button onClick={handleRatingSubmit} disabled={isSubmitting} className="px-6">
          {isSubmitting ? "Submitting..." : `Submit ${selectedRating} Star${selectedRating !== 1 ? "s" : ""}`}
        </Button>
      )}
    </div>
  )
}
