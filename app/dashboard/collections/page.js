// app/dashboard/collections/page.js
'use client';
import { useState, useEffect } from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import Image from 'next/image';

export default function CollectionsPage() {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form states
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    subCategory: '',
    collection: '',
    sizes: [],
    colors: [],
    images: [],
    tags: '',
    isFeatured: false
  });
  
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    image: ''
  });
  
  const [subCategoryForm, setSubCategoryForm] = useState({
    name: '',
    description: '',
    category: '',
    image: ''
  });
  
  const [collectionForm, setCollectionForm] = useState({
    name: '',
    description: '',
    image: '',
    season: 'All Season',
    year: new Date().getFullYear(),
    featured: false
  });

  // Size and color management
  const [currentSize, setCurrentSize] = useState({ size: '', stock: 0 });
  const [currentColor, setCurrentColor] = useState({ name: '', hex: '#000000', images: [] });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes, subCategoriesRes, collectionsRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
        fetch('/api/subcategories'),
        fetch('/api/collections')
      ]);

      if (productsRes.ok) setProducts(await productsRes.json());
      if (categoriesRes.ok) setCategories(await categoriesRes.json());
      if (subCategoriesRes.ok) setSubCategories(await subCategoriesRes.json());
      if (collectionsRes.ok) setCollections(await collectionsRes.json());
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch data' });
    } finally {
      setLoading(false);
    }
  };

  // Product Management
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (productForm.images.length === 0) {
      setMessage({ type: 'error', text: 'At least one product image is required' });
      setLoading(false);
      return;
    }

    if (!productForm.category) {
      setMessage({ type: 'error', text: 'Category is required' });
      setLoading(false);
      return;
    }

    try {
      const productData = {
        ...productForm,
        subCategory: productForm.subCategory || undefined,
        collection: productForm.collection || undefined,
        tags: productForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        price: parseFloat(productForm.price),
        originalPrice: productForm.originalPrice ? parseFloat(productForm.originalPrice) : undefined,
        featuredImage: productForm.images[0]
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Product created successfully!' });
        setProductForm({
          name: '', description: '', price: '', originalPrice: '', category: '', 
          subCategory: '', collection: '', sizes: [], colors: [], images: [], tags: '', isFeatured: false
        });
        fetchData();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to create product' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred' });
    } finally {
      setLoading(false);
    }
  };

  // Category Management
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Category created successfully!' });
        setCategoryForm({ name: '', description: '', image: '' });
        fetchData();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to create category' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred' });
    } finally {
      setLoading(false);
    }
  };

  // SubCategory Management
  const handleSubCategorySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/subcategories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subCategoryForm)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'SubCategory created successfully!' });
        setSubCategoryForm({ name: '', description: '', category: '', image: '' });
        fetchData();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to create subcategory' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred' });
    } finally {
      setLoading(false);
    }
  };

  // Collection Management
  const handleCollectionSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(collectionForm)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Collection created successfully!' });
        setCollectionForm({ 
          name: '', description: '', image: '', season: 'All Season', 
          year: new Date().getFullYear(), featured: false 
        });
        fetchData();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to create collection' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred' });
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for sizes and colors
  const addSize = () => {
    if (currentSize.size && currentSize.stock >= 0) {
      setProductForm(prev => ({
        ...prev,
        sizes: [...prev.sizes, { ...currentSize }]
      }));
      setCurrentSize({ size: '', stock: 0 });
    }
  };

  const removeSize = (index) => {
    setProductForm(prev => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index)
    }));
  };

  const addColor = () => {
    if (currentColor.name && currentColor.hex) {
      setProductForm(prev => ({
        ...prev,
        colors: [...prev.colors, { ...currentColor }]
      }));
      setCurrentColor({ name: '', hex: '#000000', images: [] });
    }
  };

  const removeColor = (index) => {
    setProductForm(prev => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = (result, type) => {
    if (result.event === 'success') {
      const imageUrl = result.info.secure_url;
      
      switch (type) {
        case 'product':
          setProductForm(prev => ({ ...prev, images: [...prev.images, imageUrl] }));
          break;
        case 'category':
          setCategoryForm(prev => ({ ...prev, image: imageUrl }));
          break;
        case 'subcategory':
          setSubCategoryForm(prev => ({ ...prev, image: imageUrl }));
          break;
        case 'collection':
          setCollectionForm(prev => ({ ...prev, image: imageUrl }));
          break;
        case 'color':
          setCurrentColor(prev => ({ ...prev, images: [...prev.images, imageUrl] }));
          break;
      }
      
      setMessage({ type: 'success', text: 'Image uploaded successfully!' });
    }
  };

  const removeImage = (index, type) => {
    switch (type) {
      case 'product':
        setProductForm(prev => ({
          ...prev,
          images: prev.images.filter((_, i) => i !== index)
        }));
        break;
      case 'color':
        setCurrentColor(prev => ({
          ...prev,
          images: prev.images.filter((_, i) => i !== index)
        }));
        break;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-4 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-light tracking-wider text-gray-900 uppercase">
          Product Management
        </h1>
        <p className="text-gray-600 mt-2 font-light text-sm sm:text-base">
          Manage products, categories, subcategories, and collections
        </p>
      </div>

      {/* Tab Navigation - Horizontal scroll on mobile */}
      <div className="border-b border-gray-200 mb-6 sm:mb-8">
        <nav className="flex space-x-4 sm:space-x-8 overflow-x-auto pb-2 -mb-px">
          {['products', 'categories', 'subcategories', 'collections'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-light text-xs sm:text-sm tracking-wide transition-colors duration-200 whitespace-nowrap ${
                activeTab === tab
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </nav>
      </div>

      {message.text && (
        <div className={`mb-6 sm:mb-8 p-4 border-l-4 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border-green-400' 
            : 'bg-red-50 text-red-800 border-red-400'
        }`}>
          <span className="font-medium text-sm sm:text-base">{message.text}</span>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
          {/* Product Form */}
          <div className="bg-white p-4 sm:p-6 border border-gray-200">
            <h2 className="text-lg sm:text-xl font-light tracking-wide text-gray-900 mb-4 sm:mb-6">
              ADD NEW PRODUCT
            </h2>
            
            <form onSubmit={handleProductSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-xs sm:text-sm font-light text-gray-700 mb-2 tracking-wide">
                  PRODUCT NAME
                </label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-none focus:outline-none focus:border-gray-900 transition-colors bg-white font-light text-sm sm:text-base"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-light text-gray-700 mb-2 tracking-wide">
                  DESCRIPTION
                </label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                  rows="3"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-none focus:outline-none focus:border-gray-900 transition-colors bg-white font-light text-sm sm:text-base"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-light text-gray-700 mb-2 tracking-wide">
                    PRICE ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-none focus:outline-none focus:border-gray-900 transition-colors bg-white font-light text-sm sm:text-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-light text-gray-700 mb-2 tracking-wide">
                    ORIGINAL PRICE ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.originalPrice}
                    onChange={(e) => setProductForm(prev => ({ ...prev, originalPrice: e.target.value }))}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-none focus:outline-none focus:border-gray-900 transition-colors bg-white font-light text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* Category Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-light text-gray-700 mb-2 tracking-wide">
                    CATEGORY
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value, subCategory: '' }))}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-none focus:outline-none focus:border-gray-900 transition-colors bg-white font-light text-sm sm:text-base"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-light text-gray-700 mb-2 tracking-wide">
                    SUBCATEGORY
                  </label>
                  <select
                    value={productForm.subCategory}
                    onChange={(e) => setProductForm(prev => ({ ...prev, subCategory: e.target.value }))}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-none focus:outline-none focus:border-gray-900 transition-colors bg-white font-light text-sm sm:text-base"
                  >
                    <option value="">Select Subcategory</option>
                    {subCategories
                      .filter(sub => sub.category === productForm.category)
                      .map(sub => (
                        <option key={sub._id} value={sub._id}>{sub.name}</option>
                      ))
                    }
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-light text-gray-700 mb-2 tracking-wide">
                  COLLECTION
                </label>
                <select
                  value={productForm.collection}
                  onChange={(e) => setProductForm(prev => ({ ...prev, collection: e.target.value }))}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-none focus:outline-none focus:border-gray-900 transition-colors bg-white font-light text-sm sm:text-base"
                >
                  <option value="">Select Collection</option>
                  {collections.map(col => (
                    <option key={col._id} value={col._id}>{col.name}</option>
                  ))}
                </select>
              </div>

              {/* Sizes Management */}
              <div>
                <label className="block text-xs sm:text-sm font-light text-gray-700 mb-2 tracking-wide">
                  SIZES & STOCK
                </label>
                <div className="flex flex-col sm:flex-row gap-2 mb-3 sm:mb-4">
                  <select
                    value={currentSize.size}
                    onChange={(e) => setCurrentSize(prev => ({ ...prev, size: e.target.value }))}
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-none focus:outline-none focus:border-gray-900 transition-colors bg-white font-light text-sm sm:text-base"
                  >
                    <option value="">Select Size</option>
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '36', '38', '40', '42', '44', '46'].map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Stock"
                    value={currentSize.stock}
                    onChange={(e) => setCurrentSize(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                    className="w-full sm:w-24 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-none focus:outline-none focus:border-gray-900 transition-colors bg-white font-light text-sm sm:text-base"
                  />
                  <button
                    type="button"
                    onClick={addSize}
                    className="px-4 py-2 sm:py-3 border border-gray-900 bg-white text-gray-900 font-light text-xs sm:text-sm tracking-wide hover:bg-gray-900 hover:text-white transition-colors duration-200"
                  >
                    ADD
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {productForm.sizes.map((size, index) => (
                    <div key={index} className="flex items-center gap-2 bg-gray-100 px-2 sm:px-3 py-1 sm:py-2">
                      <span className="text-xs sm:text-sm font-light">{size.size} (Stock: {size.stock})</span>
                      <button
                        type="button"
                        onClick={() => removeSize(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Colors Management */}
              <div>
                <label className="block text-xs sm:text-sm font-light text-gray-700 mb-2 tracking-wide">
                  COLORS
                </label>
                <div className="flex flex-col sm:flex-row gap-2 mb-3 sm:mb-4">
                  <input
                    type="text"
                    placeholder="Color Name"
                    value={currentColor.name}
                    onChange={(e) => setCurrentColor(prev => ({ ...prev, name: e.target.value }))}
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-none focus:outline-none focus:border-gray-900 transition-colors bg-white font-light text-sm sm:text-base"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={currentColor.hex}
                      onChange={(e) => setCurrentColor(prev => ({ ...prev, hex: e.target.value }))}
                      className="w-10 h-10 sm:w-16 sm:h-12 px-1 sm:px-2 border border-gray-300 rounded-none focus:outline-none focus:border-gray-900 transition-colors bg-white"
                    />
                    <button
                      type="button"
                      onClick={addColor}
                      className="flex-1 sm:flex-none px-4 py-2 sm:py-3 border border-gray-900 bg-white text-gray-900 font-light text-xs sm:text-sm tracking-wide hover:bg-gray-900 hover:text-white transition-colors duration-200"
                    >
                      ADD
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
                  {productForm.colors.map((color, index) => (
                    <div key={index} className="flex items-center gap-2 bg-gray-100 px-2 sm:px-3 py-1 sm:py-2">
                      <div 
                        className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: color.hex }}
                      ></div>
                      <span className="text-xs sm:text-sm font-light">{color.name}</span>
                      <button
                        type="button"
                        onClick={() => removeColor(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Images */}
              <div>
                <label className="block text-xs sm:text-sm font-light text-gray-700 mb-2 tracking-wide">
                  PRODUCT IMAGES
                </label>
                <CldUploadWidget
                  uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                  onSuccess={(result) => handleImageUpload(result, 'product')}
                >
                  {({ open }) => (
                    <button
                      type="button"
                      onClick={() => open()}
                      className="w-full px-4 sm:px-6 py-2 sm:py-3 border border-gray-900 bg-white text-gray-900 font-light text-xs sm:text-sm tracking-wide hover:bg-gray-900 hover:text-white transition-colors duration-200 mb-3 sm:mb-4"
                    >
                      UPLOAD PRODUCT IMAGES
                    </button>
                  )}
                </CldUploadWidget>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {productForm.images.map((image, index) => (
                    <div key={index} className="relative">
                      <Image
                        src={image}
                        alt={`Product ${index + 1}`}
                        width={80}
                        height={80}
                        className="object-cover border border-gray-300 w-full h-auto"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index, 'product')}
                        className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-light text-gray-700 mb-2 tracking-wide">
                  TAGS (comma separated)
                </label>
                <input
                  type="text"
                  value={productForm.tags}
                  onChange={(e) => setProductForm(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="summer, casual, cotton"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-none focus:outline-none focus:border-gray-900 transition-colors bg-white font-light text-sm sm:text-base"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={productForm.isFeatured}
                  onChange={(e) => setProductForm(prev => ({ ...prev, isFeatured: e.target.checked }))}
                  className="w-4 h-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
                />
                <label htmlFor="isFeatured" className="text-xs sm:text-sm font-light text-gray-700">
                  FEATURED PRODUCT
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 sm:px-8 py-3 sm:py-4 bg-gray-900 text-white font-light tracking-wide hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-900 text-sm sm:text-base"
              >
                {loading ? 'CREATING PRODUCT...' : 'CREATE PRODUCT'}
              </button>
            </form>
          </div>

          {/* Products List */}
          <div className="bg-white p-4 sm:p-6 border border-gray-200">
            <h2 className="text-lg sm:text-xl font-light tracking-wide text-gray-900 mb-4 sm:mb-6">
              PRODUCTS ({products.length})
            </h2>
            <div className="space-y-3 sm:space-y-4 max-h-[600px] overflow-y-auto">
              {products.map(product => (
                <div key={product._id} className="border border-gray-200 p-3 sm:p-4">
                  <div className="flex items-start gap-3 sm:gap-4">
                    {product.featuredImage && (
                      <div className="flex-shrink-0">
                        <Image
                          src={product.featuredImage}
                          alt={product.name}
                          width={60}
                          height={60}
                          className="object-cover border border-gray-300"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-light text-gray-900 text-sm sm:text-base truncate">{product.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 font-light">${product.price}</p>
                      <p className="text-xs text-gray-500 font-light">
                        {product.sizes?.length || 0} sizes • {product.colors?.length || 0} colors
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={`text-xs px-2 py-1 ${
                        product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
          {/* Category Form */}
          <div className="bg-white p-4 sm:p-6 border border-gray-200">
            <h2 className="text-lg sm:text-xl font-light tracking-wide text-gray-900 mb-4 sm:mb-6">
              ADD NEW CATEGORY
            </h2>
            
            <form onSubmit={handleCategorySubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-xs sm:text-sm font-light text-gray-700 mb-2 tracking-wide">
                  CATEGORY NAME
                </label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-none focus:outline-none focus:border-gray-900 transition-colors bg-white font-light text-sm sm:text-base"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-light text-gray-700 mb-2 tracking-wide">
                  DESCRIPTION
                </label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                  rows="3"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-none focus:outline-none focus:border-gray-900 transition-colors bg-white font-light text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-light text-gray-700 mb-2 tracking-wide">
                  CATEGORY IMAGE
                </label>
                <CldUploadWidget
                  uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                  onSuccess={(result) => handleImageUpload(result, 'category')}
                >
                  {({ open }) => (
                    <button
                      type="button"
                      onClick={() => open()}
                      className="w-full px-4 sm:px-6 py-2 sm:py-3 border border-gray-900 bg-white text-gray-900 font-light text-xs sm:text-sm tracking-wide hover:bg-gray-900 hover:text-white transition-colors duration-200 mb-3 sm:mb-4"
                    >
                      UPLOAD CATEGORY IMAGE
                    </button>
                  )}
                </CldUploadWidget>
                {categoryForm.image && (
                  <div className="mt-2">
                    <Image
                      src={categoryForm.image}
                      alt="Category"
                      width={80}
                      height={80}
                      className="object-cover border border-gray-300"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 sm:px-8 py-3 sm:py-4 bg-gray-900 text-white font-light tracking-wide hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-900 text-sm sm:text-base"
              >
                {loading ? 'CREATING CATEGORY...' : 'CREATE CATEGORY'}
              </button>
            </form>
          </div>

          {/* Categories List */}
          <div className="bg-white p-4 sm:p-6 border border-gray-200">
            <h2 className="text-lg sm:text-xl font-light tracking-wide text-gray-900 mb-4 sm:mb-6">
              CATEGORIES ({categories.length})
            </h2>
            <div className="space-y-3 sm:space-y-4">
              {categories.map(category => (
                <div key={category._id} className="border border-gray-200 p-3 sm:p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 sm:gap-4">
                    {category.image && (
                      <div className="flex-shrink-0">
                        <Image
                          src={category.image}
                          alt={category.name}
                          width={50}
                          height={50}
                          className="object-cover border border-gray-300"
                        />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-light text-gray-900 text-sm sm:text-base truncate">{category.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 font-light truncate">{category.description}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 flex-shrink-0 ${
                    category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {category.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SubCategories Tab */}
      {activeTab === 'subcategories' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
          {/* SubCategory Form */}
          <div className="bg-white p-4 sm:p-6 border border-gray-200">
            <h2 className="text-lg sm:text-xl font-light tracking-wide text-gray-900 mb-4 sm:mb-6">
              ADD NEW SUBCATEGORY
            </h2>
            
            <form onSubmit={handleSubCategorySubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-xs sm:text-sm font-light text-gray-700 mb-2 tracking-wide">
                  PARENT CATEGORY
                </label>
                <select
                  value={subCategoryForm.category}
                  onChange={(e) => setSubCategoryForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-none focus:outline-none focus:border-gray-900 transition-colors bg-white font-light text-sm sm:text-base"
                  required
                >
                  <option value="">Select Parent Category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-light text-gray-700 mb-2 tracking-wide">
                  SUBCATEGORY NAME
                </label>
                <input
                  type="text"
                  value={subCategoryForm.name}
                  onChange={(e) => setSubCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-none focus:outline-none focus:border-gray-900 transition-colors bg-white font-light text-sm sm:text-base"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-light text-gray-700 mb-2 tracking-wide">
                  DESCRIPTION
                </label>
                <textarea
                  value={subCategoryForm.description}
                  onChange={(e) => setSubCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                  rows="3"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-none focus:outline-none focus:border-gray-900 transition-colors bg-white font-light text-sm sm:text-base"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 sm:px-8 py-3 sm:py-4 bg-gray-900 text-white font-light tracking-wide hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-900 text-sm sm:text-base"
              >
                {loading ? 'CREATING SUBCATEGORY...' : 'CREATE SUBCATEGORY'}
              </button>
            </form>
          </div>

          {/* SubCategories List */}
          <div className="bg-white p-4 sm:p-6 border border-gray-200">
            <h2 className="text-lg sm:text-xl font-light tracking-wide text-gray-900 mb-4 sm:mb-6">
              SUBCATEGORIES ({subCategories.length})
            </h2>
            <div className="space-y-3 sm:space-y-4">
              {subCategories.map(subCategory => {
                const parentCategory = categories.find(cat => cat._id === subCategory.category);
                return (
                  <div key={subCategory._id} className="border border-gray-200 p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <h3 className="font-light text-gray-900 text-sm sm:text-base truncate">{subCategory.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-600 font-light">
                          Parent: {parentCategory?.name || 'Unknown'}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 font-light truncate">{subCategory.description}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 flex-shrink-0 ${
                        subCategory.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {subCategory.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Collections Tab */}
      {activeTab === 'collections' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
          {/* Collection Form */}
          <div className="bg-white p-4 sm:p-6 border border-gray-200">
            <h2 className="text-lg sm:text-xl font-light tracking-wide text-gray-900 mb-4 sm:mb-6">
              ADD NEW COLLECTION
            </h2>
            
            <form onSubmit={handleCollectionSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-xs sm:text-sm font-light text-gray-700 mb-2 tracking-wide">
                  COLLECTION NAME
                </label>
                <input
                  type="text"
                  value={collectionForm.name}
                  onChange={(e) => setCollectionForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-none focus:outline-none focus:border-gray-900 transition-colors bg-white font-light text-sm sm:text-base"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-light text-gray-700 mb-2 tracking-wide">
                  DESCRIPTION
                </label>
                <textarea
                  value={collectionForm.description}
                  onChange={(e) => setCollectionForm(prev => ({ ...prev, description: e.target.value }))}
                  rows="3"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-none focus:outline-none focus:border-gray-900 transition-colors bg-white font-light text-sm sm:text-base"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-light text-gray-700 mb-2 tracking-wide">
                    SEASON
                  </label>
                  <select
                    value={collectionForm.season}
                    onChange={(e) => setCollectionForm(prev => ({ ...prev, season: e.target.value }))}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-none focus:outline-none focus:border-gray-900 transition-colors bg-white font-light text-sm sm:text-base"
                  >
                    {['Spring', 'Summer', 'Fall', 'Winter', 'All Season', 'Holiday', 'Resort'].map(season => (
                      <option key={season} value={season}>{season}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-light text-gray-700 mb-2 tracking-wide">
                    YEAR
                  </label>
                  <input
                    type="number"
                    value={collectionForm.year}
                    onChange={(e) => setCollectionForm(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-none focus:outline-none focus:border-gray-900 transition-colors bg-white font-light text-sm sm:text-base"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-light text-gray-700 mb-2 tracking-wide">
                  COLLECTION IMAGE
                </label>
                <CldUploadWidget
                  uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                  onSuccess={(result) => handleImageUpload(result, 'collection')}
                >
                  {({ open }) => (
                    <button
                      type="button"
                      onClick={() => open()}
                      className="w-full px-4 sm:px-6 py-2 sm:py-3 border border-gray-900 bg-white text-gray-900 font-light text-xs sm:text-sm tracking-wide hover:bg-gray-900 hover:text-white transition-colors duration-200 mb-3 sm:mb-4"
                    >
                      UPLOAD COLLECTION IMAGE
                    </button>
                  )}
                </CldUploadWidget>
                {collectionForm.image && (
                  <div className="mt-2">
                    <Image
                      src={collectionForm.image}
                      alt="Collection"
                      width={80}
                      height={80}
                      className="object-cover border border-gray-300"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={collectionForm.featured}
                  onChange={(e) => setCollectionForm(prev => ({ ...prev, featured: e.target.checked }))}
                  className="w-4 h-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
                />
                <label htmlFor="featured" className="text-xs sm:text-sm font-light text-gray-700">
                  FEATURED COLLECTION
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 sm:px-8 py-3 sm:py-4 bg-gray-900 text-white font-light tracking-wide hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-900 text-sm sm:text-base"
              >
                {loading ? 'CREATING COLLECTION...' : 'CREATE COLLECTION'}
              </button>
            </form>
          </div>

          {/* Collections List */}
          <div className="bg-white p-4 sm:p-6 border border-gray-200">
            <h2 className="text-lg sm:text-xl font-light tracking-wide text-gray-900 mb-4 sm:mb-6">
              COLLECTIONS ({collections.length})
            </h2>
            <div className="space-y-3 sm:space-y-4">
              {collections.map(collection => (
                <div key={collection._id} className="border border-gray-200 p-3 sm:p-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    {collection.image && (
                      <div className="flex-shrink-0">
                        <Image
                          src={collection.image}
                          alt={collection.name}
                          width={50}
                          height={50}
                          className="object-cover border border-gray-300"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-light text-gray-900 text-sm sm:text-base truncate">{collection.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 font-light truncate">{collection.description}</p>
                      <p className="text-xs text-gray-500 font-light">
                        {collection.season} {collection.year}
                        {collection.featured && ' • Featured'}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 flex-shrink-0 ${
                      collection.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {collection.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}