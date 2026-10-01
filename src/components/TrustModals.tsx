import React, { useState } from 'react';
import { X, ShieldCheck, Mail, Send, CheckCircle2, FileText, Lock, Info } from 'lucide-react';
import { LegalModalType } from '../types/product';
import logoPng from '../assets/images/deals_on_point_logo.png';

interface TrustModalsProps {
  type: LegalModalType;
  onClose: () => void;
}

export const TrustModals: React.FC<TrustModalsProps> = ({ type, onClose }) => {
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  if (!type) return null;

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setContactSubmitted(false);
      setFormData({ name: '', email: '', message: '' });
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 font-sans animate-fadeIn">
      <div className="bg-[#11131A] text-[#F5F7FA] rounded-2xl max-w-2xl w-full shadow-2xl border border-[#303541] overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="px-6 py-4.5 bg-[#090A0F] text-[#F5F7FA] flex items-center justify-between border-b border-[#303541]">
          <div className="flex items-center gap-2.5">
            {type === 'about' && <Info className="w-5 h-5 text-[#3B5BDB]" />}
            {type === 'contact' && <Mail className="w-5 h-5 text-[#3B5BDB]" />}
            {type === 'disclosure' && <ShieldCheck className="w-5 h-5 text-[#3B5BDB]" />}
            {type === 'privacy' && <Lock className="w-5 h-5 text-[#7657D5]" />}
            {type === 'terms' && <FileText className="w-5 h-5 text-[#A7AFBF]" />}

            <h2 className="text-[18px] sm:text-[20px] font-display font-semibold text-[#F5F7FA] tracking-tight capitalize">
              {type === 'about' && 'About Deals On Point'}
              {type === 'contact' && 'Contact Us'}
              {type === 'disclosure' && 'Affiliate Disclosure'}
              {type === 'privacy' && 'Privacy Policy'}
              {type === 'terms' && 'Terms & Conditions'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#A7AFBF] hover:text-[#F5F7FA] rounded-lg hover:bg-[#181B24] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-[14px] sm:text-[15px] font-sans text-[#A7AFBF] leading-[1.65]">
          
          {type === 'about' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3.5 p-4 rounded-xl bg-[#090A0F] border border-[#303541] text-[#F5F7FA]">
                <img
                  src={logoPng}
                  alt="Deals On Point Logo"
                  className="h-12 w-auto object-contain"
                />
                <div>
                  <h3 className="font-display font-extrabold text-[17px] tracking-wide uppercase leading-none">
                    <span className="text-[#F5F7FA]">DEALS </span>
                    <span className="bg-gradient-to-r from-[#3B5BDB] to-[#7657D5] bg-clip-text text-transparent">ON POINT</span>
                  </h3>
                  <p className="text-[12px] font-display font-semibold text-[#3B5BDB] mt-1">
                    Smart Finds. Deals On Point.
                  </p>
                </div>
              </div>

              <p className="text-[15px] sm:text-[16px] text-[#F5F7FA] font-medium leading-relaxed bg-[#181B24] p-4.5 rounded-xl border border-[#303541]">
                “Deals On Point makes product discovery simple. We bring together interesting finds, useful everyday products and deals across tech, beauty, home, lifestyle and more — helping you discover products worth checking out without the clutter.”
              </p>
              <p>
                Deals On Point is an independent product discovery website created for shoppers who value quality, honest curation, and modern design. The purpose of Deals On Point is simple: we discover and organize interesting products and deals so visitors can easily browse products, learn more about them, and then choose whether they want to view the product on Amazon.
              </p>
              <p>
                Deals On Point is not an online store, and customers do not purchase directly on Deals On Point. Every product is individually curated to ensure high utility and honest presentation.
              </p>
              <div className="bg-[#181B24] p-4.5 rounded-xl border border-[#303541] mt-4">
                <h4 className="font-display font-semibold text-[#F5F7FA] text-[15px] mb-1">Our Independence Promise</h4>
                <p className="text-[13px] text-[#A7AFBF] leading-normal">
                  We never run fake reviews, artificial countdown timers, fake stock counters, or inflated sales claims. All products are personally chosen and reviewed.
                </p>
              </div>
            </div>
          )}

          {type === 'contact' && (
            <div>
              {contactSubmitted ? (
                <div className="text-center py-8 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#3B5BDB]/20 text-[#3B5BDB] border border-[#3B5BDB]/40 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-[18px] font-display font-semibold text-[#F5F7FA]">Message Received!</h3>
                  <p className="text-[13px] text-[#A7AFBF] max-w-sm mx-auto">
                    Thank you for reaching out to Deals On Point. We will respond to your inquiry shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <p className="text-[13px] text-[#A7AFBF]">
                    Have a question, feedback, or product recommendation for Deals On Point? Send us a note below.
                  </p>
                  <div>
                    <label className="block text-[12px] font-display font-semibold uppercase tracking-[0.06em] text-[#F5F7FA] mb-1">Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2 text-[14px] bg-[#181B24] border border-[#303541] text-[#F5F7FA] placeholder-[#747D8C] rounded-lg focus:outline-none focus:border-[#3B5BDB] font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-display font-semibold uppercase tracking-[0.06em] text-[#F5F7FA] mb-1">Email</label>
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2 text-[14px] bg-[#181B24] border border-[#303541] text-[#F5F7FA] placeholder-[#747D8C] rounded-lg focus:outline-none focus:border-[#3B5BDB] font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-display font-semibold uppercase tracking-[0.06em] text-[#F5F7FA] mb-1">Message</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Write your note or question here..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-3.5 py-2 text-[14px] bg-[#181B24] border border-[#303541] text-[#F5F7FA] placeholder-[#747D8C] rounded-lg focus:outline-none focus:border-[#3B5BDB] font-sans"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#3B5BDB] hover:bg-[#7657D5] text-white font-sans font-semibold text-[14px] tracking-wide rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-[#3B5BDB]/20 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Message</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {type === 'disclosure' && (
            <div className="space-y-4">
              <div className="p-4.5 rounded-xl bg-[#181B24] border border-[#303541]">
                <p className="font-display font-semibold text-[#F5F7FA] text-[14px] mb-1">
                  Amazon Associates Program Operating Agreement Notice
                </p>
                <p className="text-[13px] text-[#3B5BDB] font-medium">
                  “As an Amazon Associate I earn from qualifying purchases.”
                </p>
              </div>

              <h3 className="font-display font-semibold text-[#F5F7FA] text-[15px]">Affiliate Transparency</h3>
              <p>
                Deals On Point is an independent affiliate website. When you click on links to products on Deals On Point and make a purchase on Amazon, we may earn an affiliate commission.
              </p>
              <p className="font-medium text-[#F5F7FA]">
                “We may earn a commission from qualifying purchases made through links on this page, at no additional cost to you.”
              </p>
              
              <h3 className="font-display font-semibold text-[#F5F7FA] text-[15px]">Independent Discovery Platform</h3>
              <p>
                Deals On Point is NOT an online store. Customers do not purchase directly from this website. Clicking “View Deal on Amazon” will take you to Amazon using our Amazon Associates link.
              </p>
              <p>
                Amazon and the Amazon logo are trademarks of Amazon.com, Inc. or its affiliates. Deals On Point is not endorsed by, sponsored by, or an official representative of Amazon.
              </p>
            </div>
          )}

          {type === 'privacy' && (
            <div className="space-y-4">
              <p>
                At Deals On Point, your privacy is important to us.
              </p>
              <h3 className="font-display font-semibold text-[#F5F7FA] text-[15px]">No Required Account or Financial Collection</h3>
              <p>
                You do not need to register an account or provide payment information on Deals On Point. All financial transactions take place exclusively on Amazon's secure platform.
              </p>
              <h3 className="font-display font-semibold text-[#F5F7FA] text-[15px]">Third-Party Referral Cookies</h3>
              <p>
                When you click an outbound link such as “View Deal on Amazon”, Amazon may set referral tracking cookies in accordance with their privacy policy to identify qualifying purchases made via our associate link.
              </p>
            </div>
          )}

          {type === 'terms' && (
            <div className="space-y-4">
              <h3 className="font-display font-semibold text-[#F5F7FA] text-[15px]">Terms of Use</h3>
              <p>
                By using Deals On Point, you agree to these Terms and Conditions. Deals On Point provides independent product discovery, product overviews, and referral links to third-party retail destinations like Amazon.
              </p>
              <h3 className="font-display font-semibold text-[#F5F7FA] text-[15px]">Pricing & Availability Disclaimer</h3>
              <p>
                Product prices, availability, and delivery conditions are managed directly by Amazon and its merchants and may change at any time. Deals On Point does not maintain or guarantee live merchant pricing. Please verify details on Amazon before completing any purchase.
              </p>
              <p className="italic font-medium text-[#3B5BDB]">
                “As an Amazon Associate I earn from qualifying purchases.”
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#090A0F] border-t border-[#303541] flex items-center justify-between text-[13px] text-[#747D8C] font-sans">
          <span>Deals On Point · Independent Discovery</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1E222D] hover:bg-[#303541] text-[#F5F7FA] font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
