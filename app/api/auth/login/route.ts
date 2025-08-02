import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase, getUserByEmail, verifyPassword } from "@/lib/mongodb"
import { generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

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
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
