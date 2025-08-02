import ArtworkGallery from "@/components/artwork-gallery"
import AuthenticatedHeader from "@/components/authenticated-header"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AuthenticatedHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Featured Artwork</h2>
          <p className="text-gray-600">Discover amazing artwork from talented creators</p>
        </div>

        <ArtworkGallery />
      </main>
    </div>
  )
}
