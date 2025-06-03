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

    if (!user || user.account_type !== "vendor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, description, category, quantity } = await request.json()

    if (!name || !quantity || quantity <= 0) {
      return NextResponse.json({ error: "Item name and valid quantity are required" }, { status: 400 })
    }

    // Begin transaction
    const connection = (await executeQuery("START TRANSACTION")) as any

    try {
      // First, check if the item already exists
      const existingItems = (await executeQuery("SELECT id FROM items WHERE name = ?", [name])) as any[]

      let itemId

      if (existingItems.length > 0) {
        // Use existing item
        itemId = existingItems[0].id
      } else {
        // Create new item
        const result = (await executeQuery("INSERT INTO items (name, description, category) VALUES (?, ?, ?)", [
          name,
          description || "",
          category || "Other",
        ])) as any

        itemId = result.insertId
      }

      // Now add to daily items
      const today = new Date().toISOString().split("T")[0]

      // Check if this item is already in daily items for today
      const existingDailyItems = (await executeQuery(
        "SELECT id FROM daily_items WHERE item_id = ? AND available_date = ?",
        [itemId, today],
      )) as any[]

      if (existingDailyItems.length > 0) {
        // Update quantity
        await executeQuery("UPDATE daily_items SET quantity = quantity + ? WHERE id = ?", [
          quantity,
          existingDailyItems[0].id,
        ])
      } else {
        // Add new daily item
        await executeQuery(
          "INSERT INTO daily_items (item_id, vendor_id, available_date, quantity) VALUES (?, ?, ?, ?)",
          [itemId, user.id, today, quantity],
        )
      }

      // Commit transaction
      await executeQuery("COMMIT")

      return NextResponse.json({
        message: "Item added successfully",
        itemId,
      })
    } catch (error) {
      // Rollback on error
      await executeQuery("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Create item error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
