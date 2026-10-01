import React from 'react';
import { Search, Compass, ExternalLink } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  return (
    <section className="py-16 sm:py-20 bg-[#181B24] border-b border-[#303541]/70 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <div className="text-[11px] sm:text-[12px] font-display font-bold uppercase tracking-[0.08em] text-[#3B5BDB] mb-1.5">
            Transparent Product Discovery
          </div>
          <h2 className="text-[26px] sm:text-[32px] font-display font-semibold text-[#F5F7FA] tracking-tight">
            How Deals On Point <span className="text-[#7657D5]">Works</span>
          </h2>
        </div>

        {/* 3 Steps: Glassmorphic Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7">
          
          {/* Step 1: WE FIND */}
          <div className="p-6 rounded-2xl bg-[#1E222D]/90 border border-[#303541] hover:border-[#3B5BDB]/50 transition-all duration-200 backdrop-blur-sm shadow-md hover:-translate-y-1 relative flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-display font-bold text-[#3B5BDB] tracking-wider uppercase bg-[#3B5BDB]/15 px-2.5 py-1 rounded-md border border-[#3B5BDB]/30">
                  Step 01
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#11131A] text-[#3B5BDB] border border-[#303541] flex items-center justify-center">
                  <Search className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-[17px] sm:text-[18px] font-display font-semibold text-[#F5F7FA] mb-2 tracking-tight">
                1 — WE FIND
              </h3>
              <p className="text-[14px] sm:text-[15px] text-[#A7AFBF] leading-[1.65] font-normal">
                Interesting products and real deals are curated for Deals On Point.
              </p>
            </div>
          </div>

          {/* Step 2: YOU DISCOVER */}
          <div className="p-6 rounded-2xl bg-[#1E222D]/90 border border-[#303541] hover:border-[#7657D5]/50 transition-all duration-200 backdrop-blur-sm shadow-md hover:-translate-y-1 relative flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-display font-bold text-[#7657D5] tracking-wider uppercase bg-[#7657D5]/15 px-2.5 py-1 rounded-md border border-[#7657D5]/30">
                  Step 02
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#11131A] text-[#7657D5] border border-[#303541] flex items-center justify-center">
                  <Compass className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-[17px] sm:text-[18px] font-display font-semibold text-[#F5F7FA] mb-2 tracking-tight">
                2 — YOU DISCOVER
              </h3>
              <p className="text-[14px] sm:text-[15px] text-[#A7AFBF] leading-[1.65] font-normal">
                Browse simple categories, clear photography, and product details.
              </p>
            </div>
          </div>

          {/* Step 3: VIEW THE DEAL */}
          <div className="p-6 rounded-2xl bg-[#1E222D]/90 border border-[#303541] hover:border-[#3B5BDB]/50 transition-all duration-200 backdrop-blur-sm shadow-md hover:-translate-y-1 relative flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-display font-bold text-[#3B5BDB] tracking-wider uppercase bg-[#3B5BDB]/15 px-2.5 py-1 rounded-md border border-[#3B5BDB]/30">
                  Step 03
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#11131A] text-[#3B5BDB] border border-[#303541] flex items-center justify-center">
                  <ExternalLink className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-[17px] sm:text-[18px] font-display font-semibold text-[#F5F7FA] mb-2 tracking-tight">
                3 — VIEW THE DEAL
              </h3>
              <p className="text-[14px] sm:text-[15px] text-[#A7AFBF] leading-[1.65] font-normal">
                When something catches your eye, continue to Amazon to view the current offer and purchase directly.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
