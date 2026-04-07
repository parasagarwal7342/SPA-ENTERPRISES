import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Globe, Map } from 'lucide-react';

const Contact: React.FC = () => {
  return (
    <div className="bg-[#f8fafc] py-32 px-10" id="contact">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col items-center text-center mb-20">
          <span className="inline-block px-4 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">Global Communications Hub</span>
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Official Node Interaction</h2>
          <p className="text-slate-500 font-medium max-w-xl">Reliable service infrastructure through our dual-node distribution network.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Node 1: Principal Office */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-[40px] p-12 border border-slate-100 shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full blur-3xl -z-10"></div>
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-10"><MapPin size={28} /></div>
            
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Principal <span className="text-blue-600">Office</span></h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 border-b border-slate-50 pb-4">Authorized Registry Node</p>
            
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                 <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none">Global Address</span>
                 <p className="text-sm font-bold text-slate-900">53-B, Block-C, Gali No. 1, Karala Landmark Near Yuva Shakti, Rama Vihar, Delhi – 110081</p>
              </div>
              <div className="flex flex-col gap-2">
                 <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none">Phone Trace</span>
                 <p className="text-sm font-bold text-slate-900">+91 93122 77087</p>
              </div>
              <div className="flex flex-col gap-2">
                 <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none">Email Protocol</span>
                 <p className="text-sm font-bold text-blue-600">spaenterprisesdelhi@gmail.com</p>
              </div>
            </div>
          </motion.div>

          {/* Node 2: Branch Office */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-[40px] p-12 border border-slate-100 shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-50/50 rounded-full blur-3xl -z-10"></div>
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-10"><Globe size={28} /></div>
            
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Branch <span className="text-green-600">Office</span></h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 border-b border-slate-50 pb-4">Secondary Distribution Hub</p>
            
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                 <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none">Hub Address</span>
                 <p className="text-sm font-bold text-slate-900">Upper Ground, 104, Dream Hub Apartment-4 Najafgarh, Shyam Vihar Ph-II, New Delhi – 110043</p>
              </div>
              <div className="flex flex-col gap-2">
                 <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none">District Control</span>
                 <p className="text-sm font-bold text-slate-900">North West Delhi, Delhi</p>
              </div>
              <div className="flex flex-col gap-2">
                 <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none">Business Type</span>
                 <p className="text-sm font-bold text-slate-900">Micro Manufacturing Facility</p>
              </div>
            </div>
          </motion.div>

          {/* Contact Logic / Form Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900 rounded-[40px] p-12 shadow-2xl relative overflow-hidden text-white"
          >
             <div className="absolute inset-0 bg-blue-600/10 pointer-events-none"></div>
             <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-10 border border-white/10"><Map size={28} /></div>
             <h3 className="text-2xl font-bold mb-8">Interaction Protocol</h3>
             
             <div className="space-y-8">
               <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Response Latency: &lt;24h</span>
               </div>
               
               <p className="text-slate-400 text-sm font-medium leading-relaxed mb-10">
                 Our distribution network ensures that all inquiries are routed through our principal office in Karala for quality assurance and official registry.
               </p>

               <a 
                 href="mailto:spaenterprisesdelhi@gmail.com" 
                 className="flex items-center justify-center gap-3 bg-blue-600 text-white w-full py-5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-900/20"
               >
                 Initialize Sync <ArrowRight size={16} />
               </a>
             </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
import { ArrowRight } from 'lucide-react';

export default Contact;
