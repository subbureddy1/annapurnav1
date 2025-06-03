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

    const today = new Date().toISOString().split("T")[0]

    const items = await executeQuery(
      `
      SELECT 
        i.id, 
        i.name, 
        i.description, 
        i.category,
        di.id as daily_item_id,
        di.quantity
      FROM items i
      JOIN daily_items di ON i.id = di.item_id
      WHERE di.available_date = ? AND di.is_available = true AND di.quantity > 0
      ORDER BY i.name
    `,
      [today],
    )

    return NextResponse.json({ items })
  } catch (error) {
    console.error("Available items error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
