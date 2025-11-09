'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, CreditCard, Plus, Edit, Trash2, Star, Building2, Smartphone, Banknote } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentMethod {
  id: string;
  method_type: string;
  label: string;
  card_last_four?: string;
  card_brand?: string;
  bank_name?: string;
  account_number_last_four?: string;
  mobile_wallet_provider?: string;
  is_default: boolean;
}

export default function PaymentMethodsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [formData, setFormData] = useState({
    method_type: 'cash_on_delivery',
    label: '',
    card_last_four: '',
    card_brand: '',
    bank_name: '',
    account_number_last_four: '',
    mobile_wallet_provider: '',
    is_default: false
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadPaymentMethods();
    }
  }, [user]);

  const loadPaymentMethods = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPaymentMethods(data || []);
    } catch (error) {
      console.error('Error loading payment methods:', error);
      toast.error('Failed to load payment methods');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    try {
      if (editingMethod) {
        const { error } = await supabase
          .from('payment_methods')
          .update(formData)
          .eq('id', editingMethod.id);

        if (error) throw error;
        toast.success('Payment method updated successfully');
      } else {
        const { error } = await supabase
          .from('payment_methods')
          .insert({
            user_id: user.id,
            ...formData
          });

        if (error) throw error;
        toast.success('Payment method added successfully');
      }

      setIsDialogOpen(false);
      resetForm();
      loadPaymentMethods();
    } catch (error) {
      console.error('Error saving payment method:', error);
      toast.error('Failed to save payment method');
    }
  };

  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method);
    setFormData({
      method_type: method.method_type,
      label: method.label,
      card_last_four: method.card_last_four || '',
      card_brand: method.card_brand || '',
      bank_name: method.bank_name || '',
      account_number_last_four: method.account_number_last_four || '',
      mobile_wallet_provider: method.mobile_wallet_provider || '',
      is_default: method.is_default
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (methodId: string) => {
    if (!confirm('Are you sure you want to delete this payment method?')) return;

    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', methodId);

      if (error) throw error;
      toast.success('Payment method deleted successfully');
      loadPaymentMethods();
    } catch (error) {
      console.error('Error deleting payment method:', error);
      toast.error('Failed to delete payment method');
    }
  };

  const handleSetDefault = async (methodId: string) => {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_default: true })
        .eq('id', methodId);

      if (error) throw error;
      toast.success('Default payment method updated');
      loadPaymentMethods();
    } catch (error) {
      console.error('Error setting default payment method:', error);
      toast.error('Failed to update default payment method');
    }
  };

  const resetForm = () => {
    setEditingMethod(null);
    setFormData({
      method_type: 'cash_on_delivery',
      label: '',
      card_last_four: '',
      card_brand: '',
      bank_name: '',
      account_number_last_four: '',
      mobile_wallet_provider: '',
      is_default: false
    });
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'card':
        return <CreditCard className="h-5 w-5" />;
      case 'bank':
        return <Building2 className="h-5 w-5" />;
      case 'mobile_wallet':
        return <Smartphone className="h-5 w-5" />;
      case 'cash_on_delivery':
        return <Banknote className="h-5 w-5" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  const getMethodDisplay = (method: PaymentMethod) => {
    switch (method.method_type) {
      case 'card':
        return `${method.card_brand} •••• ${method.card_last_four}`;
      case 'bank':
        return `${method.bank_name} •••• ${method.account_number_last_four}`;
      case 'mobile_wallet':
        return method.mobile_wallet_provider;
      case 'cash_on_delivery':
        return 'Cash on Delivery';
      default:
        return 'Unknown';
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment methods...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/account">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Payment Methods</h1>
              <p className="text-gray-600">Manage your payment options</p>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingMethod ? 'Edit Payment Method' : 'Add Payment Method'}</DialogTitle>
                <DialogDescription>
                  {editingMethod ? 'Update payment method details' : 'Add a new payment method'}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="method_type">Payment Type *</Label>
                  <select
                    id="method_type"
                    name="method_type"
                    value={formData.method_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="cash_on_delivery">Cash on Delivery</option>
                    <option value="card">Credit/Debit Card</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="mobile_wallet">Mobile Wallet</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="label">Label *</Label>
                  <Input
                    id="label"
                    name="label"
                    value={formData.label}
                    onChange={handleInputChange}
                    placeholder="e.g., Primary Card, Main Account"
                    required
                  />
                </div>

                {formData.method_type === 'card' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="card_brand">Card Brand *</Label>
                      <select
                        id="card_brand"
                        name="card_brand"
                        value={formData.card_brand}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                      >
                        <option value="">Select brand</option>
                        <option value="Visa">Visa</option>
                        <option value="Mastercard">Mastercard</option>
                        <option value="American Express">American Express</option>
                        <option value="Discover">Discover</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="card_last_four">Last 4 Digits *</Label>
                      <Input
                        id="card_last_four"
                        name="card_last_four"
                        value={formData.card_last_four}
                        onChange={handleInputChange}
                        placeholder="1234"
                        maxLength={4}
                        required
                      />
                    </div>
                  </>
                )}

                {formData.method_type === 'bank' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="bank_name">Bank Name *</Label>
                      <Input
                        id="bank_name"
                        name="bank_name"
                        value={formData.bank_name}
                        onChange={handleInputChange}
                        placeholder="e.g., Commercial Bank"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="account_number_last_four">Account Last 4 Digits *</Label>
                      <Input
                        id="account_number_last_four"
                        name="account_number_last_four"
                        value={formData.account_number_last_four}
                        onChange={handleInputChange}
                        placeholder="1234"
                        maxLength={4}
                        required
                      />
                    </div>
                  </>
                )}

                {formData.method_type === 'mobile_wallet' && (
                  <div className="space-y-2">
                    <Label htmlFor="mobile_wallet_provider">Wallet Provider *</Label>
                    <select
                      id="mobile_wallet_provider"
                      name="mobile_wallet_provider"
                      value={formData.mobile_wallet_provider}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="">Select provider</option>
                      <option value="PayPal">PayPal</option>
                      <option value="Google Pay">Google Pay</option>
                      <option value="Apple Pay">Apple Pay</option>
                      <option value="FriMi">FriMi</option>
                      <option value="eZ Cash">eZ Cash</option>
                    </select>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_default"
                    name="is_default"
                    checked={formData.is_default}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <Label htmlFor="is_default">Set as default payment method</Label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingMethod ? 'Update Method' : 'Add Method'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> We do not store your actual card or bank account numbers. Only the last 4 digits are saved for reference.
          </p>
        </div>

        {paymentMethods.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No payment methods</h3>
              <p className="text-gray-600 mb-6">
                Add a payment method for faster checkout
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <Card key={method.id} className={method.is_default ? 'ring-2 ring-blue-500' : ''}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        {getMethodIcon(method.method_type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{method.label}</h3>
                          {method.is_default && (
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{getMethodDisplay(method)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!method.is_default && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefault(method.id)}
                        >
                          Set Default
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(method)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(method.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
