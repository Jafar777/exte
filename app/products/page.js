// app/products/page.js
'use client';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard';

// ProductsPageContent component that uses useSearchParams
function ProductsPageContent() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    subCategory: '',
    collection: '',
    priceRange: [0, 1000],
    sizes: [],
    colors: [],
    sort: 'newest',
    search: ''
  });
  
  const searchParams = useSearchParams();
  const router = useRouter();

  // Available filter options
  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '38', '40', '42', '44', '46'];
  const colorOptions = [
    { name: 'Black', hex: '#000000' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Gray', hex: '#808080' },
    { name: 'Navy', hex: '#000080' },
    { name: 'Beige', hex: '#F5F5DC' },
    { name: 'Brown', hex: '#A52A2A' },
    { name: 'Green', hex: '#008000' },
    { name: 'Blue', hex: '#0000FF' },
    { name: 'Red', hex: '#FF0000' },
    { name: 'Pink', hex: '#FFC0CB' }
  ];
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'name', label: 'Name: A to Z' }
  ];

  useEffect(() => {
    // Initialize filters from URL
    const initialFilters = {
      category: searchParams.get('category') || '',
      subCategory: searchParams.get('subCategory') || '',
      collection: searchParams.get('collection') || '',
      priceRange: [
        parseInt(searchParams.get('minPrice')) || 0,
        parseInt(searchParams.get('maxPrice')) || 1000
      ],
      sizes: searchParams.get('sizes')?.split(',') || [],
      colors: searchParams.get('colors')?.split(',') || [],
      sort: searchParams.get('sort') || 'newest',
      search: searchParams.get('search') || ''
    };
    
    setFilters(initialFilters);
    fetchData(initialFilters);
    fetchFilterOptions();
  }, [searchParams]);

  const fetchFilterOptions = async () => {
    try {
      const [categoriesRes, subCategoriesRes, collectionsRes] = await Promise.all([
        fetch('/api/categories?activeOnly=true'),
        fetch('/api/subcategories?activeOnly=true'),
        fetch('/api/collections?activeOnly=true')
      ]);

      if (categoriesRes.ok) setCategories(await categoriesRes.json());
      if (subCategoriesRes.ok) setSubCategories(await subCategoriesRes.json());
      if (collectionsRes.ok) setCollections(await collectionsRes.json());
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const fetchData = useCallback(async (currentFilters) => {
    try {
      setLoading(true);
      
      // Build query string from filters
      const params = new URLSearchParams();
      
      if (currentFilters.category) params.append('category', currentFilters.category);
      if (currentFilters.subCategory) params.append('subCategory', currentFilters.subCategory);
      if (currentFilters.collection) params.append('collection', currentFilters.collection);
      if (currentFilters.search) params.append('search', currentFilters.search);
      if (currentFilters.sizes.length > 0) params.append('sizes', currentFilters.sizes.join(','));
      if (currentFilters.colors.length > 0) params.append('colors', currentFilters.colors.join(','));
      if (currentFilters.priceRange[0] > 0) params.append('minPrice', currentFilters.priceRange[0]);
      if (currentFilters.priceRange[1] < 1000) params.append('maxPrice', currentFilters.priceRange[1]);
      if (currentFilters.sort !== 'newest') params.append('sort', currentFilters.sort);

      const response = await fetch(`/api/products?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateFilters = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    
    // Update URL with new filters
    const params = new URLSearchParams();
    
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value && key !== 'priceRange') {
        if (Array.isArray(value)) {
          if (value.length > 0) params.append(key, value.join(','));
        } else {
          params.append(key, value);
        }
      }
    });
    
    // Add price range separately
    if (updatedFilters.priceRange[0] > 0) params.append('minPrice', updatedFilters.priceRange[0]);
    if (updatedFilters.priceRange[1] < 1000) params.append('maxPrice', updatedFilters.priceRange[1]);
    
    router.push(`/products?${params.toString()}`, { scroll: false });
  };

  const handleFilterChange = (key, value) => {
    updateFilters({ [key]: value });
  };

  const handleArrayFilterChange = (key, item) => {
    const currentArray = filters[key];
    const newArray = currentArray.includes(item)
      ? currentArray.filter(i => i !== item)
      : [...currentArray, item];
    
    updateFilters({ [key]: newArray });
  };

  const clearFilters = () => {
    updateFilters({
      category: '',
      subCategory: '',
      collection: '',
      priceRange: [0, 1000],
      sizes: [],
      colors: [],
      sort: 'newest',
      search: ''
    });
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'priceRange') return value[0] > 0 || value[1] < 1000;
    if (Array.isArray(value)) return value.length > 0;
    return value && value !== 'newest';
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-light tracking-wider text-gray-900 uppercase">Products</h1>
              <p className="text-gray-600 mt-2 font-light">
                Discover our curated collection of premium clothing
              </p>
            </div>
            
            {/* Search and Sort */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-900 font-light text-sm w-64"
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-900 font-light text-sm"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="sticky top-8 space-y-8">
              {/* Filter Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-light tracking-wide text-gray-900">FILTERS</h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm font-light text-gray-500 hover:text-gray-700"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Categories */}
              <div>
                <h4 className="text-sm font-light text-gray-700 mb-3 tracking-wide">CATEGORIES</h4>
                <div className="space-y-2">
                  {categories.map(category => (
                    <label key={category._id} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="category"
                        value={category._id}
                        checked={filters.category === category._id}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="text-gray-900 focus:ring-gray-900"
                      />
                      <span className="text-sm font-light text-gray-600">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* SubCategories */}
              {filters.category && (
                <div>
                  <h4 className="text-sm font-light text-gray-700 mb-3 tracking-wide">SUBCATEGORIES</h4>
                  <div className="space-y-2">
                    {subCategories
                      .filter(sub => sub.category === filters.category)
                      .map(subCategory => (
                        <label key={subCategory._id} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="subCategory"
                            value={subCategory._id}
                            checked={filters.subCategory === subCategory._id}
                            onChange={(e) => handleFilterChange('subCategory', e.target.value)}
                            className="text-gray-900 focus:ring-gray-900"
                          />
                          <span className="text-sm font-light text-gray-600">{subCategory.name}</span>
                        </label>
                      ))}
                  </div>
                </div>
              )}

              {/* Collections */}
              <div>
                <h4 className="text-sm font-light text-gray-700 mb-3 tracking-wide">COLLECTIONS</h4>
                <div className="space-y-2">
                  {collections.map(collection => (
                    <label key={collection._id} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="collection"
                        value={collection._id}
                        checked={filters.collection === collection._id}
                        onChange={(e) => handleFilterChange('collection', e.target.value)}
                        className="text-gray-900 focus:ring-gray-900"
                      />
                      <span className="text-sm font-light text-gray-600">{collection.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="text-sm font-light text-gray-700 mb-3 tracking-wide">PRICE RANGE</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm font-light text-gray-600">
                    <span>${filters.priceRange[0]}</span>
                    <span>${filters.priceRange[1]}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="10"
                    value={filters.priceRange[1]}
                    onChange={(e) => updateFilters({ priceRange: [filters.priceRange[0], parseInt(e.target.value)] })}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Sizes */}
              <div>
                <h4 className="text-sm font-light text-gray-700 mb-3 tracking-wide">SIZES</h4>
                <div className="grid grid-cols-3 gap-2">
                  {sizeOptions.map(size => (
                    <label key={size} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        value={size}
                        checked={filters.sizes.includes(size)}
                        onChange={() => handleArrayFilterChange('sizes', size)}
                        className="text-gray-900 focus:ring-gray-900"
                      />
                      <span className="text-sm font-light text-gray-600">{size}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div>
                <h4 className="text-sm font-light text-gray-700 mb-3 tracking-wide">COLORS</h4>
                <div className="grid grid-cols-4 gap-3">
                  {colorOptions.map(color => (
                    <button
                      key={color.name}
                      onClick={() => handleArrayFilterChange('colors', color.name)}
                      className={`w-8 h-8 rounded-full border-2 ${
                        filters.colors.includes(color.name) ? 'border-gray-900' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Results Count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm font-light text-gray-600">
                {products.length} {products.length === 1 ? 'product' : 'products'} found
              </p>
              
              {/* Active Filters */}
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2">
                  {filters.category && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-light bg-gray-100 text-gray-700">
                      Category: {categories.find(c => c._id === filters.category)?.name}
                      <button
                        onClick={() => handleFilterChange('category', '')}
                        className="ml-2 hover:text-gray-900"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  
                  {filters.sizes.map(size => (
                    <span key={size} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-light bg-gray-100 text-gray-700">
                      Size: {size}
                      <button
                        onClick={() => handleArrayFilterChange('sizes', size)}
                        className="ml-2 hover:text-gray-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  
                  {filters.colors.map(color => (
                    <span key={color} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-light bg-gray-100 text-gray-700">
                      Color: {color}
                      <button
                        onClick={() => handleArrayFilterChange('colors', color)}
                        className="ml-2 hover:text-gray-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 aspect-[3/4] mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-gray-500 font-light tracking-wide mb-4">No products found matching your criteria</p>
                <button
                  onClick={clearFilters}
                  className="border border-gray-900 px-6 py-3 text-sm font-light tracking-wide text-gray-900 hover:bg-gray-900 hover:text-white transition-colors duration-200"
                >
                  CLEAR FILTERS
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading component for Suspense fallback
function ProductsLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="h-10 bg-gray-200 rounded w-64 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-64 flex-shrink-0">
            <div className="space-y-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  <div className="space-y-2">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="h-3 bg-gray-200 rounded animate-pulse"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 aspect-[3/4] mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductsPageContent />
    </Suspense>
  );
}