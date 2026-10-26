import React from 'react';
import { useProducts } from '../ProductContext';
import { inr, titleCase } from '../lib/format';
import { useDocumentMeta } from '../lib/router';
import { FileText, Download, Globe, Shield, Zap, Package } from 'lucide-react';

const CatalogExport: React.FC = () => {
  const { products } = useProducts();
  useDocumentMeta('Product Catalogue');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-white p-6 sm:p-12 lg:p-20 text-slate-900 print:p-0">
      
      {/* Professional Brand Header (Print Optimized) */}
      <div className="flex justify-between items-start border-b-4 border-blue-600 pb-12 mb-20">
         <div>
            <h1 className="text-5xl font-black text-slate-900 leading-tight mb-2">SPA ENTERPRISE</h1>
            <p className="text-xs font-black uppercase tracking-[8px] text-blue-600">AUTHORISED DISTRIBUTOR · DELHI</p>
         </div>
         <div className="text-right">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">+91 93122 77087 · spaenterprisesdelhi@gmail.com</p>
            <p className="text-lg font-black text-slate-900">{new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
         </div>
      </div>

      <div className="mb-20">
         <h2 className="text-3xl font-bold text-slate-900 mb-6 uppercase tracking-tight">Product Catalogue</h2>
         <p className="text-lg text-slate-500 max-w-3xl leading-relaxed">
            Original products from <strong>National Geographic</strong> and <strong>Shraddha Arts &amp; Jewels</strong>, supplied across India.
            Prices shown are retail (incl. GST). Wholesale and corporate pricing on request: spaenterprise.in/bulk-order
         </p>
      </div>

      {/* High-Fidelity Catalog Grid */}
      <div className="grid md:grid-cols-2 print:grid-cols-2 gap-10 lg:gap-16">
         {products.map((product) => (
            <div key={product.id} className="border-t border-slate-100 pt-10 break-inside-avoid">
               <div className="flex justify-between items-start mb-6">
                  <span className="text-[10px] font-black uppercase tracking-[5px] text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{product.brand}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: {product.id}</span>
               </div>
               <div className="flex gap-10">
                  <div className="w-40 h-40 bg-slate-50 rounded-3xl p-4 flex items-center justify-center border border-slate-100">
                     <img src={product.image} className="w-full h-full object-contain mix-blend-multiply" alt="" />
                  </div>
                  <div className="flex-grow">
                     <h3 className="text-xl font-bold text-slate-900 mb-4">{titleCase(product.name)}</h3>
                     <p className="text-sm text-slate-500 font-medium mb-6 leading-relaxed line-clamp-3">
                        {product.description}
                     </p>
                     <div className="flex justify-between items-baseline pt-4 border-t border-slate-50">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{product.mrp && product.mrp > product.price ? `MRP ${inr(product.mrp)}` : titleCase(product.category)}</span>
                        <span className="text-2xl font-black text-slate-900">{inr(product.price)}</span>
                     </div>
                  </div>
               </div>
            </div>
         ))}
      </div>

      {/* Official Footnotes */}
      <div className="mt-32 pt-12 border-t border-slate-200 grid grid-cols-3 gap-10">
         <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
            <Shield size={20} className="text-blue-600" />
            <span>Authorised distributor – 100% original</span>
         </div>
         <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
            <Globe size={20} className="text-blue-600" />
            <span>Delivery across India</span>
         </div>
         <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
            <Zap size={20} className="text-blue-600" />
            <span>Bulk & corporate orders welcome</span>
         </div>
      </div>

      <div className="fixed bottom-10 right-10 print:hidden">
         <button 
           onClick={handlePrint}
           className="bg-slate-900 text-white px-10 py-5 rounded-[40px] font-black text-xs uppercase tracking-[5px] shadow-2xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center gap-4"
         >
            <Download size={20} /> Print / Save as PDF
         </button>
      </div>
    </div>
  );
};

export default CatalogExport;
