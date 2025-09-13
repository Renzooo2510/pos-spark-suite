import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, DollarSign, TrendingUp, Coffee, Users, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SalesData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  todayRevenue: number;
  todayOrders: number;
  topSellingItems: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
  hourlyData: Array<{
    hour: number;
    orders: number;
    revenue: number;
  }>;
  dailyData: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
}

export default function Sales() {
  const [salesData, setSalesData] = useState<SalesData>({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    todayRevenue: 0,
    todayOrders: 0,
    topSellingItems: [],
    hourlyData: [],
    dailyData: []
  });
  const [dateRange, setDateRange] = useState("7d");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSalesData();
  }, [dateRange]);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (dateRange) {
        case '1d':
          startDate.setDate(endDate.getDate() - 1);
          break;
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
      }

      // Fetch orders data
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .eq("status", "completed");

      if (ordersError) throw ordersError;

      // Fetch order items with menu items
      const { data: orderItems, error: itemsError } = await supabase
        .from("order_items")
        .select(`
          *,
          menu_items!menu_item_id (name),
          orders!order_id!inner (created_at, status)
        `)
        .gte("orders.created_at", startDate.toISOString())
        .lte("orders.created_at", endDate.toISOString())
        .eq("orders.status", "completed");

      if (itemsError) throw itemsError;

      // Calculate metrics
      const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      const totalOrders = orders?.length || 0;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Today's metrics
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayOrders = orders?.filter(order => new Date(order.created_at) >= today) || [];
      const todayRevenue = todayOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);

      // Top selling items
      const itemStats = new Map();
      orderItems?.forEach(item => {
        const name = item.menu_items?.name || 'Unknown';
        if (itemStats.has(name)) {
          const existing = itemStats.get(name);
          itemStats.set(name, {
            quantity: existing.quantity + item.quantity,
            revenue: existing.revenue + Number(item.total_price)
          });
        } else {
          itemStats.set(name, {
            quantity: item.quantity,
            revenue: Number(item.total_price)
          });
        }
      });

      const topSellingItems = Array.from(itemStats.entries())
        .map(([name, stats]) => ({ name, ...stats }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

      // Hourly data for today
      const hourlyData = Array.from({ length: 24 }, (_, hour) => {
        const hourOrders = todayOrders.filter(order => {
          const orderHour = new Date(order.created_at).getHours();
          return orderHour === hour;
        });
        return {
          hour,
          orders: hourOrders.length,
          revenue: hourOrders.reduce((sum, order) => sum + Number(order.total_amount), 0)
        };
      });

      // Daily data for the range
      const dailyStats = new Map();
      orders?.forEach(order => {
        const date = new Date(order.created_at).toISOString().split('T')[0];
        if (dailyStats.has(date)) {
          const existing = dailyStats.get(date);
          dailyStats.set(date, {
            orders: existing.orders + 1,
            revenue: existing.revenue + Number(order.total_amount)
          });
        } else {
          dailyStats.set(date, {
            orders: 1,
            revenue: Number(order.total_amount)
          });
        }
      });

      const dailyData = Array.from(dailyStats.entries())
        .map(([date, stats]) => ({ date, ...stats }))
        .sort((a, b) => a.date.localeCompare(b.date));

      setSalesData({
        totalRevenue,
        totalOrders,
        averageOrderValue,
        todayRevenue,
        todayOrders: todayOrders.length,
        topSellingItems,
        hourlyData,
        dailyData
      });

    } catch (error: any) {
      console.error("Error fetching sales data:", error);
      toast({
        title: "Error",
        description: "Failed to load sales data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    const csvContent = [
      ['Date', 'Orders', 'Revenue'],
      ...salesData.dailyData.map(day => [day.date, day.orders, day.revenue.toFixed(2)])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${dateRange}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-coffee-brown">Sales Management</h1>
            <p className="text-muted-foreground">
              View sales reports and analytics.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Today</SelectItem>
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
                <SelectItem value="90d">90 Days</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={exportData} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">${salesData.totalRevenue.toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold text-blue-600">{salesData.totalOrders}</p>
                </div>
                <Coffee className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Order Value</p>
                  <p className="text-2xl font-bold text-purple-600">${salesData.averageOrderValue.toFixed(2)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Today's Revenue</p>
                  <p className="text-2xl font-bold text-orange-600">${salesData.todayRevenue.toFixed(2)}</p>
                </div>
                <CalendarIcon className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Today's Orders</p>
                  <p className="text-2xl font-bold text-indigo-600">{salesData.todayOrders}</p>
                </div>
                <Users className="h-8 w-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Selling Items */}
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Items</CardTitle>
              <CardDescription>Best performing menu items by quantity sold</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {salesData.topSellingItems.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.quantity} sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${item.revenue.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">Revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sales by Hour (Today) */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Hourly Sales</CardTitle>
              <CardDescription>Orders and revenue by hour</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {salesData.hourlyData
                  .filter(hour => hour.orders > 0)
                  .map((hour) => (
                    <div key={hour.hour} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono">
                          {hour.hour.toString().padStart(2, '0')}:00
                        </span>
                        <Badge variant="outline">{hour.orders} orders</Badge>
                      </div>
                      <span className="font-medium">${hour.revenue.toFixed(2)}</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Revenue Trend</CardTitle>
            <CardDescription>Revenue and orders over the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {salesData.dailyData.map((day) => (
                <div key={day.date} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                  <div>
                    <p className="font-medium">{new Date(day.date).toLocaleDateString()}</p>
                    <p className="text-sm text-muted-foreground">{day.orders} orders</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">${day.revenue.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      ${(day.revenue / day.orders).toFixed(2)} avg
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}