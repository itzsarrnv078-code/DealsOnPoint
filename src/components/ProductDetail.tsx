import React, { useState, useEffect } from 'react';
import { Product } from '../types/product';
import { 
  ArrowLeft, 
  ExternalLink, 
  Check, 
  Share2, 
  Copy, 
  Sparkles, 
  Tag, 
  ShieldCheck, 
  Info,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  onSelectCategory?: (category: string) => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({
  product,
  onBack,
  onSelectCategory,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  // Combine main image with gallery images (3–6 images)
  const images = React.useMemo(() => {
    const list = [product.mainImage, ...(product.galleryImages || [])];
    return Array.from(new Set(list.filter(Boolean)));
  }, [product]);

  useEffect(() => {
    setSelectedImageIndex(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product.id]);

  const currentUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/products/${product.slug}`
    : `https://dealsonpoint.com/products/${product.slug}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (e) {
      console.error('Could not copy link', e);
    }
  };

  const handleSocialShare = (platform: 'pinterest' | 'facebook' | 'twitter' | 'telegram') => {
    const text = encodeURIComponent(`${product.name} - Deals On Point`);
    const encodedUrl = encodeURIComponent(currentUrl);
    const media = encodeURIComponent(images[0] || '');

    let shareUrl = '';
    switch (platform) {
      case 'pinterest':
        shareUrl = `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${media}&description=${text}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareUrl = `https://x.com/intent/tweet?url=${encodedUrl}&text=${text}&via=Dealonpoint1`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${text}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="bg-[#090A0F] text-[#F5F7FA] min-h-screen py-6 sm:py-10 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb & Back */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-[#303541]/70 font-sans">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-[14px] sm:text-[15px] font-semibold text-[#A7AFBF] hover:text-[#F5F7FA] transition-colors focus:outline-none cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#3B5BDB]" />
            <span>Back to Deals On Point</span>
          </button>

          {/* Clean Unboxed Breadcrumb */}
          <div className="flex items-center gap-2 text-[13px] sm:text-[14px] text-[#747D8C] font-sans">
            <button onClick={onBack} className="hover:text-[#F5F7FA] transition-colors cursor-pointer">
              Home
            </button>
            <span aria-hidden="true" className="text-[#303541]">/</span>
            <button 
              onClick={() => onSelectCategory && onSelectCategory(product.category)}
              className="hover:text-[#3B5BDB] font-medium text-[#A7AFBF] transition-colors cursor-pointer"
            >
              {product.category}
            </button>
            <span aria-hidden="true" className="text-[#303541]">/</span>
            <span className="text-[#F5F7FA] truncate max-w-[160px] sm:max-w-xs">{product.name}</span>
          </div>
        </div>

        {/* Main Grid: Gallery on left, Details on right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Image Gallery (6 cols desktop) */}
          <div className="lg:col-span-6 space-y-4">
            
            {/* Primary Main Image Container */}
            <div className="relative aspect-[4/3] sm:aspect-square w-full rounded-2xl bg-[#11131A] border border-[#303541] overflow-hidden flex items-center justify-center p-3 group shadow-md">
              <img
                src={images[selectedImageIndex] || product.mainImage}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain rounded-xl transition-all duration-300"
              />

              {/* Small Badges: Poppins Bold 11–12px */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
                {(product.badge === 'NEW DEAL' || product.isNewDeal) && (
                  <span className="inline-flex items-center gap-1 bg-[#D63A4A] text-white text-[11px] font-display font-bold uppercase tracking-[0.06em] px-3 py-1 rounded shadow-sm">
                    <Tag className="w-3.5 h-3.5 fill-current" />
                    NEW DEAL
                  </span>
                )}
                {(product.badge === 'TRENDING' || product.isTrending) && (
                  <span className="inline-flex items-center gap-1 bg-[#3B5BDB] text-white text-[11px] font-display font-bold uppercase tracking-[0.06em] px-3 py-1 rounded shadow-sm">
                    <Sparkles className="w-3.5 h-3.5" />
                    TRENDING
                  </span>
                )}
                {(product.badge === 'NEW' || product.isNewArrival) && !product.isNewDeal && (
                  <span className="inline-flex items-center gap-1 bg-[#7657D5] text-white text-[11px] font-display font-bold uppercase tracking-[0.06em] px-3 py-1 rounded shadow-sm">
                    NEW ARRIVAL
                  </span>
                )}
              </div>

              {/* Gallery Navigation Arrows for multi-images */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    aria-label="Previous image"
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-[#181B24]/90 border border-[#303541] text-[#F5F7FA] shadow-md hover:bg-[#1E222D] hover:border-[#3B5BDB] transition-all focus:outline-none cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    aria-label="Next image"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-[#181B24]/90 border border-[#303541] text-[#F5F7FA] shadow-md hover:bg-[#1E222D] hover:border-[#3B5BDB] transition-all focus:outline-none cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails list (3–6 product photos) */}
            {images.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
                {images.map((imgUrl, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-[#11131A] shrink-0 border-2 transition-all p-1 cursor-pointer ${
                      selectedImageIndex === index
                        ? 'border-[#3B5BDB] shadow-md shadow-[#3B5BDB]/20 scale-102'
                        : 'border-[#303541] hover:border-[#A7AFBF]/50 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`${product.name} photo ${index + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Social Sharing bar for Pinterest, FB, X, etc. */}
            <div className="bg-[#181B24] rounded-xl p-4 border border-[#303541] font-sans">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[12px] font-display font-bold uppercase tracking-[0.06em] text-[#F5F7FA] flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-[#3B5BDB]" />
                  Share This Find
                </span>
                <span className="text-[12px] text-[#747D8C] font-sans">Shareable URL</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleSocialShare('pinterest')}
                  className="px-3 py-1.5 text-[13px] font-sans font-medium rounded-lg bg-[#11131A] text-[#A7AFBF] border border-[#303541] hover:border-[#D63A4A] hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="font-bold text-xs text-[#D63A4A]">P</span> Pinterest
                </button>
                <button
                  onClick={() => handleSocialShare('facebook')}
                  className="px-3 py-1.5 text-[13px] font-sans font-medium rounded-lg bg-[#11131A] text-[#A7AFBF] border border-[#303541] hover:border-[#3B5BDB] hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="font-bold text-xs text-[#3B5BDB]">f</span> Facebook
                </button>
                <button
                  onClick={() => handleSocialShare('twitter')}
                  className="px-3 py-1.5 text-[13px] font-sans font-medium rounded-lg bg-[#11131A] text-[#A7AFBF] border border-[#303541] hover:border-[#F5F7FA] hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="font-bold text-xs text-[#F5F7FA]">𝕏</span> X (Twitter)
                </button>
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 text-[13px] font-sans font-medium rounded-lg bg-[#11131A] text-[#F5F7FA] border border-[#303541] hover:border-[#3B5BDB] transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#747D8C]" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Product Information & Amazon Action (6 cols desktop) */}
          <div className="lg:col-span-6 flex flex-col justify-start space-y-6">
            
            {/* Category Header */}
            <div>
              <span className="text-[12px] sm:text-[13px] font-display font-bold uppercase tracking-[0.08em] text-[#3B5BDB]">
                {product.category}
              </span>
              {/* Product Name: Poppins Bold */}
              <h1 className="text-[26px] sm:text-[32px] lg:text-[34px] font-display font-bold text-[#F5F7FA] mt-1.5 leading-[1.2] tracking-tight">
                {product.name}
              </h1>
            </div>

            {/* Short Product Description: Inter 15–17px in Cool Gray */}
            <div className="text-[#A7AFBF] text-[15px] sm:text-[16px] leading-[1.65] bg-[#181B24] p-4.5 rounded-xl border border-[#303541] font-sans font-normal">
              {product.shortDescription}
            </div>

            {/* Key Features */}
            {product.keyFeatures && product.keyFeatures.length > 0 && (
              <div>
                <h2 className="text-[18px] sm:text-[19px] font-display font-semibold text-[#F5F7FA] mb-3 flex items-center gap-2 tracking-tight">
                  <ShieldCheck className="w-4 h-4 text-[#3B5BDB]" />
                  Key Features
                </h2>
                <ul className="space-y-2.5 font-sans">
                  {product.keyFeatures.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-[14px] sm:text-[15px] text-[#A7AFBF] leading-normal font-normal">
                      <span className="w-4 h-4 rounded-full bg-[#3B5BDB]/20 text-[#3B5BDB] border border-[#3B5BDB]/40 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Useful Product Information / Details */}
            {product.details && Object.keys(product.details).length > 0 && (
              <div className="border-t border-[#303541]/70 pt-4 font-sans">
                <h3 className="text-[12px] font-display font-bold text-[#747D8C] uppercase tracking-[0.06em] mb-2.5">
                  Useful Product Information
                </h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[13px] sm:text-[14px]">
                  {Object.entries(product.details).map(([label, value]) => (
                    <div key={label} className="bg-[#181B24] p-2.5 rounded-lg border border-[#303541]">
                      <dt className="text-[#747D8C] font-medium mb-0.5 text-[12px]">{label}</dt>
                      <dd className="text-[#F5F7FA] font-semibold">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Primary Action Box: “View Deal on Amazon →” */}
            <div className="pt-2 font-sans">
              <div className="p-5 sm:p-6 bg-[#181B24] rounded-2xl border border-[#303541] shadow-xl space-y-4">
                
                {/* Large Button in Deep Electric Blue #3B5BDB hover #7657D5 */}
                <a
                  href={product.amazonUrl || 'https://www.amazon.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 px-6 bg-[#3B5BDB] hover:bg-[#7657D5] text-white font-sans font-semibold text-[16px] sm:text-[17px] tracking-wide rounded-xl shadow-lg shadow-[#3B5BDB]/25 hover:shadow-[#7657D5]/30 transition-all duration-200 flex items-center justify-center gap-2 group text-center active:scale-[0.99] cursor-pointer"
                >
                  <span>View Deal on Amazon →</span>
                  <ExternalLink className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </a>

                <div className="text-center font-sans">
                  <p className="text-[13px] text-[#A7AFBF] font-medium leading-normal">
                    Click to check current pricing, options, and availability directly on Amazon.
                  </p>
                </div>

                {/* Clear Affiliate Disclosure Required by Amazon */}
                <div className="pt-3 border-t border-[#303541]/70 text-[12px] sm:text-[13px] text-[#747D8C] leading-relaxed flex items-start gap-2 font-sans">
                  <Info className="w-4 h-4 text-[#3B5BDB] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[#A7AFBF] mb-0.5">
                      “We may earn a commission from qualifying purchases made through links on this page, at no additional cost to you.”
                    </p>
                    <p className="text-[#747D8C] italic">
                      “As an Amazon Associate I earn from qualifying purchases.”
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
