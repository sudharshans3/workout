import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase, createUser, getUserByEmail, getUserByUsername } from "@/lib/mongodb"
import { generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    const body = await request.json()
    const { email, password, username } = body

    if (!email || !password || !username) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Check if user already exists
    const existingUserByEmail = await getUserByEmail(email)
    if (existingUserByEmail) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }

    const existingUserByUsername = await getUserByUsername(username)
    if (existingUserByUsername) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 })
    }

    const user = await createUser({ email, password, username })
    const token = generateToken(user._id.toString())

    const response = NextResponse.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
      },
    })

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
