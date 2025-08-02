import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase, createArtwork, getAllArtwork } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"

export async function GET() {
  try {
    await connectToDatabase()
    const artwork = await getAllArtwork()
    return NextResponse.json(artwork)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch artwork" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    await connectToDatabase()
    const body = await request.json()
    const { title, description, imageUrl } = body

    if (!title || !description || !imageUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const artwork = await createArtwork({
      title,
      description,
      imageUrl,
      userId: decoded.userId,
    })

    return NextResponse.json(artwork, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create artwork" }, { status: 500 })
  }
}
