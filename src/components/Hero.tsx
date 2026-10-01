import React from 'react';
import { ArrowDown, LayoutGrid, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

interface HeroProps {
  onExploreDeals: () => void;
  onBrowseCategories: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreDeals, onBrowseCategories }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#090A0F] via-[#090A0F] to-[#11131A] py-18 sm:py-24 lg:py-28 border-b border-[#303541]/80 font-sans">
      {/* Soft atmospheric background glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#3B5BDB]/12 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 -right-20 w-96 h-96 bg-[#7657D5]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-[#3B5BDB]/8 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        {/* Small Label: CURATED FINDS & DEALS */}
        <div className="inline-flex items-center gap-2 text-[11px] sm:text-[12px] font-display font-bold uppercase tracking-[0.14em] text-[#A7AFBF] bg-[#11131A] border border-[#303541] px-4 py-1.5 rounded-full mb-5 sm:mb-6 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3B5BDB] animate-pulse"></span>
          <span>CURATED FINDS & DEALS</span>
        </div>

        {/* Main Heading */}
        <h1 
          className="text-[36px] sm:text-[48px] lg:text-[56px] font-display font-bold tracking-tight text-[#F5F7FA] leading-[1.14] sm:leading-[1.1] mb-5 max-w-3xl mx-auto" 
          style={{ textWrap: 'balance' }}
        >
          <span className="text-[#F5F7FA] block sm:inline">Smart Finds.</span>
          <br className="hidden sm:inline" />{' '}
          <span className="bg-gradient-to-r from-[#3B5BDB] via-[#5B55E5] to-[#7657D5] bg-clip-text text-transparent">
            Deals On Point.
          </span>
        </h1>

        {/* Supporting Text: 16–18px Inter in Cool Gray */}
        <p className="text-[16px] sm:text-[18px] text-[#A7AFBF] max-w-2xl mx-auto mb-10 font-sans font-normal leading-[1.65]">
          Discover useful products, fresh finds and deals worth checking out — without the endless searching.
        </p>

        {/* Action Buttons: Primary “Explore Deals” & Secondary “Browse Categories” */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 mb-14">
          <button
            onClick={onExploreDeals}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#3B5BDB] hover:bg-[#7657D5] text-white font-sans font-semibold text-[15px] sm:text-[16px] tracking-wide rounded-xl transition-all duration-200 shadow-lg shadow-[#3B5BDB]/25 hover:shadow-[#7657D5]/35 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer border border-[#3B5BDB]/40"
          >
            <span>Explore Deals</span>
            <ArrowDown className="w-4 h-4" />
          </button>
          
          <button
            onClick={onBrowseCategories}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#11131A] hover:bg-[#181B24] text-[#F5F7FA] font-sans font-semibold text-[15px] sm:text-[16px] tracking-wide rounded-xl border border-[#303541] hover:border-[#A7AFBF]/50 transition-all duration-200 shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <LayoutGrid className="w-4 h-4 text-[#A7AFBF]" />
            <span>Browse Categories</span>
          </button>
        </div>

        {/* Micro-Features / Trust indicators */}
        <div className="pt-6 border-t border-[#303541]/70 max-w-2xl mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] sm:text-[14px] text-[#A7AFBF] font-sans">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#3B5BDB] shrink-0" />
            <span>Manually Selected Finds</span>
          </div>
          <span className="text-[#303541] hidden sm:inline">·</span>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#7657D5] shrink-0" />
            <span>Verified Amazon Associates Link</span>
          </div>
          <span className="text-[#303541] hidden sm:inline">·</span>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#3B5BDB] shrink-0" />
            <span>Zero Fake Deals</span>
          </div>
        </div>

      </div>
    </section>
  );
};
