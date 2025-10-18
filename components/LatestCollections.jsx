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
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="h-80 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-light tracking-wider text-gray-900 uppercase">
              {latestCollection ? latestCollection.name : 'Featured Collection'}
            </h2>
            {latestCollection && (
              <p className="text-gray-600 mt-2 font-light tracking-wide">
                {latestCollection.description}
              </p>
            )}
          </div>
          <Link 
            href="/products" 
            className="border border-gray-900 px-6 py-3 text-sm font-light tracking-wide text-gray-900 hover:bg-gray-900 hover:text-white transition-colors duration-200"
          >
            VIEW ALL
          </Link>
        </div>

        {/* Featured Products Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <div key={product._id} className="group">
              <Link href={`/products/${product._id}`}>
                <div className="relative overflow-hidden bg-gray-100 aspect-[3/4] mb-4">
                  {product.featuredImage ? (
                    <Image
                      src={product.featuredImage}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-sm font-light">No Image</span>
                    </div>
                  )}
                  
                  {/* Quick Actions */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button className="bg-white p-2 rounded-full shadow-md hover:bg-gray-50 transition-colors">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-light text-gray-900 text-sm tracking-wide line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 font-light text-sm">
                    ${product.price}
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-gray-400 line-through ml-2">${product.originalPrice}</span>
                    )}
                  </p>
                  
                  {/* Color variants */}
                  {product.colors && product.colors.length > 0 && (
                    <div className="flex space-x-1 mt-2">
                      {product.colors.slice(0, 3).map((color, index) => (
                        <div
                          key={index}
                          className="w-3 h-3 rounded-full border border-gray-300"
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        />
                      ))}
                      {product.colors.length > 3 && (
                        <div className="text-xs text-gray-500 font-light">
                          +{product.colors.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>

        
      </div>
    </section>
  );
};

export default LatestCollections;