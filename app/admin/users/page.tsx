'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthManager } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Label } from '@/components/ui/label';
import {
  Search,
  Users,
  ArrowLeft,
  Eye,
  Shield,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
  UserCog
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  mobile: string | null;
  role: string;
  created_at: string;
  address: string | null;
  city: string | null;
  postal_code: string | null;
}

interface UserDetails extends Profile {
  orderCount: number;
  totalSpent: number;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    checkAdminAndLoadData();
  }, []);

  const checkAdminAndLoadData = async () => {
    const admin = await AuthManager.isAdmin();
    if (!admin) {
      router.push('/admin/login');
      return;
    }
    await loadUsers();
  };

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUsers(profiles || []);
    } catch (error: any) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserDetails = async (userId: string) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      const { count: orderCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('user_id', userId);

      const totalSpent = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

      setSelectedUser({
        ...user,
        orderCount: orderCount || 0,
        totalSpent
      });
      setShowDetailsDialog(true);
    } catch (error) {
      console.error('Error loading user details:', error);
      toast.error('Failed to load user details');
    }
  };

  const handleChangeRole = (user: Profile) => {
    setSelectedUser({ ...user, orderCount: 0, totalSpent: 0 });
    setNewRole(user.role);
    setShowRoleDialog(true);
  };

  const confirmRoleChange = async () => {
    if (!selectedUser || !newRole) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', selectedUser.id);

      if (error) throw error;

      toast.success('User role updated successfully');
      setShowRoleDialog(false);
      await loadUsers();
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast.error(error.message || 'Failed to update user role');
    } finally {
      setIsUpdating(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'customer':
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.mobile?.includes(searchQuery);

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const stats = {
    total: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    customer: users.filter(u => u.role === 'customer').length,
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
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold flex items-center">
                  <Users className="w-6 h-6 mr-2" />
                  User Management
                </h1>
                <p className="text-sm text-gray-600">View and manage all user accounts</p>
              </div>
            </div>
            <Button onClick={loadUsers} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Users className="w-10 h-10 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Admins</p>
                  <p className="text-3xl font-bold text-red-600">{stats.admin}</p>
                </div>
                <Shield className="w-10 h-10 text-red-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Customers</p>
                  <p className="text-3xl font-bold text-green-600">{stats.customer}</p>
                </div>
                <ShoppingBag className="w-10 h-10 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                  <SelectItem value="customer">Customers</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Users ({filteredUsers.length})</CardTitle>
            <CardDescription>Complete list of registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                              {user.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium">{user.full_name || 'N/A'}</div>
                              <div className="text-xs text-gray-500 font-mono">
                                {user.id.substring(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="w-4 h-4 text-gray-400" />
                            {user.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.mobile ? (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="w-4 h-4 text-gray-400" />
                              {user.mobile}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleBadgeColor(user.role)}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {format(new Date(user.created_at), 'MMM dd, yyyy')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => loadUserDetails(user.id)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleChangeRole(user)}
                            >
                              <UserCog className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Complete information about this user
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 pb-4 border-b">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-semibold">
                  {selectedUser.full_name?.[0]?.toUpperCase() || selectedUser.email[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedUser.full_name || 'N/A'}</h3>
                  <p className="text-sm text-gray-600">{selectedUser.email}</p>
                  <Badge className={`mt-1 ${getRoleBadgeColor(selectedUser.role)}`}>
                    {selectedUser.role}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>

                {selectedUser.mobile && (
                  <div>
                    <Label className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                      <Phone className="w-4 h-4" />
                      Phone
                    </Label>
                    <p className="font-medium">{selectedUser.mobile}</p>
                  </div>
                )}

                <div>
                  <Label className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                    <Calendar className="w-4 h-4" />
                    Member Since
                  </Label>
                  <p className="font-medium">{format(new Date(selectedUser.created_at), 'PPP')}</p>
                </div>

                <div>
                  <Label className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                    <ShoppingBag className="w-4 h-4" />
                    Total Orders
                  </Label>
                  <p className="font-medium">{selectedUser.orderCount}</p>
                </div>

                <div className="col-span-2">
                  <Label className="text-sm text-gray-600 mb-1 block">
                    Total Spent
                  </Label>
                  <p className="text-2xl font-bold text-green-600">
                    Rs. {selectedUser.totalSpent.toLocaleString()}
                  </p>
                </div>
              </div>

              {(selectedUser.address || selectedUser.city || selectedUser.postal_code) && (
                <div className="border-t pt-4">
                  <Label className="text-sm text-gray-600 flex items-center gap-1 mb-2">
                    <MapPin className="w-4 h-4" />
                    Address
                  </Label>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm">
                      {selectedUser.address && <span>{selectedUser.address}<br /></span>}
                      {selectedUser.city && <span>{selectedUser.city} </span>}
                      {selectedUser.postal_code && <span>{selectedUser.postal_code}</span>}
                    </p>
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <Label className="text-sm text-gray-600 mb-2 block">User ID</Label>
                <p className="text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded">
                  {selectedUser.id}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change User Role</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUser && (
                <div className="space-y-4">
                  <p>
                    Change role for <strong>{selectedUser.full_name || selectedUser.email}</strong>
                  </p>
                  <div>
                    <Label htmlFor="role">New Role</Label>
                    <Select value={newRole} onValueChange={setNewRole}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="customer">Customer</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRoleChange}
              disabled={isUpdating || !newRole}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isUpdating ? 'Updating...' : 'Confirm Change'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
