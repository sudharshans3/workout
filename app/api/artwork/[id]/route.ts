import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase, getArtwork, updateArtwork, deleteArtwork } from "@/lib/mongodb"

interface Props {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    await connectToDatabase()
    const { id } = await params
    const artwork = await getArtwork(id)

    if (!artwork) {
      return NextResponse.json({ error: "Artwork not found" }, { status: 404 })
    }

    return NextResponse.json(artwork)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch artwork" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: Props) {
  try {
    await connectToDatabase()
    const { id } = await params
    const body = await request.json()

    const artwork = await updateArtwork(id, body)

    if (!artwork) {
      return NextResponse.json({ error: "Artwork not found" }, { status: 404 })
    }

    return NextResponse.json(artwork)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update artwork" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: Props) {
  try {
    await connectToDatabase()
    const { id } = await params

    const result = await deleteArtwork(id)

    if (!result) {
      return NextResponse.json({ error: "Artwork not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Artwork deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete artwork" }, { status: 500 })
  }
}
