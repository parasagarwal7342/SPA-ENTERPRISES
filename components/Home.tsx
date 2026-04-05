import React from 'react';
import { Compass, ShieldCheck, ArrowUpRight, Zap, Star, Globe, Shield, CreditCard, Activity, ArrowRight, Package, Truck, RotateCcw } from 'lucide-react';
import { useProducts } from '../ProductContext';
import { Brand } from '../types';
import { motion } from 'framer-motion';

const Home: React.FC = () => {
  const { products } = useProducts();

  return (
    <div className="bg-[#f8fafc] text-slate-900 pb-20">
      
      {/* High-End Professional Hero */}
      <section className="relative min-h-[90vh] flex items-center bg-white overflow-hidden pt-20 border-b border-slate-100">
        <div className="max-w-[1700px] mx-auto px-10 grid lg:grid-cols-2 gap-20 items-center justify-center">
          
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10"
          >
             <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-black uppercase tracking-[2px] mb-8 border border-blue-100">
                Official Marketplace / Distribution
             </span>
             <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-slate-930 leading-[1.05] mb-8">
               Reliability <br/> in Every <span className="text-blue-600">Adventure</span>
             </h1>
             <p className="text-lg text-slate-500 max-w-xl font-medium leading-relaxed mb-12">
               Discover the convergence of <span className="text-slate-900 font-bold">National Geographic</span> engineering 
               and <span className="text-slate-900 font-bold">Shraddha</span> artisanal heritage. Authentic products 
               distributed directly from our Delhi state-of-the-art facility.
             </p>
             <div className="flex flex-col sm:flex-row gap-5">
                <a
                  href="#products"
                  className="bg-blue-600 text-white px-10 py-5 rounded-full text-sm font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 group"
                >
                  Start Shopping <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </a>
                <a
                  href="#brands"
                  className="px-10 py-5 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-sm font-bold text-slate-700 flex items-center justify-center gap-3"
                >
                   View Collections <ArrowUpRight size={18} className="text-slate-400" />
                </a>
             </div>

             <div className="mt-16 flex items-center gap-8 border-t border-slate-50 pt-10">
                <div className="flex -space-x-3">
                   {[1,2,3,4].map(i => (
                     <img key={i} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+10}`} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100" />
                   ))}
                   <div className="w-10 h-10 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">+10k</div>
                </div>
                <div className="flex flex-col">
                   <div className="flex text-amber-500">
                      {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="currentColor" />)}
                   </div>
                   <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-wider">Trusted by 10,000+ Explorers</p>
                </div>
             </div>
          </motion.div>

          <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 0.8, delay: 0.2 }}
             className="relative hidden lg:block"
          >
             <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50 rounded-full blur-[100px] -z-10"></div>
             <div className="relative rounded-[40px] overflow-hidden shadow-2xl border border-slate-100">
                <img
                    src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2000&auto=format&fit=crop"
                    className="w-full h-full object-cover"
                    alt="Hero Showcase"
                />
                <div className="absolute bottom-10 left-10 right-10 bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-white shadow-xl flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><Package size={24} /></div>
                      <div>
                         <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Fresh Stock Node</p>
                         <p className="text-sm font-bold text-slate-900">National Geographic Hardshells</p>
                      </div>
                   </div>
                   <span className="text-blue-600 font-bold text-sm">₹8,999</span>
                </div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* Trust & Policy Strip */}
      <section className="py-12 bg-white border-b border-slate-100">
        <div className="max-w-[1600px] mx-auto px-10 overflow-x-auto whitespace-nowrap scrollbar-hide">
           <div className="flex items-center justify-between gap-12">
              {[
                { title: 'Dynamic Shipping Core', desc: 'Free in Delhi & PAN India >₹4,999', icon: Truck },
                { title: '24-Hour Assurance', desc: 'Secure protocol protection', icon: Shield },
                { title: '7-Day Returns', desc: 'Easy exchange policy', icon: RotateCcw },
                { title: 'Official Distributor', desc: '100% Authentic registry', icon: ShieldCheck },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 group">
                   <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-900 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                      <item.icon size={20} />
                   </div>
                   <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">{item.title}</h4>
                      <p className="text-[11px] text-slate-500 font-medium leading-none mt-1">{item.desc}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Flagship Brand Cards */}
      <section id="brands" className="py-32 px-10">
        <div className="max-w-[1600px] mx-auto">
           <div className="flex items-center justify-between mb-16">
              <div>
                 <h2 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">Prime Distributions</h2>
                 <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">Hand-selected high-tier asset classes</p>
              </div>
              <a href="#products" className="group text-blue-600 font-bold text-sm flex items-center gap-2">
                 Marketplace Overview <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </a>
           </div>

           <div className="grid md:grid-cols-2 gap-10">
              {/* Nat Geo Card */}
              <motion.div 
                whileHover={{ y: -10 }}
                className="bg-white rounded-[40px] p-12 border border-slate-100 shadow-xl overflow-hidden relative group h-[550px] flex flex-col justify-end"
              >
                  <div className="absolute inset-0 z-0">
                      <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000" className="w-full h-full object-cover grayscale opacity-10 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-110" alt="" />
                      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent"></div>
                  </div>
                  <div className="relative z-10">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/e/e0/National_Geographic_logo.svg" className="h-10 mb-8 opacity-70" alt="NG" />
                    <h3 className="text-4xl font-bold text-slate-900 mb-4">Engineering <br/> for Explorers</h3>
                    <p className="text-slate-600 max-w-sm mb-10 text-base leading-relaxed">The pinnacle of travel engineering. Designed to survive the world's most demanding environments.</p>
                    <a href="#products" className="inline-flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-full font-bold text-sm hover:scale-105 transition-all">
                       View Collection <Compass size={18} />
                    </a>
                  </div>
              </motion.div>

              {/* Shraddha Card */}
              <motion.div 
                whileHover={{ y: -10 }}
                className="bg-blue-600 rounded-[40px] p-12 shadow-2xl shadow-blue-200 overflow-hidden relative group h-[550px] flex flex-col justify-end border border-blue-500"
              >
                  <div className="absolute inset-0 z-0 text-white">
                      <img src="https://images.unsplash.com/photo-1611085583191-a3b1a6a9344e?q=80&w=1000" className="w-full h-full object-cover opacity-20 grayscale group-hover:grayscale-0 group-hover:opacity-40 transition-all duration-1000 group-hover:scale-110" alt="" />
                      <div className="absolute inset-0 bg-gradient-to-t from-blue-700 via-blue-700/60 to-transparent"></div>
                  </div>
                  <div className="relative z-10 text-white">
                    <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">Artisanal Heritage / Since 2021</span>
                    <h3 className="text-4xl font-bold mb-4">Shraddha <br/> Arts & Jewels</h3>
                    <p className="text-blue-50 text-base max-w-sm mb-10 leading-relaxed">Heritage stories woven into contemporary brass jewelry. Traditional craft for the modern profile.</p>
                    <a href="#products" className="inline-flex items-center gap-3 bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-sm hover:scale-105 transition-all">
                       Examine Assets <ShieldCheck size={18} />
                    </a>
                  </div>
              </motion.div>
           </div>
        </div>
      </section>

      {/* Top Sellers / Deals for 100k Users Proof UX */}
      <section className="py-20 px-10">
         <div className="max-w-[1600px] mx-auto bg-white rounded-[56px] border border-slate-100 p-16 shadow-2xl shadow-slate-200">
            <div className="flex items-center justify-between mb-12">
               <h2 className="text-3xl font-bold flex items-center gap-4 text-slate-900">
                  <span className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600"><Zap size={24} fill="currentColor" /></span> Premier Inventory Deals
               </h2>
               <div className="text-sm font-bold text-slate-500 flex items-center gap-2">
                  Network Status: <span className="text-green-600 px-3 py-1 rounded-lg bg-green-50 uppercase tracking-widest text-[10px]">Verified Nodes</span>
               </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
               {products.slice(0, 6).map((product, i) => (
                  <motion.div 
                    key={product.id}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="group cursor-pointer"
                  >
                     <div className="aspect-square bg-slate-50 rounded-3xl overflow-hidden mb-6 border border-slate-100 group-hover:border-blue-200 transition-all p-4">
                        <img src={product.image} className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110" alt="" />
                     </div>
                     <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2 px-1">{product.brand}</p>
                     <h4 className="text-[13px] font-bold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors tracking-tight px-1">{product.name}</h4>
                     
                     <div className="flex items-center justify-between mt-4 px-1">
                        <span className="text-lg font-black text-slate-930">{product.price}</span>
                        <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:rotate-12">
                           <ArrowUpRight size={14} />
                        </div>
                     </div>
                     <p className="px-1 text-[9px] text-green-600 font-bold uppercase mt-3 tracking-widest">In Stock / Delhi Hub</p>
                  </motion.div>
               ))}
            </div>
         </div>
      </section>

    </div>
  );
};

export default Home;
