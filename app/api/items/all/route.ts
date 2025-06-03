import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const user = await getUserFromToken(token)

    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const items = await executeQuery("SELECT id, name, description, category FROM items ORDER BY name")

    return NextResponse.json({ items })
  } catch (error) {
    console.error("Items error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
