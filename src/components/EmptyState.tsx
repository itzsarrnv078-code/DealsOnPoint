import React from 'react';
import { PlusCircle } from 'lucide-react';
import logoPng from '../assets/images/deals_on_point_logo.png';

interface EmptyStateProps {
  title?: string;
  subtitle?: string;
  onAddProduct?: () => void;
  actionText?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Great deals are coming soon.',
  subtitle = 'Fresh finds are being added to Deals On Point. Check back soon for curated selections.',
  onAddProduct,
  actionText = 'Add First Product',
}) => {
  return (
    <div className="relative overflow-hidden bg-[#181B24] border border-[#303541] rounded-2xl p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-xl font-sans">
      {/* Subtle atmospheric blurred blue/purple glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-[#3B5BDB]/15 via-[#5C59D8]/10 to-[#7657D5]/15 blur-3xl pointer-events-none rounded-full" />

      {/* Brand logo container */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#11131A] border border-[#303541] flex items-center justify-center mx-auto mb-5 shadow-md p-2.5 relative z-10">
        <img
          src={logoPng}
          alt="Deals On Point"
          className="w-full h-full object-contain"
        />
      </div>

      <h3 className="text-[20px] sm:text-[24px] font-display font-semibold text-[#F5F7FA] mb-2.5 tracking-tight leading-snug relative z-10">
        {title}
      </h3>

      <p className="text-[15px] sm:text-[16px] font-sans font-normal text-[#A7AFBF] max-w-md mx-auto leading-[1.65] mb-7 relative z-10">
        {subtitle}
      </p>

      {onAddProduct && (
        <button
          onClick={onAddProduct}
          className="relative z-10 inline-flex items-center gap-2 px-6 py-3 bg-[#3B5BDB] hover:bg-[#7657D5] text-white text-[15px] sm:text-[16px] font-sans font-semibold tracking-wide rounded-xl transition-all duration-200 shadow-md shadow-[#3B5BDB]/25 hover:shadow-lg hover:shadow-[#7657D5]/30 active:scale-[0.98] cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-white/90" />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};
