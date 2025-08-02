"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Upload, ImageIcon, X } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export default function UploadForm() {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!user) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <p className="text-gray-600 mb-4">Please sign in to upload artwork</p>
          <Button onClick={() => (window.location.href = "/auth/login")}>Sign In</Button>
        </CardContent>
      </Card>
    )
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setFormData((prev) => ({ ...prev, imageUrl: "" }))
    }
  }

  const handleFileUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append("file", selectedFile)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      })

      if (response.ok) {
        const data = await response.json()
        setFormData((prev) => ({ ...prev, imageUrl: data.imageUrl }))
      } else {
        const error = await response.json()
        alert(error.error || "Upload failed")
      }
    } catch (error) {
      alert("Upload failed")
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.description) {
      alert("Please fill in all fields")
      return
    }

    if (!formData.imageUrl && !selectedFile) {
      alert("Please provide an image")
      return
    }

    // Upload file if selected but not uploaded yet
    if (selectedFile && !formData.imageUrl) {
      await handleFileUpload()
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/artwork", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userId: user.id,
        }),
      })

      if (response.ok) {
        const artwork = await response.json()
        window.location.href = `/artwork/${artwork._id}`
      } else {
        const error = await response.json()
        alert(error.error || "Failed to upload artwork")
      }
    } catch (error) {
      alert("Failed to upload artwork")
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

  const clearFile = () => {
    setSelectedFile(null)
    setPreviewUrl("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Upload New Artwork
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Artwork Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter artwork title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your artwork..."
              rows={4}
              required
            />
          </div>

          <div className="space-y-4">
            <Label>Artwork Image</Label>

            {/* File Upload Option */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Choose File
                </Button>
                {selectedFile && (
                  <Button type="button" variant="ghost" size="sm" onClick={clearFile}>
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {selectedFile && (
                <div className="text-sm text-gray-600">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              )}
            </div>

            {/* URL Input Option */}
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Or enter image URL</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                disabled={!!selectedFile}
              />
            </div>

            {/* Preview */}
            {(previewUrl || formData.imageUrl) && (
              <div className="mt-2 p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <ImageIcon className="w-4 h-4" />
                  Preview:
                </div>
                <img
                  src={previewUrl || formData.imageUrl || "/placeholder.svg"}
                  alt="Preview"
                  className="max-w-full h-48 object-contain rounded border"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                  }}
                />
              </div>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting || isUploading}>
            {isUploading ? "Uploading image..." : isSubmitting ? "Creating artwork..." : "Upload Artwork"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
