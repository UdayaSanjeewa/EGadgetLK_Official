'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import Link from 'next/link';

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Payment Cancelled</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <XCircle className="w-20 h-20 text-orange-600 mx-auto" />
          <div>
            <h3 className="text-2xl font-bold text-orange-600 mb-2">Payment Cancelled</h3>
            <p className="text-gray-600 mb-4">
              You have cancelled the payment process. Your order has not been placed.
            </p>
          </div>
          <div className="space-y-2">
            <Link href="/checkout" className="block">
              <Button className="w-full" size="lg">
                Return to Checkout
              </Button>
            </Link>
            <Link href="/" className="block">
              <Button variant="outline" className="w-full" size="lg">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
