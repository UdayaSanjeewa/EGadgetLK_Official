'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  ArrowUp,
  ArrowDown,
  Eye,
  MoreVertical
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  totalSales: number;
  newVisitors: number;
  ordersChange: number;
  revenueChange: number;
  salesChange: number;
  visitorsChange: number;
}

interface TopCustomer {
  id: string;
  name: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
}

interface TopProduct {
  id: string;
  name: string;
  category_id: string;
  stock_quantity: number;
  images?: any;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalOrders: 35367,
    totalRevenue: 28346.00,
    totalSales: 24573,
    newVisitors: 5659,
    ordersChange: 2.3,
    revenueChange: -12.0,
    salesChange: 2.3,
    visitorsChange: -7.6,
  });

  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount');

      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'customer');

      const { data: products } = await supabase
        .from('products')
        .select('id, name, category_id, stock_quantity, images')
        .limit(4);

      const { data: customerOrders } = await supabase
        .from('orders')
        .select('user_id, total_amount, profiles(full_name, email)')
        .limit(100);

      const customerMap = new Map<string, { name: string; email: string; orders: number; spent: number }>();

      customerOrders?.forEach(order => {
        const userId = order.user_id;
        const profile = order.profiles as any;
        if (userId && profile) {
          if (!customerMap.has(userId)) {
            customerMap.set(userId, {
              name: profile.full_name || 'Unknown',
              email: profile.email || '',
              orders: 0,
              spent: 0
            });
          }
          const customer = customerMap.get(userId)!;
          customer.orders += 1;
          customer.spent += order.total_amount || 0;
        }
      });

      const topCustomersList = Array.from(customerMap.entries())
        .map(([id, data]) => ({
          id,
          name: data.name,
          email: data.email,
          totalOrders: data.orders,
          totalSpent: data.spent
        }))
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 4);

      setStats(prev => ({
        ...prev,
        totalOrders: ordersCount || 0,
        totalRevenue: totalRevenue,
        newVisitors: usersCount || 0,
      }));

      setTopCustomers(topCustomersList);
      setTopProducts(products || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ecommerce Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here's your store overview</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats.totalOrders.toLocaleString()}</h3>
                <div className="flex items-center mt-2">
                  <span className="text-xs text-gray-500 mr-1">Increased by</span>
                  <span className="text-xs font-semibold text-green-600 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-0.5" />
                    {stats.ordersChange}%
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">
                  ${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
                <div className="flex items-center mt-2">
                  <span className="text-xs text-gray-500 mr-1">Decreased by</span>
                  <span className="text-xs font-semibold text-red-600 flex items-center">
                    <TrendingDown className="w-3 h-3 mr-0.5" />
                    {Math.abs(stats.revenueChange)}%
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats.totalSales.toLocaleString()}</h3>
                <div className="flex items-center mt-2">
                  <span className="text-xs text-gray-500 mr-1">Increased by</span>
                  <span className="text-xs font-semibold text-green-600 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-0.5" />
                    {stats.salesChange}%
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-teal-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">New Visitors</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats.newVisitors.toLocaleString()}</h3>
                <div className="flex items-center mt-2">
                  <span className="text-xs text-gray-500 mr-1">Decreased by</span>
                  <span className="text-xs font-semibold text-red-600 flex items-center">
                    <TrendingDown className="w-3 h-3 mr-0.5" />
                    {Math.abs(stats.visitorsChange)}%
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Top Customers</CardTitle>
              <Link href="/admin/users">
                <Button variant="ghost" size="sm" className="text-blue-600">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCustomers.length > 0 ? (
                topCustomers.map((customer, index) => (
                  <div key={customer.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                          {customer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">{customer.name}</p>
                        <p className="text-sm text-gray-500">{customer.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${customer.totalSpent.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">Purchases {customer.totalOrders}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">No customer data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Top Selling Products</CardTitle>
              <Link href="/admin/products">
                <Button variant="ghost" size="sm" className="text-blue-600">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.length > 0 ? (
                topProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">Product</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={product.stock_quantity > 10 ? "default" : "destructive"}
                        className={product.stock_quantity > 10 ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}
                      >
                        {product.stock_quantity > 10 ? 'In Stock' : 'Low Stock'}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">No product data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Earnings Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-sm text-gray-600">Total Orders</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{(stats.totalOrders / 1000).toFixed(1)}k</p>
                <div className="flex items-center mt-1">
                  <ArrowUp className="w-3 h-3 text-green-600 mr-1" />
                  <span className="text-xs text-green-600 font-semibold">0.25%</span>
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                  <span className="text-sm text-gray-600">Total Revenue</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">${(stats.totalRevenue / 1000).toFixed(1)}k</p>
                <div className="flex items-center mt-1">
                  <ArrowUp className="w-3 h-3 text-green-600 mr-1" />
                  <span className="text-xs text-green-600 font-semibold">0.33%</span>
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-teal-600 rounded-full"></div>
                  <span className="text-sm text-gray-600">Total Profit</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">$58.5k</p>
                <div className="flex items-center mt-1">
                  <ArrowDown className="w-3 h-3 text-red-600 mr-1" />
                  <span className="text-xs text-red-600 font-semibold">0.15%</span>
                </div>
              </div>
            </div>
            <div className="h-64 flex items-end justify-between space-x-2">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => (
                <div key={month} className="flex-1 flex flex-col items-center space-y-2">
                  <div className="w-full bg-teal-500 rounded-t" style={{ height: `${Math.random() * 60 + 20}%` }}></div>
                  <span className="text-xs text-gray-500">{month}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-600 to-blue-700 text-white">
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <div>
              <h3 className="text-lg font-semibold mb-2">New Customers</h3>
              <p className="text-sm opacity-90 mb-6">Increased by</p>
              <div className="flex items-baseline space-x-2 mb-4">
                <span className="text-4xl font-bold">34,784</span>
                <span className="flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  2.3%
                </span>
              </div>
            </div>
            <div className="space-y-3 mt-6">
              <div className="flex items-center justify-between text-sm">
                <span className="opacity-90">Monday</span>
                <div className="flex-1 mx-3 bg-white/20 rounded-full h-2">
                  <div className="bg-white rounded-full h-2" style={{ width: '70%' }}></div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="opacity-90">Tuesday</span>
                <div className="flex-1 mx-3 bg-white/20 rounded-full h-2">
                  <div className="bg-white rounded-full h-2" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="opacity-90">Wednesday</span>
                <div className="flex-1 mx-3 bg-white/20 rounded-full h-2">
                  <div className="bg-white rounded-full h-2" style={{ width: '90%' }}></div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="opacity-90">Thursday</span>
                <div className="flex-1 mx-3 bg-white/20 rounded-full h-2">
                  <div className="bg-white rounded-full h-2" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="opacity-90">Friday</span>
                <div className="flex-1 mx-3 bg-white/20 rounded-full h-2">
                  <div className="bg-white rounded-full h-2" style={{ width: '95%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
