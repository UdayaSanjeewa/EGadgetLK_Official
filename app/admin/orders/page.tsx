'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthManager } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Package, Eye, RefreshCw, Search, MapPin, DollarSign, Store, Clock } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { SRI_LANKA_DISTRICTS } from '@/lib/districts';
import { toast } from 'sonner';

interface OrderItem {
  id: string;
  product_title: string;
  product_image: string;
  quantity: number;
  price: number;
  subtotal: number;
  seller_id: string;
}

interface SellerInfo {
  seller_id: string;
  business_name: string;
  district: string;
  total_amount: number;
  items: OrderItem[];
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_mobile: string;
  total_amount: number;
  status: string;
  payment_status: string;
  payment_method: string;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code?: string;
  created_at: string;
  sellers?: SellerInfo[];
}

interface SellerIncome {
  seller_id: string;
  business_name: string;
  district: string;
  total_orders: number;
  total_income: number;
  pending_income: number;
  completed_income: number;
}

const statusOptions = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
  { value: 'ready', label: 'Ready', color: 'bg-orange-100 text-orange-800' },
  { value: 'shipped', label: 'Shipped', color: 'bg-purple-100 text-purple-800' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
];

export default function AdminOrdersPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDistrict, setFilterDistrict] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [sellerIncomes, setSellerIncomes] = useState<SellerIncome[]>([]);
  const [orderHistory, setOrderHistory] = useState<any[]>([]);

  useEffect(() => {
    checkAdminAndLoadData();
  }, []);

  const checkAdminAndLoadData = async () => {
    const admin = await AuthManager.isAdmin();
    if (!admin) {
      router.push('/admin/login');
      return;
    }
    await Promise.all([loadOrders(), loadSellerIncomes()]);
  };

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Orders error:', ordersError);
        throw ordersError;
      }

      console.log('Orders loaded:', ordersData?.length);

      const ordersWithSellers = await Promise.all(
        (ordersData || []).map(async (order) => {
          try {
            const { data: items, error: itemsError } = await supabase
              .from('order_items')
              .select('id, product_title, product_image, quantity, price, subtotal, seller_id')
              .eq('order_id', order.id);

            if (itemsError) {
              console.error('Error loading items for order', order.id, itemsError);
            }

            console.log('Items for order', order.order_number, ':', items?.length);

            const uniqueSellerIds = new Set(items?.map(item => item.seller_id).filter(Boolean));
            const sellerIds = Array.from(uniqueSellerIds);

            const sellerDataMap: any = {};
            if (sellerIds.length > 0) {
              const { data: sellerData } = await supabase
                .from('seller_profiles')
                .select('id, business_name, district')
                .in('id', sellerIds);

              sellerData?.forEach(seller => {
                sellerDataMap[seller.id] = seller;
              });
            }

            const sellerGroups = items?.reduce((acc: any, item: any) => {
              const sellerId = item.seller_id;
              if (!sellerId) {
                console.log('Item without seller_id:', item.product_title);
                return acc;
              }

              if (!acc[sellerId]) {
                const sellerInfo = sellerDataMap[sellerId];
                acc[sellerId] = {
                  seller_id: sellerId,
                  business_name: sellerInfo?.business_name || 'Unknown Seller',
                  district: sellerInfo?.district || 'Unknown',
                  total_amount: 0,
                  items: [],
                };
              }
              acc[sellerId].total_amount += item.subtotal;
              acc[sellerId].items.push(item);
              return acc;
            }, {});

            return {
              ...order,
              sellers: Object.values(sellerGroups || {}),
            };
          } catch (itemError) {
            console.error('Error processing order', order.id, itemError);
            return {
              ...order,
              sellers: [],
            };
          }
        })
      );

      console.log('Orders with sellers:', ordersWithSellers.length);
      setOrders(ordersWithSellers);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSellerIncomes = async () => {
    try {
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('seller_id, subtotal, order_id');

      if (itemsError) {
        console.error('Error loading order items for income:', itemsError);
        return;
      }

      console.log('Order items loaded:', orderItems?.length);

      const uniqueOrderIds = new Set(orderItems?.map(item => item.order_id).filter(Boolean));
      const orderIds = Array.from(uniqueOrderIds);

      const { data: ordersData } = await supabase
        .from('orders')
        .select('id, status')
        .in('id', orderIds);

      const orderStatusMap: any = {};
      ordersData?.forEach(order => {
        orderStatusMap[order.id] = order.status;
      });

      const uniqueSellerIds = new Set(orderItems?.map(item => item.seller_id).filter(Boolean));
      const sellerIds = Array.from(uniqueSellerIds);

      const { data: sellerData } = await supabase
        .from('seller_profiles')
        .select('id, business_name, district')
        .in('id', sellerIds);

      const sellerDataMap: any = {};
      sellerData?.forEach(seller => {
        sellerDataMap[seller.id] = seller;
      });

      const incomeMap = orderItems?.reduce((acc: any, item: any) => {
        const sellerId = item.seller_id;
        if (!sellerId) return acc;

        const orderStatus = orderStatusMap[item.order_id];

        if (!acc[sellerId]) {
          const sellerInfo = sellerDataMap[sellerId];
          acc[sellerId] = {
            seller_id: sellerId,
            business_name: sellerInfo?.business_name || 'Unknown Seller',
            district: sellerInfo?.district || 'Unknown',
            total_orders: 0,
            total_income: 0,
            pending_income: 0,
            completed_income: 0,
          };
        }

        acc[sellerId].total_orders += 1;
        acc[sellerId].total_income += item.subtotal;

        if (['delivered'].includes(orderStatus)) {
          acc[sellerId].completed_income += item.subtotal;
        } else if (!['cancelled'].includes(orderStatus)) {
          acc[sellerId].pending_income += item.subtotal;
        }

        return acc;
      }, {});

      const incomes = Object.values(incomeMap || {}) as SellerIncome[];
      console.log('Seller incomes calculated:', incomes.length);
      setSellerIncomes(incomes);
    } catch (error) {
      console.error('Error loading seller incomes:', error);
    }
  };

  const loadOrderDetails = async (orderId: string) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      const { data: history } = await supabase
        .from('order_status_history')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

      setOrderHistory(history || []);
      setSelectedOrder(order);
      setIsDialogOpen(true);
    } catch (error) {
      console.error('Error loading order details:', error);
    }
  };

  const handleStatusChange = (order: Order, status: string) => {
    setSelectedOrder(order);
    setNewStatus(status);
    setShowStatusDialog(true);
  };

  const confirmStatusChange = async () => {
    if (!selectedOrder || !newStatus) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', selectedOrder.id);

      if (error) throw error;

      toast.success(`Order status updated to ${newStatus}`);
      setShowStatusDialog(false);
      await loadOrders();
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast.error(error.message || 'Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = statusOptions.find(s => s.value === status);
    return (
      <Badge className={statusConfig?.color || 'bg-gray-100 text-gray-800'}>
        {statusConfig?.label || status}
      </Badge>
    );
  };

  const getNextStatuses = (currentStatus: string) => {
    if (currentStatus === 'confirmed') {
      return ['ready', 'shipped'];
    } else if (currentStatus === 'ready') {
      return ['shipped'];
    } else if (currentStatus === 'shipped') {
      return ['delivered'];
    }
    return [];
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesDistrict = filterDistrict === 'all' ||
      order.sellers?.some(s => s.district === filterDistrict);
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.sellers?.some(s => s.business_name.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesDistrict && matchesSearch;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    ready: orders.filter(o => o.status === 'ready').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold flex items-center">
                  <Package className="w-6 h-6 mr-2" />
                  Advanced Order Management
                </h1>
                <p className="text-sm text-gray-600">Manage orders with seller information and logistics</p>
              </div>
            </div>
            <Button onClick={loadOrders} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="income">Seller Income</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Card>
                <CardContent className="pt-6 pb-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  <p className="text-sm text-gray-600 mt-1">Total Orders</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 pb-4 text-center">
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                  <p className="text-sm text-gray-600 mt-1">Pending</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 pb-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">{stats.confirmed}</p>
                  <p className="text-sm text-gray-600 mt-1">Confirmed</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 pb-4 text-center">
                  <p className="text-2xl font-bold text-orange-600">{stats.ready}</p>
                  <p className="text-sm text-gray-600 mt-1">Ready</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 pb-4 text-center">
                  <p className="text-2xl font-bold text-purple-600">{stats.shipped}</p>
                  <p className="text-sm text-gray-600 mt-1">Shipped</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 pb-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
                  <p className="text-sm text-gray-600 mt-1">Delivered</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Filter & Search</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="Search by order, customer, or seller..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      {statusOptions.map(status => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterDistrict} onValueChange={setFilterDistrict}>
                    <SelectTrigger>
                      <MapPin className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by district" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Districts</SelectItem>
                      {SRI_LANKA_DISTRICTS.map((district) => (
                        <SelectItem key={district} value={district}>
                          {district}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>All Orders ({filteredOrders.length})</CardTitle>
                <CardDescription>View and manage orders with seller information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Sellers</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                            No orders found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">#{order.order_number}</TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{order.customer_name}</div>
                                <div className="text-sm text-gray-500">{order.customer_email}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                {order.sellers?.map((seller, idx) => (
                                  <div key={idx} className="text-sm">
                                    <div className="font-medium">{seller.business_name}</div>
                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      {seller.district}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>LKR {Number(order.total_amount).toLocaleString()}</TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-2">
                                {getStatusBadge(order.status)}
                                {getNextStatuses(order.status).length > 0 && (
                                  <div className="flex gap-1">
                                    {getNextStatuses(order.status).map((status) => (
                                      <Button
                                        key={status}
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleStatusChange(order, status)}
                                        className="text-xs"
                                      >
                                        → {status}
                                      </Button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{format(new Date(order.created_at), 'MMM dd, yyyy')}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => loadOrderDetails(order.id)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="income" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Seller Income Overview
                </CardTitle>
                <CardDescription>View total income by seller</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Seller</TableHead>
                        <TableHead>District</TableHead>
                        <TableHead>Total Orders</TableHead>
                        <TableHead>Pending Income</TableHead>
                        <TableHead>Completed Income</TableHead>
                        <TableHead>Total Income</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sellerIncomes.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            No seller income data available
                          </TableCell>
                        </TableRow>
                      ) : (
                        sellerIncomes.map((seller) => (
                          <TableRow key={seller.seller_id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Store className="h-4 w-4 text-gray-400" />
                                <span className="font-medium">{seller.business_name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm">
                                <MapPin className="h-3 w-3 text-gray-400" />
                                {seller.district}
                              </div>
                            </TableCell>
                            <TableCell>{seller.total_orders}</TableCell>
                            <TableCell className="text-orange-600 font-medium">
                              LKR {seller.pending_income.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-green-600 font-medium">
                              LKR {seller.completed_income.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-blue-600 font-bold">
                              LKR {seller.total_income.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - #{selectedOrder?.order_number}</DialogTitle>
            <DialogDescription>Complete order information</DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Customer Information</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Name:</span> {selectedOrder.customer_name}</p>
                    <p><span className="font-medium">Email:</span> {selectedOrder.customer_email}</p>
                    <p><span className="font-medium">Mobile:</span> {selectedOrder.customer_mobile}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Shipping Address</h3>
                  <div className="text-sm">
                    <p>{selectedOrder.shipping_address}</p>
                    <p>{selectedOrder.shipping_city} {selectedOrder.shipping_postal_code}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Order Status</h3>
                <div className="flex items-center gap-2">
                  {getStatusBadge(selectedOrder.status)}
                  <Badge className="bg-gray-100 text-gray-800">
                    Payment: {selectedOrder.payment_status}
                  </Badge>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Order Items by Seller</h3>
                {selectedOrder.sellers?.map((seller, idx) => (
                  <Card key={idx} className="mb-4">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Store className="h-4 w-4" />
                            {seller.business_name}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {seller.district}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Seller Total</p>
                          <p className="text-lg font-bold text-blue-600">
                            LKR {seller.total_amount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {seller.items.map((item, itemIdx) => (
                          <div key={itemIdx} className="flex justify-between items-center py-2 border-b last:border-0">
                            <div>
                              <p className="font-medium">{item.product_title}</p>
                              <p className="text-sm text-gray-600">
                                Qty: {item.quantity} × LKR {item.price.toLocaleString()}
                              </p>
                            </div>
                            <p className="font-semibold">LKR {item.subtotal.toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Order History
                </h3>
                {orderHistory.length === 0 ? (
                  <p className="text-sm text-gray-600">No status changes yet</p>
                ) : (
                  <div className="space-y-2">
                    {orderHistory.map((history) => (
                      <div key={history.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Badge className="bg-gray-100 text-gray-800">{history.old_status}</Badge>
                        <span className="text-gray-400">→</span>
                        <Badge className="bg-blue-100 text-blue-800">{history.new_status}</Badge>
                        <span className="text-sm text-gray-600 ml-auto">
                          {history.changed_by_role} • {format(new Date(history.created_at), 'PPp')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="font-medium">{selectedOrder.payment_method.replace('_', ' ').toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-blue-600">
                    LKR {Number(selectedOrder.total_amount).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Order Status</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedOrder && newStatus && (
                <p>
                  Change order <strong>#{selectedOrder.order_number}</strong> status from{' '}
                  {getStatusBadge(selectedOrder.status)} to {getStatusBadge(newStatus)}
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmStatusChange}
              disabled={isUpdating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isUpdating ? 'Updating...' : 'Confirm Update'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
