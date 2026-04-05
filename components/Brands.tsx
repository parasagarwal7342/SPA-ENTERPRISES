
import React from 'react';
import { BRAND_DETAILS } from '../constants';
import { Brand } from '../types';
import { Shield, Hammer, Map, Star } from 'lucide-react';
import { useProducts } from '../ProductContext';

const Brands: React.FC = () => {
  const { setBrandFilter } = useProducts();
  return (
    <div className="min-h-screen">
      {/* National Geographic Brand Section */}
      <section className="bg-white py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1">
              <div className="bg-[#FFCC00] text-black px-4 py-1 rounded w-fit text-sm font-bold mb-6 tracking-widest uppercase">
                {Brand.NationalGeographic}
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 leading-tight">
                Further Your <br /> <span className="text-amber-600">Adventure.</span>
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                {BRAND_DETAILS[Brand.NationalGeographic].description}
              </p>
              <div className="grid grid-cols-2 gap-8 mb-10">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                    <Shield size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Durability</h4>
                    <p className="text-xs text-gray-500">Tested in extreme conditions.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                    <Map size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Purpose</h4>
                    <p className="text-xs text-gray-500">Gear for real explorers.</p>
                  </div>
                </div>
              </div>
              <a
                href="#products"
                onClick={() => setBrandFilter(Brand.NationalGeographic)}
                className="inline-block bg-gray-900 text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition-all"
              >
                View Nat Geo Gear
              </a>
            </div>
            <div className="order-1 md:order-2 relative">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl bg-black border border-gray-800 flex items-center justify-center p-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-16 border-[8px] border-[#FFCC00] flex-shrink-0"></div>
                  <div className="flex flex-col">
                    <span className="text-white text-2xl md:text-3xl font-black leading-none tracking-tighter">NATIONAL</span>
                    <span className="text-white text-2xl md:text-3xl font-black leading-none tracking-tighter">GEOGRAPHIC</span>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-[#FFCC00] p-6 rounded-2xl shadow-xl hidden md:block max-w-[240px]">
                <p className="text-black font-bold text-sm">Every purchase supports global exploration & research.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shraddha Brand Section */}
      <section className="bg-gray-50 py-24 border-y border-gray-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="aspect-square rounded-full overflow-hidden shadow-[0_0_40px_rgba(212,175,55,0.2)] bg-black border-4 border-[#D4AF37]/40 flex items-center justify-center">
                <img
                  src="/logo.png"
                  className="w-full h-full object-contain"
                  alt="Shraddha Logo"
                />
              </div>
              <div className="absolute -top-6 -right-6 bg-[#D4AF37] p-6 rounded-2xl shadow-xl hidden md:block max-w-[240px] text-white">
                <p className="font-hindi text-xl font-bold mb-2">परंपरा और गुणवत्ता</p>
                <p className="text-sm">Tradition and Quality, refined over generations.</p>
              </div>
            </div>
            <div>
              <div className="bg-[#D4AF37] text-white px-4 py-1 rounded w-fit text-sm font-bold mb-6 tracking-widest uppercase">
                {Brand.Shraddha}
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 leading-tight font-hindi">
                श्रद्धा (Shraddha): <br /> <span className="text-[#D4AF37]">The Art of Brass.</span>
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                {BRAND_DETAILS[Brand.Shraddha].description}
              </p>
              <div className="grid grid-cols-2 gap-8 mb-10">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-50 rounded-lg text-[#D4AF37]">
                    <Hammer size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Craft</h4>
                    <p className="text-xs text-gray-500">Hand-finished by artisans.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-50 rounded-lg text-[#D4AF37]">
                    <Star size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Coating</h4>
                    <p className="text-xs text-gray-500">1-Year Warranty protection.</p>
                  </div>
                </div>
              </div>
              <a
                href="#products"
                onClick={() => setBrandFilter(Brand.Shraddha)}
                className="inline-block bg-[#D4AF37] text-white px-8 py-3 rounded-full font-bold hover:bg-[#b8962c] transition-all"
              >
                View Jewelry Collection
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Brands;
