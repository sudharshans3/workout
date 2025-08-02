import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase, rateArtwork } from "@/lib/mongodb"

interface Props {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: Props) {
  try {
    await connectToDatabase()
    const { id } = await params
    const body = await request.json()
    const { rating, sessionId } = body

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 })
    }

    const artwork = await rateArtwork(id, rating, sessionId)

    if (!artwork) {
      return NextResponse.json({ error: "Artwork not found" }, { status: 404 })
    }

    return NextResponse.json(artwork)
  } catch (error) {
    if (error.message === "Already rated") {
      return NextResponse.json({ error: "You have already rated this artwork" }, { status: 409 })
    }
    return NextResponse.json({ error: "Failed to rate artwork" }, { status: 500 })
  }
}
