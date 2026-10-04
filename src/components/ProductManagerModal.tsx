import React, { useState, useRef, useEffect } from 'react';
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
  Database,
  Cloud,
  CloudUpload,
  RefreshCw,
  Copy,
  ExternalLink,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Code,
  Download,
  Upload
} from 'lucide-react';
import { 
  checkDatabaseStatus, 
  DatabaseStatus, 
  migrateLocalProductsToCloud, 
  scanAllLocallyStoredProducts, 
  getSupabaseCredentials, 
  saveSupabaseCredentials,
  exportProductsToJsonFile,
  importProductsFromJsonArray,
  SUPABASE_SETUP_SQL 
} from '../services/cloudDatabase';

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
  onRefreshProducts?: () => void;
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
  onRefreshProducts,
}) => {
  const [activeTab, setActiveTab] = useState<'add' | 'list' | 'categories' | 'database'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState(categories[0] || 'Tech & Electronics');
  const [newCatInput, setNewCatInput] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [keyFeaturesText, setKeyFeaturesText] = useState('');
  const [productDetailsText, setProductDetailsText] = useState('');
  const [mainImage, setMainImage] = useState('');
  const [galleryImagesText, setGalleryImagesText] = useState('');
  const [amazonUrl, setAmazonUrl] = useState('');
  const [isNewDeal, setIsNewDeal] = useState(true);
  const [isNewArrival, setIsNewArrival] = useState(true);
  const [isTrending, setIsTrending] = useState(false);
  
  // UI feedback states
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  // Export / Import states
  const [isExporting, setIsExporting] = useState(false);
  const [isImportingFile, setIsImportingFile] = useState(false);

  // Database & Migration states
  const [dbStatus, setDbStatus] = useState<DatabaseStatus>({
    provider: 'none',
    isConfigured: false,
    isConnected: false,
    message: 'Checking database connection...',
  });
  const [checkingDb, setCheckingDb] = useState(false);
  const [localProductsCount, setLocalProductsCount] = useState<number>(0);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationSummary, setMigrationSummary] = useState<{
    newlyMigrated: number;
    alreadyExisted: number;
    total: number;
  } | null>(null);

  // Custom Supabase inputs in UI
  const [inputSupabaseUrl, setInputSupabaseUrl] = useState('');
  const [inputSupabaseAnonKey, setInputSupabaseAnonKey] = useState('');

  // Scan local products and check DB status when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const creds = getSupabaseCredentials();
    if (creds) {
      setInputSupabaseUrl(creds.url);
      setInputSupabaseAnonKey(creds.anonKey);
    }

    refreshDbAndLocalScan();
  }, [isOpen]);

  const refreshDbAndLocalScan = async () => {
    setCheckingDb(true);
    try {
      const scanned = scanAllLocallyStoredProducts();
      setLocalProductsCount(scanned.length);

      const status = await checkDatabaseStatus();
      setDbStatus(status);
    } catch (e: any) {
      console.warn('Error refreshing DB status:', e);
    } finally {
      setCheckingDb(false);
    }
  };

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
    setPrice(p.price || '');
    setOriginalPrice(p.originalPrice || '');
    setDiscount(p.discount || '');
    setShortDescription(p.shortDescription);
    setKeyFeaturesText((p.keyFeatures || []).join('\n'));
    
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
    setPrice('');
    setOriginalPrice('');
    setDiscount('');
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

    const payload = {
      name: name.trim(),
      category,
      price: price.trim() || undefined,
      originalPrice: originalPrice.trim() || undefined,
      discount: discount.trim() || undefined,
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
    };

    if (editingId) {
      onUpdateProduct(editingId, payload);
      setSuccessMsg('Product updated & saved to online database!');
    } else {
      onAddProduct(payload);
      setSuccessMsg('Product added & saved to online database!');
    }

    handleResetForm();
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  /**
   * EXPORT PRODUCTS: Collects all saved products from localStorage, IndexedDB,
   * and in-memory state into a single clean products.json file.
   */
  const handleExportProducts = async () => {
    setIsExporting(true);
    setErrorMsg('');
    try {
      const res = await exportProductsToJsonFile(products);
      setSuccessMsg(`Exported ${res.count} products into ${res.filename} successfully!`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(`Failed to export products: ${err?.message || String(err)}`);
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * IMPORT PRODUCTS: Reads products.json, skips duplicates, and saves to database.
   */
  const handleImportProductsFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImportingFile(true);
    setErrorMsg('');

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const rawContent = event.target?.result as string;
        const parsed = JSON.parse(rawContent);

        if (!Array.isArray(parsed)) {
          setErrorMsg('Invalid format: File must contain a JSON array of products.');
          setIsImportingFile(false);
          return;
        }

        const importResult = await importProductsFromJsonArray(parsed, products);

        if (importResult.addedProducts.length > 0) {
          if (onImportProducts) {
            onImportProducts([...products, ...importResult.addedProducts]);
          }
          if (onRefreshProducts) {
            onRefreshProducts();
          }
        }

        setSuccessMsg(
          `Import complete: ${importResult.importedCount} new products uploaded to database (${importResult.skippedCount} duplicates skipped)!`
        );
        setTimeout(() => setSuccessMsg(''), 5000);

        if (importResult.errors.length > 0) {
          setErrorMsg(`Warnings during import: ${importResult.errors.join(', ')}`);
        }

        await refreshDbAndLocalScan();
      } catch (err: any) {
        setErrorMsg('Failed to parse JSON file: ' + err.message);
      } finally {
        setIsImportingFile(false);
      }
    };

    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Safe migration handler for local products
  const handleMigrateLocalProducts = async () => {
    setIsMigrating(true);
    setErrorMsg('');
    setMigrationSummary(null);

    try {
      const res = await migrateLocalProductsToCloud();
      setMigrationSummary({
        newlyMigrated: res.newlyMigrated,
        alreadyExisted: res.alreadyExisted,
        total: res.totalScanned,
      });

      if (res.errors.length > 0) {
        setErrorMsg(`Migrated with warnings: ${res.errors.join(', ')}`);
      } else {
        setSuccessMsg(`Migration complete: ${res.newlyMigrated} products uploaded to the cloud database!`);
      }

      // Refresh product list and database status
      if (onRefreshProducts) onRefreshProducts();
      await refreshDbAndLocalScan();
    } catch (err: any) {
      setErrorMsg(`Migration error: ${err?.message || String(err)}`);
    } finally {
      setIsMigrating(false);
    }
  };

  // Save Supabase credentials entered directly in the modal
  const handleSaveSupabaseConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    try {
      saveSupabaseCredentials(inputSupabaseUrl, inputSupabaseAnonKey);
      setSuccessMsg('Database credentials saved in browser! Testing connection...');
      await refreshDbAndLocalScan();
      if (onRefreshProducts) onRefreshProducts();
    } catch (err: any) {
      setErrorMsg(`Failed to save config: ${err?.message || String(err)}`);
    }
  };

  const handleCopySqlScript = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
    } catch (e) {
      console.warn('Could not copy SQL', e);
    }
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
        <div className="px-6 py-4 bg-[#090A0F] text-[#F5F7FA] flex items-center justify-between border-b border-[#303541]">
          <div>
            <h2 className="text-lg font-bold font-display text-[#F5F7FA] flex items-center gap-2">
              <span>Deals On Point · Product Manager</span>
              {dbStatus.isConnected ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-sans font-medium px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" />
                  Cloud Online
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-sans font-medium px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <AlertCircle className="w-3 h-3" />
                  Cloud Ready
                </span>
              )}
            </h2>
            <p className="text-xs text-[#A7AFBF]">
              Save products directly to your online database with Amazon affiliate links & unique URLs
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#A7AFBF] hover:text-[#F5F7FA] rounded-lg hover:bg-[#181B24] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prominent Export & Import Toolbar (Always visible in Admin modal) */}
        <div className="bg-[#141822] border-b border-[#303541] px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#A7AFBF] font-medium flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-[#3B5BDB]" />
              Data Backup & Migration:
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Export Products Button */}
            <button
              type="button"
              onClick={handleExportProducts}
              disabled={isExporting}
              className="px-3.5 py-1.5 bg-[#3B5BDB] hover:bg-[#7657D5] text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="Collects all saved products into products.json without deleting any data"
            >
              <Download className={`w-3.5 h-3.5 ${isExporting ? 'animate-bounce' : ''}`} />
              <span>{isExporting ? 'Exporting...' : 'Export Products'}</span>
            </button>

            {/* Import Products Button */}
            <label className="px-3.5 py-1.5 bg-[#1E222D] hover:bg-[#282E3D] text-[#F5F7FA] border border-[#303541] hover:border-[#3B5BDB] text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer active:scale-95">
              <Upload className={`w-3.5 h-3.5 text-[#3B5BDB] ${isImportingFile ? 'animate-spin' : ''}`} />
              <span>{isImportingFile ? 'Uploading...' : 'Import Products'}</span>
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleImportProductsFile}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-[#303541] bg-[#0D1017] px-6 pt-3 gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('add')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
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
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
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
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'categories'
                ? 'border-[#3B5BDB] text-[#3B5BDB]'
                : 'border-transparent text-[#A7AFBF] hover:text-[#F5F7FA]'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Categories ({categories.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('database')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'database'
                ? 'border-[#3B5BDB] text-[#3B5BDB]'
                : 'border-transparent text-[#A7AFBF] hover:text-[#F5F7FA]'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-[#3B5BDB]" />
            <span>Cloud Database & Sync</span>
            {localProductsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-[#3B5BDB] text-white text-[10px] rounded-full font-bold">
                {localProductsCount}
              </span>
            )}
          </button>
        </div>

        {/* Notification Toasts */}
        {successMsg && (
          <div className="bg-emerald-500/15 border-b border-emerald-500/30 text-emerald-400 px-6 py-2.5 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="bg-rose-500/15 border-b border-rose-500/30 text-rose-400 px-6 py-2.5 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-grow">
          
          {/* TAB 1: ADD / EDIT PRODUCT */}
          {activeTab === 'add' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Local Storage Migration Banner if items detected */}
              {localProductsCount > 0 && !editingId && (
                <div className="p-3.5 rounded-xl bg-[#3B5BDB]/10 border border-[#3B5BDB]/30 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <CloudUpload className="w-5 h-5 text-[#3B5BDB] shrink-0" />
                    <p className="text-xs text-[#F5F7FA]">
                      <span className="font-semibold text-white">{localProductsCount} products</span> found saved in your current browser!
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleExportProducts}
                      className="px-2.5 py-1 bg-[#1E222D] hover:bg-[#282E3D] text-[#F5F7FA] border border-[#303541] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      Export Backup
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('database')}
                      className="px-3 py-1 bg-[#3B5BDB] hover:bg-[#7657D5] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      Import to Cloud →
                    </button>
                  </div>
                </div>
              )}

              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold text-[#F5F7FA] uppercase tracking-wider mb-1">
                  Product Name / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BLAVOR Solar Power Bank 10000mAh"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-[#181B24] border border-[#303541] text-[#F5F7FA] placeholder-[#747D8C] rounded-lg focus:outline-none focus:border-[#3B5BDB]"
                />
              </div>

              {/* Category & Pricing in Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                {/* Price Display */}
                <div>
                  <label className="block text-xs font-bold text-[#F5F7FA] uppercase tracking-wider mb-1 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-[#3B5BDB]" />
                    Current Price (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. $29.99"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-[#181B24] border border-[#303541] text-[#F5F7FA] placeholder-[#747D8C] rounded-lg focus:outline-none focus:border-[#3B5BDB]"
                  />
                </div>
              </div>

              {/* Additional Pricing / Discount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#F5F7FA] uppercase tracking-wider mb-1">
                    Original Price / List Price (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. $49.99 (shown with strikethrough)"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#181B24] border border-[#303541] text-[#F5F7FA] placeholder-[#747D8C] rounded-lg focus:outline-none focus:border-[#3B5BDB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#F5F7FA] uppercase tracking-wider mb-1">
                    Discount Badge / Savings (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 40% OFF or Save $20"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#181B24] border border-[#303541] text-[#F5F7FA] placeholder-[#747D8C] rounded-lg focus:outline-none focus:border-[#3B5BDB]"
                  />
                </div>
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
                    placeholder="https://... (direct image link or Unsplash)"
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
                  Product Description *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Concise, engaging summary of the product and what makes it valuable."
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
                  placeholder={`Wireless Qi charging + USB-C fast charge
Solar charging panel for emergencies
Rugged waterproof and shockproof design
Dual bright LED flashlight with compass`}
                  value={keyFeaturesText}
                  onChange={(e) => setKeyFeaturesText(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-[#181B24] border border-[#303541] text-[#F5F7FA] placeholder-[#747D8C] rounded-lg focus:outline-none focus:border-[#3B5BDB]"
                />
              </div>

              {/* Useful Product Information / Details */}
              <div>
                <label className="block text-xs font-bold text-[#F5F7FA] uppercase tracking-wider mb-1">
                  Technical Specifications (Format: Label: Value, one per line)
                </label>
                <textarea
                  rows={2}
                  placeholder={`Capacity: 10,000 mAh
Weight: 8.8 oz
Outputs: Qi Wireless + USB-A + USB-C`}
                  value={productDetailsText}
                  onChange={(e) => setProductDetailsText(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-[#181B24] border border-[#303541] text-[#F5F7FA] placeholder-[#747D8C] rounded-lg focus:outline-none focus:border-[#3B5BDB]"
                />
              </div>

              {/* Amazon Affiliate Link */}
              <div>
                <label className="block text-xs font-bold text-[#F5F7FA] uppercase tracking-wider mb-1 flex items-center gap-1">
                  <LinkIcon className="w-3.5 h-3.5 text-[#3B5BDB]" />
                  Amazon Associates Affiliate URL *
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
                  Customers are redirected to this Amazon affiliate link when clicking “View Deal on Amazon”.
                </p>
              </div>

              {/* Placement Toggles: New Deal, New Arrival, Trending */}
              <div className="p-4 bg-[#181B24] rounded-xl border border-[#303541]">
                <div className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider mb-3">
                  Product Badges & Placement
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#11131A] border border-[#303541] cursor-pointer hover:border-[#D63A4A] transition-colors">
                    <input
                      type="checkbox"
                      checked={isNewDeal}
                      onChange={(e) => setIsNewDeal(e.target.checked)}
                      className="w-4 h-4 text-[#D63A4A] rounded border-[#303541] bg-[#181B24] focus:ring-[#D63A4A]"
                    />
                    <div>
                      <div className="text-xs font-semibold text-[#F5F7FA]">New Deal</div>
                      <div className="text-[10px] text-[#747D8C]">Show red badge</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#11131A] border border-[#303541] cursor-pointer hover:border-[#7657D5] transition-colors">
                    <input
                      type="checkbox"
                      checked={isNewArrival}
                      onChange={(e) => setIsNewArrival(e.target.checked)}
                      className="w-4 h-4 text-[#7657D5] rounded border-[#303541] bg-[#181B24] focus:ring-[#7657D5]"
                    />
                    <div>
                      <div className="text-xs font-semibold text-[#F5F7FA]">New Arrival</div>
                      <div className="text-[10px] text-[#747D8C]">Show in New Arrivals</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#11131A] border border-[#303541] cursor-pointer hover:border-[#3B5BDB] transition-colors">
                    <input
                      type="checkbox"
                      checked={isTrending}
                      onChange={(e) => setIsTrending(e.target.checked)}
                      className="w-4 h-4 text-[#3B5BDB] rounded border-[#303541] bg-[#181B24] focus:ring-[#3B5BDB]"
                    />
                    <div>
                      <div className="text-xs font-semibold text-[#F5F7FA]">Trending</div>
                      <div className="text-[10px] text-[#747D8C]">Show in Trending Deals</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#303541]">
                {editingId && (
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="px-4 py-2 text-xs font-semibold text-[#A7AFBF] hover:text-[#F5F7FA] rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel Edit
                  </button>
                )}
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#3B5BDB] hover:bg-[#7657D5] text-white text-xs font-semibold rounded-lg shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingId ? 'Update Product in Cloud' : 'Publish Product to Cloud'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: LIST PRODUCTS */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#303541]">
                <div className="text-xs text-[#A7AFBF]">
                  Displaying <span className="font-semibold text-white">{products.length}</span> live products
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportProducts}
                    disabled={isExporting}
                    className="px-3 py-1.5 bg-[#3B5BDB] hover:bg-[#7657D5] text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isExporting ? 'Exporting...' : 'Export products.json'}</span>
                  </button>
                  <label className="px-3 py-1.5 bg-[#181B24] hover:bg-[#1E222D] text-[#A7AFBF] hover:text-white border border-[#303541] rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Import JSON</span>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".json"
                      onChange={handleImportProductsFile}
                      className="hidden"
                    />
                  </label>
                  {products.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Are you sure you want to clear all products?')) {
                          onClearAll();
                        }
                      }}
                      className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-12 text-[#747D8C] text-sm">
                  No products added yet. Use the "Add Product" tab above to add your first deal!
                </div>
              ) : (
                <div className="space-y-2.5">
                  {products.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 bg-[#181B24] border border-[#303541] rounded-xl flex items-center justify-between gap-4 group hover:border-[#3B5BDB]/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={p.mainImage}
                          alt={p.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 object-cover rounded-lg bg-[#11131A] shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-[#F5F7FA] truncate">
                            {p.name}
                          </h4>
                          <div className="flex items-center gap-2 text-[11px] text-[#747D8C] mt-0.5">
                            <span className="text-[#3B5BDB]">{p.category}</span>
                            <span>•</span>
                            <span className="font-mono text-[10px] text-[#A7AFBF]">/product/{p.slug}</span>
                            {p.price && (
                              <>
                                <span>•</span>
                                <span className="font-bold text-white">{p.price}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Copy Link */}
                        <button
                          type="button"
                          onClick={() => handleCopyProductUrl(p)}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            copiedSlug === p.slug
                              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                              : 'border-[#303541] text-[#A7AFBF] hover:text-[#3B5BDB] hover:border-[#3B5BDB]'
                          }`}
                          title="Copy direct product URL"
                        >
                          {copiedSlug === p.slug ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleEditClick(p)}
                          className="p-1.5 border border-[#303541] text-[#A7AFBF] hover:text-[#3B5BDB] hover:border-[#3B5BDB] rounded-lg transition-colors cursor-pointer"
                          title="Edit product"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete "${p.name}"?`)) {
                              onDeleteProduct(p.id);
                            }
                          }}
                          className="p-1.5 border border-[#303541] text-[#A7AFBF] hover:text-rose-400 hover:border-rose-400 rounded-lg transition-colors cursor-pointer"
                          title="Delete product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="space-y-5">
              <form onSubmit={handleCreateCategory} className="flex gap-2">
                <input
                  type="text"
                  placeholder="New category name (e.g. Smart Home)"
                  value={newCatInput}
                  onChange={(e) => setNewCatInput(e.target.value)}
                  className="flex-grow px-3.5 py-2 text-sm bg-[#181B24] border border-[#303541] text-[#F5F7FA] placeholder-[#747D8C] rounded-lg focus:outline-none focus:border-[#3B5BDB]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#3B5BDB] hover:bg-[#7657D5] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  Add Category
                </button>
              </form>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {categories.map((c) => (
                  <div
                    key={c}
                    className="p-3 bg-[#181B24] border border-[#303541] rounded-xl flex items-center justify-between text-xs text-[#F5F7FA]"
                  >
                    <span className="font-medium truncate">{c}</span>
                    <span className="text-[10px] text-[#747D8C] bg-[#11131A] px-2 py-0.5 rounded-full font-mono">
                      {products.filter((p) => p.category === c).length} deals
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CLOUD DATABASE & MIGRATION */}
          {activeTab === 'database' && (
            <div className="space-y-6">
              
              {/* 1. Database Connection Status */}
              <div className="p-4 rounded-xl bg-[#181B24] border border-[#303541] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cloud className="w-5 h-5 text-[#3B5BDB]" />
                    <h3 className="text-sm font-bold font-display text-white">
                      Online Database Status
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={refreshDbAndLocalScan}
                    disabled={checkingDb}
                    className="text-xs text-[#A7AFBF] hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <RefreshCw className={`w-3 h-3 ${checkingDb ? 'animate-spin' : ''}`} />
                    <span>Refresh Status</span>
                  </button>
                </div>

                <div className="p-3 rounded-lg bg-[#11131A] border border-[#303541] flex items-start gap-3">
                  {dbStatus.isConnected ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div className="text-xs space-y-1">
                    <p className={`font-semibold ${dbStatus.isConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {dbStatus.message}
                    </p>
                    {dbStatus.details && (
                      <p className="text-[#A7AFBF] text-[11px] leading-relaxed">
                        {dbStatus.details}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Export & Import JSON Section */}
              <div className="p-5 rounded-xl bg-[#181B24] border border-[#303541] space-y-4">
                <div>
                  <h3 className="text-sm font-bold font-display text-white flex items-center gap-2">
                    <Download className="w-4 h-4 text-[#3B5BDB]" />
                    Export & Import JSON File (products.json)
                  </h3>
                  <p className="text-xs text-[#A7AFBF] mt-1 leading-relaxed">
                    Export all products currently stored in your browser or database into a clean <code>products.json</code> file. You can safely keep this file as a backup or import it anytime into Supabase, Firebase, or another database without creating duplicate products.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleExportProducts}
                    disabled={isExporting}
                    className="px-4 py-2 bg-[#3B5BDB] hover:bg-[#7657D5] text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Download className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} />
                    <span>{isExporting ? 'Exporting...' : 'Export products.json'}</span>
                  </button>

                  <label className="px-4 py-2 bg-[#11131A] hover:bg-[#1E222D] text-[#F5F7FA] border border-[#303541] hover:border-[#3B5BDB] text-xs font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer">
                    <Upload className="w-4 h-4 text-[#3B5BDB]" />
                    <span>Import products.json to Database</span>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".json"
                      onChange={handleImportProductsFile}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* 3. One-Time Safe Browser Storage Migration */}
              <div className="p-5 rounded-xl bg-[#181B24] border border-[#303541] space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold font-display text-white flex items-center gap-2">
                      <CloudUpload className="w-4 h-4 text-[#3B5BDB]" />
                      Direct Browser-to-Cloud Migration
                    </h3>
                    <p className="text-xs text-[#A7AFBF] mt-1 leading-relaxed">
                      Safe migration: Reads all products currently saved in your browser storage (localStorage / IndexedDB) and uploads them directly to your online database. No data is lost or overwritten, and duplicate products are automatically skipped.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-[#11131A] border border-[#303541] flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs">
                    <span className="text-[#747D8C]">Locally detected products in this browser:</span>{' '}
                    <span className="font-bold text-white">{localProductsCount} products</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleMigrateLocalProducts}
                    disabled={isMigrating || localProductsCount === 0}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                      localProductsCount > 0
                        ? 'bg-[#3B5BDB] hover:bg-[#7657D5] text-white shadow-md'
                        : 'bg-[#303541] text-[#747D8C] cursor-not-allowed'
                    }`}
                  >
                    <CloudUpload className={`w-4 h-4 ${isMigrating ? 'animate-bounce' : ''}`} />
                    <span>{isMigrating ? 'Migrating Products...' : 'Import Existing Products'}</span>
                  </button>
                </div>

                {migrationSummary && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 space-y-1">
                    <p className="font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Migration Completed Successfully:
                    </p>
                    <ul className="list-disc list-inside text-[11px] text-[#A7AFBF] space-y-0.5 pl-1">
                      <li>Total products scanned: <strong className="text-white">{migrationSummary.total}</strong></li>
                      <li>Newly uploaded to online database: <strong className="text-emerald-400">{migrationSummary.newlyMigrated}</strong></li>
                      <li>Already present in online database (avoided duplicate): <strong className="text-white">{migrationSummary.alreadyExisted}</strong></li>
                    </ul>
                  </div>
                )}
              </div>

              {/* 4. Supabase Credentials Configuration */}
              <div className="p-5 rounded-xl bg-[#181B24] border border-[#303541] space-y-4">
                <div>
                  <h3 className="text-sm font-bold font-display text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-[#3B5BDB]" />
                    Supabase Online Database Settings
                  </h3>
                  <p className="text-xs text-[#A7AFBF] mt-1">
                    Connect your free Supabase project to make all added products instantly visible to every visitor on mobile, desktop, incognito, and Netlify.
                  </p>
                </div>

                <form onSubmit={handleSaveSupabaseConfig} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-[#F5F7FA] uppercase tracking-wider mb-1">
                      Supabase Project URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://xyzcompany.supabase.co"
                      value={inputSupabaseUrl}
                      onChange={(e) => setInputSupabaseUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-[#11131A] border border-[#303541] text-[#F5F7FA] placeholder-[#747D8C] rounded-lg font-mono text-xs focus:outline-none focus:border-[#3B5BDB]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#F5F7FA] uppercase tracking-wider mb-1">
                      Supabase Anon Public API Key
                    </label>
                    <input
                      type="text"
                      placeholder="eyJhbGciOi..."
                      value={inputSupabaseAnonKey}
                      onChange={(e) => setInputSupabaseAnonKey(e.target.value)}
                      className="w-full px-3 py-2 bg-[#11131A] border border-[#303541] text-[#F5F7FA] placeholder-[#747D8C] rounded-lg font-mono text-xs focus:outline-none focus:border-[#3B5BDB]"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <a
                      href="https://supabase.com/dashboard"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#3B5BDB] hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <span>Open Supabase Dashboard</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#3B5BDB] hover:bg-[#7657D5] text-white font-semibold rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save & Test Connection</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* 5. Supabase SQL Setup Script (1-Click Copy) */}
              <div className="p-5 rounded-xl bg-[#181B24] border border-[#303541] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold font-display text-white flex items-center gap-2">
                    <Code className="w-4 h-4 text-[#3B5BDB]" />
                    Supabase SQL Table Script (1-Click Setup)
                  </h3>
                  <button
                    type="button"
                    onClick={handleCopySqlScript}
                    className="px-3 py-1 bg-[#11131A] hover:bg-[#1E222D] text-xs font-semibold text-white border border-[#303541] hover:border-[#3B5BDB] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedSql ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied SQL!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-[#747D8C]" />
                        <span>Copy SQL</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-[#A7AFBF]">
                  In your Supabase project, go to the <strong>SQL Editor</strong> tab on the left, paste this script, and click <strong>Run</strong>. This creates the <code className="text-white bg-[#11131A] px-1 py-0.5 rounded">products</code> table and enables public access so all visitors can browse your deals.
                </p>
                <pre className="p-3 bg-[#090A0F] border border-[#303541] rounded-lg text-[11px] font-mono text-[#A7AFBF] overflow-x-auto max-h-36">
                  {SUPABASE_SETUP_SQL}
                </pre>
              </div>

              {/* 6. Netlify Environment Variables Guide */}
              <div className="p-5 rounded-xl bg-[#181B24] border border-[#303541] space-y-3 text-xs">
                <h3 className="text-sm font-bold font-display text-white">
                  Netlify Deployment Configuration
                </h3>
                <p className="text-[#A7AFBF] leading-relaxed">
                  To have your site automatically connect to your online database when deployed on Netlify:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-[#A7AFBF] pl-1">
                  <li>Go to your <strong>Netlify Site Dashboard</strong> &rarr; <strong>Site configuration</strong> &rarr; <strong>Environment variables</strong>.</li>
                  <li>Add variable <code className="text-white font-mono bg-[#11131A] px-1.5 py-0.5 rounded">VITE_SUPABASE_URL</code> with your Project URL.</li>
                  <li>Add variable <code className="text-white font-mono bg-[#11131A] px-1.5 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code> with your anon public key.</li>
                  <li>Click <strong>Trigger deploy</strong> &rarr; <strong>Deploy site</strong>.</li>
                </ol>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
