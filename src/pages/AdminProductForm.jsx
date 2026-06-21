import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Upload, AlertCircle, RefreshCw, Trash2, Eye } from 'lucide-react';
import { API } from '../context/AuthContext';
import { getImageUrl } from '../utils/image';

const RichTextEditor = ({ value, onChange, placeholder }) => {
  const editorRef = React.useRef(null);
  const isEditingRef = React.useRef(false);

  // Synchronize initial value or updates from outside when not focused/editing
  React.useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value && !isEditingRef.current) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCmd = (command, val = null) => {
    document.execCommand(command, false, val);
    handleInput();
  };

  return (
    <div className="border border-brand-border dark:border-zinc-750 bg-white dark:bg-zinc-800 rounded-lg overflow-hidden shadow-2xs">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 p-2 bg-zinc-50 dark:bg-zinc-900 border-b border-brand-border dark:border-zinc-850">
        <button
          type="button"
          onClick={() => execCmd('bold')}
          className="p-1 px-2.5 rounded bg-white dark:bg-zinc-850 border border-brand-border dark:border-zinc-750 hover:bg-brand-blue-light/25 hover:text-brand-blue dark:hover:bg-brand-blue/10 dark:hover:text-brand-blue-light text-xs font-black text-brand-dark dark:text-zinc-200 transition-all cursor-pointer"
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => execCmd('italic')}
          className="p-1 px-2.5 rounded bg-white dark:bg-zinc-850 border border-brand-border dark:border-zinc-750 hover:bg-brand-blue-light/25 hover:text-brand-blue dark:hover:bg-brand-blue/10 dark:hover:text-brand-blue-light text-xs italic font-bold text-brand-dark dark:text-zinc-200 transition-all cursor-pointer"
          title="Italic"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => execCmd('underline')}
          className="p-1 px-2.5 rounded bg-white dark:bg-zinc-850 border border-brand-border dark:border-zinc-750 hover:bg-brand-blue-light/25 hover:text-brand-blue dark:hover:bg-brand-blue/10 dark:hover:text-brand-blue-light text-xs underline font-bold text-brand-dark dark:text-zinc-200 transition-all cursor-pointer"
          title="Underline"
        >
          U
        </button>
        <div className="h-5 w-[1px] bg-brand-border dark:bg-zinc-800 mx-1"></div>
        <button
          type="button"
          onClick={() => execCmd('insertUnorderedList')}
          className="p-1 px-2.5 rounded bg-white dark:bg-zinc-850 border border-brand-border dark:border-zinc-750 hover:bg-brand-blue-light/25 hover:text-brand-blue dark:hover:bg-brand-blue/10 dark:hover:text-brand-blue-light text-xs font-bold text-brand-dark dark:text-zinc-200 transition-all cursor-pointer"
          title="Bullet List"
        >
          • Bullet List
        </button>
        <button
          type="button"
          onClick={() => execCmd('insertOrderedList')}
          className="p-1 px-2.5 rounded bg-white dark:bg-zinc-850 border border-brand-border dark:border-zinc-750 hover:bg-brand-blue-light/25 hover:text-brand-blue dark:hover:bg-brand-blue/10 dark:hover:text-brand-blue-light text-xs font-bold text-brand-dark dark:text-zinc-200 transition-all cursor-pointer"
          title="Numbered List"
        >
          1. Numbered List
        </button>
        <div className="h-5 w-[1px] bg-brand-border dark:bg-zinc-800 mx-1"></div>
        <button
          type="button"
          onClick={() => execCmd('removeFormat')}
          className="p-1 px-2.5 rounded bg-white dark:bg-zinc-850 border border-brand-border dark:border-zinc-750 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-brand-accent text-xs font-bold text-brand-dark dark:text-zinc-200 transition-all cursor-pointer"
          title="Clear Format"
        >
          Clear
        </button>
      </div>
      {/* Editor area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={() => { isEditingRef.current = true; }}
        onBlur={() => { isEditingRef.current = false; }}
        className="w-full min-h-[180px] p-3.5 text-xs bg-white dark:bg-zinc-800 text-brand-dark dark:text-zinc-200 focus:outline-none overflow-y-auto leading-relaxed"
        placeholder={placeholder}
        style={{ outline: 'none' }}
      />
    </div>
  );
};

const AdminProductForm = () => {
  const { id } = useParams(); // Holds product ID if editing
  const navigate = useNavigate();
  const isEditMode = !!id;

  // Component States
  const [categories, setCategories] = useState([]);
  const [concerns, setConcerns] = useState([]);
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [comparePrice, setComparePrice] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [selectedConcernIds, setSelectedConcernIds] = useState([]);
  const [selectedComboIds, setSelectedComboIds] = useState([]);
  const [weight, setWeight] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [secondaryImageUrl, setSecondaryImageUrl] = useState('');
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [images, setImages] = useState([]);
  const [description, setDescription] = useState('');
  const [detailsDescription, setDetailsDescription] = useState('');
  
  // How to Use Steps Fields
  const [howToUseSteps, setHowToUseSteps] = useState([]);
  const [newStepNo, setNewStepNo] = useState('1');
  const [newStepTitle, setNewStepTitle] = useState('');
  const [newStepDetails, setNewStepDetails] = useState('');

  // Ingredients Fields
  const [ingredientsList, setIngredientsList] = useState([]);
  const [newIngredient, setNewIngredient] = useState('');
  
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');

  // Key Active Ingredients States
  const [keyActives, setKeyActives] = useState([]);
  const [newActiveName, setNewActiveName] = useState('');
  const [newActiveBenefit, setNewActiveBenefit] = useState('');

  // Clinical FAQs States
  const [faqs, setFaqs] = useState([]);
  const [newFaqQuestion, setNewFaqQuestion] = useState('');
  const [newFaqAnswer, setNewFaqAnswer] = useState('');

  // Product Highlights States
  const [highlights, setHighlights] = useState([]);
  const [newHighlightTitle, setNewHighlightTitle] = useState('');
  const [newHighlightDesc, setNewHighlightDesc] = useState('');

  // Suitable For / Skin Concern Targets States
  const [suitableFor, setSuitableFor] = useState([]);
  const [newSuitableItem, setNewSuitableItem] = useState('');

  // Image Uploading States
  const [uploadingPrimary, setUploadingPrimary] = useState(false);
  const [uploadingSecondary, setUploadingSecondary] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  // Load categories, concerns, products list and product details (if editing)
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch categories, concerns, and combos list first
        const [catRes, conRes, comboRes] = await Promise.all([
          API.get('/products/categories'),
          API.get('/products/concerns'),
          API.get('/products/combos')
        ]);
        setCategories(catRes.data);
        setConcerns(conRes.data);
        setCombos(comboRes.data);

        // Fetch product if editing
        if (isEditMode) {
          const prodRes = await API.get(`/products/${id}`);
          const product = prodRes.data;

          setName(product.name || '');
          setSku(product.sku || '');
          setPrice(product.price || '');
          setComparePrice(product.compare_price || '');
          setSelectedCategoryIds(product.category_ids || (product.category_id ? [product.category_id] : []));
          setSelectedConcernIds(product.concern_ids || (product.concern_id ? [product.concern_id] : []));
          setSelectedComboIds(product.combo_ids || []);
          setWeight(product.weight || '');
          setImageUrl(product.image_url || '');
          setSecondaryImageUrl(product.secondary_image_url || '');
          setIsBestSeller(!!product.is_best_seller);
          setIsNewArrival(!!product.is_new_arrival);
          setImages(product.images || []);
          setDescription(product.description || '');
          setDetailsDescription(product.details?.description || product.description || '');

          const rawHow = product.details?.how_to_use;
          if (Array.isArray(rawHow)) {
            setHowToUseSteps(rawHow);
            setNewStepNo(String(rawHow.length + 1));
          } else if (rawHow) {
            setHowToUseSteps([{ no: '1', title: 'Directions', details: rawHow }]);
            setNewStepNo('2');
          } else {
            setHowToUseSteps([]);
            setNewStepNo('1');
          }

          const rawIngs = product.details?.ingredients;
          if (Array.isArray(rawIngs)) {
            setIngredientsList(rawIngs);
          } else if (typeof rawIngs === 'string') {
            setIngredientsList(rawIngs.split(/[;,]/).map(item => item.trim()).filter(Boolean));
          } else {
            setIngredientsList([]);
          }
          setKeyActives(product.details?.key_actives || []);
          setFaqs(product.details?.faqs || []);
          setHighlights(product.details?.highlights || []);
          setSuitableFor(product.details?.suitable_for || []);
          setMetaTitle(product.details?.meta_title || '');
          setMetaDescription(product.details?.meta_description || '');
          setMetaKeywords(product.details?.meta_keywords || '');
        }
      } catch (err) {
        console.error('Failed to load form initialization data:', err.message);
        setFormError('Failed to load product, categories or concerns. Please try refreshing.');
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
    else if (type === 'combo') setUploadingCombo(true);

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
      } else if (type === 'combo') {
        setNewComboImage(uploadedUrl);
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
      setUploadingCombo(false);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!name.trim() || !description.trim() || !price || selectedCategoryIds.length === 0) {
      setFormError('Please fill out all required fields. Select at least one category.');
      return;
    }

    setFormSubmitting(true);
    setFormError('');

    const payload = {
      name,
      description,
      price: parseFloat(price),
      compare_price: comparePrice ? parseFloat(comparePrice) : null,
      category_id: selectedCategoryIds[0] || null,
      category_ids: selectedCategoryIds,
      concern_id: selectedConcernIds[0] || null,
      concern_ids: selectedConcernIds,
      combo_ids: selectedComboIds,
      sku: sku.trim() || null,
      image_url: imageUrl,
      secondary_image_url: secondaryImageUrl || imageUrl,
      images,
      is_best_seller: isBestSeller,
      is_new_arrival: isNewArrival,
      weight: weight.trim() || null,
      details: {
        description: detailsDescription,
        how_to_use: howToUseSteps,
        ingredients: ingredientsList,
        key_actives: keyActives,
        faqs: faqs,
        highlights: highlights,
        suitable_for: suitableFor,
        combo_items: [],
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

          {/* Categories Multi-Select Checklist */}
          <div className="sm:col-span-2 space-y-2">
            <label className="block text-[10px] font-bold text-brand-grey dark:text-zinc-400 uppercase tracking-wider">Categories *</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 border border-brand-border dark:border-zinc-800 rounded bg-zinc-50/30 dark:bg-zinc-950/10">
              {categories.map((c) => {
                const isChecked = selectedCategoryIds.includes(c.id);
                return (
                  <label
                    key={c.id}
                    className={`flex items-center gap-2.5 p-3 rounded-lg border text-xs font-bold uppercase cursor-pointer select-none transition-all ${
                      isChecked
                        ? 'border-brand-blue bg-brand-blue-light/10 text-brand-blue dark:bg-brand-blue/10 dark:text-brand-blue-light'
                        : 'border-brand-border dark:border-zinc-750 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-brand-dark dark:text-zinc-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        if (isChecked) {
                          setSelectedCategoryIds(prev => prev.filter(id => id !== c.id));
                        } else {
                          setSelectedCategoryIds(prev => [...prev, c.id]);
                        }
                      }}
                      className="rounded text-brand-blue focus:ring-brand-blue w-4 h-4 cursor-pointer"
                    />
                    <span>{c.name}</span>
                  </label>
                );
              })}
            </div>
            {selectedCategoryIds.length === 0 && (
              <p className="text-[10px] text-red-500 font-bold">Please select at least one category.</p>
            )}
          </div>

          {/* Concerns Multi-Select Checklist */}
          <div className="sm:col-span-2 space-y-2">
            <label className="block text-[10px] font-bold text-brand-grey dark:text-zinc-400 uppercase tracking-wider">Skin / Hair Concerns</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 border border-brand-border dark:border-zinc-800 rounded bg-zinc-50/30 dark:bg-zinc-950/10">
              {concerns.map((con) => {
                const isChecked = selectedConcernIds.includes(con.id);
                return (
                  <label
                    key={con.id}
                    className={`flex items-center gap-2.5 p-3 rounded-lg border text-xs font-bold uppercase cursor-pointer select-none transition-all ${
                      isChecked
                        ? 'border-brand-blue bg-brand-blue-light/10 text-brand-blue dark:bg-brand-blue/10 dark:text-brand-blue-light'
                        : 'border-brand-border dark:border-zinc-750 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-brand-dark dark:text-zinc-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        if (isChecked) {
                          setSelectedConcernIds(prev => prev.filter(id => id !== con.id));
                        } else {
                          setSelectedConcernIds(prev => [...prev, con.id]);
                        }
                      }}
                      className="rounded text-brand-blue focus:ring-brand-blue w-4 h-4 cursor-pointer"
                    />
                    <span>{con.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Combos Multi-Select Checklist */}
          <div className="sm:col-span-2 space-y-2">
            <label className="block text-[10px] font-bold text-brand-grey dark:text-zinc-400 uppercase tracking-wider">Combos & Kits</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 border border-brand-border dark:border-zinc-800 rounded bg-zinc-50/30 dark:bg-zinc-950/10">
              {combos.map((comb) => {
                const isChecked = selectedComboIds.includes(comb.id);
                return (
                  <label
                    key={comb.id}
                    className={`flex items-center gap-2.5 p-3 rounded-lg border text-xs font-bold uppercase cursor-pointer select-none transition-all ${
                      isChecked
                        ? 'border-brand-blue bg-brand-blue-light/10 text-brand-blue dark:bg-brand-blue/10 dark:text-brand-blue-light'
                        : 'border-brand-border dark:border-zinc-750 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-brand-dark dark:text-zinc-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        if (isChecked) {
                          setSelectedComboIds(prev => prev.filter(id => id !== comb.id));
                        } else {
                          setSelectedComboIds(prev => [...prev, comb.id]);
                        }
                      }}
                      className="rounded text-brand-blue focus:ring-brand-blue w-4 h-4 cursor-pointer"
                    />
                    <span>{comb.name}</span>
                  </label>
                );
              })}
            </div>
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

          {/* Brief Description */}
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

          {/* Product Details (Tab Content Rich Text) */}
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold text-brand-grey dark:text-zinc-400 uppercase tracking-wider mb-1">Product Details (Tab Content Rich Text)</label>
            <RichTextEditor
              value={detailsDescription}
              onChange={setDetailsDescription}
              placeholder="Detailed product information for tabs..."
            />
          </div>

          {/* How to Use (Steps List) */}
          <div className="sm:col-span-2 border-t border-brand-border/40 dark:border-zinc-800 pt-6 space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-brand-grey dark:text-zinc-400 uppercase tracking-wider">How to Use (Steps List)</label>
              <span className="text-[10px] text-brand-grey dark:text-zinc-550 font-semibold uppercase tracking-wider font-heading block mt-0.5">
                Define the steps for application (e.g. Step 1, Step 2, etc.) in a row layout
              </span>
            </div>

            {/* Steps List */}
            {howToUseSteps.length > 0 ? (
              <div className="space-y-3 max-w-xl">
                {howToUseSteps.map((step, idx) => (
                  <div key={idx} className="flex items-start justify-between p-3 bg-[#f9fafb] dark:bg-zinc-850 border border-brand-border dark:border-zinc-800 rounded-lg text-xs font-medium shadow-2xs">
                    <div className="flex gap-3 items-start">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue dark:text-brand-blue-light font-black text-xs shrink-0">
                        {step.no}
                      </span>
                      <div className="space-y-1">
                        <h5 className="font-bold text-brand-dark dark:text-white uppercase tracking-wide">{step.title}</h5>
                        <p className="text-[11px] text-brand-grey dark:text-zinc-400 font-medium leading-relaxed">{step.details}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setHowToUseSteps(prev => prev.filter((_, i) => i !== idx))}
                      className="p-1.5 text-brand-accent hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-colors shrink-0 cursor-pointer"
                      title="Delete Step"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-brand-grey dark:text-zinc-555 font-semibold italic">No steps added yet.</p>
            )}

            {/* Inputs to Add Step */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end max-w-xl bg-zinc-50/50 dark:bg-zinc-950/20 p-4 border border-brand-border dark:border-zinc-800 rounded-xl">
              <div className="sm:col-span-3">
                <label className="block text-[9px] font-bold text-brand-grey dark:text-zinc-550 uppercase mb-1">Step No.</label>
                <input
                  type="text"
                  value={newStepNo}
                  onChange={(e) => setNewStepNo(e.target.value)}
                  className="w-full px-3 py-1.5 border border-brand-border dark:border-zinc-750 bg-white dark:bg-zinc-800 text-brand-dark dark:text-white rounded text-xs focus:outline-none focus:border-brand-blue"
                  placeholder="e.g. 1"
                />
              </div>
              <div className="sm:col-span-9">
                <label className="block text-[9px] font-bold text-brand-grey dark:text-zinc-550 uppercase mb-1">Step Title</label>
                <input
                  type="text"
                  value={newStepTitle}
                  onChange={(e) => setNewStepTitle(e.target.value)}
                  className="w-full px-3 py-1.5 border border-brand-border dark:border-zinc-750 bg-white dark:bg-zinc-800 text-brand-dark dark:text-white rounded text-xs focus:outline-none focus:border-brand-blue"
                  placeholder="e.g. Cleanse your skin"
                />
              </div>
              <div className="sm:col-span-12">
                <label className="block text-[9px] font-bold text-brand-grey dark:text-zinc-550 uppercase mb-1">Step Details</label>
                <textarea
                  rows="2"
                  value={newStepDetails}
                  onChange={(e) => setNewStepDetails(e.target.value)}
                  className="w-full px-3 py-1.5 border border-brand-border dark:border-zinc-750 bg-white dark:bg-zinc-800 text-brand-dark dark:text-white rounded text-xs focus:outline-none focus:border-brand-blue"
                  placeholder="e.g. Wet face and apply a small pump of cleanser..."
                />
              </div>
              <div className="sm:col-span-12 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (newStepNo.trim() && newStepTitle.trim() && newStepDetails.trim()) {
                      setHowToUseSteps(prev => [...prev, {
                        no: newStepNo.trim(),
                        title: newStepTitle.trim(),
                        details: newStepDetails.trim()
                      }]);
                      setNewStepNo((prev) => {
                        const parsed = parseInt(prev);
                        return isNaN(parsed) ? '' : String(parsed + 1);
                      });
                      setNewStepTitle('');
                      setNewStepDetails('');
                    }
                  }}
                  className="px-5 py-1.5 bg-brand-blue hover:bg-brand-blue-dark text-white rounded font-bold text-xs cursor-pointer transition-colors"
                >
                  Add Step
                </button>
              </div>
            </div>
          </div>

          {/* Ingredients List Builder */}
          <div className="sm:col-span-2 border-t border-brand-border/40 dark:border-zinc-800 pt-6 space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-brand-grey dark:text-zinc-400 uppercase tracking-wider">Ingredients List</label>
              <span className="text-[10px] text-brand-grey dark:text-zinc-550 font-semibold uppercase tracking-wider font-heading block mt-0.5">
                Add formulation ingredients one by one (e.g. Aqua, Glycerine, Niacinamide) or paste a comma-separated list
              </span>
            </div>

            {/* Ingredients Pills Grid */}
            {ingredientsList.length > 0 ? (
              <div className="flex flex-wrap gap-2 p-3 border border-brand-border dark:border-zinc-800 rounded bg-[#f9fafb]/45 dark:bg-zinc-950/10">
                {ingredientsList.map((ing, idx) => (
                  <span 
                    key={idx} 
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-50 dark:bg-zinc-850 text-brand-dark dark:text-zinc-200 rounded text-xs font-semibold border border-brand-border dark:border-zinc-800 shadow-2xs group hover:border-brand-accent transition-all"
                  >
                    <span>{ing}</span>
                    <button
                      type="button"
                      onClick={() => setIngredientsList(prev => prev.filter((_, i) => i !== idx))}
                      className="text-brand-grey group-hover:text-brand-accent dark:text-zinc-500 font-bold text-[11px] focus:outline-none cursor-pointer"
                      title="Remove ingredient"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-brand-grey dark:text-zinc-550 font-semibold italic">No ingredients added yet.</p>
            )}

            {/* Input to Add Ingredient */}
            <div className="flex gap-2 max-w-md">
              <input
                type="text"
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (newIngredient.trim()) {
                      const items = newIngredient.split(/[;,]/).map(item => item.trim()).filter(Boolean);
                      setIngredientsList(prev => [...prev, ...items]);
                      setNewIngredient('');
                    }
                  }
                }}
                className="flex-1 px-3 py-1.5 border border-brand-border dark:border-zinc-750 bg-white dark:bg-zinc-800 text-brand-dark dark:text-white rounded text-xs focus:outline-none focus:border-brand-blue"
                placeholder="Type name and press Enter or click '+'"
              />
              <button
                type="button"
                onClick={() => {
                  if (newIngredient.trim()) {
                    const items = newIngredient.split(/[;,]/).map(item => item.trim()).filter(Boolean);
                    setIngredientsList(prev => [...prev, ...items]);
                    setNewIngredient('');
                  }
                }}
                className="px-3 bg-brand-blue hover:bg-brand-blue-dark text-white rounded font-bold text-xs cursor-pointer transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Key Active Ingredients */}
          <div className="sm:col-span-2 border-t border-brand-border/40 dark:border-zinc-800 pt-6 space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-brand-grey dark:text-zinc-400 uppercase tracking-wider">Key Active Ingredients</label>
              <span className="text-[10px] text-brand-grey dark:text-zinc-500 font-semibold uppercase tracking-wider font-heading block mt-0.5">
                Add active ingredients and their corresponding benefits (e.g. Niacinamide &rarr; Calms and soothes skin)
              </span>
            </div>

            {/* Key Actives List */}
            {keyActives.length > 0 ? (
              <div className="space-y-2 max-w-xl">
                {keyActives.map((act, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-[#f9fafb] dark:bg-zinc-850 border border-brand-border dark:border-zinc-800 rounded-lg text-xs font-medium">
                    <div className="space-y-0.5">
                      <span className="font-bold text-brand-dark dark:text-white">{act.name}</span>
                      <p className="text-[11px] text-brand-grey dark:text-zinc-400 font-medium">{act.benefit}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setKeyActives(prev => prev.filter((_, i) => i !== idx))}
                      className="p-1.5 text-brand-accent hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-colors"
                      title="Delete ingredient"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-brand-grey dark:text-zinc-500 font-semibold italic">No key active ingredients defined. (Storefront fallbacks will be used if left empty).</p>
            )}

            {/* Inputs to Add Key Active */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end max-w-xl">
              <div className="sm:col-span-5">
                <label className="block text-[9px] font-bold text-brand-grey dark:text-zinc-550 uppercase mb-1">Active Name</label>
                <input
                  type="text"
                  value={newActiveName}
                  onChange={(e) => setNewActiveName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-brand-border dark:border-zinc-750 bg-white dark:bg-zinc-800 text-brand-dark dark:text-white rounded text-xs focus:outline-none focus:border-brand-blue"
                  placeholder="e.g. Niacinamide"
                />
              </div>
              <div className="sm:col-span-5">
                <label className="block text-[9px] font-bold text-brand-grey dark:text-zinc-550 uppercase mb-1">Clinical Benefit</label>
                <input
                  type="text"
                  value={newActiveBenefit}
                  onChange={(e) => setNewActiveBenefit(e.target.value)}
                  className="w-full px-3 py-1.5 border border-brand-border dark:border-zinc-750 bg-white dark:bg-zinc-800 text-brand-dark dark:text-white rounded text-xs focus:outline-none focus:border-brand-blue"
                  placeholder="e.g. Calms and soothes skin"
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={() => {
                    if (newActiveName.trim() && newActiveBenefit.trim()) {
                      setKeyActives(prev => [...prev, { name: newActiveName.trim(), benefit: newActiveBenefit.trim() }]);
                      setNewActiveName('');
                      setNewActiveBenefit('');
                    }
                  }}
                  className="w-full py-1.5 bg-brand-blue hover:bg-brand-blue-dark text-white rounded font-bold text-xs cursor-pointer transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Product Highlights / Benefits */}
          <div className="sm:col-span-2 border-t border-brand-border/40 dark:border-zinc-800 pt-6 space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-brand-grey dark:text-zinc-400 uppercase tracking-wider">Product Highlights / Benefits</label>
              <span className="text-[10px] text-brand-grey dark:text-zinc-500 font-semibold uppercase tracking-wider font-heading block mt-0.5">
                Add custom product benefits (Title & Description) to override default category highlights
              </span>
            </div>

            {/* Highlights List */}
            {highlights.length > 0 ? (
              <div className="space-y-2 max-w-xl">
                {highlights.map((hl, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-[#f9fafb] dark:bg-zinc-850 border border-brand-border dark:border-zinc-800 rounded-lg text-xs font-medium">
                    <div className="space-y-0.5">
                      <span className="font-bold text-brand-dark dark:text-white">{hl.title}</span>
                      <p className="text-[11px] text-brand-grey dark:text-zinc-400 font-medium">{hl.desc}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setHighlights(prev => prev.filter((_, i) => i !== idx))}
                      className="p-1.5 text-brand-accent hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-colors"
                      title="Delete highlight"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-brand-grey dark:text-zinc-500 font-semibold italic">No custom highlights defined. (Default category-based highlights will be used).</p>
            )}

            {/* Inputs to Add Highlight */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end max-w-xl">
              <div className="sm:col-span-5">
                <label className="block text-[9px] font-bold text-brand-grey dark:text-zinc-550 uppercase mb-1">Highlight Title</label>
                <input
                  type="text"
                  value={newHighlightTitle}
                  onChange={(e) => setNewHighlightTitle(e.target.value)}
                  className="w-full px-3 py-1.5 border border-brand-border dark:border-zinc-750 bg-white dark:bg-zinc-800 text-brand-dark dark:text-white rounded text-xs focus:outline-none focus:border-brand-blue"
                  placeholder="e.g. Cleanses Gently"
                />
              </div>
              <div className="sm:col-span-5">
                <label className="block text-[9px] font-bold text-brand-grey dark:text-zinc-550 uppercase mb-1">Description</label>
                <input
                  type="text"
                  value={newHighlightDesc}
                  onChange={(e) => setNewHighlightDesc(e.target.value)}
                  className="w-full px-3 py-1.5 border border-brand-border dark:border-zinc-750 bg-white dark:bg-zinc-800 text-brand-dark dark:text-white rounded text-xs focus:outline-none focus:border-brand-blue"
                  placeholder="e.g. Removes impurities..."
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={() => {
                    if (newHighlightTitle.trim() && newHighlightDesc.trim()) {
                      setHighlights(prev => [...prev, { title: newHighlightTitle.trim(), desc: newHighlightDesc.trim() }]);
                      setNewHighlightTitle('');
                      setNewHighlightDesc('');
                    }
                  }}
                  className="w-full py-1.5 bg-brand-blue hover:bg-brand-blue-dark text-white rounded font-bold text-xs cursor-pointer transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Suitable For (Skin Concerns & Targets) */}
          <div className="sm:col-span-2 border-t border-brand-border/40 dark:border-zinc-800 pt-6 space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-brand-grey dark:text-zinc-400 uppercase tracking-wider">Suitable For List</label>
              <span className="text-[10px] text-brand-grey dark:text-zinc-550 font-semibold uppercase tracking-wider font-heading block mt-0.5">
                Add skin concern targets or suitable demographics (e.g. Uneven skin tone & dark patches)
              </span>
            </div>

            {/* Suitable For List */}
            {suitableFor.length > 0 ? (
              <div className="flex flex-wrap gap-2 p-3 border border-brand-border dark:border-zinc-800 rounded bg-[#f9fafb]/45 dark:bg-zinc-950/10">
                {suitableFor.map((item, idx) => (
                  <span 
                    key={idx} 
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-50 dark:bg-zinc-850 text-brand-dark dark:text-zinc-200 rounded text-xs font-semibold border border-brand-border dark:border-zinc-800 shadow-2xs group hover:border-brand-accent transition-all"
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => setSuitableFor(prev => prev.filter((_, i) => i !== idx))}
                      className="text-brand-grey group-hover:text-brand-accent dark:text-zinc-500 font-bold text-[11px] focus:outline-none cursor-pointer"
                      title="Remove concern target"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-brand-grey dark:text-zinc-550 font-semibold italic">No target demographics specified. (Default category-based targets will be used).</p>
            )}

            {/* Input to Add Suitable For */}
            <div className="flex gap-2 max-w-md">
              <input
                type="text"
                value={newSuitableItem}
                onChange={(e) => setNewSuitableItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (newSuitableItem.trim()) {
                      setSuitableFor(prev => [...prev, newSuitableItem.trim()]);
                      setNewSuitableItem('');
                    }
                  }
                }}
                className="flex-1 px-3 py-1.5 border border-brand-border dark:border-zinc-750 bg-white dark:bg-zinc-800 text-brand-dark dark:text-white rounded text-xs focus:outline-none focus:border-brand-blue"
                placeholder="e.g. Dry, itchy & sensitive scalp"
              />
              <button
                type="button"
                onClick={() => {
                  if (newSuitableItem.trim()) {
                    setSuitableFor(prev => [...prev, newSuitableItem.trim()]);
                    setNewSuitableItem('');
                  }
                }}
                className="px-3 bg-brand-blue hover:bg-brand-blue-dark text-white rounded font-bold text-xs cursor-pointer transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Clinical FAQs */}
          <div className="sm:col-span-2 border-t border-brand-border/40 dark:border-zinc-800 pt-6 space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-brand-grey dark:text-zinc-400 uppercase tracking-wider">Clinical FAQs (Dermat Review)</label>
              <span className="text-[10px] text-brand-grey dark:text-zinc-500 font-semibold uppercase tracking-wider font-heading block mt-0.5">
                Add frequently asked questions and their corresponding clinical answers
              </span>
            </div>

            {/* FAQs List */}
            {faqs.length > 0 ? (
              <div className="space-y-2 max-w-xl">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-[#f9fafb] dark:bg-zinc-850 border border-brand-border dark:border-zinc-800 rounded-lg text-xs font-medium">
                    <div className="space-y-0.5">
                      <span className="font-bold text-brand-dark dark:text-white">Q: {faq.question}</span>
                      <p className="text-[11px] text-brand-grey dark:text-zinc-400 font-medium">A: {faq.answer}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFaqs(prev => prev.filter((_, i) => i !== idx))}
                      className="p-1.5 text-brand-accent hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-colors"
                      title="Delete FAQ"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-brand-grey dark:text-zinc-500 font-semibold italic">No FAQs defined.</p>
            )}

            {/* Inputs to Add FAQ */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end max-w-xl">
              <div className="sm:col-span-5">
                <label className="block text-[9px] font-bold text-brand-grey dark:text-zinc-550 uppercase mb-1">Question</label>
                <input
                  type="text"
                  value={newFaqQuestion}
                  onChange={(e) => setNewFaqQuestion(e.target.value)}
                  className="w-full px-3 py-1.5 border border-brand-border dark:border-zinc-750 bg-white dark:bg-zinc-800 text-brand-dark dark:text-white rounded text-xs focus:outline-none focus:border-brand-blue"
                  placeholder="e.g. Does it leave a white cast?"
                />
              </div>
              <div className="sm:col-span-5">
                <label className="block text-[9px] font-bold text-brand-grey dark:text-zinc-550 uppercase mb-1">Clinical Answer</label>
                <input
                  type="text"
                  value={newFaqAnswer}
                  onChange={(e) => setNewFaqAnswer(e.target.value)}
                  className="w-full px-3 py-1.5 border border-brand-border dark:border-zinc-750 bg-white dark:bg-zinc-800 text-brand-dark dark:text-white rounded text-xs focus:outline-none focus:border-brand-blue"
                  placeholder="e.g. No, it is translucent..."
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={() => {
                    if (newFaqQuestion.trim() && newFaqAnswer.trim()) {
                      setFaqs(prev => [...prev, { question: newFaqQuestion.trim(), answer: newFaqAnswer.trim() }]);
                      setNewFaqQuestion('');
                      setNewFaqAnswer('');
                    }
                  }}
                  className="w-full py-1.5 bg-brand-blue hover:bg-brand-blue-dark text-white rounded font-bold text-xs cursor-pointer transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
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
