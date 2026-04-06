import React from 'react';
import { Facebook, Instagram, Linkedin, Twitter, Globe, Shield, Zap, Activity, Store, Mail, Phone, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white text-slate-900 pt-32 pb-12 relative overflow-hidden border-t border-slate-100">
      <div className="absolute top-0 right-0 w-[800px] h-[300px] bg-blue-50/50 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      <div className="max-w-[1700px] mx-auto px-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20 mb-28">
          
          {/* Brand Core Identity */}
          <div className="col-span-1">
            <div className="flex items-center gap-3 mb-10 group cursor-pointer" onClick={() => window.location.hash = '#home'}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-all transition-shadow shadow-lg shadow-blue-100 overflow-hidden bg-white border border-slate-100 p-1">
                <img src="/logo.png" className="w-full h-full object-contain" alt="SPA Logo" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-slate-900 leading-none">
                SPA <span className="text-blue-600">ENTERPRISE</span>
              </span>
            </div>
            <p className="text-slate-500 text-sm font-medium leading-relaxed mb-10 max-w-xs">
              Connecting global excellence with local distribution. Official distributor for 
              <span className="text-slate-900 font-bold"> National Geographic</span> and 
              <span className="text-slate-900 font-bold"> Shraddha Arts & Jewels</span> in India.
            </p>
            <div className="flex space-x-6">
              {[Instagram, Linkedin, Twitter, Facebook].map((Icon, i) => (
                <motion.a 
                  key={i}
                  whileHover={{ y: -5, scale: 1.1 }}
                  href="#" 
                  className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                >
                  <Icon size={18} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Access Matrix */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[5px] text-blue-600 mb-10">Marketplace Access</h4>
            <ul className="space-y-6 text-xs font-bold uppercase tracking-widest text-slate-500">
              <li><a href="#home" className="hover:text-blue-600 transition-colors flex items-center gap-3 group"><span className="w-1.5 h-1.5 bg-blue-600 rounded-full scale-0 group-hover:scale-100 transition-transform"></span> Home Portal</a></li>
              <li><a href="#products" className="hover:text-blue-600 transition-colors flex items-center gap-3 group"><span className="w-1.5 h-1.5 bg-blue-600 rounded-full scale-0 group-hover:scale-100 transition-transform"></span> Registry Collections</a></li>
              <li><a href="#brands" className="hover:text-blue-600 transition-colors flex items-center gap-3 group"><span className="w-1.5 h-1.5 bg-blue-600 rounded-full scale-0 group-hover:scale-100 transition-transform"></span> Official Brands</a></li>
              <li><a href="#seller" className="hover:text-blue-600 transition-colors flex items-center gap-3 group"><span className="w-1.5 h-1.5 bg-blue-600 rounded-full scale-0 group-hover:scale-100 transition-transform"></span> Distributed Seller Hub</a></li>
            </ul>
          </div>

          {/* Support Protocol */}
          <div id="support">
            <h4 className="text-[10px] font-black uppercase tracking-[5px] text-blue-600 mb-10">Official Communications</h4>
            <ul className="space-y-6">
              <li className="flex items-center gap-4 group">
                 <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all"><Mail size={18} /></div>
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Support</p>
                    <p className="text-xs font-bold text-slate-900 mt-1">spaenterprisesdelhi@gmail.com</p>
                 </div>
              </li>
              <li className="flex items-center gap-4 group">
                 <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all"><Phone size={18} /></div>
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secure Line</p>
                    <p className="text-xs font-bold text-slate-900 mt-1">+91 9650045621</p>
                 </div>
              </li>
              <li className="flex items-center gap-4 group">
                 <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all"><MapPin size={18} /></div>
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global HQ Node</p>
                    <p className="text-xs font-bold text-slate-900 mt-1">Rohini Sector-39, Delhi-110081</p>
                 </div>
              </li>
            </ul>
          </div>

          {/* Marketplace Distribution Logic */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[5px] text-blue-600 mb-10">Sales Channels</h4>
            <div className="space-y-4">
              {[
                { name: 'Amazon Prime Hub', status: 'SYNCHRONIZED', icon: Store, active: true },
                { name: 'Myntra Distribution', status: 'SYNCHRONIZED', icon: Globe, active: true },
                { name: 'Flipkart Global Node', status: 'PENDING SYNC', icon: Zap, active: false },
              ].map((channel, i) => (
                <div key={i} className={`p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-all flex flex-col gap-2 ${!channel.active && 'opacity-60 grayscale'}`}>
                   <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">{channel.name}</span>
                      <channel.icon size={16} className={channel.active ? 'text-blue-600' : 'text-slate-400'} />
                   </div>
                   <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${channel.active ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse' : 'bg-slate-300'}`}></div>
                      <span className={`text-[9px] font-black tracking-[3px] uppercase ${channel.active ? 'text-green-600' : 'text-slate-400'}`}>{channel.status}</span>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Global Footer Strip */}
        <div className="pt-12 border-t border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-10 lg:gap-0">
          
          {/* Copyright & Meta */}
          <div className="flex flex-col gap-4 flex-1">
             <p className="text-[10px] font-black uppercase tracking-[3px] text-slate-400">© {new Date().getFullYear()} SPA ENTERPRISE CORE DISTRIBUTION. REGISTRY-G-4309.</p>
             <div className="flex items-center gap-4 text-[9px] font-bold text-slate-900 uppercase tracking-widest">
                <span className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg"><Shield size={12} className="text-blue-600" /> Authorized Nodes Only</span>
                <span className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg"><Activity size={12} className="text-green-600" /> Latency: 42ms</span>
             </div>
          </div>

          {/* Central Venture Badge */}
          <div className="flex-1 flex justify-center order-first lg:order-none">
             <a 
               href="https://parasagarwal7342.netlify.app" 
               target="_blank" 
               rel="noopener noreferrer"
               className="group flex flex-col items-center gap-3"
             >
                <span className="text-[10px] font-black uppercase tracking-[5px] text-slate-300 group-hover:text-slate-900 transition-colors">Venture Delivery</span>
                
                <div className="flex items-center gap-5 px-8 py-4 bg-slate-950 rounded-2xl shadow-2xl shadow-slate-200/50 hover:shadow-slate-300/60 transition-all border border-slate-900 hover:border-slate-800 group/btn">
                   <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white group-hover/btn:bg-white group-hover/btn:text-slate-950 transition-all duration-300">
                      <Globe size={18} />
                   </div>
                   
                   <div className="flex flex-col items-start">
                      <span className="text-[9px] font-black uppercase tracking-[4px] text-slate-500 leading-none mb-1.5">Architected By</span>
                      <div className="flex items-center gap-1.5">
                         <span className="text-sm font-black uppercase tracking-[3px] text-white">Paraditi</span>
                         <span className="text-sm font-black uppercase tracking-[3px] text-slate-400">Corp</span>
                      </div>
                   </div>
                </div>
             </a>
          </div>

          {/* Legal Protocol */}
          <div className="flex-1 flex justify-end gap-10 text-[10px] font-black uppercase tracking-[5px] text-slate-400 border-l border-slate-100 pl-10 hidden lg:flex">
            <a href="#" className="hover:text-blue-600 transition-colors">Port Privacy</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Protocol Manifest</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Data Nodes</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
