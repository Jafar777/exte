// app/products/[id]/page.js
'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { CiHeart } from "react-icons/ci";
import { FaHeart } from "react-icons/fa";

export default function ProductPage() {
  const params = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userCanReview, setUserCanReview] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    if (params.id) {
      fetchProduct();
      fetchReviews();
      checkUserCanReview();
      checkIfLiked();
    }
  }, [params.id]);

const fetchProduct = async () => {
  try {
    setLoading(true);
    const productRes = await fetch(`/api/products/${params.id}`);

    if (productRes.ok) {
      const productData = await productRes.json();
      setProduct(productData);
      setLikesCount(productData.likes || 0);
      
      // Set default selections
      if (productData.sizes && productData.sizes.length > 0) {
        setSelectedSize(productData.sizes[0].size);
      }
      if (productData.colors && productData.colors.length > 0) {
        setSelectedColor(productData.colors[0].name);
      }

      // Fetch related products only if category exists
      if (productData.category && productData.category._id) {
        const relatedRes = await fetch(`/api/products?category=${productData.category._id}&limit=4`);
        if (relatedRes.ok) {
          setRelatedProducts(await relatedRes.json());
        }
      } else {
        setRelatedProducts([]);
      }
    }
  } catch (error) {
    console.error('Error fetching product:', error);
  } finally {
    setLoading(false);
  }
};

