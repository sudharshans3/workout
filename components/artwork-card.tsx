import Link from "next/link"
import Image from "next/image"
import { Star } from "lucide-react"
import type { Artwork } from "@/lib/mongodb"

interface Props {
  artwork: Artwork
}

export default function ArtworkCard({ artwork }: Props) {
  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
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
    <Link href={`/artwork/${artwork._id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer">
        <div className="relative w-full h-64">
          <Image
            src={artwork.imageUrl || "/placeholder.svg"}
            alt={artwork.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-1">{artwork.title}</h3>

          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{artwork.description}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {renderStars(artwork.averageRating)}
              <span className="text-sm text-gray-500 ml-1">({artwork.totalRatings})</span>
            </div>

            <div className="text-xs text-gray-400">{new Date(artwork.createdAt).toLocaleDateString()}</div>
          </div>
        </div>
      </div>
    </Link>
  )
}
