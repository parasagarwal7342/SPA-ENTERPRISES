import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, User, Users, Gem, Info } from 'lucide-react';

const Leadership: React.FC = () => {
  const partners = [
    {
      name: 'Shraddha Agarwal',
      title: 'Partner',
      region: 'Delhi',
      initials: 'SA',
      color: 'bg-blue-600',
    },
    {
      name: 'Prabha Pathak',
      title: 'Partner',
      region: 'Uttar Pradesh',
      initials: 'PP',
      color: 'bg-indigo-600',
    }
  ];

  return (
    <div className="bg-white py-32 px-10" id="management">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col items-center text-center mb-24">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-8"><Users size={24} /></div>
          <h2 className="text-4xl font-bold tracking-tight text-slate-900 mb-4 uppercase tracking-[4px]">Board & Management</h2>
          <p className="text-slate-500 font-medium max-w-xl">Governed by experienced leadership dedicated to operational excellence.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          {partners.map((partner, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-slate-50 rounded-[48px] p-12 border border-slate-100 group hover:border-blue-200 transition-all shadow-xl shadow-slate-100 flex items-center gap-10 relative overflow-hidden"
            >
               <div className="absolute top-0 right-0 w-48 h-48 bg-white rounded-full blur-3xl -z-10 group-hover:bg-blue-50/50 transition-colors"></div>
               
               <div className={`w-32 h-32 rounded-full border-4 border-white shadow-2xl flex items-center justify-center text-white text-3xl font-black ${partner.color} group-hover:scale-110 transition-transform`}>
                 {partner.initials}
               </div>

               <div className="flex-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">{partner.title}</span>
                  <h3 className="text-3xl font-black tracking-tight text-slate-900 mb-4">{partner.name}</h3>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-100 rounded-2xl w-fit">
                    <ShieldCheck size={14} className="text-blue-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 leading-none">{partner.region} Division Control</span>
                  </div>
                  
                  <div className="mt-8 flex gap-4">
                     <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"><Info size={14} /></div>
                     <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"><Gem size={14} /></div>
                  </div>
               </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Leadership;
