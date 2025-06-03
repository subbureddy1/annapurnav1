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

    if (!user || user.account_type !== "vendor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const today = new Date().toISOString().split("T")[0]

    const items = await executeQuery(
      `
      SELECT 
        di.id,
        di.item_id,
        i.name as item_name,
        di.quantity,
        di.available_date
      FROM daily_items di
      JOIN items i ON di.item_id = i.id
      WHERE di.vendor_id = ? AND di.available_date = ?
      ORDER BY i.name
    `,
      [user.id, today],
    )

    return NextResponse.json({ items })
  } catch (error) {
    console.error("Daily items error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const user = await getUserFromToken(token)

    if (!user || user.account_type !== "vendor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { itemId, quantity } = await request.json()

    if (!itemId || !quantity || quantity <= 0) {
      return NextResponse.json({ error: "Valid item ID and quantity are required" }, { status: 400 })
    }

    const today = new Date().toISOString().split("T")[0]

    // Check if item already exists for today
    const existingItems = (await executeQuery("SELECT id FROM daily_items WHERE item_id = ? AND available_date = ?", [
      itemId,
      today,
    ])) as any[]

    if (existingItems.length > 0) {
      // Update existing item
      await executeQuery(
        "UPDATE daily_items SET quantity = quantity + ?, vendor_id = ? WHERE item_id = ? AND available_date = ?",
        [quantity, user.id, itemId, today],
      )
    } else {
      // Insert new daily item
      await executeQuery("INSERT INTO daily_items (item_id, vendor_id, available_date, quantity) VALUES (?, ?, ?, ?)", [
        itemId,
        user.id,
        today,
        quantity,
      ])
    }

    return NextResponse.json({ message: "Item added successfully" })
  } catch (error) {
    console.error("Add daily item error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