const checkIfLiked = async () => {
  try {
    const response = await fetch('/api/users/likes');
    if (response.ok) {
      const likedProducts = await response.json();
      // Ensure we're comparing strings and handle case where likedProducts is null/undefined
      const liked = Array.isArray(likedProducts) && 
                   likedProducts.some(likedProduct => 
                     likedProduct && likedProduct._id === params.id
                   );
      setIsLiked(liked);
    } else {
      console.error('Failed to fetch liked products');
      setIsLiked(false);
    }
  } catch (error) {
    console.error('Error checking like status:', error);
    setIsLiked(false);
  }
};

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/products/${params.id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ liked: !isLiked })
      });

      if (response.ok) {
        const result = await response.json();
        setIsLiked(!isLiked);
        setLikesCount(result.likes);
      } else {
        console.error('Failed to update like');
      }
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product._id,
          size: selectedSize,
          color: product.colors?.find(color => color.name === selectedColor),
          quantity: quantity
        }),
      });

      if (response.ok) {
        // Show success message
        alert('Product added to cart!');
        
        // Refresh cart data in navbar
        if (window.mutateCart) {
          window.mutateCart();
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart');
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?productId=${params.id}`);
      if (response.ok) {
        setReviews(await response.json());
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const checkUserCanReview = async () => {
    try {
      const response = await fetch('/api/reviews/eligible-products');
      if (response.ok) {
        const eligibleProducts = await response.json();
        const canReview = eligibleProducts.some(item => item.product._id === params.id);
        setUserCanReview(canReview);
      }
    } catch (error) {
      console.error('Error checking review eligibility:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-8">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-4">
                <div className="bg-gray-200 aspect-square rounded"></div>
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-gray-200 aspect-square rounded"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/6"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-light tracking-wide text-gray-900 mb-4">Product Not Found</h1>
          <Link 
            href="/products" 
            className="border border-gray-900 px-6 py-3 text-sm font-light tracking-wide text-gray-900 hover:bg-gray-900 hover:text-white transition-colors duration-200"
          >
            BACK TO PRODUCTS
          </Link>
        </div>
      </div>
    );
  }

  const availableSizes = product.sizes?.filter(size => size.stock > 0) || [];
  const selectedColorData = product.colors?.find(color => color.name === selectedColor);
  const images = selectedColorData?.images?.length > 0 ? selectedColorData.images : product.images;

  return (
    <div className="min-h-screen bg-white">
        <Navbar />
      {/* Breadcrumb */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex space-x-2 text-sm font-light text-gray-600">
            <Link href="/" className="hover:text-gray-900">Home</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-gray-900">Products</Link>
            <span>/</span>
            <span className="text-gray-900">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Product Images */}
          <div>
            {/* Main Image */}
            <div className="relative bg-gray-100 aspect-square mb-4">
              {images && images[activeImage] ? (
                <Image
                  src={images[activeImage]}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-400 font-light">No Image Available</span>
                </div>
              )}
            </div>

            {/* Image Thumbnails */}
            {images && images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`relative bg-gray-100 aspect-square border-2 ${
                      activeImage === index ? 'border-gray-900' : 'border-transparent'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Product Header */}
            <div>
              <h1 className="text-3xl font-light tracking-wide text-gray-900 mb-2">
                {product.name}
              </h1>
              
              <div className="flex items-center space-x-4 mb-4">
                <p className="text-2xl font-light text-gray-900">
                  ${product.price}
                </p>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <p className="text-lg text-gray-400 line-through font-light">
                      ${product.originalPrice}
                    </p>
                    <span className="bg-red-500 text-white px-2 py-1 text-xs font-light tracking-wide">
                      SAVE ${product.originalPrice - product.price}
                    </span>
                  </>
                )}
              </div>

              {/* Rating and Likes */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-4 h-4 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 font-light">4.8 (124 reviews)</span>
                </div>

                {/* Like Button */}
                <button
                  onClick={handleLike}
                  className="flex items-center space-x-2 text-sm text-gray-600 hover:text-red-500 transition-colors"
                >
                  {isLiked ? (
                    <FaHeart className="w-5 h-5 text-red-500" />
                  ) : (
                    <CiHeart className="w-5 h-5" />
                  )}
                  <span>{likesCount} likes</span>
                </button>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-sm font-light text-gray-700 mb-2 tracking-wide">DESCRIPTION</h3>
              <p className="text-gray-600 font-light leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="text-sm font-light text-gray-700 mb-3 tracking-wide">COLOR</h3>
                <div className="flex space-x-3">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`w-10 h-10 rounded-full border-2 ${
                        selectedColor === color.name ? 'border-gray-900' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600 font-light mt-2">{selectedColor}</p>
              </div>
            )}

            {/* Size Selection */}
            {availableSizes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-light text-gray-700 tracking-wide">SIZE</h3>
                  <button className="text-sm font-light text-gray-600 hover:text-gray-900">
                    Size Guide
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {availableSizes.map((size) => (
                    <button
                      key={size.size}
                      onClick={() => setSelectedSize(size.size)}
                      className={`py-3 text-center border text-sm font-light tracking-wide transition-colors ${
                        selectedSize === size.size
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-300 text-gray-900 hover:border-gray-900'
                      }`}
                    >
                      {size.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div>
                  <label className="text-sm font-light text-gray-700 mb-2 block tracking-wide">QUANTITY</label>
                  <div className="flex border border-gray-300">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 text-gray-600 hover:text-gray-900 font-light"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 text-gray-900 font-light">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-900 font-light"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex-1">
                  <label className="text-sm font-light text-gray-700 mb-2 block tracking-wide invisible">
                    Add to Cart
                  </label>
                  <button
                    onClick={handleAddToCart}
                    disabled={availableSizes.length === 0}
                    className="w-full bg-gray-900 text-white py-3 text-sm font-light tracking-wide hover:bg-gray-800 transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {availableSizes.length === 0 ? 'OUT OF STOCK' : 'ADD TO CART'}
                  </button>
                </div>
              </div>

              {/* Secondary Actions - Replaced with Heart Button */}
              <div className="flex space-x-4">
                <button
                  onClick={handleLike}
                  className={`flex-1 border py-3 text-sm font-light tracking-wide transition-colors duration-200 flex items-center justify-center space-x-2 ${
                    isLiked 
                      ? 'border-red-500 text-red-500 bg-red-50 hover:bg-red-100' 
                      : 'border-gray-300 text-gray-900 hover:border-gray-900'
                  }`}
                >
                  {isLiked ? (
                    <>
                      <FaHeart className="w-5 h-5 text-red-500" />
                      <span>LIKED</span>
                    </>
                  ) : (
                    <>
                      <CiHeart className="w-5 h-5" />
                      <span>LIKE</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Product Details */}
            <div className="border-t border-gray-200 pt-6">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="font-light text-gray-600">SKU</span>
                  <span className="font-light text-gray-900">{product.sku}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-light text-gray-600">Category</span>
                  <span className="font-light text-gray-900">{product.category?.name}</span>
                </div>
                {product.subCategory && (
                  <div className="flex justify-between">
                    <span className="font-light text-gray-600">Subcategory</span>
                    <span className="font-light text-gray-900">{product.subCategory?.name}</span>
                  </div>
                )}
                {product.collection && (
                  <div className="flex justify-between">
                    <span className="font-light text-gray-600">Collection</span>
                    <span className="font-light text-gray-900">{product.collection?.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 border-t border-gray-200 pt-16">
            <h2 className="text-2xl font-light tracking-wide text-gray-900 mb-8">YOU MIGHT ALSO LIKE</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map((relatedProduct) => (
                <div key={relatedProduct._id} className="group">
                  <Link href={`/products/${relatedProduct._id}`}>
                    <div className="relative bg-gray-100 aspect-[3/4] mb-4">
                      {relatedProduct.featuredImage && (
                        <Image
                          src={relatedProduct.featuredImage}
                          alt={relatedProduct.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                    </div>
                    <div>
                      <h3 className="font-light text-gray-900 text-sm tracking-wide mb-1">
                        {relatedProduct.name}
                      </h3>
                      <p className="text-gray-600 font-light text-sm">
                        ${relatedProduct.price}
                      </p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}