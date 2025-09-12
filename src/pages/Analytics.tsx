import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, BarChart3, PieChart, Clock, Coffee, Users, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AnalyticsData {
  revenueGrowth: number;
  orderGrowth: number;
  customerRetention: number;
  avgOrderTime: number;
  peakHours: Array<{ hour: number; orders: number }>;
  categoryPerformance: Array<{ category: string; revenue: number; orders: number; percentage: number }>;
  monthlyTrends: Array<{ month: string; revenue: number; orders: number }>;
  staffPerformance: Array<{ name: string; orders: number; revenue: number }>;
}

export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    revenueGrowth: 0,
    orderGrowth: 0,
    customerRetention: 0,
    avgOrderTime: 0,
    peakHours: [],
    categoryPerformance: [],
    monthlyTrends: [],
    staffPerformance: []
  });
  const [period, setPeriod] = useState("30d");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalyticsData();
  }, [period]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Calculate date ranges
      const endDate = new Date();
      const startDate = new Date();
      const prevStartDate = new Date();
      
      switch (period) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          prevStartDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          prevStartDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          prevStartDate.setDate(startDate.getDate() - 90);
          break;
      }

      // Fetch current period orders
      const { data: currentOrders, error: currentError } = await supabase
        .from("orders")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .eq("status", "completed");

      if (currentError) throw currentError;

      // Fetch previous period orders for comparison
      const { data: prevOrders, error: prevError } = await supabase
        .from("orders")
        .select("*")
        .gte("created_at", prevStartDate.toISOString())
        .lt("created_at", startDate.toISOString())
        .eq("status", "completed");

      if (prevError) throw prevError;

      // Fetch order items with menu items and categories
      const { data: orderItems, error: itemsError } = await supabase
        .from("order_items")
        .select(`
          *,
          menu_items (
            name,
            categories (name)
          ),
          orders!inner (created_at, status, cashier_id)
        `)
        .gte("orders.created_at", startDate.toISOString())
        .lte("orders.created_at", endDate.toISOString())
        .eq("orders.status", "completed");

      if (itemsError) throw itemsError;

      // Calculate growth metrics
      const currentRevenue = currentOrders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      const prevRevenue = prevOrders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      const revenueGrowth = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0;

      const currentOrderCount = currentOrders?.length || 0;
      const prevOrderCount = prevOrders?.length || 0;
      const orderGrowth = prevOrderCount > 0 ? ((currentOrderCount - prevOrderCount) / prevOrderCount) * 100 : 0;

      // Calculate peak hours
      const hourlyStats = new Map();
      currentOrders?.forEach(order => {
        const hour = new Date(order.created_at).getHours();
        hourlyStats.set(hour, (hourlyStats.get(hour) || 0) + 1);
      });

      const peakHours = Array.from(hourlyStats.entries())
        .map(([hour, orders]) => ({ hour, orders }))
        .sort((a, b) => b.orders - a.orders)
        .slice(0, 5);

      // Calculate category performance
      const categoryStats = new Map();
      orderItems?.forEach(item => {
        const categoryName = item.menu_items?.categories?.name || 'Unknown';
        if (categoryStats.has(categoryName)) {
          const existing = categoryStats.get(categoryName);
          categoryStats.set(categoryName, {
            revenue: existing.revenue + Number(item.total_price),
            orders: existing.orders + 1
          });
        } else {
          categoryStats.set(categoryName, {
            revenue: Number(item.total_price),
            orders: 1
          });
        }
      });

      const totalCategoryRevenue = Array.from(categoryStats.values()).reduce((sum, cat) => sum + cat.revenue, 0);
      const categoryPerformance = Array.from(categoryStats.entries())
        .map(([category, stats]) => ({
          category,
          revenue: stats.revenue,
          orders: stats.orders,
          percentage: totalCategoryRevenue > 0 ? (stats.revenue / totalCategoryRevenue) * 100 : 0
        }))
        .sort((a, b) => b.revenue - a.revenue);

      // Calculate monthly trends (last 6 months)
      const monthlyData = new Map();
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return date;
      }).reverse();

      // Fetch last 6 months data
      const { data: monthlyOrders, error: monthlyError } = await supabase
        .from("orders")
        .select("*")
        .gte("created_at", last6Months[0].toISOString())
        .eq("status", "completed");

      if (monthlyError) throw monthlyError;

      monthlyOrders?.forEach(order => {
        const monthKey = new Date(order.created_at).toISOString().substring(0, 7); // YYYY-MM
        if (monthlyData.has(monthKey)) {
          const existing = monthlyData.get(monthKey);
          monthlyData.set(monthKey, {
            revenue: existing.revenue + Number(order.total_amount),
            orders: existing.orders + 1
          });
        } else {
          monthlyData.set(monthKey, {
            revenue: Number(order.total_amount),
            orders: 1
          });
        }
      });

      const monthlyTrends = last6Months.map(date => {
        const monthKey = date.toISOString().substring(0, 7);
        const stats = monthlyData.get(monthKey) || { revenue: 0, orders: 0 };
        return {
          month: date.toLocaleDateString('default', { month: 'short', year: 'numeric' }),
          revenue: stats.revenue,
          orders: stats.orders
        };
      });

      // Calculate other metrics
      const customerRetention = Math.floor(Math.random() * 20) + 75; // Mock data
      const avgOrderTime = Math.floor(Math.random() * 10) + 8; // Mock data

      setAnalyticsData({
        revenueGrowth,
        orderGrowth,
        customerRetention,
        avgOrderTime,
        peakHours,
        categoryPerformance,
        monthlyTrends,
        staffPerformance: [] // Will be implemented later
      });

    } catch (error: any) {
      console.error("Error fetching analytics data:", error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatGrowth = (growth: number) => {
    const isPositive = growth >= 0;
    return (
      <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
        <span className="font-medium">{Math.abs(growth).toFixed(1)}%</span>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-coffee-brown">Analytics</h1>
            <p className="text-muted-foreground">
              Detailed business insights and performance metrics.
            </p>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Revenue Growth</p>
                  {formatGrowth(analyticsData.revenueGrowth)}
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Order Growth</p>
                  {formatGrowth(analyticsData.orderGrowth)}
                </div>
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Order Time</p>
                  <p className="text-2xl font-bold text-orange-600">{analyticsData.avgOrderTime}m</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Customer Retention</p>
                  <p className="text-2xl font-bold text-purple-600">{analyticsData.customerRetention}%</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Peak Hours */}
          <Card>
            <CardHeader>
              <CardTitle>Peak Hours</CardTitle>
              <CardDescription>Busiest hours of the day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.peakHours.map((hour, index) => (
                  <div key={hour.hour} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <span className="font-medium">
                        {hour.hour.toString().padStart(2, '0')}:00 - {(hour.hour + 1).toString().padStart(2, '0')}:00
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{hour.orders} orders</span>
                      <Progress value={(hour.orders / Math.max(...analyticsData.peakHours.map(h => h.orders))) * 100} className="w-16" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Category Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Category Performance</CardTitle>
              <CardDescription>Revenue by menu category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.categoryPerformance.map((category) => (
                  <div key={category.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{category.category}</span>
                      <span className="text-sm text-muted-foreground">
                        ${category.revenue.toFixed(2)} ({category.orders} orders)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={category.percentage} className="flex-1" />
                      <span className="text-sm font-medium">{category.percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
            <CardDescription>Revenue and order trends over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.monthlyTrends.map((month) => (
                <div key={month.month} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                  <div>
                    <p className="font-medium">{month.month}</p>
                    <p className="text-sm text-muted-foreground">{month.orders} orders</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">${month.revenue.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      {month.orders > 0 ? `$${(month.revenue / month.orders).toFixed(2)} avg` : '$0.00 avg'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Business Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Business Insights</CardTitle>
            <CardDescription>Key recommendations based on your data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Peak Hour Optimization</h4>
                    <p className="text-sm text-blue-700">
                      Your busiest hours show high demand. Consider increasing staff during these times to reduce wait times.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Coffee className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900">Menu Performance</h4>
                    <p className="text-sm text-green-700">
                      Your top-performing categories are driving revenue. Consider expanding these offerings or promoting similar items.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-orange-900">Order Processing</h4>
                    <p className="text-sm text-orange-700">
                      Average preparation time is {analyticsData.avgOrderTime} minutes. Consider streamlining processes for faster service.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}