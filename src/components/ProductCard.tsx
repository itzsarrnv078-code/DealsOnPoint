import React, { useState } from 'react';
import { Product } from '../types/product';
import { ArrowRight, Tag, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelectProduct }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Small Badge styling: Poppins Bold 11–12px with slightly increased letter spacing
  const renderBadge = () => {
    if (product.badge === 'NEW DEAL' || product.isNewDeal) {
      return (
        <span className="inline-flex items-center gap-1 bg-[#D63A4A] text-white text-[11px] font-display font-bold uppercase tracking-[0.06em] px-2.5 py-0.5 rounded shadow-sm">
          <Tag className="w-3 h-3 fill-current" />
          NEW DEAL
        </span>
      );
    }
    if (product.badge === 'TRENDING' || product.isTrending) {
      return (
        <span className="inline-flex items-center gap-1 bg-[#3B5BDB] text-white text-[11px] font-display font-bold uppercase tracking-[0.06em] px-2.5 py-0.5 rounded shadow-sm">
          <Sparkles className="w-3 h-3" />
          TRENDING
        </span>
      );
    }
    if (product.badge === 'NEW' || product.isNewArrival) {
      return (
        <span className="inline-flex items-center gap-1 bg-[#7657D5] text-white text-[11px] font-display font-bold uppercase tracking-[0.06em] px-2.5 py-0.5 rounded shadow-sm">
          NEW
        </span>
      );
    }
    return null;
  };

  return (
    <article
      onClick={() => onSelectProduct(product)}
      className="group bg-[#1E222D] rounded-2xl border border-[#303541] hover:border-[#3B5BDB]/50 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col overflow-hidden cursor-pointer h-full font-sans"
    >
      {/* Product Image Area - clean neutral backdrop so images pop clearly */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#11131A] flex items-center justify-center p-3 border-b border-[#303541]/70">
        {/* Optional Badge */}
        <div className="absolute top-3 left-3 z-10">
          {renderBadge()}
        </div>

        {/* Small Category Label unboxed */}
        <div className="absolute top-3 right-3 z-10 bg-[#181B24]/90 backdrop-blur-xs border border-[#303541] px-2.5 py-0.5 rounded text-[11px] font-sans font-medium text-[#A7AFBF] shadow-xs">
          {product.category}
        </div>

        {!imageError ? (
          <img
            src={product.mainImage}
            alt={product.name}
            referrerPolicy="no-referrer"
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover object-center rounded-xl group-hover:scale-102 transition-transform duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ) : (
          <div className="w-full h-full rounded-xl bg-[#181B24] flex flex-col items-center justify-center text-[#747D8C] p-4 text-center">
            <span className="text-2xl mb-1">📦</span>
            <span className="text-xs font-sans font-medium text-[#A7AFBF] line-clamp-1">{product.name}</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-5 flex flex-col flex-grow justify-between">
        <div>
          {/* Category */}
          <div className="text-[12px] font-sans font-medium text-[#A7AFBF] mb-1.5 uppercase tracking-wider">
            {product.category}
          </div>

          {/* Product Name: Poppins Semi-Bold 18–20px in Soft White */}
          <h3 className="font-display font-semibold text-[18px] sm:text-[19px] text-[#F5F7FA] group-hover:text-blue-300 transition-colors line-clamp-2 mb-2 leading-snug tracking-tight">
            {product.name}
          </h3>

          {/* Description: Inter 14–15px in Cool Gray */}
          <p className="font-sans text-[#A7AFBF] text-[14px] sm:text-[15px] line-clamp-2 mb-4 leading-relaxed font-normal">
            {product.shortDescription}
          </p>
        </div>

        {/* Action Button: “View Deal” in Deep Blue */}
        <div className="pt-3.5 border-t border-[#303541]/70 flex items-center justify-between mt-auto">
          <span className="text-[12px] font-sans text-[#747D8C] font-medium">Deals On Point</span>
          
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectProduct(product);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3B5BDB] hover:bg-[#7657D5] text-white font-sans font-semibold text-[13.5px] rounded-lg transition-all duration-200 shadow-sm shadow-[#3B5BDB]/20 hover:shadow-[#7657D5]/25 active:scale-[0.98] cursor-pointer"
          >
            <span>View Deal</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </article>
  );
};
