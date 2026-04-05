import React, { useMemo } from 'react';
import { useProducts } from '../ProductContext';
import { useAuth } from '../AuthContext';
import { 
  TrendingUp, Users, DollarSign, Activity, Globe, Shield, Zap, Briefcase, 
  ArrowUpRight, ArrowDownRight, Package, PieChart as PieIcon, BarChart3, Target, Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';

// Real-time Business Logic Simulation
const businessPerformance = [
  { month: 'Jan', revenue: 4500000, profit: 1200000, users: 12000 },
  { month: 'Feb', revenue: 5200000, profit: 1400000, users: 15400 },
  { month: 'Mar', revenue: 4800000, profit: 1300000, users: 14200 },
  { month: 'Apr', revenue: 6100000, profit: 1800000, users: 19800 },
  { month: 'May', revenue: 5900000, profit: 1750000, users: 18500 },
  { month: 'Jun', revenue: 7200000, profit: 2100000, users: 24000 },
];

const distributionData = [
  { name: 'Amazon Prime', value: 40, color: '#2563eb' },
  { name: 'Direct Retail', value: 25, color: '#f59e0b' },
  { name: 'Myntra Node', value: 20, color: '#0f172a' },
  { name: 'B2B Wholesale', value: 15, color: '#94a3b8' },
];

const OwnerDashboard: React.FC = () => {
  const { products } = useProducts();
  const { user, logout } = useAuth();

  const kpis = useMemo(() => [
    { label: 'Total Portfolio Revenue', value: '₹4.2 Cr', trend: '+18.4%', up: true, icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Global Active Users', value: '1,02,491', trend: '+12.5%', up: true, icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Gross Profit Margin', value: '28.4%', trend: '-0.2%', up: false, icon: Activity, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Asset Health Index', value: '99.8%', trend: 'Stable', up: true, icon: Shield, color: 'text-slate-600', bg: 'bg-slate-50' },
  ], []);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-20">
      
      {/* Strategic Header */}
      <header className="bg-white border-b border-slate-200 h-24 fixed top-0 w-full z-40 px-10 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
             <Briefcase size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-930">Executive Command Centre</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[3px] mt-1">SPA ENTERPRISE / PRIVATE ACCESS ONLY</p>
          </div>
        </div>

        <div className="flex items-center gap-8">
           <div className="hidden lg:flex items-center gap-4 border-r border-slate-100 pr-8">
              <div className="text-right">
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Network Status</p>
                 <p className="text-sm font-bold text-green-600 flex items-center gap-2 justify-end">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Synchronized
                 </p>
              </div>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                 <p className="text-sm font-bold text-slate-930 leading-none">{user?.name}</p>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Chief Executive Role</p>
              </div>
              <img src={user?.avatar} className="w-11 h-11 rounded-xl border border-slate-200" alt="CEO" />
              <button 
                 onClick={logout} 
                 className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-red-600 transition-all"
              >
                 <Zap size={20} />
              </button>
           </div>
        </div>
      </header>

      <main className="pt-36 max-w-[1700px] mx-auto px-10 space-y-12">
        
        {/* Real-time KPI Nodes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           {kpis.map((kpi, i) => (
             <motion.div 
               key={kpi.label}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group"
             >
                <div className="flex justify-between items-start mb-6">
                   <div className={`p-4 rounded-2xl ${kpi.bg} ${kpi.color}`}>
                      <kpi.icon size={26} />
                   </div>
                   <div className={`flex items-center gap-1 text-[11px] font-black px-3 py-1 rounded-full ${kpi.up ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      {kpi.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {kpi.trend}
                   </div>
                </div>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[2px]">{kpi.label}</p>
                <h3 className="text-4xl font-black text-slate-930 mt-2 tracking-tighter">{kpi.value}</h3>
                <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                   <kpi.icon size={150} />
                </div>
             </motion.div>
           ))}
        </div>

        {/* Business Intelligence Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           
           {/* Revenue Growth Node */}
           <div className="lg:col-span-2 bg-white p-12 rounded-[56px] border border-slate-100 shadow-2xl shadow-slate-200/30">
              <div className="flex justify-between items-center mb-12">
                 <div>
                    <h3 className="text-2xl font-bold flex items-center gap-4 text-slate-900">
                       <BarChart3 className="text-blue-600" /> Revenue & Profit Optimization
                    </h3>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2 px-1">Q1-Q2 Integrated Growth Matrix</p>
                 </div>
                 <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                       <span className="w-3 h-3 bg-blue-600 rounded-full"></span>
                       <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Revenue</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="w-3 h-3 bg-blue-100 rounded-full"></span>
                       <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Profit</span>
                    </div>
                 </div>
              </div>
              
              <div className="h-[400px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={businessPerformance}>
                       <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                             <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 900, fill: '#94a3b8' }} />
                       <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 900, fill: '#94a3b8' }} />
                       <Tooltip 
                         contentStyle={{ borderRadius: '24px', border: 'none', shadow: '0 20px 50px rgba(0,0,0,0.1)' }}
                         itemStyle={{ fontWeight: 900, fontSize: '12px' }}
                       />
                       <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={5} fillOpacity={1} fill="url(#colorRev)" />
                       <Area type="monotone" dataKey="profit" stroke="#e2e8f0" strokeWidth={5} fillOpacity={0} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* Strategic Distribution Pie */}
           <div className="bg-white p-12 rounded-[56px] border border-slate-100 shadow-2xl shadow-slate-200/30 flex flex-col items-center">
              <h3 className="text-2xl font-bold text-slate-930 text-center mb-2">Market Reach</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center mb-16">Global Channel Efficiency</p>
              
              <div className="flex-grow w-full h-[300px] relative">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie 
                         data={distributionData} 
                         cx="50%" 
                         cy="50%" 
                         innerRadius={80} 
                         outerRadius={120} 
                         dataKey="value"
                         stroke="none"
                       >
                          {distributionData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                       </Pie>
                       <Tooltip />
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <Target size={32} className="text-blue-600 mb-2" />
                    <span className="text-[10px] font-black uppercase tracking-[3px] text-slate-400">Target Reached</span>
                 </div>
              </div>

              <div className="w-full space-y-6 pt-10">
                 {distributionData.map(d => (
                    <div key={d.name} className="flex justify-between items-center">
                       <div className="flex items-center gap-4">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">{d.name}</span>
                       </div>
                       <span className="text-[11px] font-black text-slate-900">{d.value}%</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Tactical Summary Node */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
           <div className="p-10 bg-slate-900 rounded-[48px] text-white flex flex-col justify-between h-[300px]">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"><Calendar size={20} /></div>
                 <h4 className="text-sm font-black uppercase tracking-[4px]">Board Status</h4>
              </div>
              <p className="text-lg leading-relaxed font-medium">
                 Q3 projected growth <span className="text-blue-400">synced at +24%</span> with National Geographic direct imports. No supply node latency detected.
              </p>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Update Node: Delhi-HQ-01</div>
           </div>

           <div className="p-10 bg-blue-600 rounded-[48px] text-white flex flex-col justify-between h-[300px]">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><Globe size={20} /></div>
                 <h4 className="text-sm font-black uppercase tracking-[4px]">Network Reach</h4>
              </div>
              <p className="text-lg leading-relaxed font-medium">
                 Global distribution nodes currently <span className="text-white font-bold">active in 12 states</span>. Primary hubs in Delhi and Mumbai report 10ms sync latency.
              </p>
              <div className="text-[10px] font-black text-white/50 uppercase tracking-widest">Distributor Score: 98/100</div>
           </div>

           <div className="p-10 bg-white border border-slate-100 rounded-[48px] shadow-xl flex flex-col justify-between h-[300px]">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-blue-600"><Package size={20} /></div>
                 <h4 className="text-sm font-black uppercase tracking-[4px] text-slate-400">Asset Registry</h4>
              </div>
              <div>
                 <p className="text-slate-900 font-bold mb-2">Inventory Value Portfolio</p>
                 <p className="text-4xl font-black text-slate-930 tracking-tighter">₹12.8 Cr</p>
              </div>
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[2px] text-slate-400">
                 <span>{products.length} High-Yield SKUs</span>
                 <span className="text-green-600">Growth: +4.2%</span>
              </div>
           </div>
        </div>

      </main>

    </div>
  );
};

export default OwnerDashboard;
