import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Upload, AlertCircle, RefreshCw, Trash2, Eye } from 'lucide-react';
import { API } from '../context/AuthContext';
import { getImageUrl } from '../utils/image';

const AdminProductForm = () => {
  const { id } = useParams(); // Holds product ID if editing
  const navigate = useNavigate();
  const isEditMode = !!id;

  // Component States
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [comparePrice, setComparePrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [weight, setWeight] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [secondaryImageUrl, setSecondaryImageUrl] = useState('');
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [images, setImages] = useState([]);
  const [description, setDescription] = useState('');
  const [howToUse, setHowToUse] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');

  // Image Uploading States
  const [uploadingPrimary, setUploadingPrimary] = useState(false);
  const [uploadingSecondary, setUploadingSecondary] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  // Load categories and product details (if editing)
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch categories first
        const catRes = await API.get('/products/categories');
        setCategories(catRes.data);

        // Fetch product if editing
        if (isEditMode) {
          const prodRes = await API.get(`/products/${id}`);
          const product = prodRes.data;

          setName(product.name || '');
          setSku(product.sku || '');
          setPrice(product.price || '');
          setComparePrice(product.compare_price || '');
          setCategoryId(product.category_id || (product.category_ids && product.category_ids[0]) || '');
          setWeight(product.weight || '');
          setImageUrl(product.image_url || '');
          setSecondaryImageUrl(product.secondary_image_url || '');
          setIsBestSeller(!!product.is_best_seller);
          setIsNewArrival(!!product.is_new_arrival);
          setImages(product.images || []);
          setDescription(product.description || '');
          setHowToUse(product.details?.how_to_use || '');
          setIngredients(product.details?.ingredients || '');
          setMetaTitle(product.details?.meta_title || '');
          setMetaDescription(product.details?.meta_description || '');
          setMetaKeywords(product.details?.meta_keywords || '');
        }
      } catch (err) {
        console.error('Failed to load form initialization data:', err.message);
        setFormError('Failed to load product or categories. Please try refreshing.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, isEditMode]);

  const handleImageUpload = async (e, type = 'primary') => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'primary') setUploadingPrimary(true);
    else if (type === 'secondary') setUploadingSecondary(true);
    else if (type === 'gallery') setUploadingGallery(true);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await API.post('/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const uploadedUrl = res.data.imageUrl;

      if (type === 'secondary') {
        setSecondaryImageUrl(uploadedUrl);
      } else if (type === 'gallery') {
        setImages(prev => [...prev, uploadedUrl]);
      } else {
        setImageUrl(uploadedUrl);
      }
    } catch (err) {
      console.error('File upload failed:', err.message);
      setFormError('Failed to upload image. Make sure it is less than 50MB and in a valid image format.');
    } finally {
      setUploadingPrimary(false);
      setUploadingSecondary(false);
      setUploadingGallery(false);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!name.trim() || !description.trim() || !price || !categoryId) {
      setFormError('Please fill out all required fields. Select a category.');
      return;
    }

    setFormSubmitting(true);
    setFormError('');

    const payload = {
      name,
      description,
      price: parseFloat(price),
      compare_price: comparePrice ? parseFloat(comparePrice) : null,
      category_id: parseInt(categoryId),
      category_ids: [parseInt(categoryId)],
      sku: sku.trim() || null,
      image_url: imageUrl,
      secondary_image_url: secondaryImageUrl || imageUrl,
      images,
      is_best_seller: isBestSeller,
      is_new_arrival: isNewArrival,
      weight: weight.trim() || null,
      details: {
        how_to_use: howToUse,
        ingredients: ingredients,
        meta_title: metaTitle,
        meta_description: metaDescription,
        meta_keywords: metaKeywords
      }
    };

    try {
      if (isEditMode) {
        await API.put(`/admin/products/${id}`, payload);
      } else {
        await API.post('/admin/products', payload);
      }
      navigate('/products'); // Redirect back to product catalog on success
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Error saving product details.';
      const errDetail = err.response?.data?.error ? ` (${err.response.data.error})` : '';
      setFormError(`${errMsg}${errDetail}`);
    } finally {
      setFormSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <RefreshCw className="animate-spin text-brand-blue" size={32} />
        <p className="text-xs font-semibold text-brand-grey dark:text-zinc-400 uppercase tracking-wider font-heading">
          Loading formulation parameters...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-up">
      {/* Header and Back Link */}
      <div className="flex flex-col gap-2">
        <Link 
          to="/products"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-blue hover:text-brand-blue-dark uppercase tracking-wider font-heading transition-colors"
        >
          <ArrowLeft size={14} /> Back to Catalog
        </Link>
        <h1 className="text-xl sm:text-2xl font-black text-brand-dark dark:text-white uppercase tracking-tight font-heading">
          {isEditMode ? `Edit Formulation: ${name}` : 'Create New Formulation'}
        </h1>
        <p className="text-xs font-semibold text-brand-grey dark:text-zinc-400 uppercase tracking-wider font-heading">
          Fill in the details below to publish or update the product
        </p>
      </div>

      <form onSubmit={handleSaveProduct} className="bg-white dark:bg-zinc-900 border border-brand-border dark:border-zinc-800 rounded-xl p-6 sm:p-8 space-y-8 shadow-xs">
        {formError && (
          <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-brand-accent dark:text-red-400 text-xs font-semibold rounded-md flex items-center gap-2">
            <AlertCircle size={15} className="flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Product Name */}
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold text-brand-grey dark:text-zinc-400 uppercase tracking-wider mb-1">Product Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-brand-border dark:border-zinc-750 bg-white dark:bg-zinc-800 text-brand-dark dark:text-white rounded text-xs focus:outline-none focus:border-brand-blue"
              placeholder="e.g. Shadow SPF 50+ Gel"
            />
          </div>

          {/* SKU Code */}
          <div>
            <label className="block text-[10px] font-bold text-brand-grey dark:text-zinc-400 uppercase tracking-wider mb-1">SKU / Code</label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="w-full px-3 py-2 border border-brand-border dark:border-zinc-750 bg-white dark:bg-zinc-800 text-brand-dark dark:text-white rounded text-xs focus:outline-none focus:border-brand-blue"
              placeholder="e.g. SHD-SPF50-GEL"
            />
          </div>

          {/* Net Weight / Volume */}
          <div>
            <label className="block text-[10px] font-bold text-brand-grey dark:text-zinc-400 uppercase tracking-wider mb-1">Net Weight / Volume</label>
            <input
              type="text"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full px-3 py-2 border border-brand-border dark:border-zinc-750 bg-white dark:bg-zinc-800 text-brand-dark dark:text-white rounded text-xs focus:outline-none focus:border-brand-blue"
              placeholder="e.g. 50g or 100ml"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-[10px] font-bold text-brand-grey dark:text-zinc-400 uppercase tracking-wider mb-1">Selling Price (₹) *</label>
            <input
              type="number"
              step="0.01"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3 py-2 border border-brand-border dark:border-zinc-750 bg-white dark:bg-zinc-800 text-brand-dark dark:text-white rounded text-xs focus:outline-none focus:border-brand-blue"
              placeholder="e.g. 425.00"
            />
          </div>

          {/* Compare Price */}
          <div>
            <label className="block text-[10px] font-bold text-brand-grey dark:text-zinc-400 uppercase tracking-wider mb-1">Compare Price (₹)</label>
            <input
              type="number"
              step="0.01"
              value={comparePrice}
              onChange={(e) => setComparePrice(e.target.value)}
              className="w-full px-3 py-2 border border-brand-border dark:border-zinc-750 bg-white dark:bg-zinc-800 text-brand-dark dark:text-white rounded text-xs focus:outline-none focus:border-brand-blue"
              placeholder="e.g. 499.00"
            />
          </div>

          {/* Category Selector */}
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold text-brand-grey dark:text-zinc-400 uppercase tracking-wider mb-1">Category *</label>
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 border border-brand-border dark:border-zinc-750 bg-white dark:bg-zinc-800 text-brand-dark dark:text-white rounded text-xs focus:outline-none focus:border-brand-blue font-semibold"
            >
              <option value="">Select a category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Badges Checklist */}
          <div className="sm:col-span-2 flex gap-6 items-center pt-2 text-brand-dark dark:text-zinc-200">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold">
              <input
                type="checkbox"
                checked={isBestSeller}
                onChange={(e) => setIsBestSeller(e.target.checked)}
                className="rounded text-brand-blue focus:ring-brand-blue w-4 h-4 cursor-pointer"
              />
              <span>Best Seller</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold">
              <input
                type="checkbox"
                checked={isNewArrival}
                onChange={(e) => setIsNewArrival(e.target.checked)}
                className="rounded text-brand-blue focus:ring-brand-blue w-4 h-4 cursor-pointer"
              />
              <span>New Arrival</span>
            </label>
          </div>

          {/* Primary Image Upload & Preview */}
          <div className="sm:col-span-2 border-t border-brand-border/40 dark:border-zinc-800 pt-6 space-y-3">
            <span className="block text-[10px] font-bold text-brand-grey dark:text-zinc-400 uppercase tracking-wider">Primary Image *</span>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
              {/* Input & Upload */}
              <div className="md:col-span-3 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1 px-3 py-2 border border-brand-border dark:border-zinc-750 bg-white dark:bg-zinc-800 text-brand-dark dark:text-white rounded text-xs focus:outline-none focus:border-brand-blue"
                    placeholder="/assets/products/filename.jpg or external URL"
                  />
                  <label className="cursor-pointer shrink-0 flex items-center justify-center gap-1.5 py-2 px-4 bg-brand-bg-grey dark:bg-zinc-800 hover:bg-brand-blue-light dark:hover:bg-brand-blue/15 hover:text-brand-blue border border-brand-border dark:border-zinc-700 rounded text-xs font-bold transition-all text-brand-dark dark:text-zinc-200">
                    {uploadingPrimary ? <RefreshCw className="animate-spin" size={14} /> : <Upload size={14} />} 
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'primary')}
                      className="hidden"
                      disabled={uploadingPrimary}
                    />
                  </label>
                </div>
              </div>
              
              {/* Preview Box */}
              <div className="flex flex-col items-center justify-center p-2 border border-brand-border dark:border-zinc-800 rounded bg-brand-bg-grey/10 dark:bg-zinc-950/20 aspect-square w-24 mx-auto md:mx-0">
                {imageUrl ? (
                  <img 
                    src={getImageUrl(imageUrl)} 
                    alt="Primary preview" 
                    className="max-h-full max-w-full object-contain rounded"
                    onError={(e) => { e.target.src = '/assets/products/placeholder.png'; }}
                  />
                ) : (
                  <span className="text-[10px] text-brand-grey dark:text-zinc-500 font-semibold text-center leading-tight">No Preview</span>
                )}
              </div>
            </div>
          </div>

          {/* Secondary Image Upload & Preview */}
          <div className="sm:col-span-2 space-y-3">
            <span className="block text-[10px] font-bold text-brand-grey dark:text-zinc-400 uppercase tracking-wider">Secondary Image (Hover)</span>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
              {/* Input & Upload */}
              <div className="md:col-span-3 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={secondaryImageUrl}
                    onChange={(e) => setSecondaryImageUrl(e.target.value)}
                    className="flex-1 px-3 py-2 border border-brand-border dark:border-zinc-750 bg-white dark:bg-zinc-800 text-brand-dark dark:text-white rounded text-xs focus:outline-none focus:border-brand-blue"
                    placeholder="/assets/products/filename_secondary.jpg"
                  />
                  <label className="cursor-pointer shrink-0 flex items-center justify-center gap-1.5 py-2 px-4 bg-brand-bg-grey dark:bg-zinc-800 hover:bg-brand-blue-light dark:hover:bg-brand-blue/15 hover:text-brand-blue border border-brand-border dark:border-zinc-700 rounded text-xs font-bold transition-all text-brand-dark dark:text-zinc-200">
                    {uploadingSecondary ? <RefreshCw className="animate-spin" size={14} /> : <Upload size={14} />} 
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'secondary')}
                      className="hidden"
                      disabled={uploadingSecondary}
                    />
                  </label>
                </div>
              </div>

              {/* Preview Box */}
              <div className="flex flex-col items-center justify-center p-2 border border-brand-border dark:border-zinc-800 rounded bg-brand-bg-grey/10 dark:bg-zinc-950/20 aspect-square w-24 mx-auto md:mx-0">
                {secondaryImageUrl ? (
                  <img 
                    src={getImageUrl(secondaryImageUrl)} 
                    alt="Secondary preview" 
                    className="max-h-full max-w-full object-contain rounded"
                    onError={(e) => { e.target.src = '/assets/products/placeholder.png'; }}
                  />
                ) : (
                  <span className="text-[10px] text-brand-grey dark:text-zinc-500 font-semibold text-center leading-tight">No Preview</span>
                )}
              </div>
            </div>
          </div>

          {/* Additional Product Gallery Images */}
          <div className="sm:col-span-2 border-t border-brand-border/40 dark:border-zinc-800 pt-6 space-y-4">
            <span className="block text-[10px] font-bold text-brand-grey dark:text-zinc-400 uppercase tracking-wider">Additional Product Gallery Images</span>
            
            {/* Gallery Thumbnail Preview Grid */}
            {images.length > 0 ? (
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 p-3.5 border border-brand-border dark:border-zinc-800 rounded bg-brand-bg-grey/10 dark:bg-zinc-950/10">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square bg-white dark:bg-zinc-900 border border-brand-border dark:border-zinc-800 rounded p-1 flex items-center justify-center group overflow-hidden">
                    <img 
                      src={getImageUrl(img)} 
                      alt="" 
                      className="max-h-full max-w-full object-contain rounded" 
                      onError={(e) => { e.target.src = '/assets/products/placeholder.png'; }}
                    />
                    <button
                      type="button"
                      onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute inset-0 bg-red-650/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-bold uppercase rounded cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-brand-grey dark:text-zinc-500 font-semibold italic">No additional gallery images added yet.</p>
            )}

            {/* Input to Add URL or Upload */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
              <div className="sm:col-span-2 flex gap-2">
                <input
                  type="text"
                  id="newGalleryUrlInput"
                  className="flex-1 px-3 py-2 border border-brand-border dark:border-zinc-750 bg-white dark:bg-zinc-800 text-brand-dark dark:text-white rounded text-xs focus:outline-none focus:border-brand-blue"
                  placeholder="Paste URL and click '+' to add"
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('newGalleryUrlInput');
                    if (input && input.value.trim()) {
                      setImages(prev => [...prev, input.value.trim()]);
                      input.value = '';
                    }
                  }}
                  className="px-3 bg-brand-blue hover:bg-brand-blue-dark text-white rounded font-bold text-xs cursor-pointer"
                >
                  +
                </button>
              </div>

              <label className="cursor-pointer flex items-center justify-center gap-1.5 py-2 px-4 bg-brand-bg-grey dark:bg-zinc-800 hover:bg-brand-blue-light dark:hover:bg-brand-blue/15 hover:text-brand-blue border border-brand-border dark:border-zinc-700 rounded text-xs font-bold transition-all text-brand-dark dark:text-zinc-200 text-center">
                {uploadingGallery ? <RefreshCw className="animate-spin" size={14} /> : <Upload size={14} />} 
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    handleImageUpload(e, 'gallery');
                    e.target.value = null;
                  }}
                  className="hidden"
                  disabled={uploadingGallery}
                />
              </label>
            </div>
          </div>

          {/* Description */}
          <div className="sm:col-span-2 border-t border-brand-border/40 dark:border-zinc-800 pt-6">
            <label className="block text-[10px] font-bold text-brand-grey dark:text-zinc-400 uppercase tracking-wider mb-1">Brief Description *</label>
            <textarea
              rows="3"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-brand-border dark:border-zinc-750 bg-white dark:bg-zinc-800 text-brand-dark dark:text-white rounded text-xs focus:outline-none focus:border-brand-blue"
              placeholder="Short product callout overview..."
            ></textarea>
          </div>

          {/* How to Use */}
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold text-brand-grey dark:text-zinc-400 uppercase tracking-wider mb-1">Directions for Use</label>
            <textarea
              rows="2"
              value={howToUse}
              onChange={(e) => setHowToUse(e.target.value)}
              className="w-full px-3 py-2 border border-brand-border dark:border-zinc-750 bg-white dark:bg-zinc-800 text-brand-dark dark:text-white rounded text-xs focus:outline-none focus:border-brand-blue"
              placeholder="Application details..."
            ></textarea>
          </div>

          {/* Ingredients */}
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold text-brand-grey dark:text-zinc-400 uppercase tracking-wider mb-1">Ingredients List</label>
            <textarea
              rows="2"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              className="w-full px-3 py-2 border border-brand-border dark:border-zinc-750 bg-white dark:bg-zinc-800 text-brand-dark dark:text-white rounded text-xs focus:outline-none focus:border-brand-blue"
              placeholder="Key chemicals, concentrations, or botanical extracts..."
            ></textarea>
          </div>

          {/* SEO & Metadata section */}
          <div className="sm:col-span-2 border-t border-brand-border/40 dark:border-zinc-800 pt-6 space-y-4">
            <h3 className="text-xs font-bold text-brand-dark dark:text-white uppercase tracking-wide">SEO & Meta Tags (Optional)</h3>
            
            <div>
              <label className="block text-[10px] font-bold text-brand-grey dark:text-zinc-400 uppercase tracking-wider mb-1">Meta Title</label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className="w-full px-3 py-2 border border-brand-border dark:border-zinc-750 bg-white dark:bg-zinc-800 text-brand-dark dark:text-white rounded text-xs focus:outline-none focus:border-brand-blue"
                placeholder="Custom page title (falls back to Product Name if left empty)"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-brand-grey dark:text-zinc-400 uppercase tracking-wider mb-1">Meta Description</label>
              <textarea
                rows="2"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="w-full px-3 py-2 border border-brand-border dark:border-zinc-750 bg-white dark:bg-zinc-800 text-brand-dark dark:text-white rounded text-xs focus:outline-none focus:border-brand-blue"
                placeholder="Short description for search results (falls back to Brief Description if left empty)"
              ></textarea>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-brand-grey dark:text-zinc-400 uppercase tracking-wider mb-1">Meta Keywords</label>
              <input
                type="text"
                value={metaKeywords}
                onChange={(e) => setMetaKeywords(e.target.value)}
                className="w-full px-3 py-2 border border-brand-border dark:border-zinc-750 bg-white dark:bg-zinc-800 text-brand-dark dark:text-white rounded text-xs focus:outline-none focus:border-brand-blue"
                placeholder="e.g. sunscreen gel, spf50, oil-free sunscreen, sun damage"
              />
            </div>
          </div>
        </div>

        {/* Footer controls */}
        <div className="border-t border-brand-border dark:border-zinc-800 pt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="px-5 py-2.5 bg-brand-bg-grey dark:bg-zinc-800 hover:bg-brand-border dark:hover:bg-zinc-700 text-brand-dark dark:text-zinc-200 rounded text-xs font-bold uppercase transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={formSubmitting || uploadingPrimary || uploadingSecondary || uploadingGallery}
            className="px-6 py-2.5 bg-brand-blue hover:bg-brand-blue-dark text-white rounded text-xs font-bold uppercase transition-all shadow-md disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
          >
            {formSubmitting ? (
              <>
                <RefreshCw className="animate-spin" size={14} />
                Saving...
              </>
            ) : (
              <>
                <Save size={14} />
                Save Formulation
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProductForm;
