import React, { useState, useEffect } from 'react';
import { Bot, Image as ImageIcon, Video, Calendar, Clock, Lock, CheckCircle2, XCircle, Share2, Facebook, Instagram, Linkedin, Youtube, Loader2, Sparkles, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AutoPostHub: React.FC = () => {
    const [password, setPassword] = useState(localStorage.getItem('app_password') || '');
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('app_password'));
    const [activeTab, setActiveTab] = useState<'create' | 'history' | 'schedule'>('create');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password) {
            localStorage.setItem('app_password', password);
            setIsAuthenticated(true);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] bg-slate-930 text-white rounded-[48px] p-12 border border-slate-800 relative overflow-hidden group">
               <div className="absolute inset-0 bg-blue-600/5 transition-opacity group-hover:bg-blue-600/10"></div>
               <Lock size={64} className="text-blue-500 mb-8 relative z-10" />
               <h2 className="text-4xl font-black mb-4 tracking-tighter relative z-10">Restricted Access</h2>
               <p className="text-sm font-bold text-slate-400 uppercase tracking-[4px] mb-12 relative z-10">SPA Enterprise AutoPost Hub</p>
               
               <form onSubmit={handleLogin} className="w-full max-w-sm relative z-10">
                   <div className="bg-slate-900 rounded-3xl p-2 pl-6 flex items-center border border-slate-800 shadow-2xl shadow-blue-900/20 focus-within:border-blue-500/50 transition-all">
                       <input 
                           type="password"
                           value={password}
                           onChange={e => setPassword(e.target.value)}
                           placeholder="Enter Access Sequence..."
                           className="bg-transparent border-none text-white w-full text-sm font-bold tracking-widest outline-none placeholder:text-slate-600 uppercase"
                       />
                       <button type="submit" className="bg-blue-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30">
                           <KeyIcon />
                       </button>
                   </div>
               </form>
            </div>
        );
    }

    return (
        <div className="p-10 bg-white border border-slate-200 rounded-[48px] shadow-2xl shadow-slate-200/50 min-h-[80vh]">
            <div className="flex items-center gap-6 mb-12">
               <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-200">
                  <Share2 size={28} />
               </div>
               <div>
                  <h2 className="text-3xl font-black text-slate-930 tracking-tight">Social Matrix Center</h2>
                  <p className="text-[10px] items-center font-bold text-blue-600 uppercase tracking-[4px] mt-2 flex gap-2">
                     <Sparkles size={12} /> AI Content Engine Active
                  </p>
               </div>
               <div className="ml-auto flex gap-3 bg-slate-50 p-2 rounded-3xl border border-slate-100">
                  {['create', 'history', 'schedule'].map(v => (
                      <button 
                         key={v}
                         onClick={() => setActiveTab(v as any)}
                         className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[3px] transition-all ${activeTab === v ? 'bg-white text-blue-600 shadow-md shadow-slate-200/50 border border-slate-200' : 'text-slate-400 hover:text-slate-900'}`}
                      >
                          {v}
                      </button>
                  ))}
               </div>
            </div>

            <div className="relative">
                {activeTab === 'create' && <CreatePost password={password} />}
                {activeTab === 'history' && <PostHistory password={password} />}
                {activeTab === 'schedule' && <PostSchedule password={password} />}
            </div>
        </div>
    );
};

const CreatePost: React.FC<{ password: string }> = ({ password }) => {
    const [topic, setTopic] = useState('');
    const [brand, setBrand] = useState('SPA Enterprise');
    const [tone, setTone] = useState('Professional');
    const [platforms, setPlatforms] = useState<string[]>(['instagram', 'linkedin']);
    const [genImage, setGenImage] = useState(true);
    const [status, setStatus] = useState<'idle' | 'generating' | 'review' | 'posting' | 'done'>('idle');
    const [aiResult, setAiResult] = useState<any>(null);

    const handleGenerate = async () => {
        setStatus('generating');
        try {
            const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
            const res = await fetch(`${API_BASE_URL}/api/autopost/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-app-password': password },
                body: JSON.stringify({ topic, brand, tone, platforms, generateImage: genImage, audience: 'General Audience' })
            });
            if (!res.ok) throw new Error("Auth Failed or API Error");
            const data = await res.json();
            setAiResult(data);
            setStatus('review');
        } catch (e: any) {
            alert('Generation Failed: ' + e.message);
            setStatus('idle');
        }
    };

    const handlePost = async () => {
        setStatus('posting');
        try {
            const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
            const res = await fetch(`${API_BASE_URL}/api/autopost/post`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-app-password': password },
                body: JSON.stringify({
                    platforms,
                    caption: JSON.stringify(aiResult.captions),
                    hashtags: aiResult.hashtags,
                    imageUrl: aiResult.imageUrl,
                    scheduleTime: null
                })
            });
            if (!res.ok) throw new Error("Post Submission Failed");
            setStatus('done');
        } catch (e) {
            alert('Posting Failed');
            setStatus('review');
        }
    };

    if (status === 'generating' || status === 'posting') {
        return (
            <div className="flex flex-col items-center justify-center py-40">
                <Loader2 size={64} className="text-blue-500 animate-spin mb-8" />
                <p className="text-sm font-black uppercase tracking-[5px] text-slate-400">
                    {status === 'generating' ? 'AI Synapse Generating Content Matrix...' : 'Authorizing Global Broadcast...'}
                </p>
            </div>
        );
    }

    if (status === 'review' && aiResult) {
        return (
            <div className="grid grid-cols-2 gap-10 animate-in fade-in slide-in-from-bottom-5">
                <div className="space-y-8">
                    <h3 className="text-xs font-black uppercase tracking-[4px] text-slate-900 border-b border-slate-100 pb-4">Content Review</h3>
                    {platforms.map(p => (
                        <div key={p} className="bg-slate-50 rounded-3xl p-6 border border-slate-200">
                            <p className="text-[10px] font-black uppercase tracking-[3px] text-blue-600 mb-4">{p}</p>
                            <textarea 
                                className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm font-medium outline-none resize-none h-32 focus:border-blue-500 shadow-sm"
                                defaultValue={aiResult.captions[p]}
                            />
                        </div>
                    ))}
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 mb-3">Hashtags</p>
                        <div className="flex flex-wrap gap-2">
                           {aiResult.hashtags.map((h: string) => <span key={h} className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">{h}</span>)}
                        </div>
                    </div>
                </div>
                <div className="space-y-8">
                    <h3 className="text-xs font-black uppercase tracking-[4px] text-slate-900 border-b border-slate-100 pb-4">Media Asset Matrix</h3>
                    {aiResult.imageUrl ? (
                        <div className="rounded-[32px] overflow-hidden border-4 border-slate-100 shadow-2xl relative group">
                            <img src={aiResult.imageUrl} className="w-full h-auto" />
                            <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                               <p className="text-white text-[10px] font-black tracking-[4px] uppercase">DALL-E 3 Generation</p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-50 p-10 rounded-3xl text-center border-2 border-dashed border-slate-200 text-slate-400 text-xs font-bold uppercase tracking-widest">
                           No Image Generated
                        </div>
                    )}
                    
                    <div className="bg-slate-900 text-white rounded-[32px] p-8 mt-10 relative overflow-hidden">
                       <p className="text-[10px] font-black uppercase tracking-[4px] text-blue-400 mb-6">Video Blueprint Script</p>
                       <p className="text-sm font-medium leading-relaxed whitespace-pre-line text-slate-300 relative z-10">{aiResult.script}</p>
                    </div>

                    <div className="flex gap-4 pt-8">
                        <button onClick={handlePost} className="flex-1 bg-blue-600 text-white py-6 rounded-3xl text-xs font-black uppercase tracking-[4px] hover:bg-blue-700 shadow-xl shadow-blue-200 flex items-center justify-center gap-3">
                            <Send size={18} /> Global Broadcast
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (status === 'done') {
        return (
            <div className="py-32 text-center text-green-600">
                <CheckCircle2 size={100} className="mx-auto mb-8 animate-pulse shadow-xl shadow-green-100 rounded-full" />
                <h3 className="text-4xl font-black mb-4 tracking-tighter">Broadcast Complete</h3>
                <p className="text-slate-500 font-bold uppercase tracking-[4px] text-sm mb-12">Social Matrix Successfully Synchronized</p>
                <button onClick={() => setStatus('idle')} className="bg-slate-900 py-4 px-12 rounded-3xl text-xs text-white font-black tracking-[3px] uppercase hover:bg-slate-800">
                    Initialize New Action
                </button>
            </div>
        );
    }

    // Default Create Form
    return (
        <div className="max-w-4xl mx-auto space-y-12 py-10 animate-in fade-in">
            <div className="bg-slate-50 p-10 rounded-[40px] border border-slate-200 shadow-sm space-y-8">
                <div>
                   <label className="text-[10px] font-black uppercase tracking-[4px] text-slate-400 ml-4 mb-4 block">Topic / Initiative Array</label>
                   <textarea rows={3} value={topic} onChange={e => setTopic(e.target.value)} className="w-full bg-white border border-slate-200 rounded-[24px] p-6 text-sm font-bold resize-none outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all shadow-sm" placeholder="Define target communication protocol..." />
                </div>
                
                <div className="grid grid-cols-2 gap-8">
                   <div>
                       <label className="text-[10px] font-black uppercase tracking-[4px] text-slate-400 ml-4 mb-4 block">Brand Identity</label>
                       <input value={brand} onChange={e => setBrand(e.target.value)} className="w-full bg-white border border-slate-200 rounded-2xl p-5 text-sm font-bold outline-none focus:border-blue-500 transition-all" />
                   </div>
                   <div>
                       <label className="text-[10px] font-black uppercase tracking-[4px] text-slate-400 ml-4 mb-4 block">Communication Tone</label>
                       <select value={tone} onChange={e => setTone(e.target.value)} className="w-full bg-white border border-slate-200 rounded-2xl p-5 text-sm font-bold outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer">
                           <option>Professional</option><option>Inspirational</option><option>Casual</option><option>Funny</option>
                       </select>
                   </div>
                </div>
            </div>

            <div>
                <label className="text-[10px] font-black uppercase tracking-[4px] text-slate-400 ml-4 mb-6 block">Target Publication Hubs</label>
                <div className="flex flex-wrap gap-4">
                    {[
                        { id: 'instagram', icon: Instagram, name: 'Instagram' },
                        { id: 'facebook', icon: Facebook, name: 'Facebook' },
                        { id: 'linkedin', icon: Linkedin, name: 'LinkedIn' },
                        { id: 'youtube', icon: Youtube, name: 'YouTube' }
                    ].map(p => (
                        <button 
                           key={p.id}
                           onClick={() => setPlatforms(prev => prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id])}
                           className={`flex items-center gap-4 px-8 py-5 rounded-[24px] text-xs font-black uppercase tracking-widest transition-all ${platforms.includes(p.id) ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 border-2 border-blue-600' : 'bg-white border-2 border-slate-200 text-slate-400 hover:border-blue-300'}`}
                        >
                            <p.icon size={20} /> {p.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-between bg-slate-930 text-white p-10 rounded-[40px] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 blur-[120px] opacity-20 transform translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                <div>
                   <h4 className="text-xl font-black tracking-tight mb-2 flex items-center gap-3"><ImageIcon className="text-blue-500" /> Synthesize Visual Media</h4>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Connect to DALL-E 3 Neural Net</p>
                </div>
                <button 
                   onClick={() => setGenImage(!genImage)}
                   className={`w-20 h-10 rounded-full p-1 transition-colors ${genImage ? 'bg-blue-600' : 'bg-slate-700'}`}
                >
                   <div className={`w-8 h-8 bg-white rounded-full transition-transform shadow-sm ${genImage ? 'translate-x-10' : 'translate-x-0'}`} />
                </button>
            </div>

            <button onClick={handleGenerate} disabled={!topic || platforms.length === 0} className="w-full bg-blue-600 py-8 rounded-[32px] text-white text-sm font-black uppercase tracking-[5px] hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 flex items-center justify-center gap-4 disabled:opacity-50 group">
                <Bot size={24} className="group-hover:animate-bounce" /> Generate Content Matrix
            </button>
        </div>
    );
};

const PostHistory: React.FC<{ password: string }> = ({ password }) => {
    const [history, setHistory] = useState<any[]>([]);

    const fetchHistory = () => {
        const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
        fetch(`${API_BASE_URL}/api/autopost/history`, { headers: { 'x-app-password': password } })
            .then(r => r.json())
            .then(data => Array.isArray(data) ? setHistory(data) : setHistory([]))
            .catch(() => setHistory([]));
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    return (
        <div className="py-10 animate-in fade-in space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[4px] text-slate-900 border-b border-slate-100 pb-4 mb-8">Broadcast Ledger</h3>
            {history.length ? history.map(h => (
                <div key={h.id} className="bg-slate-50 p-8 rounded-[32px] border border-slate-200 flex items-center justify-between group hover:bg-white transition-colors cursor-pointer relative">
                   <div>
                       <div className="flex items-center gap-3 mb-2">
                           <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md ${h.status === 'posted' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{h.status}</span>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(h.created_at).toLocaleString()}</p>
                       </div>
                       <h4 className="text-lg font-bold text-slate-900">{h.topic || 'Autopost Subject'}</h4>
                   </div>
                   <div className="flex gap-2 text-slate-400">
                      {JSON.parse(h.platforms || '[]').map((p: string) => <span key={p} className="text-[10px] bg-slate-200 font-black px-3 py-1 uppercase rounded-lg">{p}</span>)}
                   </div>
                </div>
            )) : (
                <p className="text-center py-20 text-slate-400 text-xs font-bold uppercase tracking-[5px]">Ledger is Empty</p>
            )}
        </div>
    );
};

const PostSchedule: React.FC<{ password: string }> = ({ password }) => {
    const [scheduled, setScheduled] = useState<any[]>([]);

    const fetchSchedule = () => {
        const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
        fetch(`${API_BASE_URL}/api/autopost/scheduled`, { headers: { 'x-app-password': password } })
            .then(r => r.json())
            .then(data => Array.isArray(data) ? setScheduled(data) : setScheduled([]))
            .catch(() => setScheduled([]));
    };

    useEffect(() => {
        fetchSchedule();
    }, []);

    const cancelPost = async (id: number) => {
        const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
        await fetch(`${API_BASE_URL}/api/autopost/scheduled/${id}`, { 
            method: 'DELETE',
            headers: { 'x-app-password': password } 
        });
        fetchSchedule();
    };

    return (
        <div className="py-10 animate-in fade-in space-y-6 text-left">
            <h3 className="text-xs font-black uppercase tracking-[4px] text-slate-900 border-b border-slate-100 pb-4 mb-8">Queue Status</h3>
            {scheduled.length ? scheduled.map(s => (
                <div key={s.id} className="bg-slate-900 text-white p-8 rounded-[40px] border border-slate-800 flex items-center justify-between group">
                   <div className="flex items-center gap-8">
                       <div className="w-16 h-16 bg-slate-800 rounded-3xl flex items-center justify-center text-blue-500 shadow-inner">
                           <Clock size={28} />
                       </div>
                       <div>
                           <p className="text-[10px] font-black uppercase tracking-[3px] text-blue-400 mb-2">Target Time: {new Date(s.scheduled_time).toLocaleString()}</p>
                           <h4 className="text-xl font-bold tracking-tight text-white mb-2 line-clamp-1">{s.caption.slice(0, 50)}...</h4>
                           <div className="flex gap-2">
                                {JSON.parse(s.platforms || '[]').map((p: string) => <span key={p} className="text-[8px] font-black uppercase bg-white/10 px-2 py-1 rounded-md text-slate-300">{p}</span>)}
                           </div>
                       </div>
                   </div>
                   <button onClick={() => cancelPost(s.id)} className="bg-red-500/20 text-red-500 p-4 border border-red-500/30 rounded-2xl hover:bg-red-500 hover:text-white transition-all group-hover:scale-105">
                       <XCircle size={20} />
                   </button>
                </div>
            )) : (
                <div className="py-40 text-center">
                    <Calendar size={64} className="mx-auto text-slate-300 mb-6" />
                    <p className="text-slate-400 font-black text-xs uppercase tracking-[5px]">Schedule is Empty</p>
                </div>
            )}
        </div>
    );
};

const KeyIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
);
