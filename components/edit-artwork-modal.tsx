"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"
import type { Artwork } from "@/lib/mongodb"

interface Props {
  artwork: Artwork
  onClose: () => void
  onUpdate: (artwork: Artwork) => void
}

export default function EditArtworkModal({ artwork, onClose, onUpdate }: Props) {
  const [formData, setFormData] = useState({
    title: artwork.title,
    description: artwork.description,
    imageUrl: artwork.imageUrl,
    creatorId: artwork.creatorId,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.creatorId !== artwork.creatorId) {
      alert("Invalid creator ID. You can only edit your own artwork.")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/artwork/${artwork._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          imageUrl: formData.imageUrl,
        }),
      })

      if (response.ok) {
        const updatedArtwork = await response.json()
        onUpdate(updatedArtwork)
      } else {
        const error = await response.json()
        alert(error.error || "Failed to update artwork")
      }
    } catch (error) {
      alert("Failed to update artwork")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Edit Artwork</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Artwork Title</Label>
              <Input id="edit-title" name="title" value={formData.title} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-imageUrl">Image URL</Label>
              <Input
                id="edit-imageUrl"
                name="imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-creatorId">Creator ID (for verification)</Label>
              <Input
                id="edit-creatorId"
                name="creatorId"
                value={formData.creatorId}
                onChange={handleChange}
                placeholder="Enter your creator ID to confirm"
                required
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Artwork"}
              </Button>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
