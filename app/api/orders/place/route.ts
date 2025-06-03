import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
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

    const { dailyItemId } = await request.json()

    if (!dailyItemId) {
      return NextResponse.json({ error: "Daily item ID is required" }, { status: 400 })
    }

    // Check if daily item exists and has quantity
    const dailyItems = (await executeQuery(
      "SELECT di.*, i.id as item_id FROM daily_items di JOIN items i ON di.item_id = i.id WHERE di.id = ? AND di.quantity > 0",
      [dailyItemId],
    )) as any[]

    if (dailyItems.length === 0) {
      return NextResponse.json({ error: "Item not available" }, { status: 400 })
    }

    const dailyItem = dailyItems[0]
    const today = new Date().toISOString().split("T")[0]

    // Create order
    const result = (await executeQuery(
      "INSERT INTO orders (customer_id, item_id, daily_item_id, order_date) VALUES (?, ?, ?, ?)",
      [user.id, dailyItem.item_id, dailyItemId, today],
    )) as any

    // Decrease quantity
    await executeQuery("UPDATE daily_items SET quantity = quantity - 1 WHERE id = ?", [dailyItemId])

    return NextResponse.json({
      message: "Order placed successfully",
      orderId: result.insertId,
    })
  } catch (error) {
    console.error("Place order error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
