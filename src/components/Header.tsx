import React, { useState } from 'react';
import { Search, Menu, X, PlusCircle } from 'lucide-react';
import { NavSection, LegalModalType } from '../types/product';
import logoPng from '../assets/images/deals_on_point_logo.png';

interface HeaderProps {
  activeSection: NavSection;
  onNavigate: (section: NavSection) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenLegal: (type: LegalModalType) => void;
  onOpenManager: () => void;
  hasProducts: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeSection,
  onNavigate,
  searchQuery,
  onSearchChange,
  onOpenLegal,
  onOpenManager,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);

  const handleNavClick = (section: NavSection) => {
    onNavigate(section);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#090A0F]/85 backdrop-blur-md border-b border-[#303541] text-[#F5F7FA] font-sans transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo & Wordmark */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNavClick('home')}
              className="text-left group flex items-center gap-2.5 sm:gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5BDB] rounded-md cursor-pointer"
            >
              <img
                src={logoPng}
                alt="Deals On Point Logo"
                className="h-10 sm:h-12 w-auto object-contain drop-shadow-sm transition-transform group-hover:scale-105"
              />
              <div className="flex flex-col">
                <span className="text-[18px] sm:text-[21px] font-display font-extrabold tracking-[0.05em] uppercase leading-none">
                  <span className="text-[#F5F7FA] group-hover:text-white transition-colors">DEALS </span>
                  <span className="bg-gradient-to-r from-[#3B5BDB] to-[#7657D5] bg-clip-text text-transparent">
                    ON POINT
                  </span>
                </span>
                <span className="text-[10px] sm:text-[11px] font-sans font-medium text-[#A7AFBF] tracking-wider uppercase mt-1 leading-none">
                  Smart Finds. Deals On Point.
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation: Home | Deals | New Arrivals | Categories | About */}
          <nav className="hidden md:flex items-center space-x-7 text-[14px] sm:text-[15px] font-medium font-sans">
            <button
              onClick={() => handleNavClick('home')}
              className={`transition-colors py-1 cursor-pointer ${
                activeSection === 'home'
                  ? 'text-[#F5F7FA] border-b-2 border-[#3B5BDB] font-semibold'
                  : 'text-[#A7AFBF] hover:text-[#F5F7FA]'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('deals')}
              className={`transition-colors py-1 flex items-center gap-1.5 cursor-pointer ${
                activeSection === 'deals' || activeSection === 'new-deals'
                  ? 'text-[#F5F7FA] border-b-2 border-[#3B5BDB] font-semibold'
                  : 'text-[#A7AFBF] hover:text-[#F5F7FA]'
              }`}
            >
              <span>Deals</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#3B5BDB] inline-block"></span>
            </button>
            <button
              onClick={() => handleNavClick('new-arrivals')}
              className={`transition-colors py-1 cursor-pointer ${
                activeSection === 'new-arrivals'
                  ? 'text-[#F5F7FA] border-b-2 border-[#3B5BDB] font-semibold'
                  : 'text-[#A7AFBF] hover:text-[#F5F7FA]'
              }`}
            >
              New Arrivals
            </button>
            <button
              onClick={() => handleNavClick('categories')}
              className={`transition-colors py-1 cursor-pointer ${
                activeSection === 'categories'
                  ? 'text-[#F5F7FA] border-b-2 border-[#3B5BDB] font-semibold'
                  : 'text-[#A7AFBF] hover:text-[#F5F7FA]'
              }`}
            >
              Categories
            </button>
            <button
              onClick={() => {
                onOpenLegal('about');
                setMobileMenuOpen(false);
              }}
              className="text-[#A7AFBF] hover:text-[#F5F7FA] transition-colors py-1 cursor-pointer"
            >
              About
            </button>
          </nav>

          {/* Action Zone: Search Icon / Bar & Add Product */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Search Input / Toggle with glassmorphism */}
            <div className="relative flex items-center font-sans">
              <div className={`flex items-center transition-all duration-200 ${
                showSearchInput ? 'w-52 sm:w-64' : 'w-9 sm:w-56'
              }`}>
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder="Search deals, products..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className={`w-full bg-[#11131A]/90 text-[14px] text-[#F5F7FA] placeholder-[#747D8C] pl-9 pr-4 py-1.5 rounded-lg border border-[#303541] focus:outline-none focus:border-[#3B5BDB] focus:ring-1 focus:ring-[#3B5BDB] backdrop-blur-sm transition-all font-sans ${
                      showSearchInput ? 'block' : 'hidden sm:block'
                    }`}
                  />
                  <div className={`absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[#747D8C] ${
                    showSearchInput ? 'block' : 'hidden sm:flex'
                  }`}>
                    <Search className="w-4 h-4" />
                  </div>
                </div>

                {/* Mobile Search Icon */}
                <button
                  type="button"
                  onClick={() => setShowSearchInput(!showSearchInput)}
                  className="sm:hidden p-2 text-[#A7AFBF] hover:text-[#F5F7FA] rounded-lg hover:bg-[#181B24] focus:outline-none cursor-pointer"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Owner Add Product Button */}
            <button
              onClick={onOpenManager}
              className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[13.5px] font-semibold text-white bg-[#3B5BDB] hover:bg-[#7657D5] rounded-lg transition-colors shadow-sm font-sans cursor-pointer active:scale-[0.98]"
              title="Add a product with its Amazon affiliate link"
            >
              <PlusCircle className="w-3.5 h-3.5 text-white/90" />
              <span>Add Product</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#A7AFBF] hover:text-[#F5F7FA] hover:bg-[#181B24] rounded-lg focus:outline-none cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#090A0F]/95 backdrop-blur-md border-b border-[#303541] px-4 pt-3 pb-6 space-y-2 font-sans">
          {/* Mobile search bar */}
          <div className="pb-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search deals, products..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-[#11131A] text-[14px] text-[#F5F7FA] placeholder-[#747D8C] pl-9 pr-4 py-2 rounded-lg border border-[#303541] focus:outline-none focus:border-[#3B5BDB]"
              />
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#747D8C]" />
            </div>
          </div>

          <button
            onClick={() => handleNavClick('home')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-[15px] font-medium transition-colors cursor-pointer ${
              activeSection === 'home' ? 'bg-[#181B24] text-[#F5F7FA] font-semibold' : 'text-[#A7AFBF] hover:bg-[#181B24]'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => handleNavClick('deals')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-[15px] font-medium transition-colors flex items-center justify-between cursor-pointer ${
              activeSection === 'deals' || activeSection === 'new-deals' ? 'bg-[#181B24] text-[#F5F7FA] font-semibold' : 'text-[#A7AFBF] hover:bg-[#181B24]'
            }`}
          >
            <span>Deals</span>
            <span className="text-[11px] font-display font-bold uppercase tracking-wider bg-[#3B5BDB]/20 text-[#3B5BDB] border border-[#3B5BDB]/40 px-2 py-0.5 rounded">DEALS</span>
          </button>
          <button
            onClick={() => handleNavClick('new-arrivals')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-[15px] font-medium transition-colors cursor-pointer ${
              activeSection === 'new-arrivals' ? 'bg-[#181B24] text-[#F5F7FA] font-semibold' : 'text-[#A7AFBF] hover:bg-[#181B24]'
            }`}
          >
            New Arrivals
          </button>
          <button
            onClick={() => handleNavClick('categories')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-[15px] font-medium transition-colors cursor-pointer ${
              activeSection === 'categories' ? 'bg-[#181B24] text-[#F5F7FA] font-semibold' : 'text-[#A7AFBF] hover:bg-[#181B24]'
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => {
              onOpenLegal('about');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2.5 rounded-lg text-[15px] font-medium text-[#A7AFBF] hover:bg-[#181B24] hover:text-[#F5F7FA] transition-colors cursor-pointer"
          >
            About
          </button>

          <div className="pt-3 border-t border-[#303541]">
            <button
              onClick={() => {
                onOpenManager();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#3B5BDB] hover:bg-[#7657D5] text-white font-semibold text-[15px] transition-colors shadow-sm font-sans cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-white/90" />
              <span>Add Product / Affiliate Link</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
