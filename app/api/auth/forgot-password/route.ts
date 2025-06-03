import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Check if user exists
    const users = (await executeQuery("SELECT id FROM users WHERE email = ?", [email])) as any[]

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetTokenExpires = new Date(Date.now() + 3600000) // 1 hour

    // Update user with reset token
    await executeQuery("UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?", [
      resetToken,
      resetTokenExpires,
      email,
    ])

    // In a real application, you would send an email here
    console.log(`Reset token for ${email}: ${resetToken}`)

    return NextResponse.json({
      message: "Password reset link sent to your email",
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
