// components/LatestCollections.jsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const LatestCollections = () => {
  const [latestCollection, setLatestCollection] = useState(null);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestCollections();
  }, []);

  const fetchLatestCollections = async () => {
    try {
      setLoading(true);
      
      // Fetch latest collection
      const collectionsRes = await fetch('/api/collections?activeOnly=true&limit=1&sort=-createdAt');
      const collections = await collectionsRes.json();
      
      // Fetch featured products
      const productsRes = await fetch('/api/products?featured=true&limit=8');
      const products = await productsRes.json();

      setLatestCollection(collections[0] || null);
      setFeaturedProducts(products);
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-gray-900 via-black to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="h-80 bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-16">
          <div>
            <h2 className="text-4xl font-light tracking-tighter text-white uppercase mb-4">
              {latestCollection ? latestCollection.name : 'FEATURED COLLECTION'}
            </h2>
            {latestCollection && (
              <p className="text-gray-300 text-lg font-light tracking-wide max-w-2xl">
                {latestCollection.description}
              </p>
            )}
          </div>
          <Link 
            href="/products" 
            className="border border-white px-8 py-4 text-sm font-light tracking-widest text-white uppercase hover:bg-white hover:text-black transition-all duration-300"
          >
            VIEW ALL
          </Link>
        </div>

        {/* Featured Products Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product) => (
            <div key={product._id} className="group relative bg-gradient-to-b from-gray-800 to-black border border-gray-700 hover:border-gray-500 transition-all duration-500">
              <Link href={`/products/${product._id}`}>
                <div className="relative overflow-hidden bg-gray-800 aspect-[3/4] mb-4">
                  {product.featuredImage ? (
                    <Image
                      src={product.featuredImage}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                      <span className="text-gray-400 text-sm font-light">NO IMAGE</span>
                    </div>
                  )}
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Quick Actions */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <button className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-200">
                      <svg className="w-4 h-4 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>

                  {/* Sale Badge */}
                  {product.originalPrice && product.originalPrice > product.price && (
                    <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 text-xs font-light tracking-widest uppercase">
                      SALE
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4 space-y-3">
                  <h3 className="font-light text-white text-sm tracking-wide line-clamp-2 leading-relaxed group-hover:text-gray-300 transition-colors">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <p className="text-white font-light text-sm">
                        ${product.price}
                      </p>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <p className="text-gray-400 line-through text-sm font-light">
                          ${product.originalPrice}
                        </p>
                      )}
                    </div>
                    
                    {/* Rating */}
                    <div className="flex items-center space-x-1">
                      <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-xs text-gray-400 font-light">4.8</span>
                    </div>
                  </div>
                  
                  {/* Color variants */}
                  {product.colors && product.colors.length > 0 && (
                    <div className="flex space-x-2 pt-2">
                      {product.colors.slice(0, 4).map((color, index) => (
                        <div
                          key={index}
                          className="w-3 h-3 rounded-full border border-gray-600 shadow-sm"
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        />
                      ))}
                      {product.colors.length > 4 && (
                        <div className="text-xs text-gray-400 font-light">
                          +{product.colors.length - 4}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Hover Border Effect */}
                <div className="absolute inset-0 border border-transparent group-hover:border-gray-400 transition-all duration-500 pointer-events-none"></div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LatestCollections;