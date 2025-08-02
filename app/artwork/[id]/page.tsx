import { notFound } from "next/navigation"
import ArtworkViewer from "@/components/artwork-viewer"
import { getArtwork } from "@/lib/mongodb"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  params: Promise<{ id: string }>
}

export default async function ArtworkPage({ params }: Props) {
  const { id } = await params

  try {
    const artwork = await getArtwork(id)

    if (!artwork) {
      notFound()
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Gallery
              </Button>
            </Link>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ArtworkViewer artwork={artwork} />
        </main>
      </div>
    )
  } catch (error) {
    notFound()
  }
}
