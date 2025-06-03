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

    if (!user || user.account_type !== "customer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const orders = await executeQuery(
      `
      SELECT 
        o.id,
        i.name as item_name,
        o.status,
        o.order_date,
        o.created_at
      FROM orders o
      JOIN items i ON o.item_id = i.id
      WHERE o.customer_id = ?
      ORDER BY o.created_at DESC
    `,
      [user.id],
    )

    return NextResponse.json({ orders })
  } catch (error) {
    console.error("My orders error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
