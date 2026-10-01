import React, { useState, useRef } from 'react';
import { Product } from '../types/product';
import { 
  X, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Image as ImageIcon, 
  Link as LinkIcon,
  Tag,
  Layers,
  Info,
  Download,
  Upload,
  Copy,
  CheckCircle2
} from 'lucide-react';

interface ProductManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  categories: string[];
  onAddProduct: (productData: Omit<Product, 'id' | 'slug' | 'createdAt'>) => void;
  onUpdateProduct: (id: string, updates: Partial<Product>) => void;
  onDeleteProduct: (id: string) => void;
  onAddCategory: (category: string) => void;
  onClearAll: () => void;
  onImportProducts?: (importedProducts: Product[]) => void;
}

export const ProductManagerModal: React.FC<ProductManagerModalProps> = ({
  isOpen,
  onClose,
  products,
  categories,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onAddCategory,
  onClearAll,
  onImportProducts,
}) => {
  const [activeTab, setActiveTab] = useState<'add' | 'list' | 'categories'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState(categories[0] || 'Tech & Electronics');
  const [newCatInput, setNewCatInput] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [keyFeaturesText, setKeyFeaturesText] = useState('');
  const [productDetailsText, setProductDetailsText] = useState('');
  const [mainImage, setMainImage] = useState('');
  const [galleryImagesText, setGalleryImagesText] = useState('');
  const [amazonUrl, setAmazonUrl] = useState('');
  const [isNewDeal, setIsNewDeal] = useState(true);
  const [isNewArrival, setIsNewArrival] = useState(true);
  const [isTrending, setIsTrending] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyProductUrl = async (p: Product) => {
    try {
      const url = typeof window !== 'undefined'
        ? `${window.location.origin}/product/${p.slug}`
        : `https://dealsonpoint.com/product/${p.slug}`;
      await navigator.clipboard.writeText(url);
      setCopiedSlug(p.slug);
      setTimeout(() => setCopiedSlug(null), 2000);
    } catch (e) {
      console.warn('Could not copy link', e);
    }
  };

  const handleEditClick = (p: Product) => {
    setEditingId(p.id);
    setName(p.name);
    setCategory(p.category);
    setShortDescription(p.shortDescription);
    setKeyFeaturesText(p.keyFeatures.join('\n'));
    
    // Format details
    if (p.details) {
      const detailsLines = Object.entries(p.details).map(([k, v]) => `${k}: ${v}`).join('\n');
      setProductDetailsText(detailsLines);
    } else {
      setProductDetailsText('');
    }

    setMainImage(p.mainImage);
    setGalleryImagesText((p.galleryImages || []).join('\n'));
    setAmazonUrl(p.amazonUrl);
    setIsNewDeal(p.isNewDeal);
    setIsNewArrival(p.isNewArrival);
    setIsTrending(p.isTrending);
    setActiveTab('add');
  };

  const handleResetForm = () => {
    setEditingId(null);
    setName('');
    setCategory(categories[0] || 'Tech & Electronics');
    setShortDescription('');
    setKeyFeaturesText('');
    setProductDetailsText('');
    setMainImage('');
    setGalleryImagesText('');
    setAmazonUrl('');
    setIsNewDeal(true);
    setIsNewArrival(true);
    setIsTrending(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    // Parse features
    const keyFeatures = keyFeaturesText
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    // Parse details (Key: Value)
    const details: Record<string, string> = {};
    productDetailsText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .forEach((line) => {
        const parts = line.split(':');
        if (parts.length >= 2) {
          const k = parts[0].trim();
          const v = parts.slice(1).join(':').trim();
          if (k && v) details[k] = v;
        }
      });

    // Parse gallery
    const gallery = galleryImagesText
      .split('\n')
      .map((u) => u.trim())
      .filter(Boolean);

    const finalMainImage = mainImage.trim() || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80';
    const finalGallery = gallery.length > 0 ? gallery : [finalMainImage];

    let badge: Product['badge'] = undefined;
    if (isNewDeal) badge = 'NEW DEAL';
    else if (isTrending) badge = 'TRENDING';
    else if (isNewArrival) badge = 'NEW';

    if (editingId) {
      onUpdateProduct(editingId, {
        name: name.trim(),
        category,
        shortDescription: shortDescription.trim(),
        keyFeatures,
        details: Object.keys(details).length > 0 ? details : undefined,
        mainImage: finalMainImage,
        galleryImages: finalGallery,
        amazonUrl: amazonUrl.trim() || 'https://www.amazon.com',
        isNewDeal,
        isNewArrival,
        isTrending,
        badge,
      });
      setSuccessMsg('Product updated successfully!');
    } else {
      onAddProduct({
        name: name.trim(),
        category,
        shortDescription: shortDescription.trim(),
        keyFeatures,
        details: Object.keys(details).length > 0 ? details : undefined,
        mainImage: finalMainImage,
        galleryImages: finalGallery,
        amazonUrl: amazonUrl.trim() || 'https://www.amazon.com',
        isNewDeal,
        isNewArrival,
        isTrending,
        badge,
      });
      setSuccessMsg('Product added to Deals On Point!');
    }

    handleResetForm();
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDownloadJson = () => {
    try {
      const dataStr = JSON.stringify(products, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'products.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSuccessMsg('Downloaded products.json backup successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      alert('Could not download file: ' + err.message);
    }
  };

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(products, null, 2));
      setSuccessMsg('Copied products JSON to clipboard!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      alert('Could not copy JSON: ' + err.message);
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          if (onImportProducts) {
            onImportProducts(parsed);
          }
          setSuccessMsg(`Imported ${parsed.length} products successfully!`);
          setTimeout(() => setSuccessMsg(''), 3000);
        } else {
          alert('Invalid format: File must contain a JSON array of products.');
        }
      } catch (err: any) {
        alert('Failed to parse JSON file: ' + err.message);
      }
    };
    reader.readAsText(file);
    // Reset file input so user can re-import if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatInput.trim()) return;
    onAddCategory(newCatInput.trim());
    setCategory(newCatInput.trim());
    setNewCatInput('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans animate-fadeIn">
      <div className="bg-[#11131A] text-[#F5F7FA] rounded-2xl max-w-3xl w-full shadow-2xl border border-[#303541] overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-[#090A0F] text-[#F5F7FA] flex items-center justify-between border-b border-[#303541]">
          <div>
            <h2 className="text-lg font-bold font-display text-[#F5F7FA]">
              Deals On Point · Product Manager
            </h2>
            <p className="text-xs text-[#A7AFBF]">
              Manually add products, images, and your Amazon Associates affiliate link
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#A7AFBF] hover:text-[#F5F7FA] rounded-lg hover:bg-[#181B24] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-[#303541] bg-[#0D1017] px-6 pt-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('add')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'add'
                ? 'border-[#3B5BDB] text-[#3B5BDB]'
                : 'border-transparent text-[#A7AFBF] hover:text-[#F5F7FA]'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{editingId ? 'Edit Product' : 'Add Product'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'list'
                ? 'border-[#3B5BDB] text-[#3B5BDB]'
                : 'border-transparent text-[#A7AFBF] hover:text-[#F5F7FA]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Added Products ({products.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'categories'
                ? 'border-[#3B5BDB] text-[#3B5BDB]'
                : 'border-transparent text-[#A7AFBF] hover:text-[#F5F7FA]'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Categories ({categories.length})</span>
          </button>
        </div>

        {/* Notification Toast */}
        {successMsg && (
          <div className="bg-[#3B5BDB]/20 border-b border-[#3B5BDB]/40 text-[#3B5BDB] px-6 py-2.5 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-[#3B5BDB]" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-grow">
          
          {activeTab === 'add' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold text-[#F5F7FA] uppercase tracking-wider mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Portable Power Bank"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-[#181B24] border border-[#303541] text-[#F5F7FA] placeholder-[#747D8C] rounded-lg focus:outline-none focus:border-[#3B5BDB]"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-[#F5F7FA] uppercase tracking-wider mb-1">
                  Product Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-[#181B24] border border-[#303541] text-[#F5F7FA] rounded-lg focus:outline-none focus:border-[#3B5BDB]"
                >
                  {categories.map((c) => (
                    <option key={c} value={c} className="bg-[#181B24] text-[#F5F7FA]">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Product Images */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#F5F7FA] uppercase tracking-wider mb-1 flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-[#3B5BDB]" />
                    Main Product Image URL *
                  </label>
                  <input
                    type="url"
                    placeholder="https://... (direct image link)"
                    value={mainImage}
                    onChange={(e) => setMainImage(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#181B24] border border-[#303541] text-[#F5F7FA] placeholder-[#747D8C] rounded-lg focus:outline-none focus:border-[#3B5BDB]"
                  />
                  <p className="text-[11px] text-[#747D8C] mt-1">High-resolution photo recommended.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#F5F7FA] uppercase tracking-wider mb-1">
                    Additional Gallery Images (1 URL per line)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="https://... image 2&#10;https://... image 3"
                    value={galleryImagesText}
                    onChange={(e) => setGalleryImagesText(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#181B24] border border-[#303541] text-[#F5F7FA] placeholder-[#747D8C] rounded-lg focus:outline-none focus:border-[#3B5BDB]"
                  />
                </div>
              </div>

              {/* Short Product Description */}
              <div>
                <label className="block text-xs font-bold text-[#F5F7FA] uppercase tracking-wider mb-1">
                  Product Description / Information *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Concise, clear description of the product and what makes it useful."
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-[#181B24] border border-[#303541] text-[#F5F7FA] placeholder-[#747D8C] rounded-lg focus:outline-none focus:border-[#3B5BDB]"
                />
              </div>

              {/* Key Features */}
              <div>
                <label className="block text-xs font-bold text-[#F5F7FA] uppercase tracking-wider mb-1">
                  Key Features (One feature per line)
                </label>
                <textarea
                  rows={3}
                  placeholder={`Compact magnetic portable charger
Strong magnetic snap aligned for effortless wireless charging
USB-C fast charging port for rapid top-ups`}
                  value={keyFeaturesText}
                  onChange={(e) => setKeyFeaturesText(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-[#181B24] border border-[#303541] text-[#F5F7FA] placeholder-[#747D8C] rounded-lg focus:outline-none focus:border-[#3B5BDB]"
                />
              </div>

              {/* Useful Product Information / Details */}
              <div>
                <label className="block text-xs font-bold text-[#F5F7FA] uppercase tracking-wider mb-1">
                  Useful Product Details (Format: Label: Value, one per line)
                </label>
                <textarea
                  rows={2}
                  placeholder={`Capacity: 10,000 mAh
Weight: 6.8 oz
Material: Anodized Aluminum`}
                  value={productDetailsText}
                  onChange={(e) => setProductDetailsText(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-[#181B24] border border-[#303541] text-[#F5F7FA] placeholder-[#747D8C] rounded-lg focus:outline-none focus:border-[#3B5BDB]"
                />
              </div>

              {/* Amazon Affiliate Link */}
              <div>
                <label className="block text-xs font-bold text-[#F5F7FA] uppercase tracking-wider mb-1 flex items-center gap-1">
                  <LinkIcon className="w-3.5 h-3.5 text-[#3B5BDB]" />
                  Amazon Associates Affiliate Link *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://www.amazon.com/dp/.../?tag=yourtag-20"
                  value={amazonUrl}
                  onChange={(e) => setAmazonUrl(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-[#181B24] border border-[#303541] text-[#F5F7FA] placeholder-[#747D8C] rounded-lg focus:outline-none focus:border-[#3B5BDB] font-mono text-xs"
                />
                <p className="text-[11px] text-[#747D8C] mt-1">
                  Your individual affiliate link for this product. Customers will visit this link when clicking “View Deal on Amazon”.
                </p>
              </div>

              {/* Placement Toggles: New Deal, New Arrival, Trending */}
              <div className="p-4 bg-[#181B24] rounded-xl border border-[#303541]">
                <div className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider mb-3">
                  Product Placement & Badges
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  {/* New Deal */}
                  <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#11131A] border border-[#303541] cursor-pointer hover:border-[#D63A4A] transition-colors">
                    <input
                      type="checkbox"
                      checked={isNewDeal}
                      onChange={(e) => setIsNewDeal(e.target.checked)}
                      className="w-4 h-4 text-[#D63A4A] rounded border-[#303541] bg-[#181B24] focus:ring-[#D63A4A]"
                    />
                    <div>
                      <div className="text-xs font-semibold text-[#F5F7FA]">New Deal</div>
                      <div className="text-[10px] text-[#747D8C]">Show in “New Deals”</div>
                    </div>
                  </label>

                  {/* New Arrival */}
                  <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#11131A] border border-[#303541] cursor-pointer hover:border-[#7657D5] transition-colors">
                    <input
                      type="checkbox"
                      checked={isNewArrival}
                      onChange={(e) => setIsNewArrival(e.target.checked)}
                      className="w-4 h-4 text-[#7657D5] rounded border-[#303541] bg-[#181B24] focus:ring-[#7657D5]"
                    />
                    <div>
                      <div className="text-xs font-semibold text-[#F5F7FA]">New Arrival</div>
                      <div className="text-[10px] text-[#747D8C]">Show in “New Arrivals”</div>
                    </div>
                  </label>

                  {/* Trending */}
                  <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#11131A] border border-[#303541] cursor-pointer hover:border-[#3B5BDB] transition-colors">
                    <input
                      type="checkbox"
                      checked={isTrending}
                      onChange={(e) => setIsTrending(e.target.checked)}
                      className="w-4 h-4 text-[#3B5BDB] rounded border-[#303541] bg-[#181B24] focus:ring-[#3B5BDB]"
                    />
                    <div>
                      <div className="text-xs font-semibold text-[#F5F7FA]">Trending</div>
                      <div className="text-[10px] text-[#747D8C]">Show in “Trending Finds”</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#303541]">
                {editingId && (
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="px-4 py-2 text-xs font-medium text-[#A7AFBF] hover:text-[#F5F7FA] border border-[#303541] rounded-lg hover:bg-[#181B24] transition-colors cursor-pointer"
                  >
                    Cancel Editing
                  </button>
                )}
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-semibold text-white bg-[#3B5BDB] hover:bg-[#7657D5] rounded-lg transition-colors shadow-md shadow-[#3B5BDB]/20 cursor-pointer"
                >
                  {editingId ? 'Save Changes' : 'Publish Product to Deals On Point'}
                </button>
              </div>

            </form>
          )}

          {activeTab === 'list' && (
            <div className="space-y-4">
              
              {/* Data Sync & Backup Toolbar for Netlify & Source of Truth */}
              <div className="p-3.5 bg-[#181B24] rounded-xl border border-[#303541] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-[#A7AFBF]">
                  <CheckCircle2 className="w-4 h-4 text-[#3B5BDB] shrink-0" />
                  <span>
                    <strong className="text-[#F5F7FA]">Single Source of Truth:</strong> Synced for Netlify deployments &amp; live preview.
                  </span>
                </div>
                
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".json,application/json"
                    onChange={handleImportFile}
                    className="hidden"
                  />
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1.5 bg-[#11131A] hover:bg-[#1E222D] border border-[#303541] text-[#F5F7FA] rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Import a products.json file"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#3B5BDB]" />
                    <span>Import JSON</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyJson}
                    className="px-2.5 py-1.5 bg-[#11131A] hover:bg-[#1E222D] border border-[#303541] text-[#F5F7FA] rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Copy all products data to clipboard as JSON"
                  >
                    <Copy className="w-3.5 h-3.5 text-[#7657D5]" />
                    <span>Copy JSON</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadJson}
                    className="px-2.5 py-1.5 bg-[#3B5BDB]/20 hover:bg-[#3B5BDB]/30 border border-[#3B5BDB]/40 text-[#3B5BDB] rounded-md transition-colors flex items-center gap-1.5 cursor-pointer font-semibold"
                    title="Download backup file of all products"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Backup</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#A7AFBF] pb-2 border-b border-[#303541]">
                <span>{products.length === 0 ? 'No products have been added yet.' : `${products.length} products published`}</span>
                {products.length > 0 && (
                  <button
                    onClick={onClearAll}
                    className="text-xs text-[#D63A4A] hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear all products</span>
                  </button>
                )}
              </div>

              {products.length === 0 ? (
                <div className="py-12 text-center text-[#747D8C] text-xs">
                  <p>Your product list is completely clean and empty.</p>
                  <button
                    onClick={() => setActiveTab('add')}
                    className="mt-3 text-[#3B5BDB] hover:underline font-semibold cursor-pointer"
                  >
                    Click here to add your first product
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-[#303541] max-h-[50vh] overflow-y-auto">
                  {products.map((p) => (
                    <div key={p.id} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-lg bg-[#181B24] overflow-hidden shrink-0 border border-[#303541]">
                          <img
                            src={p.mainImage}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-[#F5F7FA] truncate">
                            {p.name}
                          </div>
                          <div className="text-xs text-[#747D8C] flex items-center gap-2">
                            <span>{p.category}</span>
                            {p.isNewDeal && (
                              <span className="text-[#D63A4A] font-bold text-[10px]">Deal</span>
                            )}
                            {p.isTrending && (
                              <span className="text-[#3B5BDB] font-bold text-[10px]">Trending</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopyProductUrl(p)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            copiedSlug === p.slug 
                              ? 'text-emerald-400 bg-emerald-500/10' 
                              : 'text-[#A7AFBF] hover:text-[#3B5BDB] hover:bg-[#181B24]'
                          }`}
                          title={copiedSlug === p.slug ? "URL copied to clipboard!" : "Copy direct product URL"}
                        >
                          {copiedSlug === p.slug ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <LinkIcon className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEditClick(p)}
                          className="p-1.5 text-[#A7AFBF] hover:text-[#3B5BDB] hover:bg-[#181B24] rounded-lg transition-colors cursor-pointer"
                          title="Edit product"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteProduct(p.id)}
                          className="p-1.5 text-[#A7AFBF] hover:text-[#D63A4A] hover:bg-[#181B24] rounded-lg transition-colors cursor-pointer"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="space-y-5">
              <form onSubmit={handleCreateCategory} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter new category name..."
                  value={newCatInput}
                  onChange={(e) => setNewCatInput(e.target.value)}
                  className="flex-grow px-3.5 py-2 text-sm bg-[#181B24] border border-[#303541] text-[#F5F7FA] placeholder-[#747D8C] rounded-lg focus:outline-none focus:border-[#3B5BDB]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#3B5BDB] hover:bg-[#7657D5] rounded-lg transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Category</span>
                </button>
              </form>

              <div className="border border-[#303541] rounded-xl overflow-hidden divide-y divide-[#303541]">
                {categories.map((c) => {
                  const count = products.filter((p) => p.category === c).length;
                  return (
                    <div key={c} className="p-3.5 flex items-center justify-between bg-[#181B24] text-sm">
                      <span className="font-medium text-[#F5F7FA]">{c}</span>
                      <span className="text-xs text-[#A7AFBF] bg-[#11131A] px-2.5 py-0.5 rounded-full border border-[#303541]">
                        {count} {count === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
