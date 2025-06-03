"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Package, Plus, User, LogOut, CheckCircle, Clock, ShoppingCart } from "lucide-react"

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
}

interface DailyItem {
  id: number
  item_id: number
  item_name: string
  quantity: number
  available_date: string
}

interface Order {
  id: number
  customer_name: string
  item_name: string
  status: string
  order_date: string
  created_at: string
}

export default function VendorDashboard() {
  const [user, setUser] = useState<UserType | null>(null)
  const [allItems, setAllItems] = useState<Item[]>([])
  const [dailyItems, setDailyItems] = useState<DailyItem[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [addLoading, setAddLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  // Update the state to include a new item form
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    quantity: "",
  });

  useEffect(() => {
    fetchUserData()
    fetchAllItems()
    fetchDailyItems()
    fetchOrders()
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
        if (userData.user.account_type !== "vendor") {
          router.push("/dashboard/customer")
          return
        }
        setUser(userData.user)
      } else {
        router.push("/login")
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
      router.push("/login")
    }
  }

  const fetchAllItems = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/items/all", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setAllItems(data.items)
      }
    } catch (error) {
      console.error("Error fetching items:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDailyItems = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/items/daily", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setDailyItems(data.items)
      }
    } catch (error) {
      console.error("Error fetching daily items:", error)
    }
  }

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/orders/vendor", {
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

  // Update the addDailyItem function to handle creating new items
  const addDailyItem = async () => {
    if (!formData.name || !formData.quantity) {
      setError("Please enter an item name and quantity");
      return;
    }

    setAddLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/items/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          category: formData.category,
          quantity: Number.parseInt(formData.quantity),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Item added to today's menu successfully!");
        setFormData({
          name: "",
          description: "",
          category: "",
          quantity: "",
        });
        fetchDailyItems();
        fetchAllItems();
      } else {
        setError(data.error || "Failed to add item");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setAddLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        setSuccess(`Order marked as ${status}!`)
        fetchOrders()
      } else {
        setError("Failed to update order status")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    router.push("/")
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
              <h1 className="text-2xl font-bold text-gray-900">Annapurna Vendor</h1>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Vendor Dashboard</h2>
          <p className="text-gray-600">Manage your daily menu and orders</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add Daily Item */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="h-5 w-5 mr-2 text-green-500" />
                Add Item to Today's Menu
              </CardTitle>
              <CardDescription>Create new items and make them available for customers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Item Name</Label>
                <Input
                  placeholder="Enter item name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  placeholder="Enter item description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Main Course">Main Course</SelectItem>
                    <SelectItem value="Beverages">Beverages</SelectItem>
                    <SelectItem value="Healthy">Healthy</SelectItem>
                    <SelectItem value="Appetizer">Appetizer</SelectItem>
                    <SelectItem value="Dessert">Dessert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity Available</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="Enter quantity"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  min="1"
                />
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
                onClick={addDailyItem}
                disabled={addLoading || !formData.name || !formData.quantity}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                {addLoading ? "Adding Item..." : "Add to Menu"}
              </Button>
            </CardContent>

          {/* Orders Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2 text-blue-500" />
                Pending Orders
              </CardTitle>
              <CardDescription>Manage customer orders</CardDescription>
            </CardHeader>
            <CardContent>
              {orders.filter((order) => order.status === "pending").length === 0 ? (
                <p className="text-gray-500 text-center py-4">No pending orders</p>
              ) : (
                <div className="space-y-3">
                  {orders
                    .filter((order) => order.status === "pending")
                    .map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{order.item_name}</p>
                          <p className="text-sm text-gray-500">Customer: {order.customer_name}</p>
                          <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, "ready")}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          Mark Ready
                        </Button>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Today's Menu */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2 text-orange-500" />
              Today's Available Items
            </CardTitle>
            <CardDescription>Items you've made available for today</CardDescription>
          </CardHeader>
          <CardContent>
            {dailyItems.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No items added to today's menu</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dailyItems.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-lg mb-2">{item.item_name}</h3>
                    <div className="flex justify-between items-center">
                      <Badge variant="outline">Available</Badge>
                      <span className="text-sm text-gray-500">Qty: {item.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Orders */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>All Orders</CardTitle>
            <CardDescription>Complete order history</CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No orders yet</p>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{order.item_name}</p>
                      <p className="text-sm text-gray-500">Customer: {order.customer_name}</p>
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
    </div>
  );
}
