'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthManager } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  DialogFooter,
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
  ShieldCheck,
  UserX,
  UserCheck,
  Filter,
  Mail,
  Phone,
  Calendar
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface User {
  id: string;
  email: string;
  name: string;
  mobile: string | null;
  role: string;
  created_at: string;
  is_active: boolean;
  last_sign_in_at: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const admin = await AuthManager.isAdmin();
      if (!admin) {
        router.push('/auth/signin');
      } else {
        setIsAdmin(true);
        loadUsers();
      }
      setIsLoading(false);
    };
    checkAdmin();
  }, [router]);

  const loadUsers = async () => {
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/get-users`;
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    }
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setShowDetailsDialog(true);
  };

  const handleChangeRole = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowRoleDialog(true);
  };

  const handleToggleStatus = (user: User) => {
    setSelectedUser(user);
    setShowStatusDialog(true);
  };

  const confirmRoleChange = async () => {
    if (!selectedUser || !newRole) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase.auth.admin.updateUserById(
        selectedUser.id,
        {
          user_metadata: { role: newRole }
        }
      );

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

  const confirmStatusChange = async () => {
    if (!selectedUser) return;

    setIsUpdating(true);
    try {
      const newStatus = !selectedUser.is_active;

      const { error } = await supabase.auth.admin.updateUserById(
        selectedUser.id,
        {
          ban_duration: newStatus ? 'none' : '876000h'
        }
      );

      if (error) throw error;

      toast.success(`User ${newStatus ? 'activated' : 'deactivated'} successfully`);
      setShowStatusDialog(false);
      await loadUsers();
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error(error.message || 'Failed to update user status');
    } finally {
      setIsUpdating(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'seller':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'user':
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const getRoleStats = () => {
    return {
      all: users.length,
      admin: users.filter(u => u.role === 'admin').length,
      seller: users.filter(u => u.role === 'seller').length,
      user: users.filter(u => u.role === 'user').length,
      active: users.filter(u => u.is_active).length,
      inactive: users.filter(u => !u.is_active).length,
    };
  };

  const stats = getRoleStats();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
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
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <p className="text-sm text-gray-600">Manage all user accounts</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <Card className={`cursor-pointer transition-all hover:shadow-md ${roleFilter === 'all' ? 'ring-2 ring-blue-500' : ''}`} onClick={() => setRoleFilter('all')}>
            <CardContent className="pt-6 pb-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.all}</p>
              <p className="text-sm text-gray-600 mt-1">All Users</p>
            </CardContent>
          </Card>
          <Card className={`cursor-pointer transition-all hover:shadow-md ${roleFilter === 'admin' ? 'ring-2 ring-red-500' : ''}`} onClick={() => setRoleFilter('admin')}>
            <CardContent className="pt-6 pb-4 text-center">
              <p className="text-2xl font-bold text-red-600">{stats.admin}</p>
              <p className="text-sm text-gray-600 mt-1">Admins</p>
            </CardContent>
          </Card>
          <Card className={`cursor-pointer transition-all hover:shadow-md ${roleFilter === 'seller' ? 'ring-2 ring-blue-500' : ''}`} onClick={() => setRoleFilter('seller')}>
            <CardContent className="pt-6 pb-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.seller}</p>
              <p className="text-sm text-gray-600 mt-1">Sellers</p>
            </CardContent>
          </Card>
          <Card className={`cursor-pointer transition-all hover:shadow-md ${roleFilter === 'user' ? 'ring-2 ring-gray-500' : ''}`} onClick={() => setRoleFilter('user')}>
            <CardContent className="pt-6 pb-4 text-center">
              <p className="text-2xl font-bold text-gray-600">{stats.user}</p>
              <p className="text-sm text-gray-600 mt-1">Users</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 pb-4 text-center">
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              <p className="text-sm text-gray-600 mt-1">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 pb-4 text-center">
              <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
              <p className="text-sm text-gray-600 mt-1">Inactive</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                  <SelectItem value="seller">Sellers</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No users found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-lg font-semibold flex-shrink-0">
                        {user.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-semibold text-gray-900">{user.name}</h3>
                          <Badge className={getRoleBadgeColor(user.role)}>
                            {user.role}
                          </Badge>
                          {user.is_active ? (
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              Active
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800 border-red-200">
                              Inactive
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </p>
                        {user.mobile && (
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {user.mobile}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3" />
                          Joined {format(new Date(user.created_at), 'PPP')}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetails(user)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleChangeRole(user)}
                      >
                        <ShieldCheck className="h-4 w-4 mr-1" />
                        Change Role
                      </Button>
                      <Button
                        size="sm"
                        variant={user.is_active ? 'destructive' : 'default'}
                        onClick={() => handleToggleStatus(user)}
                      >
                        {user.is_active ? (
                          <>
                            <UserX className="h-4 w-4 mr-1" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <UserCheck className="h-4 w-4 mr-1" />
                            Activate
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
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
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">Name</Label>
                  <p className="font-medium">{selectedUser.name}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Email</Label>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Role</Label>
                  <Badge className={getRoleBadgeColor(selectedUser.role)}>
                    {selectedUser.role}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Status</Label>
                  {selectedUser.is_active ? (
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800">Inactive</Badge>
                  )}
                </div>
                {selectedUser.mobile && (
                  <div>
                    <Label className="text-sm text-gray-600">Mobile</Label>
                    <p className="font-medium">{selectedUser.mobile}</p>
                  </div>
                )}
                <div>
                  <Label className="text-sm text-gray-600">Joined</Label>
                  <p className="font-medium">{format(new Date(selectedUser.created_at), 'PPP')}</p>
                </div>
                {selectedUser.last_sign_in_at && (
                  <div className="col-span-2">
                    <Label className="text-sm text-gray-600">Last Sign In</Label>
                    <p className="font-medium">{format(new Date(selectedUser.last_sign_in_at), 'PPP p')}</p>
                  </div>
                )}
              </div>

              {(selectedUser.address || selectedUser.city || selectedUser.postal_code) && (
                <div className="border-t pt-4">
                  <Label className="text-sm text-gray-600 mb-2 block">Address</Label>
                  <p className="text-sm">
                    {selectedUser.address && <span>{selectedUser.address}<br /></span>}
                    {selectedUser.city && <span>{selectedUser.city} </span>}
                    {selectedUser.postal_code && <span>{selectedUser.postal_code}</span>}
                  </p>
                </div>
              )}

              <div className="border-t pt-4">
                <Label className="text-sm text-gray-600 mb-2 block">User ID</Label>
                <p className="text-xs text-gray-500 font-mono">{selectedUser.id}</p>
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
                    Change role for <strong>{selectedUser.name}</strong>
                  </p>
                  <div>
                    <Label htmlFor="role">New Role</Label>
                    <Select value={newRole} onValueChange={setNewRole}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="seller">Seller</SelectItem>
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

      <AlertDialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedUser?.is_active ? 'Deactivate User' : 'Activate User'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUser && (
                <p>
                  Are you sure you want to {selectedUser.is_active ? 'deactivate' : 'activate'}{' '}
                  <strong>{selectedUser.name}</strong>?
                  {selectedUser.is_active && (
                    <span className="block mt-2 text-red-600">
                      This will prevent the user from accessing their account.
                    </span>
                  )}
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmStatusChange}
              disabled={isUpdating}
              className={selectedUser?.is_active ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
            >
              {isUpdating ? 'Updating...' : `Confirm ${selectedUser?.is_active ? 'Deactivation' : 'Activation'}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
