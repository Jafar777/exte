// app/dashboard/cart/page.js
'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session) {
      fetchCart();
    }
  }, [session, status, router]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cart');
      
      if (response.ok) {
        const cartData = await response.json();
        setCart(cartData);
      } else {
        console.error('Failed to fetch cart');
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      setUpdating(true);
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId,
          quantity: newQuantity,
        }),
      });

      if (response.ok) {
        const updatedCart = await response.json();
        setCart(updatedCart);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setUpdating(false);
    }
  };

  const removeItem = async (itemId) => {
    try {
      setUpdating(true);
      const response = await fetch(`/api/cart?itemId=${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const updatedCart = await response.json();
        setCart(updatedCart);
      }
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setUpdating(false);
    }
  };

  const clearCart = async () => {
    try {
      setUpdating(true);
      const response = await fetch('/api/cart', {
        method: 'DELETE',
      });

      if (response.ok) {
        const updatedCart = await response.json();
        setCart(updatedCart);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-4 p-4 border border-gray-200">
                    <div className="w-24 h-32 bg-gray-200"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 p-6 h-64">
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-white pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-3xl font-light tracking-wide text-gray-900 mb-4">YOUR SHOPPING BAG</h1>
            <p className="text-gray-600 font-light mb-8">Your bag is empty</p>
            <Link
              href="/products"
              className="inline-block border border-gray-900 px-8 py-3 text-sm font-light tracking-wide text-gray-900 hover:bg-gray-900 hover:text-white transition-colors duration-200"
            >
              CONTINUE SHOPPING
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-light tracking-wide text-gray-900">SHOPPING BAG</h1>
          <p className="text-gray-600 font-light mt-2">
            {cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {cart.items.map((item) => (
                <div key={item._id} className="flex gap-6 p-6 border border-gray-200 relative">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <div className="w-24 h-32 relative bg-gray-100">
                      {item.product.featuredImage ? (
                        <Image
                          src={item.product.featuredImage}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No Image</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-light text-gray-900 text-lg mb-2">
                          {item.product.name}
                        </h3>
                        <p className="text-gray-600 font-light text-sm mb-1">
                          {item.product.category?.name}
                        </p>
                        {item.product.collection && (
                          <p className="text-gray-500 font-light text-xs mb-3">
                            Collection: {item.product.collection.name}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item._id)}
                        disabled={updating}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Size and Color */}
                    <div className="flex items-center space-x-6 mb-4">
                      <div>
                        <span className="text-xs font-light text-gray-600 tracking-wide">SIZE</span>
                        <p className="text-sm font-light text-gray-900">{item.size}</p>
                      </div>
                      {item.color && (
                        <div>
                          <span className="text-xs font-light text-gray-600 tracking-wide">COLOR</span>
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-4 h-4 rounded-full border border-gray-300"
                              style={{ backgroundColor: item.color.hex }}
                            ></div>
                            <span className="text-sm font-light text-gray-900">{item.color.name}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Quantity and Price */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-xs font-light text-gray-600 tracking-wide">QUANTITY</span>
                        <div className="flex border border-gray-300">
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            disabled={updating || item.quantity <= 1}
                            className="px-3 py-1 text-gray-600 hover:text-gray-900 font-light disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            -
                          </button>
                          <span className="px-3 py-1 text-gray-900 font-light min-w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            disabled={updating}
                            className="px-3 py-1 text-gray-600 hover:text-gray-900 font-light"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-light text-gray-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-sm text-gray-500 font-light">
                            ${item.price} each
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Clear Cart Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={clearCart}
                disabled={updating}
                className="text-sm font-light text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
              >
                CLEAR SHOPPING BAG
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 p-6 sticky top-24">
              <h2 className="text-xl font-light tracking-wide text-gray-900 mb-6">ORDER SUMMARY</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm font-light">
                  <span>Subtotal ({cart.itemCount} items)</span>
                  <span>${cart.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-light">
                  <span>Shipping</span>
                  <span className="text-green-600">FREE</span>
                </div>
                <div className="flex justify-between text-sm font-light">
                  <span>Estimated Tax</span>
                  <span>${(cart.total * 0.08).toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-300 pt-4">
                  <div className="flex justify-between text-base font-light">
                    <span>Total</span>
                    <span>${(cart.total * 1.08).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  // TODO: Implement checkout
                  alert('Checkout functionality coming soon!');
                }}
                className="w-full bg-gray-900 text-white py-4 text-sm font-light tracking-wide hover:bg-gray-800 transition-colors duration-200 mb-4"
              >
                PROCEED TO CHECKOUT
              </button>

              <Link
                href="/products"
                className="block w-full border border-gray-900 bg-white text-gray-900 py-4 text-sm font-light tracking-wide text-center hover:bg-gray-900 hover:text-white transition-colors duration-200"
              >
                CONTINUE SHOPPING
              </Link>

              <div className="mt-6 text-xs text-gray-500 font-light">
                <p>Free shipping on all orders over $50</p>
                <p className="mt-2">Easy returns within 30 days</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}