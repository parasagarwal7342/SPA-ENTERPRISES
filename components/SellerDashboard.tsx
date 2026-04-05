import React, { useState, useMemo, useEffect } from 'react';
import { useProducts } from '../ProductContext';
import { useAuth } from '../AuthContext';
import { Brand, Product } from '../types';
import { AutoPostHub } from './AutoPost';
import { 
  Plus, Trash2, Edit, X, LayoutDashboard, Package, TrendingUp, Users, RefreshCw, 
  AlertCircle, Activity, Globe, DollarSign, ArrowUpRight, Zap, PieChart as PieIcon, LineChart as LineIcon, Search, CreditCard, ShoppingCart, Image as ImageIcon, Check, CheckCircle2, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SellerDashboard: React.FC = () => {
  const { products, addProduct, removeProduct, updateProduct, resetToDefault } = useProducts();
  const { user, logout } = useAuth();
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<'inventory' | 'autopost'>('inventory');

  // Form Fields
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    brand: Brand.NationalGeographic,
    category: '',
    price: '',
    description: '',
    image: '',
    features: []
  });

  const filteredProducts = useMemo(() => 
    products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.brand.toLowerCase().includes(searchTerm.toLowerCase())),
    [products, searchTerm]
  );

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        brand: Brand.NationalGeographic,
        category: '',
        price: '',
        description: '',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000',
        features: ['Premium Quality', 'Official Distribution']
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const finalProduct = {
      ...formData,
      id: editingProduct ? editingProduct.id : (Date.now().toString()),
    } as Product;

    if (editingProduct) {
      updateProduct(finalProduct);
    } else {
      addProduct(finalProduct);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
      
      {/* Management Header */}
      <header className="fixed top-20 left-0 right-0 h-20 bg-white/90 backdrop-blur-md border-b border-slate-200 z-40 px-10 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Inventory Management Portal</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[2px]">Authorized SPA TEAM Connection Only</p>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-[16px] border border-slate-200">
             <button
               onClick={() => setActiveTab('inventory')}
               className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'inventory' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
             >
                Global Inventory
             </button>
             <button
               onClick={() => setActiveTab('autopost')}
               className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'autopost' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
             >
                AutoPost Node
             </button>
          </div>
          <button
            onClick={() => window.open('#catalog', '_blank')}
            className="p-3 bg-slate-50 border border-slate-200 rounded-[14px] text-slate-400 hover:text-blue-600 hover:bg-white transition-all shadow-sm flex items-center gap-3 font-bold text-xs uppercase tracking-widest"
          >
            <FileText size={18} /> Export B2B Portfolio
          </button>
          <button
            onClick={() => resetToDefault()}
            className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-white transition-all shadow-sm"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden lg:flex flex-col items-end border-r border-slate-100 pr-6">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Catalog Node Sync</p>
            <p className="text-lg font-black text-slate-900 leading-none">{products.length} <span className="text-[10px] text-blue-600 font-bold ml-1">SKUs</span></p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all text-sm group"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-500" />
            Add New Asset
          </button>
        </div>
      </header>

      {/* Main Management Hub */}
      <main className="pt-44 p-10 space-y-12 max-w-[1700px] mx-auto w-full">
        {activeTab === 'autopost' ? (
            <AutoPostHub />
        ) : (
            <>
        {/* Top Intelligence Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 flex items-center gap-6 group hover:border-blue-400/20 transition-all">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><Package size={28} /></div>
              <div>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-2">Total Registry Items</p>
                 <h4 className="text-2xl font-black text-slate-900 leading-none">{products.length} Units</h4>
              </div>
           </div>
           <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 flex items-center gap-6 group hover:border-amber-400/20 transition-all">
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center"><TrendingUp size={28} /></div>
              <div>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-2">Asset Growth Index</p>
                 <h4 className="text-2xl font-black text-slate-900 leading-none">+12.4%</h4>
              </div>
           </div>
           <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 flex items-center gap-6 group hover:border-green-400/20 transition-all">
              <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center"><CheckCircle2 size={28} /></div>
              <div>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-2">System Sync Protocol</p>
                 <h4 className="text-2xl font-black text-slate-900 leading-none uppercase">Success</h4>
              </div>
           </div>
        </div>

        {/* Catalog Search & List Hub */}
        <div className="bg-white rounded-[56px] border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden">
           <div className="p-12 border-b border-slate-100 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div>
                 <h3 className="text-2xl font-bold text-slate-900 mb-2">Global Asset Registry</h3>
                 <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Inventory Management / Authorized Management Node</p>
              </div>
              <div className="relative group w-full lg:w-96">
                  <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Query Name or Brand..." 
                    className="w-full pl-16 pr-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-bold outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all shadow-sm" 
                  />
              </div>
           </div>

           <div className="overflow-x-auto overflow-y-hidden">
              <table className="w-full text-left">
                 <thead className="bg-[#f8fafc]">
                    <tr>
                       <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[3px] text-slate-400">Secure Product ID</th>
                       <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[3px] text-slate-400">Class/Category</th>
                       <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[3px] text-slate-400">Unit Price</th>
                       <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[3px] text-slate-400">Sync Status</th>
                       <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-[3px] text-slate-400">Authorized Edits</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    <AnimatePresence>
                       {filteredProducts.map((product, i) => (
                          <motion.tr 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ delay: i * 0.05 }}
                            key={product.id} 
                            className="group hover:bg-slate-50/70 transition-all font-medium"
                          >
                             <td className="px-10 py-8">
                                <div className="flex items-center gap-6">
                                   <div className="w-20 h-20 rounded-3xl overflow-hidden border border-slate-100 bg-white p-2">
                                      <img src={product.image} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" alt="" />
                                   </div>
                                   <div>
                                      <p className="text-slate-900 font-bold uppercase tracking-tight text-[15px] group-hover:text-blue-600 transition-colors leading-none mb-2">{product.name}</p>
                                      <div className="flex items-center gap-2">
                                         <span className="text-[10px] font-black text-blue-600 px-2 py-0.5 bg-blue-50 rounded-full">{product.brand}</span>
                                         <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">ID: SPA-{product.id.substring(0, 5)}</span>
                                      </div>
                                   </div>
                                </div>
                             </td>
                             <td className="px-10 py-8">
                                <span className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500">
                                   {product.category}
                                </span>
                             </td>
                             <td className="px-10 py-8">
                                <span className="text-lg font-black text-slate-930 tracking-tighter">{product.price}</span>
                             </td>
                             <td className="px-10 py-8">
                                <div className="flex items-center gap-3">
                                   <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.3)]"></div>
                                   <span className="text-[10px] font-black uppercase tracking-[2px] text-slate-900">Synchronized</span>
                                </div>
                             </td>
                             <td className="px-10 py-8 text-right">
                                <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                   <button 
                                     onClick={() => handleOpenModal(product)}
                                     className="p-4 bg-white border border-slate-200 rounded-[24px] text-slate-400 hover:text-blue-600 hover:border-blue-600 hover:shadow-xl hover:shadow-blue-50 transition-all"
                                   >
                                      <Edit size={20} />
                                   </button>
                                   <button 
                                     onClick={() => removeProduct(product.id)}
                                     className="p-4 bg-white border border-slate-200 rounded-[24px] text-slate-400 hover:text-red-600 hover:border-red-600 hover:shadow-xl hover:shadow-red-50 transition-all"
                                   >
                                      <Trash2 size={20} />
                                   </button>
                                </div>
                             </td>
                          </motion.tr>
                       ))}
                    </AnimatePresence>
                 </tbody>
              </table>
           </div>
        </div>
         </>
        )}
      </main>


      {/* Advanced Product Create/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-10">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsModalOpen(false)}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ scale: 0.95, opacity: 0, y: 30 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.95, opacity: 0, y: 30 }}
               className="relative bg-white w-full max-w-4xl rounded-[56px] shadow-2xl p-16 overflow-hidden max-h-[90vh] overflow-y-auto scrollbar-hide"
             >
                <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 p-4 bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all">
                   <X size={24} />
                </button>

                <div className="flex items-center gap-6 mb-12">
                   <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-lg"><ImageIcon size={28} /></div>
                   <div>
                      <h2 className="text-3xl font-black text-slate-900 leading-none mb-2">{editingProduct ? 'Update Inventory Registry' : 'Distribute New Asset'}</h2>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[4px]">Private SPA ENTERPRISE Record Entry</p>
                   </div>
                </div>

                <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-8">
                      <div className="flex flex-col gap-3">
                         <label className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 ml-2">Product Official Name</label>
                         <input 
                           required 
                           value={formData.name}
                           onChange={(e) => setFormData({...formData, name: e.target.value})}
                           className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold outline-none focus:bg-white focus:border-blue-600 transition-all shadow-sm" 
                           placeholder="e.g. National Geographic Hardshell L"
                         />
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                         <div className="flex flex-col gap-3">
                            <label className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 ml-2">Secure Brand Node</label>
                            <select 
                              value={formData.brand}
                              onChange={(e) => setFormData({...formData, brand: e.target.value as Brand})}
                              className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold outline-none focus:bg-white focus:border-blue-600 transition-all shadow-sm appearance-none"
                            >
                               <option value={Brand.NationalGeographic}>Nat Geographic</option>
                               <option value={Brand.Shraddha}>Shraddha Arts</option>
                            </select>
                         </div>
                         <div className="flex flex-col gap-3">
                            <label className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 ml-2">Market Price (₹)</label>
                            <input 
                               required 
                               value={formData.price}
                               onChange={(e) => setFormData({...formData, price: e.target.value})}
                               className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold outline-none focus:bg-white focus:border-blue-600 transition-all shadow-sm" 
                               placeholder="e.g. ₹9,499"
                            />
                         </div>
                      </div>
                      <div className="flex flex-col gap-3">
                         <label className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 ml-2">Category Port</label>
                         <input 
                            required 
                            value={formData.category}
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold outline-none focus:bg-white focus:border-blue-600 transition-all shadow-sm" 
                            placeholder="e.g. Premium Luggage"
                         />
                      </div>
                   </div>

                   <div className="space-y-8">
                      <div className="flex flex-col gap-3">
                         <label className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 ml-2">Asset Metadata / Description</label>
                         <textarea 
                           required 
                           value={formData.description}
                           onChange={(e) => setFormData({...formData, description: e.target.value})}
                           rows={5}
                           className="w-full bg-slate-50 border border-slate-100 rounded-[32px] p-6 text-sm font-medium outline-none focus:bg-white focus:border-blue-600 transition-all shadow-sm resize-none" 
                           placeholder="Describe the asset's unique properties..."
                         />
                      </div>
                      <div className="flex flex-col gap-3">
                         <label className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 ml-2">Asset Image Sync URL</label>
                         <input 
                           required 
                           value={formData.image}
                           onChange={(e) => setFormData({...formData, image: e.target.value})}
                           className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold outline-none focus:bg-white focus:border-blue-600 transition-all shadow-sm" 
                           placeholder="https://image-source.com/..."
                         />
                         <div className="mt-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-[2px] text-slate-400">Node Validation</span>
                            <Check className="text-green-500" size={16} />
                         </div>
                      </div>
                   </div>

                   <div className="md:col-span-2 pt-10 border-t border-slate-50 flex gap-6">
                      <button 
                        type="submit"
                        className="bg-blue-600 text-white px-12 py-5 rounded-3xl font-black text-xs uppercase tracking-[4px] hover:bg-blue-700 transition-all shadow-2xl shadow-blue-100 flex items-center gap-3"
                      >
                         <CheckCircle2 size={20} /> Synchronize to Registry
                      </button>
                      <button 
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="px-10 py-5 rounded-3xl border border-slate-200 text-slate-400 font-bold text-xs uppercase tracking-[4px] hover:bg-slate-50 transition-all"
                      >
                         Cancel Entry
                      </button>
                   </div>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default SellerDashboard;
