// app/dashboard/reviews/page.js
'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function ReviewsPage() {
  const { data: session, status } = useSession();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsToReview, setProductsToReview] = useState([]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchUserReviews();
      fetchProductsToReview();
    }
  }, [status]);

  const fetchUserReviews = async () => {
    try {
      const response = await fetch('/api/reviews/user');
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsToReview = async () => {
    try {
      const response = await fetch('/api/reviews/eligible-products');
      if (response.ok) {
        const data = await response.json();
        setProductsToReview(data);
      }
    } catch (error) {
      console.error('Error fetching products to review:', error);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setReviews(reviews.filter(review => review._id !== reviewId));
      } else {
        alert('Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm mb-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-md mx-auto px-4 text-center">
          <h1 className="text-2xl font-light text-gray-900 mb-4">Sign In Required</h1>
          <p className="text-gray-600 mb-8">Please sign in to view your reviews.</p>
          <Link
            href="/auth/signin"
            className="bg-gray-900 text-white px-6 py-3 text-sm font-light tracking-wide hover:bg-gray-800 transition-colors"
          >
            SIGN IN
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-light tracking-wide text-gray-900 mb-8">My Reviews</h1>

        {/* Products Eligible for Review */}
        {productsToReview.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-light text-gray-900 mb-6">Products to Review</h2>
            <div className="grid gap-4">
              {productsToReview.map((item, index) => (
                <div key={`${item.product._id}-${item.order._id}-${index}`} className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                        {item.product.featuredImage ? (
                          <img 
                            src={item.product.featuredImage} 
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <span className="text-gray-400 text-xs">No Image</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-light text-gray-900">{item.product.name}</h3>
                        <p className="text-sm text-gray-600">Order #: {item.order.orderNumber}</p>
                        <p className="text-xs text-gray-500">Delivered on {new Date(item.order.updatedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Link
                      href={`/products/${item.product._id}?writeReview=true`}
                      className="bg-gray-900 text-white px-4 py-2 text-sm font-light tracking-wide hover:bg-gray-800 transition-colors"
                    >
                      WRITE REVIEW
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User's Reviews */}
        <div>
          <h2 className="text-xl font-light text-gray-900 mb-6">
            My Reviews ({reviews.length})
          </h2>
          
          {reviews.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <p className="text-gray-600 mb-4">You haven't written any reviews yet.</p>
              <p className="text-sm text-gray-500">
                Review products you've purchased to help other shoppers.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review._id} className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                        {review.product.featuredImage ? (
                          <img 
                            src={review.product.featuredImage} 
                            alt={review.product.name}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <span className="text-gray-400 text-xs">No Image</span>
                        )}
                      </div>
                      <div>
                        <Link 
                          href={`/products/${review.product._id}`}
                          className="font-light text-gray-900 hover:text-gray-700"
                        >
                          {review.product.name}
                        </Link>
                        <div className="flex items-center space-x-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteReview(review._id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  {review.title && (
                    <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
                  )}
                  
                  <p className="text-gray-600 mb-4 whitespace-pre-wrap">{review.comment}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Reviewed on {new Date(review.createdAt).toLocaleDateString()}</span>
                    {review.isVerified && (
                      <span className="flex items-center space-x-1 text-green-600">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Verified Purchase</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}