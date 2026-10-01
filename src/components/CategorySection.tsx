import React from 'react';
import { 
  Laptop, 
  Smartphone, 
  Sparkles, 
  Coffee, 
  Watch, 
  Gamepad2, 
  Compass, 
  CheckCircle, 
  FolderOpen 
} from 'lucide-react';

interface CategorySectionProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  productCountByCategory: Record<string, number>;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  productCountByCategory,
}) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Tech & Electronics':
        return <Laptop className="w-5 h-5" />;
      case 'Phone Accessories':
        return <Smartphone className="w-5 h-5" />;
      case 'Beauty & Personal Care':
        return <Sparkles className="w-5 h-5" />;
      case 'Home & Kitchen':
        return <Coffee className="w-5 h-5" />;
      case 'Fashion & Accessories':
        return <Watch className="w-5 h-5" />;
      case 'Gaming':
        return <Gamepad2 className="w-5 h-5" />;
      case 'Travel & Outdoor':
        return <Compass className="w-5 h-5" />;
      case 'Daily Essentials':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <FolderOpen className="w-5 h-5" />;
    }
  };

  return (
    <section id="categories-section" className="py-16 sm:py-20 bg-[#11131A] border-y border-[#303541]/70 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
          <div>
            <div className="text-[11px] sm:text-[12px] font-display font-bold uppercase tracking-[0.08em] text-[#3B5BDB] mb-1">
              Curated Collections
            </div>
            {/* Section Heading: Poppins Semi-Bold 28–34px desktop / 24–28px mobile */}
            <h2 className="text-[24px] sm:text-[30px] lg:text-[32px] font-display font-semibold text-[#F5F7FA] tracking-tight leading-tight">
              Shop by <span className="text-[#3B5BDB]">Category</span>
            </h2>
          </div>

          {selectedCategory && (
            <button
              onClick={() => onSelectCategory(null)}
              className="text-[13px] font-sans font-semibold text-[#F5F7FA] hover:text-white transition-colors self-start sm:self-auto py-1.5 px-3.5 rounded-lg bg-[#181B24] border border-[#303541] hover:border-[#3B5BDB]/50 cursor-pointer"
            >
              Clear Filter: {selectedCategory} ✕
            </button>
          )}
        </div>

        {/* Categories Grid: Subtle glassmorphism cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {categories.map((category) => {
            const isSelected = selectedCategory === category;
            const count = productCountByCategory[category] || 0;

            return (
              <button
                key={category}
                type="button"
                onClick={() => onSelectCategory(isSelected ? null : category)}
                className={`p-4 rounded-xl text-left transition-all duration-200 flex items-center gap-3.5 border cursor-pointer backdrop-blur-sm ${
                  isSelected
                    ? 'bg-[#3B5BDB] text-white border-[#3B5BDB] shadow-lg shadow-[#3B5BDB]/25 translate-y-[-2px]'
                    : 'bg-[#181B24]/80 text-[#F5F7FA] border-[#303541] hover:border-[#3B5BDB]/50 hover:bg-[#1E222D] hover:shadow-md hover:translate-y-[-2px]'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-[#11131A] text-[#3B5BDB] border border-[#303541]'
                  }`}
                >
                  {getCategoryIcon(category)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className={`text-[14px] sm:text-[15px] font-display font-medium truncate ${
                    isSelected ? 'text-white' : 'text-[#F5F7FA]'
                  }`}>
                    {category}
                  </div>
                  <div className={`text-[12px] font-sans mt-0.5 ${
                    isSelected ? 'text-blue-100' : 'text-[#747D8C]'
                  }`}>
                    {count} {count === 1 ? 'find' : 'finds'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
};
