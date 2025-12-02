'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { paymentGateway } from '@/lib/payment-gateway';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import Link from 'next/link';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'success' | 'failed' | 'pending'>('pending');
  const [orderNumber, setOrderNumber] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      const sessionId = searchParams.get('session_id');
      const orderId = searchParams.get('order_id');

      if (!orderId) {
        setVerificationStatus('failed');
        setMessage('Invalid payment details');
        setIsVerifying(false);
        return;
      }

      const { data: order } = await supabase
        .from('orders')
        .select('order_number, payment_status, status')
        .eq('id', orderId)
        .maybeSingle();

      if (order) {
        setOrderNumber(order.order_number);

        if (order.payment_status === 'completed') {
          setVerificationStatus('success');
          setMessage('Payment completed successfully!');
        } else {
          await new Promise(resolve => setTimeout(resolve, 2000));

          const { data: updatedOrder } = await supabase
            .from('orders')
            .select('payment_status')
            .eq('id', orderId)
            .maybeSingle();

          if (updatedOrder?.payment_status === 'completed') {
            setVerificationStatus('success');
            setMessage('Payment completed successfully!');
          } else {
            setVerificationStatus('pending');
            setMessage('Payment is being processed. Please check your orders page.');
          }
        }
      } else {
        setVerificationStatus('failed');
        setMessage('Order not found');
      }
    } catch (error: any) {
      console.error('Payment verification error:', error);
      setVerificationStatus('failed');
      setMessage('An error occurred while verifying payment');
    } finally {
      setIsVerifying(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Loader2 className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold mb-2">Verifying Payment</h2>
            <p className="text-gray-600">Please wait while we verify your payment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            {verificationStatus === 'success' ? 'Payment Successful' : 'Payment Failed'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          {verificationStatus === 'success' ? (
            <>
              <CheckCircle className="w-20 h-20 text-green-600 mx-auto" />
              <div>
                <h3 className="text-2xl font-bold text-green-600 mb-2">Thank You!</h3>
                <p className="text-gray-600 mb-4">{message}</p>
                {orderNumber && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Order Number</p>
                    <p className="text-xl font-bold text-gray-900">{orderNumber}</p>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Link href="/account/orders" className="block">
                  <Button className="w-full" size="lg">
                    View My Orders
                  </Button>
                </Link>
                <Link href="/" className="block">
                  <Button variant="outline" className="w-full" size="lg">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <XCircle className="w-20 h-20 text-red-600 mx-auto" />
              <div>
                <h3 className="text-2xl font-bold text-red-600 mb-2">Payment Failed</h3>
                <p className="text-gray-600 mb-4">{message}</p>
              </div>
              <div className="space-y-2">
                <Link href="/checkout" className="block">
                  <Button className="w-full" size="lg">
                    Try Again
                  </Button>
                </Link>
                <Link href="/" className="block">
                  <Button variant="outline" className="w-full" size="lg">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Loader2 className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold mb-2">Loading...</h2>
            <p className="text-gray-600">Please wait...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
