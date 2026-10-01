import React, { useState, useEffect, useMemo } from 'react';
import { Product, NavSection, LegalModalType } from './types/product';
import { 
  getStoredProducts, 
  getStoredCategories, 
  saveCategories, 
  addProductToStorage, 
  updateProductInStorage, 
  deleteProductFromStorage,
  clearAllProducts,
  fetchProductsFromBackend,
  fetchCategoriesFromBackend
} from './services/productStorage';
import { TopDisclosureBar } from './components/TopDisclosureBar';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { ProductDetail } from './components/ProductDetail';
import { CategorySection } from './components/CategorySection';
import { HowItWorks } from './components/HowItWorks';
import { EmptyState } from './components/EmptyState';
import { ProductManagerModal } from './components/ProductManagerModal';
import { TrustModals } from './components/TrustModals';
import { Footer } from './components/Footer';
import { Tag, Clock, Search, X, Info } from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeSection, setActiveSection] = useState<NavSection>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [activeLegalModal, setActiveLegalModal] = useState<LegalModalType>(null);

  // Helper to parse URL on load/change for /products/:slug or ?product=:slug
  const resolveUrlProduct = (productList: Product[]) => {
    const path = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    let targetSlug = searchParams.get('product');

    if (!targetSlug && path.startsWith('/products/')) {
      targetSlug = path.replace('/products/', '').replace(/\/$/, '');
    }

    if (targetSlug) {
      try {
        targetSlug = decodeURIComponent(targetSlug).trim();
      } catch (e) {
        // ignore
      }
      const found = productList.find(
        (p) => p.slug.toLowerCase() === targetSlug!.toLowerCase() || p.id === targetSlug
      );
      if (found) {
        setSelectedProduct(found);
        document.title = `${found.name} - Deals On Point`;
        return;
      }
    } else {
      setSelectedProduct(null);
      document.title = 'Deals On Point - Smart Finds. Deals On Point.';
    }
  };

  // Initialize data and check URL for deep-linked product
  useEffect(() => {
    // 1. Instant local load
    const initialProducts = getStoredProducts();
    const initialCategories = getStoredCategories();
    setProducts(initialProducts);
    setCategories(initialCategories);
    resolveUrlProduct(initialProducts);

    // 2. Fetch from Netlify Database API in the background
    fetchProductsFromBackend().then((latestProducts) => {
      if (latestProducts && Array.isArray(latestProducts)) {
        setProducts(latestProducts);
        resolveUrlProduct(latestProducts);
      }
    });

    fetchCategoriesFromBackend().then((latestCats) => {
      if (latestCats && latestCats.length > 0) {
        setCategories(latestCats);
      }
    });

    // Listen to browser popstate (back/forward)
    const handlePopState = () => {
      const currentList = getStoredProducts();
      resolveUrlProduct(currentList);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update browser URL when a product is opened or closed
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    document.title = `${product.name} - Deals On Point`;
    try {
      const newUrl = `/products/${product.slug}`;
      window.history.pushState({ productId: product.id }, '', newUrl);
    } catch (e) {
      console.warn('Could not pushState', e);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToDiscovery = () => {
    setSelectedProduct(null);
    document.title = 'Deals On Point - Smart Finds. Deals On Point.';
    try {
      window.history.pushState({}, '', '/');
    } catch (e) {
      console.warn('Could not pushState', e);
    }
  };

  // Header navigation smooth jump
  const handleNavigate = (section: NavSection) => {
    setActiveSection(section);

    // If currently viewing a product detail, return to discovery first
    if (selectedProduct) {
      setSelectedProduct(null);
      try {
        window.history.pushState({}, '', '/');
      } catch (e) {
        console.warn('Could not pushState', e);
      }
    }

    if (section === 'home') {
      setSelectedCategory(null);
      setSearchQuery('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (section === 'deals' || section === 'new-deals') {
      setSelectedCategory(null);
      const el = document.getElementById('deals-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (section === 'new-arrivals') {
      setSelectedCategory(null);
      const el = document.getElementById('new-arrivals-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (section === 'categories') {
      const el = document.getElementById('categories-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Management methods for adding/editing products
  const handleAddProduct = (productData: Omit<Product, 'id' | 'slug' | 'createdAt'>) => {
    const newProduct = addProductToStorage(productData);
    setProducts(getStoredProducts());
    setCategories(getStoredCategories());
    return newProduct;
  };

  const handleUpdateProduct = (id: string, updates: Partial<Product>) => {
    updateProductInStorage(id, updates);
    setProducts(getStoredProducts());
    if (selectedProduct && selectedProduct.id === id) {
      const updated = getStoredProducts().find((p) => p.id === id);
      if (updated) setSelectedProduct(updated);
    }
  };

  const handleDeleteProduct = (id: string) => {
    deleteProductFromStorage(id);
    setProducts(getStoredProducts());
    if (selectedProduct && selectedProduct.id === id) {
      handleBackToDiscovery();
    }
  };

  const handleAddCategory = (newCat: string) => {
    const updated = [...categories, newCat];
    saveCategories(updated);
    setCategories(updated);
  };

  const handleClearAll = () => {
    clearAllProducts();
    setProducts([]);
    if (selectedProduct) {
      handleBackToDiscovery();
    }
  };

  // Product counts by category
  const productCountByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    products.forEach((p) => {
      map[p.category] = (map[p.category] || 0) + 1;
    });
    return map;
  }, [products]);

  // Filtered products when search or category filter is active
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const inName = p.name.toLowerCase().includes(q);
      const inCat = p.category.toLowerCase().includes(q);
      const inDesc = p.shortDescription.toLowerCase().includes(q);
      const inFeatures = p.keyFeatures.some((f) => f.toLowerCase().includes(q));

      return inName || inCat || inDesc || inFeatures;
    });
  }, [products, searchQuery, selectedCategory]);

  // Distinct groups for Deals On Point
  const deals = useMemo(() => {
    return products.filter((p) => p.isNewDeal || p.badge === 'NEW DEAL');
  }, [products]);

  const newArrivals = useMemo(() => {
    return products.filter((p) => p.isNewArrival || p.badge === 'NEW');
  }, [products]);

  const isFiltering = Boolean(searchQuery.trim() || selectedCategory);

  return (
    <div className="min-h-screen flex flex-col bg-[#090A0F] text-[#F5F7FA] font-sans selection:bg-[#3B5BDB] selection:text-white">
      
      {/* Top Affiliate Disclosure Bar */}
      <TopDisclosureBar onOpenLegal={(type) => setActiveLegalModal(type)} />

      {/* Top Header (Sticky Dark Semi-Transparent) */}
      <Header
        activeSection={activeSection}
        onNavigate={handleNavigate}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (selectedProduct) setSelectedProduct(null);
        }}
        onOpenLegal={(type) => setActiveLegalModal(type)}
        onOpenManager={() => setIsManagerOpen(true)}
        hasProducts={products.length > 0}
      />

      {/* Main Content Area */}
      <main className="flex-grow">
        {selectedProduct ? (
          /* PRODUCT DETAIL DEDICATED VIEW (dealsonpoint.com/products/product-name) */
          <ProductDetail
            product={selectedProduct}
            onBack={handleBackToDiscovery}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setSelectedProduct(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : (
          /* HOMEPAGE & DISCOVERY FEED */
          <div>
            {/* Show Hero only when not filtering */}
            {!isFiltering && (
              <Hero
                onExploreDeals={() => {
                  const el = document.getElementById('deals-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                onBrowseCategories={() => {
                  const el = document.getElementById('categories-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            )}

            {/* If user is actively searching or filtering by category */}
            {isFiltering ? (
              <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-[#090A0F]">
                
                {/* Search / Filter Active Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-[#303541] gap-3">
                  <div>
                    <span className="text-[11px] sm:text-[12px] font-display font-bold uppercase tracking-[0.08em] text-[#3B5BDB]">
                      Discovery Results
                    </span>
                    <h2 className="text-[24px] sm:text-[30px] font-display font-semibold text-[#F5F7FA] tracking-tight mt-0.5">
                      {selectedCategory ? `${selectedCategory}` : 'Search Results'}
                      {searchQuery && (
                        <span className="text-[#A7AFBF] font-normal text-[20px] sm:text-[24px] ml-2 font-display">
                          matching “{searchQuery}”
                        </span>
                      )}
                    </h2>
                    <p className="text-[13px] sm:text-[14px] text-[#A7AFBF] font-sans mt-1">
                      {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
                    </p>
                  </div>

                  {/* Reset Filters button */}
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory(null);
                    }}
                    className="self-start sm:self-auto px-4 py-2 text-[14px] font-sans font-semibold text-[#F5F7FA] bg-[#181B24] hover:bg-[#1E222D] border border-[#303541] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5 text-[#A7AFBF]" />
                    <span>Clear Filters</span>
                  </button>
                </div>

                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onSelectProduct={handleSelectProduct}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-[#11131A] rounded-2xl border border-[#303541] p-8 max-w-xl mx-auto font-sans shadow-xl">
                    <Search className="w-10 h-10 text-[#747D8C] mx-auto mb-3" />
                    <h3 className="text-[20px] sm:text-[22px] font-display font-semibold text-[#F5F7FA] mb-1.5 tracking-tight">
                      {products.length === 0
                        ? 'New deals are coming soon.'
                        : 'No matching products found'}
                    </h3>
                    <p className="text-[14px] sm:text-[15px] text-[#A7AFBF] mb-6 leading-relaxed font-normal">
                      {products.length === 0
                        ? 'We’re getting Deals On Point ready with products worth discovering. Check back soon.'
                        : 'Try searching with different keywords, or clear your filters to view all categories.'}
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory(null);
                      }}
                      className="px-6 py-2.5 text-[14px] sm:text-[15px] font-sans font-semibold text-white bg-[#3B5BDB] hover:bg-[#7657D5] rounded-lg transition-colors shadow-md shadow-[#3B5BDB]/20 cursor-pointer"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </section>
            ) : (
              /* STANDARD HOMEPAGE PRESENTATION WITH ALTERNATING DARK SECTIONS */
              <div className="font-sans">
                
                {/* 1. LATEST DEALS (Background: Graphite Black #11131A) */}
                <section id="deals-section" className="py-16 sm:py-20 bg-[#11131A] border-b border-[#303541]/70">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2">
                      <div>
                        <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-[12px] font-display font-bold uppercase tracking-[0.08em] text-[#D63A4A] mb-1">
                          <Tag className="w-3.5 h-3.5 fill-current" />
                          <span>Curated Savings</span>
                        </div>
                        <h2 className="text-[24px] sm:text-[30px] lg:text-[32px] font-display font-semibold text-[#F5F7FA] tracking-tight leading-tight">
                          Latest <span className="text-[#3B5BDB]">Deals</span>
                        </h2>
                        <p className="text-[14px] sm:text-[15px] font-sans text-[#A7AFBF] mt-1 font-normal">
                          Fresh finds worth checking out.
                        </p>
                      </div>

                      {deals.length > 0 && (
                        <span className="text-[13px] font-sans font-medium text-[#747D8C]">
                          {deals.length} {deals.length === 1 ? 'deal' : 'deals'}
                        </span>
                      )}
                    </div>

                    {deals.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {deals.map((product) => (
                          <ProductCard
                            key={product.id}
                            product={product}
                            onSelectProduct={handleSelectProduct}
                          />
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        title="Great deals are coming soon."
                        subtitle="Fresh finds are being added to Deals On Point. Check back soon."
                        onAddProduct={() => setIsManagerOpen(true)}
                        actionText="Add Product to Deals"
                      />
                    )}
                  </div>
                </section>

                {/* 2. HOW IT WORKS (Background: Charcoal Gray #181B24) */}
                <HowItWorks />

                {/* 3. NEW ARRIVALS (Background: Midnight Black #090A0F) */}
                <section id="new-arrivals-section" className="py-16 sm:py-20 bg-[#090A0F] border-b border-[#303541]/70">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2">
                      <div>
                        <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-[12px] font-display font-bold uppercase tracking-[0.08em] text-[#7657D5] mb-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Latest Additions</span>
                        </div>
                        <h2 className="text-[24px] sm:text-[30px] lg:text-[32px] font-display font-semibold text-[#F5F7FA] tracking-tight leading-tight">
                          New <span className="text-[#7657D5]">Arrivals</span>
                        </h2>
                        <p className="text-[14px] sm:text-[15px] font-sans text-[#A7AFBF] mt-1 font-normal">
                          Freshly added finds.
                        </p>
                      </div>

                      {newArrivals.length > 0 && (
                        <span className="text-[13px] font-sans font-medium text-[#747D8C]">
                          {newArrivals.length} {newArrivals.length === 1 ? 'find' : 'finds'}
                        </span>
                      )}
                    </div>

                    {newArrivals.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {newArrivals.map((product) => (
                          <ProductCard
                            key={product.id}
                            product={product}
                            onSelectProduct={handleSelectProduct}
                          />
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        title="Fresh finds are on their way."
                        subtitle="We’re getting Deals On Point ready with products worth discovering. Check back soon."
                        onAddProduct={() => setIsManagerOpen(true)}
                        actionText="Add Product to New Arrivals"
                      />
                    )}
                  </div>
                </section>

                {/* 4. SHOP BY CATEGORY (Background: Graphite Black #11131A) */}
                <CategorySection
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={(cat) => {
                    setSelectedCategory(cat);
                    window.scrollTo({ top: 350, behavior: 'smooth' });
                  }}
                  productCountByCategory={productCountByCategory}
                />

                {/* 5. ABOUT SECTION (Background: Charcoal Gray #181B24) */}
                <section id="about-section" className="py-16 sm:py-20 bg-[#181B24] font-sans">
                  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="p-8 sm:p-12 rounded-2xl bg-[#11131A] border border-[#303541] text-center shadow-xl relative overflow-hidden">
                      {/* Subtle atmospheric glow */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-[#3B5BDB]/10 via-[#5C59D8]/8 to-[#7657D5]/10 blur-3xl pointer-events-none rounded-full" />
                      
                      <div className="w-10 h-10 rounded-xl bg-[#181B24] border border-[#303541] text-[#3B5BDB] flex items-center justify-center mx-auto mb-4 relative z-10 shadow-xs">
                        <Info className="w-5 h-5" />
                      </div>
                      <div className="text-[11px] sm:text-[12px] font-display font-bold uppercase tracking-[0.08em] text-[#3B5BDB] mb-2 relative z-10">
                        About Deals On Point
                      </div>
                      <h3 className="text-[22px] sm:text-[26px] font-display font-semibold text-[#F5F7FA] tracking-tight mb-4 leading-snug relative z-10">
                        Product Discovery <span className="text-[#7657D5]">Made Simple</span>
                      </h3>
                      <p className="text-[15px] sm:text-[16px] text-[#A7AFBF] leading-[1.75] max-w-2xl mx-auto font-normal relative z-10">
                        “Deals On Point makes product discovery simple. We bring together useful products, interesting finds and deals across tech, beauty, home, lifestyle and more — helping you discover products worth checking out without the clutter.”
                      </p>
                    </div>
                  </div>
                </section>

              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer in Near-Black #07080C with subtle Blue/Purple gradient accent line */}
      <Footer
        onNavigate={handleNavigate}
        onOpenLegal={(type) => setActiveLegalModal(type)}
      />

      {/* Product Manager Modal (For adding products manually with Amazon affiliate links) */}
      <ProductManagerModal
        isOpen={isManagerOpen}
        onClose={() => setIsManagerOpen(false)}
        products={products}
        categories={categories}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        onAddCategory={handleAddCategory}
        onClearAll={handleClearAll}
      />

      {/* Trust & Legal Information Modals */}
      <TrustModals
        type={activeLegalModal}
        onClose={() => setActiveLegalModal(null)}
      />

    </div>
  );
}
