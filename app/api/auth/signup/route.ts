import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { hashPassword } from "@/lib/auth"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const { employeeId, fullName, email, password, accountType } = await request.json()

    // Validate input
    if (!employeeId || !fullName || !email || !password || !accountType) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Check if vendor already exists (only one vendor allowed)
    if (accountType === "vendor") {
      const existingVendors = (await executeQuery("SELECT COUNT(*) as count FROM users WHERE account_type = ?", [
        "vendor",
      ])) as any[]

      if (existingVendors[0].count > 0) {
        return NextResponse.json({ error: "Vendor account already exists" }, { status: 400 })
      }
    }

    // Check if user already exists
    const existingUsers = (await executeQuery("SELECT id FROM users WHERE email = ? OR employee_id = ?", [
      email,
      employeeId,
    ])) as any[]

    if (existingUsers.length > 0) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Hash password and create verification token
    const hashedPassword = await hashPassword(password)
    const verificationToken = crypto.randomBytes(32).toString("hex")

    // Insert user
    await executeQuery(
      "INSERT INTO users (employee_id, full_name, email, password_hash, account_type, verification_token) VALUES (?, ?, ?, ?, ?, ?)",
      [employeeId, fullName, email, hashedPassword, accountType, verificationToken],
    )

    return NextResponse.json(
      {
        message: "User created successfully",
        verificationToken,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
