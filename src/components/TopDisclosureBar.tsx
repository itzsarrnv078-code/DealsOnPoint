import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { LegalModalType } from '../types/product';

interface TopDisclosureBarProps {
  onOpenLegal: (type: LegalModalType) => void;
}

export const TopDisclosureBar: React.FC<TopDisclosureBarProps> = ({ onOpenLegal }) => {
  return (
    <div className="bg-[#07080C] text-[#A7AFBF] border-b border-[#303541]/70 py-1.5 px-4 text-[12px] sm:text-[12.5px] font-sans">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 sm:gap-3 text-center flex-wrap">
        <span className="flex items-center gap-1.5 text-[#A7AFBF] font-normal">
          <ShieldCheck className="w-3.5 h-3.5 text-[#3B5BDB] shrink-0 inline" />
          <span>As an Amazon Associate I earn from qualifying purchases.</span>
        </span>
        <span className="text-[#303541] hidden sm:inline" aria-hidden="true">·</span>
        <button
          onClick={() => onOpenLegal('disclosure')}
          className="text-[#3B5BDB] hover:text-[#7657D5] font-medium underline underline-offset-2 transition-colors cursor-pointer"
        >
          Affiliate Disclosure
        </button>
      </div>
    </div>
  );
};
