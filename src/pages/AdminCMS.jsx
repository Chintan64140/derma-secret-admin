import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, ArrowUp, ArrowDown, Upload, Save, RefreshCw, 
  Eye, Monitor, Smartphone, Link as LinkIcon, Tag, FileText, 
  Sparkles, CheckCircle, AlertCircle, Image as ImageIcon 
} from 'lucide-react';
import { API } from '../context/AuthContext';
import { getImageUrl } from '../utils/image';

const AdminCMS = () => {
  const [banners, setBanners] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Image upload states
  const [uploadingDesktop, setUploadingDesktop] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);

  // Live preview device toggle: 'desktop' or 'mobile'
  const [previewDevice, setPreviewDevice] = useState('desktop');
  // Toggle to show/hide text overlays in preview
  const [showPreviewText, setShowPreviewText] = useState(true);

  // Load hero banners from backend
  const fetchBanners = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get('/products/cms/hero');
      if (res.data && Array.isArray(res.data)) {
        setBanners(res.data);
        setSelectedIndex(res.data.length > 0 ? 0 : -1);
      } else {
        setBanners([]);
        setSelectedIndex(-1);
      }
    } catch (err) {
      console.error('Fetch hero banners failed:', err.message);
      setError('Failed to fetch hero banners from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Save banners to backend
  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      // Validate that at least one banner exists and has an image
      const invalid = banners.some((b, i) => !b.image);
      if (invalid) {
        throw new Error('All banners must have at least a Desktop Image.');
      }

      const res = await API.put('/admin/cms/hero', banners);
      setBanners(res.data);
      setSuccess('Hero banners settings updated successfully!');
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('Save hero banners failed:', err.message);
      setError(err.response?.data?.message || err.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  // Add a new empty banner
  const handleAddBanner = () => {
    const newBanner = {
      id: Date.now(),
      image: '',
      mobileImage: '',
      title: 'New Promotional Banner',
      subtitle: 'Special Skin Care Offer',
      description: 'Discover dermatologist-tested formulas enriched with clinically-active ingredients.',
      link: '/shop',
      badge: 'New'
    };
    const updated = [...banners, newBanner];
    setBanners(updated);
    setSelectedIndex(updated.length - 1);
  };

  // Delete current banner
  const handleDeleteBanner = (indexToDelete) => {
    if (banners.length <= 1) {
      setError('You must keep at least one hero banner for the landing page.');
      setTimeout(() => setError(''), 4000);
      return;
    }
    const updated = banners.filter((_, idx) => idx !== indexToDelete);
    setBanners(updated);
    
    // Adjust selected index
    if (selectedIndex >= updated.length) {
      setSelectedIndex(updated.length - 1);
    } else if (selectedIndex === indexToDelete && indexToDelete > 0) {
      setSelectedIndex(indexToDelete - 1);
    }
  };

  // Move banner up in sorting order
  const handleMoveUp = (index) => {
    if (index === 0) return;
    const updated = [...banners];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    setBanners(updated);
    if (selectedIndex === index) {
      setSelectedIndex(index - 1);
    } else if (selectedIndex === index - 1) {
      setSelectedIndex(index);
    }
  };

  // Move banner down in sorting order
  const handleMoveDown = (index) => {
    if (index === banners.length - 1) return;
    const updated = [...banners];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    setBanners(updated);
    if (selectedIndex === index) {
      setSelectedIndex(index + 1);
    } else if (selectedIndex === index + 1) {
      setSelectedIndex(index);
    }
  };

  // Update field of selected banner
  const handleUpdateField = (field, value) => {
    if (selectedIndex === -1) return;
    const updated = [...banners];
    updated[selectedIndex] = {
      ...updated[selectedIndex],
      [field]: value
    };
    setBanners(updated);
  };

  // Handle image uploads directly to R2
  const uploadImageFile = async (file, type) => {
    const formData = new FormData();
    formData.append('image', file);

    if (type === 'desktop') setUploadingDesktop(true);
    else setUploadingMobile(true);

    try {
      const res = await API.post('/admin/upload?original=true', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const imageUrl = res.data.imageUrl;
      
      if (type === 'desktop') {
        handleUpdateField('image', imageUrl);
      } else {
        handleUpdateField('mobileImage', imageUrl);
      }
    } catch (err) {
      console.error('Banner upload failed:', err.message);
      setError('Failed to upload image. Ensure it is a valid graphic format.');
      setTimeout(() => setError(''), 5000);
    } finally {
      if (type === 'desktop') setUploadingDesktop(false);
      else setUploadingMobile(false);
    }
  };

  // Active banner reference
  const currentBanner = selectedIndex !== -1 ? banners[selectedIndex] : null;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="animate-spin text-brand-blue dark:text-white" size={32} />
        <p className="text-xs font-semibold text-brand-grey dark:text-zinc-400 uppercase tracking-widest">
          Loading CMS configurations...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1 py-4">
      {/* 1. Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-brand-border dark:border-zinc-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-brand-dark dark:text-white uppercase tracking-tight font-heading">
            Hero Section CMS
          </h1>
          <p className="text-xs text-brand-grey dark:text-zinc-400 font-medium">
            Manage your homepage slides, graphics, tags, links, and promo texts stored securely in R2.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={fetchBanners}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-brand-border dark:border-zinc-700 text-brand-dark dark:text-zinc-300 rounded hover:bg-black/5 dark:hover:bg-white/5 font-semibold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            <RefreshCw size={14} /> Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-brand-blue text-white rounded hover:bg-brand-blue/90 font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            <Save size={14} /> {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* 2. Success/Error Toast alerts */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/20 text-brand-accent dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded-lg shadow-sm">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span className="text-xs font-semibold">{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-900/30 rounded-lg shadow-sm">
          <CheckCircle size={18} className="flex-shrink-0" />
          <span className="text-xs font-semibold">{success}</span>
        </div>
      )}

      {/* 3. Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Slide list selection & ordering (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#1a1a1a] rounded-xl border border-brand-border dark:border-zinc-800 shadow-sm p-4 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-brand-border dark:border-zinc-800">
            <h2 className="text-xs font-extrabold text-brand-dark dark:text-white uppercase tracking-wider font-heading">
              Banner Slides ({banners.length})
            </h2>
            <button
              onClick={handleAddBanner}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <Plus size={12} /> Add Slide
            </button>
          </div>

          {banners.length === 0 ? (
            <div className="py-8 text-center border border-dashed border-brand-border dark:border-zinc-800 rounded-lg space-y-2">
              <ImageIcon className="mx-auto text-brand-grey dark:text-zinc-600" size={32} />
              <p className="text-xs text-brand-grey dark:text-zinc-400 font-medium">No banners configured</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {banners.map((banner, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <div
                    key={banner.id || index}
                    onClick={() => setSelectedIndex(index)}
                    className={`group relative flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-brand-blue/10 dark:bg-brand-blue/20 border-brand-blue'
                        : 'bg-brand-bg-grey/30 dark:bg-zinc-900/40 border-brand-border dark:border-zinc-800 hover:bg-brand-bg-grey/60 dark:hover:bg-zinc-800/40'
                    }`}
                  >
                    {/* Thumbnail preview */}
                    <div className="w-16 h-10 bg-zinc-100 dark:bg-zinc-800 rounded overflow-hidden border border-brand-border dark:border-zinc-700 flex-shrink-0">
                      {banner.image ? (
                        <img
                          src={getImageUrl(banner.image)}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400">
                          <ImageIcon size={16} />
                        </div>
                      )}
                    </div>

                    {/* Metadata summary */}
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-black text-brand-blue uppercase tracking-wider bg-brand-blue/10 px-1.5 py-0.5 rounded">
                          Slide {index + 1}
                        </span>
                        {banner.badge && (
                          <span className="text-[9px] font-bold text-white bg-brand-accent uppercase tracking-wider px-1.5 py-0.5 rounded">
                            {banner.badge}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-brand-dark dark:text-white truncate">
                        {banner.title || 'Untitled Banner'}
                      </h4>
                    </div>

                    {/* Quick controls on hover/selection */}
                    <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleMoveUp(index); }}
                        disabled={index === 0}
                        className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded text-brand-grey dark:text-zinc-400 disabled:opacity-20 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp size={12} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleMoveDown(index); }}
                        disabled={index === banners.length - 1}
                        className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded text-brand-grey dark:text-zinc-400 disabled:opacity-20 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown size={12} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteBanner(index); }}
                        className="p-1 hover:bg-red-50 dark:hover:bg-red-950/40 rounded text-brand-accent hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
                        title="Delete Banner"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* MIDDLE COLUMN: Form Editor (4 cols) & Live Preview (4 cols) */}
        {currentBanner ? (
          <>
            {/* Editor fields */}
            <div className="lg:col-span-4 bg-white dark:bg-[#1a1a1a] rounded-xl border border-brand-border dark:border-zinc-800 shadow-sm p-4 space-y-4">
              <h3 className="text-xs font-extrabold text-brand-dark dark:text-white uppercase tracking-wider border-b border-brand-border dark:border-zinc-800 pb-2 font-heading">
                Slide Configuration
              </h3>

              {/* Form Input fields */}
              <div className="space-y-3">
                {/* Badge Tag */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-brand-grey dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Tag size={12} /> Badge Overlay Tag
                  </label>
                  <input
                    type="text"
                    value={currentBanner.badge || ''}
                    onChange={(e) => handleUpdateField('badge', e.target.value)}
                    placeholder="e.g. Best Seller, New Launch"
                    className="w-full px-3 py-2 text-xs border border-brand-border dark:border-zinc-800 rounded bg-brand-bg-grey/10 dark:bg-zinc-900 text-brand-dark dark:text-white focus:outline-none focus:border-brand-blue"
                  />
                </div>

                {/* Title */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-brand-grey dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={12} /> Slide Title
                  </label>
                  <input
                    type="text"
                    value={currentBanner.title || ''}
                    onChange={(e) => handleUpdateField('title', e.target.value)}
                    placeholder="e.g. Shadow Sunscreen Series"
                    className="w-full px-3 py-2 text-xs border border-brand-border dark:border-zinc-800 rounded bg-brand-bg-grey/10 dark:bg-zinc-900 text-brand-dark dark:text-white focus:outline-none focus:border-brand-blue font-bold"
                  />
                </div>

                {/* Subtitle */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-brand-grey dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText size={12} /> Subtitle / Category Hook
                  </label>
                  <input
                    type="text"
                    value={currentBanner.subtitle || ''}
                    onChange={(e) => handleUpdateField('subtitle', e.target.value)}
                    placeholder="e.g. Clinical UV Protection Formulas"
                    className="w-full px-3 py-2 text-xs border border-brand-border dark:border-zinc-800 rounded bg-brand-bg-grey/10 dark:bg-zinc-900 text-brand-dark dark:text-white focus:outline-none focus:border-brand-blue"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-brand-grey dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText size={12} /> Description Text
                  </label>
                  <textarea
                    rows={2}
                    value={currentBanner.description || ''}
                    onChange={(e) => handleUpdateField('description', e.target.value)}
                    placeholder="Provide description..."
                    className="w-full px-3 py-2 text-xs border border-brand-border dark:border-zinc-800 rounded bg-brand-bg-grey/10 dark:bg-zinc-900 text-brand-dark dark:text-white focus:outline-none focus:border-brand-blue resize-none"
                  />
                </div>

                {/* Link */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-brand-grey dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <LinkIcon size={12} /> Redirection Link (Click action)
                  </label>
                  <input
                    type="text"
                    value={currentBanner.link || ''}
                    onChange={(e) => handleUpdateField('link', e.target.value)}
                    placeholder="e.g. /shop, /shop?category=sun-protection"
                    className="w-full px-3 py-2 text-xs border border-brand-border dark:border-zinc-800 rounded bg-brand-bg-grey/10 dark:bg-zinc-900 text-brand-dark dark:text-white focus:outline-none focus:border-brand-blue font-mono"
                  />
                </div>

                {/* Image Upload Grid */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  {/* Desktop Image upload */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-brand-grey dark:text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                      <Monitor size={12} /> Desktop (Wide)
                    </label>
                    <div className="relative border border-dashed border-brand-border dark:border-zinc-800 hover:border-brand-blue rounded-lg overflow-hidden h-24 bg-brand-bg-grey/10 dark:bg-zinc-900/60 transition-colors flex flex-col items-center justify-center p-2 text-center">
                      {currentBanner.image ? (
                        <>
                          <img
                            src={getImageUrl(currentBanner.image)}
                            alt="Desktop"
                            className="w-full h-full object-cover rounded"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                            <label className="cursor-pointer text-[10px] text-white font-bold uppercase tracking-wider flex items-center gap-1">
                              <Upload size={10} /> Replace
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => uploadImageFile(e.target.files[0], 'desktop')}
                              />
                            </label>
                          </div>
                        </>
                      ) : (
                        <label className="cursor-pointer flex flex-col items-center gap-1 w-full h-full justify-center">
                          {uploadingDesktop ? (
                            <RefreshCw className="animate-spin text-brand-blue" size={16} />
                          ) : (
                            <Upload size={16} className="text-zinc-400" />
                          )}
                          <span className="text-[9px] font-bold text-zinc-500 uppercase">
                            {uploadingDesktop ? 'Uploading...' : 'Upload 41:14'}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => uploadImageFile(e.target.files[0], 'desktop')}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Mobile Image upload */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-brand-grey dark:text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                      <Smartphone size={12} /> Mobile (Tall)
                    </label>
                    <div className="relative border border-dashed border-brand-border dark:border-zinc-800 hover:border-brand-blue rounded-lg overflow-hidden h-24 bg-brand-bg-grey/10 dark:bg-zinc-900/60 transition-colors flex flex-col items-center justify-center p-2 text-center">
                      {currentBanner.mobileImage ? (
                        <>
                          <img
                            src={getImageUrl(currentBanner.mobileImage)}
                            alt="Mobile"
                            className="w-full h-full object-cover rounded"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                            <label className="cursor-pointer text-[10px] text-white font-bold uppercase tracking-wider flex items-center gap-1">
                              <Upload size={10} /> Replace
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => uploadImageFile(e.target.files[0], 'mobile')}
                              />
                            </label>
                          </div>
                        </>
                      ) : (
                        <label className="cursor-pointer flex flex-col items-center gap-1 w-full h-full justify-center">
                          {uploadingMobile ? (
                            <RefreshCw className="animate-spin text-brand-blue" size={16} />
                          ) : (
                            <Upload size={16} className="text-zinc-400" />
                          )}
                          <span className="text-[9px] font-bold text-zinc-500 uppercase">
                            {uploadingMobile ? 'Uploading...' : 'Upload 195:227'}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => uploadImageFile(e.target.files[0], 'mobile')}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Live Preview card */}
            <div className="lg:col-span-4 bg-white dark:bg-[#1a1a1a] rounded-xl border border-brand-border dark:border-zinc-800 shadow-sm p-4 space-y-4">
              <div className="flex justify-between items-center border-b border-brand-border dark:border-zinc-800 pb-2">
                <h3 className="text-xs font-extrabold text-brand-dark dark:text-white uppercase tracking-wider flex items-center gap-1.5 font-heading">
                  <Eye size={14} /> Live Sandbox Preview
                </h3>
                
                {/* Device simulation controls */}
                <div className="flex bg-brand-bg-grey dark:bg-zinc-900 p-0.5 rounded border border-brand-border dark:border-zinc-800">
                  <button
                    onClick={() => setPreviewDevice('desktop')}
                    className={`p-1 rounded transition-all cursor-pointer ${
                      previewDevice === 'desktop'
                        ? 'bg-white dark:bg-zinc-800 text-brand-blue shadow-sm'
                        : 'text-zinc-400 hover:text-brand-dark dark:hover:text-white'
                    }`}
                    title="Simulate Desktop Layout"
                  >
                    <Monitor size={14} />
                  </button>
                  <button
                    onClick={() => setPreviewDevice('mobile')}
                    className={`p-1 rounded transition-all cursor-pointer ${
                      previewDevice === 'mobile'
                        ? 'bg-white dark:bg-zinc-800 text-brand-blue shadow-sm'
                        : 'text-zinc-400 hover:text-brand-dark dark:hover:text-white'
                    }`}
                    title="Simulate Mobile Layout"
                  >
                    <Smartphone size={14} />
                  </button>
                </div>
              </div>

              {/* Toggle text overlay simulation */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-brand-grey dark:text-zinc-400 uppercase tracking-widest">
                  Simulate Overlay Text
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={showPreviewText}
                    onChange={(e) => setShowPreviewText(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-zinc-200 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-blue"></div>
                </label>
              </div>

              {/* Simulation display viewport */}
              <div className="bg-brand-bg-grey dark:bg-zinc-900 border border-brand-border dark:border-zinc-800 rounded-xl p-3 flex justify-center items-center min-h-[300px]">
                {previewDevice === 'desktop' ? (
                  /* Desktop Preview aspect-ratio container */
                  <div className="w-full aspect-[41/14] bg-brand-blue-light rounded border border-brand-border dark:border-zinc-700 shadow-lg overflow-hidden relative group">
                    {currentBanner.image ? (
                      <img
                        src={getImageUrl(currentBanner.image)}
                        alt=""
                        className="w-full h-full object-fill object-center"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 gap-1 bg-zinc-200 dark:bg-zinc-800">
                        <ImageIcon size={24} />
                        <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-500">No Desktop Image</span>
                      </div>
                    )}

                    {/* Text card overlay simulation if toggled */}
                    {showPreviewText && (
                      <div className="absolute inset-0 z-10 flex items-center px-4 sm:px-6">
                        <div className="bg-brand-blue-dark/50 dark:bg-black/45 backdrop-blur-md p-3 sm:p-4 rounded-xl border border-white/10 text-white max-w-[50%] space-y-1">
                          {currentBanner.badge && (
                            <span className="inline-block bg-brand-accent text-white text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                              {currentBanner.badge}
                            </span>
                          )}
                          {currentBanner.subtitle && (
                            <h5 className="text-[7px] font-bold text-brand-yellow uppercase tracking-widest">
                              {currentBanner.subtitle}
                            </h5>
                          )}
                          <h4 className="text-xs font-black leading-tight truncate">
                            {currentBanner.title}
                          </h4>
                          <p className="text-[8px] text-gray-200 leading-normal line-clamp-2">
                            {currentBanner.description}
                          </p>
                          {currentBanner.link && (
                            <div className="pt-1">
                              <span className="inline-block px-2.5 py-1 bg-brand-accent text-white rounded text-[7px] font-bold uppercase tracking-wider">
                                Explore Range
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Mobile Preview aspect-ratio container */
                  <div className="w-52 aspect-[195/227] bg-brand-blue-light rounded border border-brand-border dark:border-zinc-700 shadow-lg overflow-hidden relative">
                    {currentBanner.mobileImage || currentBanner.image ? (
                      <img
                        src={getImageUrl(currentBanner.mobileImage || currentBanner.image)}
                        alt=""
                        className="w-full h-full object-fill object-center"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 gap-1 bg-zinc-200 dark:bg-zinc-800">
                        <ImageIcon size={24} />
                        <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-500">No Mobile Image</span>
                      </div>
                    )}

                    {/* Text card overlay simulation if toggled */}
                    {showPreviewText && (
                      <div className="absolute inset-x-2 bottom-3 z-10">
                        <div className="bg-brand-blue-dark/65 dark:bg-black/55 backdrop-blur-md p-2.5 rounded-lg border border-white/10 text-white space-y-1">
                          {currentBanner.badge && (
                            <span className="inline-block bg-brand-accent text-white text-[6px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                              {currentBanner.badge}
                            </span>
                          )}
                          <h4 className="text-[9px] font-black leading-tight">
                            {currentBanner.title}
                          </h4>
                          {currentBanner.link && (
                            <div className="pt-0.5">
                              <span className="inline-block px-2 py-0.5 bg-brand-accent text-white rounded text-[6px] font-bold uppercase tracking-wider">
                                Explore
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="text-[10px] text-brand-grey dark:text-zinc-500 font-medium leading-relaxed bg-brand-bg-grey/10 dark:bg-zinc-900/40 p-2.5 rounded-lg border border-brand-border dark:border-zinc-800/40">
                💡 <strong>Aspect ratio guidelines:</strong>
                <ul className="list-disc pl-4 mt-1 space-y-0.5">
                  <li>Desktop banners are rendered at a <strong>41:14</strong> aspect ratio on the storefront (e.g. 1950x660px).</li>
                  <li>Mobile banners are rendered at a <strong>195:227</strong> aspect ratio (e.g. 750x870px).</li>
                </ul>
              </div>
            </div>
          </>
        ) : (
          <div className="lg:col-span-8 bg-white dark:bg-[#1a1a1a] rounded-xl border border-brand-border dark:border-zinc-800 shadow-sm p-12 text-center space-y-3">
            <ImageIcon className="mx-auto text-zinc-300 dark:text-zinc-700 animate-pulse" size={48} />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-brand-dark dark:text-white uppercase tracking-wider">No slide selected</h3>
              <p className="text-xs text-brand-grey dark:text-zinc-400">Select a slide on the left or add a new promotional slide to start configuring settings.</p>
            </div>
            <button
              onClick={handleAddBanner}
              className="px-4 py-2 bg-brand-blue text-white rounded font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Add Your First Slide
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminCMS;
