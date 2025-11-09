'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2, ShoppingCart } from 'lucide-react';

export default function VerifyEmailPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const type = hashParams.get('type');

        if (type === 'signup' && accessToken) {
          setStatus('success');
          setMessage('Your email has been verified successfully!');

          setTimeout(() => {
            router.push('/auth/signin');
          }, 3000);
        } else {
          setStatus('error');
          setMessage('Invalid verification link. Please try again or request a new verification email.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred during verification. Please try again.');
      }
    };

    verifyEmail();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">E-GadgetLK</h1>
              <p className="text-sm text-gray-500">Your Tech Store</p>
            </div>
          </Link>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-6">
            {status === 'loading' && (
              <>
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
                <CardTitle className="text-2xl font-bold text-center text-gray-900">
                  Verifying Email
                </CardTitle>
                <CardDescription className="text-center text-gray-600">
                  Please wait while we verify your email address...
                </CardDescription>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-center text-gray-900">
                  Email Verified!
                </CardTitle>
                <CardDescription className="text-center text-gray-600">
                  {message}
                </CardDescription>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-center text-gray-900">
                  Verification Failed
                </CardTitle>
                <CardDescription className="text-center text-gray-600">
                  {message}
                </CardDescription>
              </>
            )}
          </CardHeader>

          <CardContent className="space-y-4">
            {status === 'success' && (
              <>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-green-800">
                    You will be redirected to the sign-in page in a few seconds...
                  </p>
                </div>

                <Link href="/auth/signin">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Sign In Now
                  </Button>
                </Link>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="space-y-3">
                  <Link href="/auth/signup">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      Sign Up Again
                    </Button>
                  </Link>
                  <Link href="/auth/signin">
                    <Button variant="outline" className="w-full">
                      Go to Sign In
                    </Button>
                  </Link>
                </div>
              </>
            )}

            <div className="text-center pt-2">
              <Link
                href="/"
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
