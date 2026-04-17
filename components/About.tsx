import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Calendar, Gem, Info, Award } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="bg-white py-32 px-10" id="about">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid lg:grid-cols-2 gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Building2 size={24} />
              </div>
              <span className="text-sm font-black uppercase tracking-[3px] text-blue-600">Company Profile</span>
            </div>
            
            <h2 className="text-5xl font-black text-slate-900 leading-tight mb-10">
              M/S SPA <br/> <span className="text-blue-600">Enterprises</span>
            </h2>
            
            <div className="space-y-8 text-slate-500 leading-[1.8] text-lg font-medium mb-12">
              <p>
                SPA Enterprises is a certified <span className="text-slate-900 font-bold">Micro Enterprise</span> specializing in the 
                manufacturing and trading of high-quality goods. Since our intechoration in <span className="text-slate-900 font-bold">May 2023</span>, 
                we have established ourselves as a reliable partner in the retail sale of non-specialized goods across India.
              </p>
              <p>
                Our core strength lies in our ability to source and distribute premium asset classes, 
                blending traditional artisanal craftsmanship with modern engineering excellence.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-blue-200 transition-all">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                  <Calendar size={20} />
                </div>
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Intechorated</h4>
                <p className="text-slate-900 font-bold">30 May 2023</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-blue-200 transition-all">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                  <Award size={20} />
                </div>
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">MSME Type</h4>
                <p className="text-slate-900 font-bold">Micro (2023-24)</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-blue-50/50 rounded-[40px] blur-3xl -z-10"></div>
            <div className="bg-slate-950 rounded-[48px] p-12 text-white shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] -z-10"></div>
               
               <h3 className="text-2xl font-bold mb-12 flex items-center gap-3">
                 <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white"><Info size={18} /></span> 
                 Business Registry Trace
               </h3>

               <div className="space-y-10">
                 {[
                   { label: 'Udyam Registration', value: 'UDYAM-DL-06-0094890' },
                   { label: 'GSTIN Protocol', value: '07AFAFS5850H1ZW' },
                   { label: 'Legal Constitution', value: 'Partnership' },
                   { label: 'NIC Industry Code', value: '47190 (Retail Sale)' },
                   { label: 'Activity Domain', value: 'Manufacturing & Trading' },
                 ].map((detail, i) => (
                   <div key={i} className="flex flex-col gap-2 group cursor-default">
                      <span className="text-[10px] font-black uppercase tracking-[4px] text-slate-500 group-hover:text-blue-400 transition-colors">{detail.label}</span>
                      <span className="text-xl font-bold tracking-tight text-white">{detail.value}</span>
                   </div>
                 ))}
               </div>

               <div className="mt-16 pt-10 border-t border-slate-900 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border border-slate-800 flex items-center justify-center">
                    <Gem size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Enterprise Status</p>
                    <p className="text-sm font-bold text-green-500">Regular / Ongoing Activity</p>
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default About;
