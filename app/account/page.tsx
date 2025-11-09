'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, ShoppingBag, Heart, Settings, CreditCard, MapPin, Bell, Shield, CircleHelp as HelpCircle, LogOut, Package, Star, TrendingUp } from 'lucide-react';

interface UserStats {
  totalOrders: number;
  activeOrders: number;
  watchlistItems: number;
  reviewsGiven: number;
  savedAddresses: number;
  unreadNotifications: number;
}

export default function AccountPage() {
  const { user, isLoading, signOut } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats>({
    totalOrders: 0,
    activeOrders: 0,
    watchlistItems: 0,
    reviewsGiven: 0,
    savedAddresses: 0,
    unreadNotifications: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      loadUserStats();
    }
  }, [user]);

  const loadUserStats = async () => {
    if (!user) return;

    setIsLoadingStats(true);
    try {
      const [ordersResult, watchlistResult, reviewsResult, addressesResult, notificationsResult] = await Promise.all([
        supabase
          .from('orders')
          .select('id, status', { count: 'exact' })
          .eq('user_id', user.id),
        supabase
          .from('watchlist')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id),
        supabase
          .from('reviews')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id),
        supabase
          .from('user_addresses')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id),
        supabase
          .from('notifications')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .eq('is_read', false)
      ]);

      const activeStatuses = ['pending', 'processing', 'shipped'];
      const activeOrders = ordersResult.data?.filter(order => activeStatuses.includes(order.status)).length || 0;

      setStats({
        totalOrders: ordersResult.count || 0,
        activeOrders: activeOrders,
        watchlistItems: watchlistResult.count || 0,
        reviewsGiven: reviewsResult.count || 0,
        savedAddresses: addressesResult.count || 0,
        unreadNotifications: notificationsResult.count || 0
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const accountSections = [
    {
      title: 'My Orders',
      description: 'Track and manage your orders',
      icon: ShoppingBag,
      href: '/account/orders',
      badge: stats.activeOrders > 0 ? `${stats.activeOrders} Active` : undefined,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Profile Details',
      description: 'Update your personal information',
      icon: User,
      href: '/account/profile',
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Watchlist',
      description: 'View your saved products',
      icon: Heart,
      href: '/account/watchlist',
      badge: stats.watchlistItems > 0 ? `${stats.watchlistItems} Items` : undefined,
      color: 'from-red-500 to-pink-500'
    },
    {
      title: 'Payment Methods',
      description: 'Manage your payment options',
      icon: CreditCard,
      href: '/account/payment-methods',
      color: 'from-purple-500 to-indigo-500'
    },
    {
      title: 'Addresses',
      description: 'Manage shipping addresses',
      icon: MapPin,
      href: '/account/addresses',
      badge: stats.savedAddresses > 0 ? `${stats.savedAddresses} Saved` : undefined,
      color: 'from-orange-500 to-red-500'
    },
    {
      title: 'Notifications',
      description: 'Control your notification preferences',
      icon: Bell,
      href: '/account/notifications',
      badge: stats.unreadNotifications > 0 ? `${stats.unreadNotifications} New` : undefined,
      color: 'from-yellow-500 to-orange-500'
    },
    {
      title: 'Security',
      description: 'Password and security settings',
      icon: Shield,
      href: '/account/security',
      color: 'from-gray-500 to-slate-500'
    },
    {
      title: 'Settings',
      description: 'App preferences and settings',
      icon: Settings,
      href: '/account/settings',
      color: 'from-teal-500 to-cyan-500'
    }
  ];

  const getAccountLevel = () => {
    if (stats.totalOrders >= 50) return { level: 'Platinum', color: 'text-gray-700' };
    if (stats.totalOrders >= 20) return { level: 'Gold', color: 'text-yellow-600' };
    if (stats.totalOrders >= 10) return { level: 'Silver', color: 'text-gray-500' };
    return { level: 'Bronze', color: 'text-orange-700' };
  };

  const accountLevel = getAccountLevel();

  const quickStats = [
    { label: 'Total Orders', value: isLoadingStats ? '...' : stats.totalOrders.toString(), icon: Package },
    { label: 'Watchlist Items', value: isLoadingStats ? '...' : stats.watchlistItems.toString(), icon: Heart },
    { label: 'Reviews Given', value: isLoadingStats ? '...' : stats.reviewsGiven.toString(), icon: Star },
    { label: 'Account Level', value: isLoadingStats ? '...' : accountLevel.level, icon: TrendingUp, color: accountLevel.color }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                {user.name[0]?.toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h1>
                <p className="text-blue-100 mb-1">{user.email || user.mobile}</p>
                <Badge className="bg-white/20 text-white border-0">
                  {user.role === 'admin' ? 'Administrator' : 'Member'}
                </Badge>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={signOut}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {quickStats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="p-6">
                <stat.icon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className={`text-2xl font-bold text-gray-900 mb-1 ${stat.color || ''}`}>
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {accountSections.map((section, index) => (
            <Link key={index} href={section.href}>
              <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${section.color} group-hover:scale-110 transition-transform duration-300`}>
                      <section.icon className="h-6 w-6 text-white" />
                    </div>
                    {section.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {section.badge}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                    {section.title}
                  </CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>

        <Card className="bg-gradient-to-r from-gray-50 to-blue-50 border-0">
          <CardContent className="p-8 text-center">
            <HelpCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Need Help?</h3>
            <p className="text-gray-600 mb-6">
              Our support team is here to help you with any questions or issues.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline">
                Contact Support
              </Button>
              <Button variant="outline">
                View FAQ
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
