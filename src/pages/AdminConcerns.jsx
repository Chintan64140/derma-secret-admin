import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, RefreshCw, Upload, AlertCircle, Sparkles } from 'lucide-react';
import { API } from '../context/AuthContext';
import { getImageUrl } from '../utils/image';

const AdminConcerns = () => {
  const [concerns, setConcerns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editConcernId, setEditConcernId] = useState(null); // If editing, holds the concern ID, else null
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');

  // Image Uploading States
  const [uploadingImage, setUploadingImage] = useState(false);

  // Load lists
  const fetchConcernsData = async () => {
    setLoading(true);
    try {
      const concernRes = await API.get('/products/concerns');
      setConcerns(concernRes.data);
    } catch (err) {
      console.error('Fetch concerns admin failed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConcernsData();
  }, []);

  const openAddModal = () => {
    setEditConcernId(null);
    setName('');
    setImageUrl('');
    setDescription('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (concern) => {
    setEditConcernId(concern.id);
    setName(concern.name);
    setImageUrl(concern.image_url || '');
    setDescription(concern.description || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await API.post('/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImageUrl(res.data.imageUrl);
    } catch (err) {
      console.error('File upload failed:', err.message);
      setFormError('Failed to upload image. Make sure it is less than 50MB and a valid format.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveConcern = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Concern name is required.');
      return;
    }

    setFormSubmitting(true);
    setFormError('');

    const payload = {
      name: name.trim(),
      image_url: imageUrl.trim(),
      description: description.trim()
    };

    try {
      if (editConcernId) {
        // Edit route
        await API.put(`/admin/concerns/${editConcernId}`, payload);
      } else {
        // Create route
        await API.post('/admin/concerns', payload);
      }
      setIsModalOpen(false);
      fetchConcernsData(); // Reload list
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error saving concern details.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteConcern = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to delete this concern? Products targeting this concern will become unassigned.')) {
      return;
    }

    try {
      await API.delete(`/admin/concerns/${id}`);
      fetchConcernsData(); // Reload list
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting concern.');
    }
  };

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-brand-dark dark:text-white uppercase tracking-tight font-heading flex items-center gap-2">
            <Sparkles className="text-brand-blue" size={24} /> Concerns Catalog CRUD
          </h1>
          <p className="text-xs font-semibold text-brand-grey dark:text-zinc-400 uppercase tracking-wider font-heading mt-0.5">
            Add, update, or remove skin concerns from database
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-blue hover:bg-brand-blue-dark text-white rounded font-bold font-heading text-xs uppercase tracking-wider transition-all shadow-md self-start sm:self-auto cursor-pointer"
        >
          <Plus size={16} /> Add Concern
        </button>
      </div>

      {/* Concerns Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <RefreshCw className="animate-spin text-brand-blue" size={32} />
          <p className="text-xs font-semibold text-brand-grey dark:text-zinc-400 uppercase tracking-wider">
            Loading concerns database...
          </p>
        </div>
      ) : concerns.length === 0 ? (
        <div className="text-center p-12 bg-white dark:bg-zinc-900 border border-brand-border dark:border-zinc-800 rounded-xl">
          <p className="text-xs text-brand-grey dark:text-zinc-400 font-medium">No concerns found in the database. Click Add Concern to get started.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-brand-border dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-brand-dark dark:text-zinc-200">
              <thead>
                <tr className="border-b border-brand-border dark:border-zinc-800 bg-brand-bg-grey dark:bg-zinc-850 text-brand-grey dark:text-zinc-450 font-bold uppercase tracking-wider">
                  <th className="py-4 px-4 w-16">Image</th>
                  <th className="py-4 px-4">Concern Name</th>
                  <th className="py-4 px-4">Slug</th>
                  <th className="py-4 px-4">Description</th>
                  <th className="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60 dark:divide-zinc-800/60 font-medium">
                {concerns.map((concern) => (
                  <tr key={concern.id} className="hover:bg-brand-bg-grey/30 dark:hover:bg-zinc-800/30">
                    <td className="py-3 px-4">
                      <div className="w-10 h-10 bg-brand-bg-grey dark:bg-zinc-800 border border-brand-border dark:border-zinc-700 rounded overflow-hidden flex items-center justify-center">
                        <img 
                          src={getImageUrl(concern.image_url)} 
                          alt="" 
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => { e.target.src = '/assets/placeholder-concern.jpg'; }}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-brand-dark dark:text-white">{concern.name}</td>
                    <td className="py-3 px-4 font-mono text-brand-grey dark:text-zinc-450">{concern.slug}</td>
                    <td className="py-3 px-4 text-brand-grey dark:text-zinc-400 max-w-xs truncate" title={concern.description}>{concern.description}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(concern)}
                          className="p-1.5 text-brand-blue dark:text-blue-400 hover:bg-brand-blue-light dark:hover:bg-brand-blue/15 rounded transition-colors cursor-pointer"
                          title="Edit Concern"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteConcern(concern.id)}
                          className="p-1.5 text-brand-accent dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-colors cursor-pointer"
                          title="Delete Concern"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Form Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-brand-border dark:border-zinc-800 rounded-xl w-full max-w-md flex flex-col shadow-2xl animate-fade-up">
            
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-brand-border dark:border-zinc-800">
              <h2 className="text-sm sm:text-base font-bold text-brand-dark dark:text-white font-heading uppercase tracking-wide">
                {editConcernId ? 'Edit Concern' : 'Create New Concern'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-brand-grey dark:text-zinc-400 hover:text-brand-dark dark:hover:text-white p-1 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {/* Content Form */}
            <form onSubmit={handleSaveConcern} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-brand-accent dark:text-red-400 text-xs font-semibold rounded-md flex items-center gap-2">
                  <AlertCircle size={15} className="flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Concern Name */}
              <div>
                <label className="block text-[10px] font-bold text-brand-grey dark:text-zinc-400 uppercase tracking-wider mb-1">Concern Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-brand-border dark:border-zinc-700 bg-white dark:bg-zinc-800 text-brand-dark dark:text-white rounded text-xs focus:outline-none focus:border-brand-blue"
                  placeholder="e.g. Acne & Blemishes"
                />
              </div>

              {/* Image upload */}
              <div className="space-y-1">
                <span className="block text-[10px] font-bold text-brand-grey dark:text-zinc-400 uppercase tracking-wider mb-1">Concern Image</span>
                <div className="grid grid-cols-3 gap-3 items-center">
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="col-span-2 px-3 py-2 border border-brand-border dark:border-zinc-700 bg-white dark:bg-zinc-800 text-brand-dark dark:text-white rounded text-xs focus:outline-none focus:border-brand-blue"
                    placeholder="/assets/placeholder-concern.jpg"
                  />
                  
                  {/* File upload handle */}
                  <label className="cursor-pointer flex items-center justify-center gap-1.5 py-2 px-3 bg-brand-bg-grey dark:bg-zinc-850 hover:bg-brand-blue-light dark:hover:bg-brand-blue/15 hover:text-brand-blue border border-brand-border dark:border-zinc-700 rounded text-xs font-bold transition-all text-center text-brand-dark dark:text-zinc-200">
                    <Upload size={14} /> Upload
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-bold text-brand-grey dark:text-zinc-400 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-brand-border dark:border-zinc-700 bg-white dark:bg-zinc-800 text-brand-dark dark:text-white rounded text-xs focus:outline-none focus:border-brand-blue"
                  placeholder="Formulations targets acne breakouts..."
                ></textarea>
              </div>

              {/* Footer controls */}
              <div className="border-t border-brand-border dark:border-zinc-800 pt-4 flex justify-end gap-3 bg-white dark:bg-zinc-900 sticky bottom-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-brand-bg-grey dark:bg-zinc-800 hover:bg-brand-border dark:hover:bg-zinc-700 text-brand-dark dark:text-zinc-200 rounded text-xs font-bold uppercase transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting || uploadingImage}
                  className="px-5 py-2 bg-brand-blue hover:bg-brand-blue-dark text-white rounded text-xs font-bold uppercase transition-all shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {formSubmitting ? 'Saving...' : 'Save Concern'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
};

export default AdminConcerns;
