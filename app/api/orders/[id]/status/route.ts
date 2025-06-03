import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { status } = await request.json()
    const orderId = params.id

    if (!status || !["pending", "ready", "completed"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Update order status
    await executeQuery("UPDATE orders SET status = ? WHERE id = ?", [status, orderId])

    // Get order details for notification
    const orders = (await executeQuery(
      `
      SELECT 
        o.customer_id,
        i.name as item_name
      FROM orders o
      JOIN items i ON o.item_id = i.id
      WHERE o.id = ?
    `,
      [orderId],
    )) as any[]

    if (orders.length > 0 && status === "ready") {
      const order = orders[0]
      // Create notification
      await executeQuery("INSERT INTO notifications (user_id, order_id, message) VALUES (?, ?, ?)", [
        order.customer_id,
        orderId,
        `Your order for ${order.item_name} is ready for pickup!`,
      ])
    }

    return NextResponse.json({ message: "Order status updated successfully" })
  } catch (error) {
    console.error("Update order status error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
