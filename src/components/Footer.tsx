import React from 'react';
import { NavSection, LegalModalType } from '../types/product';
import logoPng from '../assets/images/deals_on_point_logo.png';

interface FooterProps {
  onNavigate: (section: NavSection) => void;
  onOpenLegal: (type: LegalModalType) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenLegal }) => {
  return (
    <footer className="relative bg-[#07080C] text-[#A7AFBF] pt-14 pb-12 font-sans overflow-hidden">
      {/* Subtle Blue/Purple gradient accent line at the top of the footer */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#3B5BDB]/60 via-[#7657D5]/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Tier: Brand, Mission, and Socials */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-[#303541]/70">
          
          {/* Brand Info (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={logoPng}
                alt="Deals On Point Logo"
                className="h-10 sm:h-12 w-auto object-contain drop-shadow-sm"
              />
              <span className="text-[20px] sm:text-[22px] font-display font-extrabold tracking-[0.05em] uppercase leading-none">
                <span className="text-[#F5F7FA]">DEALS </span>
                <span className="bg-gradient-to-r from-[#3B5BDB] to-[#7657D5] bg-clip-text text-transparent">ON POINT</span>
              </span>
            </div>

            <p className="text-[14px] sm:text-[15px] font-display font-semibold text-[#F5F7FA] tracking-tight">
              “Smart Finds. Deals On Point.”
            </p>

            <p className="text-[14px] font-sans text-[#A7AFBF] max-w-sm leading-[1.65] font-normal">
              We discover and organize interesting products and deals so you can easily browse, discover, and decide what is worth checking out.
            </p>
          </div>

          {/* Navigation: Home | Deals | New Arrivals | Categories | About | Contact */}
          <div className="md:col-span-3 space-y-3 font-sans">
            <h4 className="text-[13px] font-display font-semibold uppercase tracking-[0.06em] text-[#F5F7FA]">
              Navigation
            </h4>
            <ul className="space-y-2 text-[14px]">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="text-[#A7AFBF] hover:text-[#F5F7FA] transition-colors cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('deals')}
                  className="text-[#A7AFBF] hover:text-[#F5F7FA] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Deals</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3B5BDB]"></span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('new-arrivals')}
                  className="text-[#A7AFBF] hover:text-[#F5F7FA] transition-colors cursor-pointer"
                >
                  New Arrivals
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('categories')}
                  className="text-[#A7AFBF] hover:text-[#F5F7FA] transition-colors cursor-pointer"
                >
                  Categories
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal('about')}
                  className="text-[#A7AFBF] hover:text-[#F5F7FA] transition-colors cursor-pointer"
                >
                  About
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal('contact')}
                  className="text-[#A7AFBF] hover:text-[#F5F7FA] transition-colors cursor-pointer"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Legal: Affiliate Disclosure | Privacy Policy | Terms & Conditions */}
          <div className="md:col-span-4 space-y-3 font-sans">
            <h4 className="text-[13px] font-display font-semibold uppercase tracking-[0.06em] text-[#F5F7FA]">
              Legal & Disclosures
            </h4>
            <ul className="space-y-2 text-[14px]">
              <li>
                <button
                  onClick={() => onOpenLegal('disclosure')}
                  className="text-[#A7AFBF] hover:text-[#F5F7FA] transition-colors cursor-pointer"
                >
                  Affiliate Disclosure
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal('privacy')}
                  className="text-[#A7AFBF] hover:text-[#F5F7FA] transition-colors cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal('terms')}
                  className="text-[#A7AFBF] hover:text-[#F5F7FA] transition-colors cursor-pointer"
                >
                  Terms & Conditions
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Tier: Amazon Associate Notice & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left font-sans">
          
          <div className="space-y-1">
            <p className="text-[13px] sm:text-[14px] font-medium text-[#F5F7FA] tracking-wide">
              “As an Amazon Associate I earn from qualifying purchases.”
            </p>
            <p className="text-[12px] text-[#747D8C] max-w-2xl leading-normal">
              Deals On Point is an independent affiliate product discovery website and is not owned, operated, or endorsed by Amazon.com, Inc. or any of its subsidiaries.
            </p>
          </div>

          <div className="text-[12px] text-[#747D8C] shrink-0">
            © {new Date().getFullYear()} Deals On Point. All rights reserved.
          </div>

        </div>

      </div>
    </footer>
  );
};
