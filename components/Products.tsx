import React, { useState, useMemo } from 'react';
import { useProducts } from '../ProductContext';
import { Brand, Product } from '../types';
import { Filter, Search, ShoppingCart, Star, ShieldCheck, X, ArrowUpRight, Zap, Layers, Cpu, CheckCircle2, ChevronRight, Package, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Products: React.FC = () => {
  const { products, brandFilter, setBrandFilter, addToCart } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const filteredProducts = useMemo(() => products.filter(p => {
    const matchesBrand = brandFilter === 'All' || p.brand === brandFilter;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBrand && matchesSearch;
  }), [products, brandFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-32 pt-28">
      
      {/* Immersive Professional Product Detail Overlay */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6"
          >
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedProduct(null)}></div>
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="relative w-full max-w-6xl bg-white rounded-[40px] overflow-hidden flex flex-col lg:grid lg:grid-cols-2 border border-slate-200 shadow-2xl"
            >
              <button onClick={() => setSelectedProduct(null)} className="absolute top-8 right-8 p-3 bg-slate-50 hover:bg-slate-100 rounded-full z-10 transition-colors border border-slate-200 text-slate-400 hover:text-slate-900">
                <X size={24} />
              </button>

              <div className="bg-slate-50 flex items-center justify-center p-12 relative min-h-[500px]">
                 <div className="absolute left-8 top-1/2 -translate-y-1/2 flex flex-col gap-3">
                    {[selectedProduct.image, ...(selectedProduct.images || [])].map((img, i) => (
                       <button 
                         key={i} 
                         onClick={() => setActiveImage(img)}
                         className={`w-16 h-16 rounded-2xl border-2 overflow-hidden transition-all p-1 bg-white ${activeImage === img || (!activeImage && i === 0) ? 'border-blue-600 shadow-lg shadow-blue-50' : 'border-slate-100 opacity-60 hover:opacity-100'}`}
                       >
                         <img src={img} className="w-full h-full object-contain" alt="" />
                       </button>
                    ))}
                 </div>
                 <motion.img 
                   key={activeImage || selectedProduct.image}
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   src={activeImage || selectedProduct.image} 
                   className="w-full max-h-[600px] object-contain drop-shadow-xl" 
                 />
              </div>

              <div className="p-12 lg:p-16 flex flex-col h-full overflow-y-auto max-h-[90vh]">
                 <div className="mb-10">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="text-blue-600 text-[10px] font-black uppercase tracking-[4px] px-3 py-1 bg-blue-50 border border-blue-100 rounded-full">{selectedProduct.brand}</span>
                        <div className="flex text-amber-500 scale-75">
                          {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="currentColor" />)}
                        </div>
                    </div>
                    <h2 className="text-4xl font-bold text-slate-900 leading-[1.1] mb-6">{selectedProduct.name}</h2>
                    <div className="flex items-baseline gap-4 mb-8">
                       <span className="text-5xl font-black text-slate-930 tracking-tighter">{selectedProduct.price}</span>
                       <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Distributed from Delhi</span>
                    </div>
                 </div>

                 <div className="space-y-10 flex-grow">
                    <div>
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[4px] mb-4 flex items-center gap-2">
                           <Layers size={14} /> Product Profile
                       </h4>
                       <p className="text-slate-600 text-[15px] leading-relaxed bg-slate-50 p-6 rounded-3xl border border-slate-100">
                          {selectedProduct.description}
                       </p>
                    </div>

                    <div>
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[4px] mb-4 flex items-center gap-2">
                           <ShieldCheck size={14} /> Official Specifications
                       </h4>
                       <div className="grid grid-cols-1 gap-3">
                          {selectedProduct.features.slice(0, 3).map((f, i) => (
                             <div key={i} className="flex items-center gap-4 text-xs font-bold text-slate-700 bg-white px-5 py-4 rounded-2xl border border-slate-100 shadow-sm">
                                <CheckCircle2 size={18} className="text-blue-600" /> {f}
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>

                 <div className="mt-12 grid grid-cols-2 gap-5 pt-10 border-t border-slate-100">
                    <button 
                       onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}
                       className="bg-blue-600 py-5 rounded-2xl text-xs text-white font-black tracking-[4px] uppercase flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
                    >
                       <ShoppingCart size={20} /> Add to Cart
                    </button>
                    <button className="py-5 rounded-2xl border-2 border-slate-900 bg-slate-900 text-white font-black text-xs tracking-[4px] uppercase hover:bg-slate-800 transition-all shadow-xl shadow-slate-100">
                       Buy Now
                    </button>
                 </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1700px] mx-auto px-8 flex flex-col lg:flex-row gap-12">
        
        {/* Professional Filter Sidebar */}
        <aside className="w-full lg:w-80 flex-shrink-0 space-y-12">
           <div className="p-8 bg-white rounded-[40px] border border-slate-200 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-[4px] text-slate-900 mb-8 flex items-center gap-3">
                 <Filter size={18} /> Marketplace Discovery
              </h3>
              
              <div className="space-y-10">
                 <div>
                    <label className="flex items-center gap-3 text-xs font-bold text-slate-600 cursor-pointer group hover:text-blue-600 transition-colors">
                       <input type="checkbox" className="w-5 h-5 rounded-lg border-slate-300 bg-slate-50 text-blue-600 focus:ring-blue-600" defaultChecked />
                       <span className="uppercase tracking-widest">In Stock Global Registry</span>
                    </label>
                 </div>

                 <div className="space-y-4 pt-6 border-t border-slate-50">
                    <p className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 mb-2">Portfolio Brands</p>
                    <div className="space-y-2">
                       {['All', Brand.NationalGeographic, Brand.Shraddha].map((b) => (
                          <button 
                            key={b} 
                            onClick={() => setBrandFilter(b)}
                            className={`flex items-center justify-between w-full text-left text-[11px] font-bold uppercase tracking-[2px] p-4 rounded-xl transition-all ${brandFilter === b ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-600 hover:bg-slate-50'}`}
                          >
                             {b} {brandFilter === b && <Zap size={10} />}
                          </button>
                       ))}
                    </div>
                 </div>

                 <div className="pt-6 border-t border-slate-50">
                    <p className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 mb-6">User Satisfaction Rating</p>
                    {[4, 3, 2, 1].map(stars => (
                       <button key={stars} className="flex items-center gap-2 text-[10px] font-bold text-slate-500 mb-4 hover:text-blue-600 transition-all group">
                          <div className="flex text-amber-500/50 group-hover:text-amber-500 transition-colors">
                            {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={i < stars ? 'currentColor' : 'none'} />)}
                          </div>
                          <span className="uppercase tracking-[2px]">& ABOVE RANK</span>
                       </button>
                    ))}
                 </div>
              </div>
           </div>

           {/* Professional Insight Box (Replacing Shraddha AI's neon box) */}
           <div className="p-8 rounded-[40px] bg-slate-900 text-white shadow-2xl relative overflow-hidden group">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-blue-400 mb-6">
                 <ShieldCheck size={20} />
              </div>
              <h4 className="text-sm font-black text-white mb-2 uppercase tracking-[3px]">Official Assurance</h4>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                 All assets listed are passed through a multi-point inspection node. Every <span className="text-white font-bold">Shraddha</span> item includes a certificate of coating authenticity.
              </p>
           </div>
        </aside>

        {/* Catalog Node Area */}
        <main className="flex-grow space-y-10">
           
           {/* Navigation Context Bar */}
           <div className="p-6 bg-white rounded-[40px] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600"><Package size={20} /></div>
                 <div>
                    <h2 className="text-base font-bold text-slate-900 uppercase tracking-widest leading-none">Marketplace Catalog</h2>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[3px] mt-1.5">Official Inventory Hub / {filteredProducts.length} Items</p>
                 </div>
              </div>

              <div className="relative w-full md:w-96 group">
                 <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                 <input 
                   type="text" 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   placeholder="Search Catalog Registry..." 
                   className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-[2px] text-slate-900 outline-none focus:bg-white focus:border-blue-600 transition-all "
                 />
              </div>
           </div>

           {/* High-Performance Product Grid (Optimized for 1L Range) */}
           <motion.div 
             layout
             className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8"
           >
              <AnimatePresence>
                 {filteredProducts.map((product, i) => (
                    <motion.div 
                      key={product.id}
                      layout
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => setSelectedProduct(product)}
                      className="group bg-white rounded-[40px] overflow-hidden border border-slate-200 hover:border-blue-500/50 transition-all duration-500 p-5 cursor-pointer relative hover:shadow-2xl hover:shadow-blue-100"
                    >
                       <div className="relative aspect-square rounded-[32px] overflow-hidden mb-6 bg-slate-50 border border-slate-100 transition-all group-hover:bg-white p-4">
                          <img src={product.image} className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 transform group-hover:scale-110" alt="" />
                          <div className="absolute top-4 right-4 translate-x-10 translate-y-[-10px] group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-500">
                             <div className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur-md flex items-center justify-center text-blue-600 shadow-xl border border-white"><ArrowUpRight size={18} /></div>
                          </div>
                       </div>

                       <div className="px-2">
                          <div className="flex justify-between items-start mb-3">
                             <span className="text-[9px] font-bold text-blue-600 uppercase tracking-[3px] py-1">{product.brand}</span>
                             <div className="flex text-amber-500 scale-90">
                                <Star size={10} fill="currentColor" />
                                <span className="text-[9px] font-black ml-1 text-slate-400">4.9 RANK</span>
                             </div>
                          </div>
                          <h3 className="text-sm font-bold text-slate-800 mb-6 line-clamp-1 group-hover:text-blue-600 transition-color tracking-tight">{product.name}</h3>
                          
                          <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                             <span className="text-2xl font-black text-slate-930 tracking-tighter">{product.price}</span>
                             <button 
                               onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                               className="p-3 bg-slate-50 hover:bg-blue-600 text-slate-400 hover:text-white rounded-2xl transition-all border border-slate-100 group-hover:border-blue-600/20"
                             >
                                <ShoppingCart size={18} />
                             </button>
                          </div>
                       </div>
                    </motion.div>
                 ))}
              </AnimatePresence>
           </motion.div>

           {filteredProducts.length === 0 && (
              <div className="py-40 text-center">
                 <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-8 border border-slate-200">
                    <Search size={40} className="text-slate-300" />
                 </div>
                 <h3 className="text-2xl font-bold text-slate-900 mb-2 uppercase tracking-widest">Inventory Node Empty</h3>
                 <p className="text-slate-500 text-xs font-bold uppercase tracking-[5px]">No results match your current registry filters.</p>
                 <button onClick={() => { setSearchQuery(''); setBrandFilter('All'); }} className="mt-10 text-blue-600 font-bold text-xs uppercase tracking-[3px] border-b border-blue-200 pb-2 hover:border-blue-600 transition-all">Reset Marketplace Access</button>
              </div>
           )}
        </main>
      </div>
    </div>
  );
};

export default Products;
