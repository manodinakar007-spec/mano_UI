import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CreditCard, Lock, Tag, Trash2, CheckCircle } from 'lucide-react';
import { cartApi, paymentApi } from '../utils/api.js';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState('');
  const [step, setStep] = useState('cart'); // cart | payment | success

  const { data: cart } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartApi.get().then((r) => r.data),
    placeholderData: { items: PLACEHOLDER_CART, total: 169.98, discount: 0 },
  });

const removeMutation = useMutation({
  mutationFn: (itemId) => cartApi.remove(itemId),
});

const checkoutMutation = useMutation({
  mutationFn: async () => {
    const { data } = await paymentApi.createIntent({ coupon });

    if (!data.url) {
      throw new Error('Stripe checkout URL was not returned');
    }

    window.location.assign(data.url);
  },
});

const confirmationStarted = useRef(false);

const confirmMutation = useMutation({
  mutationFn: (id) => paymentApi.confirm(id),
  onSuccess: () => setStep('success'),
  onError: () => {
    alert('Payment verification failed. If you were charged, contact support.');
  },
});

useEffect(() => {
  const sessionId = new URLSearchParams(window.location.search).get('session_id');

  if (sessionId && !confirmationStarted.current) {
    confirmationStarted.current = true;
    confirmMutation.mutate(sessionId);
  }
}, []);

  if (step === 'success') {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="card p-10">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Enrollment Confirmed!</h1>
          <p className="text-gray-500 mb-6">You're all set. Check your email for your enrollment details.</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary w-full py-3">
            Go to My Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart?.items?.map((item) => (
            <div key={item.id} className="card p-4 flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-brand-100 flex items-center justify-center shrink-0">
                <CreditCard className="h-7 w-7 text-brand-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 line-clamp-1">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.instructor}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-semibold text-gray-900">${item.price?.toFixed(2)}</p>
                <button
                  onClick={() => removeMutation.mutate(item.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors mt-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Coupon */}
          <div className="card p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Tag className="h-4 w-4" /> Coupon Code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter coupon code"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                className="input flex-1"
              />
              <button className="btn-secondary px-4">Apply</button>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${cart?.total?.toFixed(2)}</span>
              </div>
              {cart?.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-${cart.discount?.toFixed(2)}</span>
                </div>
              )}
            </div>
            <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-200 pt-3 mb-6">
              <span>Total</span>
              <span>${((cart?.total || 0) - (cart?.discount || 0)).toFixed(2)}</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
              <Lock className="h-3.5 w-3.5" />
              Secured with 256-bit SSL encryption
            </div>

            <button
              onClick={() => checkoutMutation.mutate()}
              disabled={checkoutMutation.isPending || !cart?.items?.length}
              className="btn-primary w-full py-3 text-base"
            >
              {checkoutMutation.isPending
  ? 'Redirecting to Stripe...'
  : 'Pay securely with Stripe'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const PLACEHOLDER_CART = [
  { id: '1', title: 'Cloud-Native Architecture with Kubernetes', instructor: 'Priya Mehta', price: 79.99 },
  { id: '2', title: 'Full-Stack React & Node.js Development', instructor: 'James Whitfield', price: 89.99 },
];
