'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import SellerLayout from '@/components/seller/SellerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function SellerBankDetailsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [hasDetails, setHasDetails] = useState(false);
  const [formData, setFormData] = useState({
    bank_name: '',
    account_holder_name: '',
    account_number: '',
    branch: '',
    swift_code: '',
  });

  useEffect(() => {
    const checkAuthAndLoad = async () => {
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

        loadBankDetails();
      }
    };

    checkAuthAndLoad();
  }, [user, isLoading, router]);

  const loadBankDetails = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('seller_bank_details')
      .select('*')
      .eq('seller_id', user.id)
      .maybeSingle();

    if (data) {
      setHasDetails(true);
      setFormData({
        bank_name: data.bank_name || '',
        account_holder_name: data.account_holder_name || '',
        account_number: data.account_number || '',
        branch: data.branch || '',
        swift_code: data.swift_code || '',
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);

    try {
      const dataToSave = { ...formData, seller_id: user.id };

      if (hasDetails) {
        const { error } = await supabase
          .from('seller_bank_details')
          .update(dataToSave)
          .eq('seller_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('seller_bank_details')
          .insert(dataToSave);

        if (error) throw error;
        setHasDetails(true);
      }

      toast.success('Bank details saved successfully!');
    } catch (error: any) {
      console.error('Error saving bank details:', error);
      toast.error(error.message || 'Failed to save bank details');
    } finally {
      setIsSaving(false);
    }
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
      <div className="max-w-3xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Bank Details</h1>
          <p className="text-gray-600 mt-1">Manage your payment information</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bank Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bank_name">Bank Name *</Label>
                <Input
                  id="bank_name"
                  name="bank_name"
                  value={formData.bank_name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="account_holder_name">Account Holder Name *</Label>
                <Input
                  id="account_holder_name"
                  name="account_holder_name"
                  value={formData.account_holder_name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="account_number">Account Number *</Label>
                <Input
                  id="account_number"
                  name="account_number"
                  value={formData.account_number}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="branch">Branch</Label>
                  <Input
                    id="branch"
                    name="branch"
                    value={formData.branch}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="swift_code">SWIFT/BIC Code</Label>
                  <Input
                    id="swift_code"
                    name="swift_code"
                    value={formData.swift_code}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" disabled={isSaving} size="lg">
            {isSaving ? 'Saving...' : hasDetails ? 'Update Details' : 'Save Details'}
          </Button>
        </form>
      </div>
    </SellerLayout>
  );
}
