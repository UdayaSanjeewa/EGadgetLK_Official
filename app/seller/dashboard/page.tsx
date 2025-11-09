'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import SellerLayout from '@/components/seller/SellerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';

export default function SellerDashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeProducts: 0,
  });
  const [sellerProfile, setSellerProfile] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      if (!isLoading && !user) {
        router.push('/auth/signin');
        return;
      }

      if (user) {
        const { data: { session } } = await supabase.auth.getSession();
        const userRole = session?.user?.user_metadata?.role;

        if (userRole !== 'seller') {
          router.push('/auth/signin');
          return;
        }

        loadSellerData();
      }
    };

    checkAuth();
  }, [user, isLoading, router]);

  const loadSellerData = async () => {
    if (!user) return;

    const { data: profile } = await supabase
      .from('seller_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profile) {
      setSellerProfile(profile);
    }

    const { data: products } = await supabase
      .from('products')
      .select('id')
      .eq('seller_id', user.id);

    const { data: orderItems } = await supabase
      .from('order_items')
      .select('subtotal')
      .eq('seller_id', user.id);

    const totalRevenue = orderItems?.reduce((sum, item) => sum + Number(item.subtotal), 0) || 0;

    setStats({
      totalProducts: products?.length || 0,
      totalOrders: orderItems?.length || 0,
      totalRevenue,
      activeProducts: products?.length || 0,
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <SellerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          {sellerProfile && (
            <p className="text-gray-600 mt-1">Welcome back, {sellerProfile.business_name}!</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Products
              </CardTitle>
              <Package className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalProducts}</div>
              <p className="text-sm text-gray-600 mt-1">
                {stats.activeProducts} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Orders
              </CardTitle>
              <ShoppingCart className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalOrders}</div>
              <p className="text-sm text-gray-600 mt-1">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-5 w-5 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatPrice(stats.totalRevenue)}</div>
              <p className="text-sm text-gray-600 mt-1">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Seller Rating
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {sellerProfile?.rating?.toFixed(1) || '0.0'}
              </div>
              <p className="text-sm text-gray-600 mt-1">Out of 5.0</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/seller/products/new"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-colors text-center"
            >
              <Package className="h-8 w-8 mx-auto mb-2 text-gray-600" />
              <p className="font-medium">Add New Product</p>
            </a>
            <a
              href="/seller/orders"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-colors text-center"
            >
              <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-gray-600" />
              <p className="font-medium">View Orders</p>
            </a>
            <a
              href="/seller/profile"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-colors text-center"
            >
              <Package className="h-8 w-8 mx-auto mb-2 text-gray-600" />
              <p className="font-medium">Update Profile</p>
            </a>
          </CardContent>
        </Card>
      </div>
    </SellerLayout>
  );
}
