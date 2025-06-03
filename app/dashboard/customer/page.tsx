"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, ShoppingCart, LogOut, CheckCircle, Clock, Package, User } from "lucide-react"

interface UserType {
  id: number
  employee_id: string
  full_name: string
  email: string
  account_type: string
}

interface Item {
  id: number
  name: string
  description: string
  category: string
  daily_item_id: number
  quantity: number
}

interface Order {
  id: number
  item_name: string
  status: string
  order_date: string
  created_at: string
}

interface Notification {
  id: number
  message: string
  is_read: boolean
  created_at: string
}

export default function CustomerDashboard() {
  const [user, setUser] = useState<UserType | null>(null)
  const [availableItems, setAvailableItems] = useState<Item[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [selectedItem, setSelectedItem] = useState("")
  const [loading, setLoading] = useState(true)
  const [orderLoading, setOrderLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  useEffect(() => {
    fetchUserData()
    fetchAvailableItems()
    fetchOrders()
    fetchNotifications()
  }, [])

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch("/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
      } else {
        router.push("/login")
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
      router.push("/login")
    }
  }

  const fetchAvailableItems = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/items/available", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setAvailableItems(data.items)
      }
    } catch (error) {
      console.error("Error fetching items:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/orders/my-orders", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders)
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    }
  }

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  const placeOrder = async () => {
    if (!selectedItem) {
      setError("Please select an item to order")
      return
    }

    setOrderLoading(true)
    setError("")
    setSuccess("")

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/orders/place", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ dailyItemId: selectedItem }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Order placed successfully!")
        setSelectedItem("")
        fetchOrders()
        fetchAvailableItems()
      } else {
        setError(data.error || "Failed to place order")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setOrderLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    router.push("/")
  }

  const markNotificationRead = async (notificationId: number) => {
    try {
      const token = localStorage.getItem("token")
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchNotifications()
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Annapurna</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-700">{user?.full_name}</span>
              </div>
              <Button variant="outline" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.full_name}!</h2>
          <p className="text-gray-600">Employee ID: {user?.employee_id}</p>
        </div>

        {/* Notifications */}
        {notifications.filter((n) => !n.is_read).length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Bell className="h-5 w-5 mr-2 text-orange-500" />
              Notifications
            </h3>
            <div className="space-y-2">
              {notifications
                .filter((n) => !n.is_read)
                .map((notification) => (
                  <Alert key={notification.id} className="border-orange-200 bg-orange-50">
                    <AlertDescription className="flex justify-between items-center">
                      <span className="text-orange-800">{notification.message}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => markNotificationRead(notification.id)}
                        className="text-orange-600 hover:text-orange-700"
                      >
                        Mark as read
                      </Button>
                    </AlertDescription>
                  </Alert>
                ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2 text-orange-500" />
                Place New Order
              </CardTitle>
              <CardDescription>Select from today's available items</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Available Items</label>
                <Select value={selectedItem} onValueChange={setSelectedItem}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an item to order" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableItems.map((item) => (
                      <SelectItem key={item.daily_item_id} value={item.daily_item_id.toString()}>
                        {item.name} - {item.description} (Qty: {item.quantity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={placeOrder}
                disabled={orderLoading || !selectedItem}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
              >
                {orderLoading ? "Placing Order..." : "Place Order"}
              </Button>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2 text-blue-500" />
                Recent Orders
              </CardTitle>
              <CardDescription>Your order history</CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No orders yet</p>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{order.item_name}</p>
                        <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                      <Badge
                        variant={
                          order.status === "ready" ? "default" : order.status === "pending" ? "secondary" : "outline"
                        }
                        className={
                          order.status === "ready"
                            ? "bg-green-100 text-green-800"
                            : order.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                        }
                      >
                        {order.status === "ready" && <CheckCircle className="h-3 w-3 mr-1" />}
                        {order.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Available Items Display */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Today's Menu</CardTitle>
            <CardDescription>Fresh items available for ordering</CardDescription>
          </CardHeader>
          <CardContent>
            {availableItems.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No items available today</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableItems.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                    <div className="flex justify-between items-center">
                      <Badge variant="outline">{item.category}</Badge>
                      <span className="text-sm text-gray-500">Qty: {item.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
