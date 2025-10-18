// app/dashboard/orders/page.js
'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session) {
      fetchOrders();
    }
  }, [session, status, router]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders');
      
      if (response.ok) {
        const ordersData = await response.json();
        setOrders(ordersData);
      } else {
        console.error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdating(true);
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        // Update the order in the local state
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId ? updatedOrder.order : order
          )
        );
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isAdmin = session?.user?.role === 'admin';

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-6 border border-gray-200">
                  <div className="flex justify-between mb-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
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
          <h1 className="text-3xl font-light tracking-wide text-gray-900">
            {isAdmin ? 'ALL ORDERS' : 'MY ORDERS'}
          </h1>
          <p className="text-gray-600 font-light mt-2">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'} found
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 font-light tracking-wide mb-4">
              {isAdmin ? 'No orders found' : 'You have no orders yet'}
            </p>
            {!isAdmin && (
              <button
                onClick={() => router.push('/products')}
                className="border border-gray-900 px-6 py-3 text-sm font-light tracking-wide text-gray-900 hover:bg-gray-900 hover:text-white transition-colors duration-200"
              >
                START SHOPPING
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="border border-gray-200 p-6">
                {/* Order Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                  <div>
                    <h3 className="font-light text-gray-900 text-lg">
                      Order #{order.orderNumber}
                    </h3>
                    <p className="text-gray-600 font-light text-sm">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    {isAdmin && order.user && (
                      <p className="text-gray-500 font-light text-sm mt-1">
                        Customer: {order.user.firstName} {order.user.lastName} ({order.user.email})
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 mt-2 lg:mt-0">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status.toUpperCase()}
                    </span>
                    <p className="text-lg font-light text-gray-900">
                      ${order.total.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-4 mb-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 py-3 border-b border-gray-100">
                      <div className="flex-shrink-0 w-16 h-20 relative bg-gray-100">
                        {item.product?.featuredImage ? (
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
                      <div className="flex-1">
                        <h4 className="font-light text-gray-900 text-sm">
                          {item.product?.name}
                        </h4>
                        <div className="flex items-center space-x-4 mt-1">
                          <p className="text-sm text-gray-600 font-light">
                            Size: {item.size}
                          </p>
                          {item.color && (
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-3 h-3 rounded-full border border-gray-300"
                                style={{ backgroundColor: item.color.hex }}
                              ></div>
                              <span className="text-sm text-gray-600 font-light">{item.color.name}</span>
                            </div>
                          )}
                          <p className="text-sm text-gray-600 font-light">
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-900 font-light">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Admin Actions */}
                {isAdmin && order.status === 'pending' && (
                  <div className="flex space-x-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => updateOrderStatus(order._id, 'accepted')}
                      disabled={updating}
                      className="bg-green-600 text-white px-4 py-2 text-sm font-light tracking-wide hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
                    >
                      ACCEPT ORDER
                    </button>
                    <button
                      onClick={() => updateOrderStatus(order._id, 'rejected')}
                      disabled={updating}
                      className="bg-red-600 text-white px-4 py-2 text-sm font-light tracking-wide hover:bg-red-700 transition-colors duration-200 disabled:opacity-50"
                    >
                      REJECT ORDER
                    </button>
                  </div>
                )}

                {/* Additional status updates for admin */}
                {isAdmin && order.status === 'accepted' && (
                  <div className="flex space-x-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => updateOrderStatus(order._id, 'shipped')}
                      disabled={updating}
                      className="bg-purple-600 text-white px-4 py-2 text-sm font-light tracking-wide hover:bg-purple-700 transition-colors duration-200 disabled:opacity-50"
                    >
                      MARK AS SHIPPED
                    </button>
                  </div>
                )}

                {isAdmin && order.status === 'shipped' && (
                  <div className="flex space-x-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => updateOrderStatus(order._id, 'delivered')}
                      disabled={updating}
                      className="bg-green-600 text-white px-4 py-2 text-sm font-light tracking-wide hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
                    >
                      MARK AS DELIVERED
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}