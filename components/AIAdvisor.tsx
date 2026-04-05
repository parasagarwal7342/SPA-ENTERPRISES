import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { useProducts } from '../ProductContext';
import { MessageSquare, Send, X, Bot, Sparkles, Zap, Shield, Globe, Headset } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AIAdvisor: React.FC = () => {
  const { products } = useProducts();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: 'Welcome! I am Aditi AI, your professional SPA Enterprise concierge. How can I assist you with our authorized collections today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsTyping(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
      const inventoryContext = products.map(p => `${p.name} (${p.brand}) at ${p.price}.`).join('; ');

      if (!apiKey) {
        // Professional Mock Fallback if API Key is not set
        setTimeout(() => {
          let fallbackResponse = `I see you are interested in our current authorized inventory. We currently feature: ${products.map(p => p.name).join(', ')}. Please refer to our product catalog for full details.`;
          if (userMessage.toLowerCase().includes('price') || userMessage.toLowerCase().includes('cost')) {
             fallbackResponse = `Our premium assets are priced as follows: ${inventoryContext} Let me know if you need to add any to your cart.`;
          }
           setMessages(prev => [...prev, { role: 'bot', text: fallbackResponse }]);
           setIsTyping(false);
        }, 1500);
        return;
      }
      
      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMessage,
        config: {
          systemInstruction: `You are Aditi AI, the professional digital concierge for SPA Enterprise. 
          CURRENT AUTHORIZED INVENTORY: ${inventoryContext}.
          Location: Rohini Sector-39, Delhi.
          Direct Distributor for National Geographic and Shraddha.
          Tone: Elite, Informed, Professional.
          Role: Guide users to choice assets from our current registry. If they ask about a product, refer to its price and features.`,
        },
      });

      const botResponse = response.text || "I am currently adjusting my knowledge base. Please reach out to our Delhi HQ for immediate support.";
      setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
    } catch (error: any) {
      console.error("AI Error:", error);
      // Fallback Strategy
      setTimeout(() => {
        let fallbackResponse = `I see you are interested in our current authorized inventory. We currently feature: ${products.map(p => p.name).join(', ')}. Please refer to our product catalog for full details.`;
        if (userMessage.toLowerCase().includes('price') || userMessage.toLowerCase().includes('cost')) {
           fallbackResponse = `Our premium assets are priced as follows: ${products.map(p => `${p.name} at ${p.price}`).join(', ')} Let me know if you need to add any to your cart.`;
        }
        setMessages(prev => [...prev, { role: 'bot', text: fallbackResponse }]);
        setIsTyping(false);
      }, 500);
      return; 
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-10 right-10 z-[100] p-1 rounded-full group"
          >
            <div className="absolute inset-0 bg-blue-100 rounded-full blur-xl opacity-50 group-hover:opacity-100 transition-opacity animate-pulse"></div>
            <div className="relative bg-blue-600 text-white p-5 rounded-full shadow-2xl flex items-center justify-center transform group-hover:-translate-y-2 transition-transform duration-500">
              <Headset size={28} />
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-10 right-10 z-[100] w-[420px] h-[650px] bg-white rounded-[40px] border border-slate-200 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Professional Chat Header */}
            <div className="p-8 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-xl border border-slate-100 relative">
                     <Bot size={24} />
                     <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-4 border-white shadow-sm"></span>
                  </div>
                  <div>
                     <h4 className="font-bold text-sm text-slate-930 tracking-tight">Aditi AI Assistant</h4>
                     <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none flex items-center gap-1.5"><Globe size={10} /> Syncing Delhi HQ</span>
                     </div>
                  </div>
               </div>
               <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                  <X size={24} />
               </button>
            </div>

            {/* Chat Body */}
            <div ref={scrollRef} className="flex-grow overflow-y-auto p-8 space-y-8 scrollbar-hide bg-white">
               {messages.map((m, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={idx} 
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                     <div className={`max-w-[85%] p-5 rounded-3xl text-[14px] leading-relaxed font-medium ${
                       m.role === 'user'
                       ? 'bg-blue-600 text-white shadow-xl shadow-blue-50'
                       : 'bg-slate-50 text-slate-700 border border-slate-100'
                     }`}>
                        <p>{m.text}</p>
                     </div>
                  </motion.div>
               ))}
               {isTyping && (
                  <div className="flex justify-start">
                     <div className="bg-slate-50 border border-slate-100 p-4 rounded-3xl flex gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce delay-150"></span>
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce delay-300"></span>
                     </div>
                  </div>
               )}
            </div>

            {/* Input Node */}
            <div className="p-8 bg-slate-50 border-t border-slate-100 relative">
               <div className="relative group">
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type your message..." 
                    className="w-full pl-6 pr-14 py-5 bg-white border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-900 outline-none focus:border-blue-600 focus:shadow-xl focus:shadow-blue-50 transition-all shadow-sm" 
                  />
                  <button 
                    onClick={handleSend}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 bg-slate-900 text-white rounded-xl hover:scale-105 transition-all shadow-lg"
                  >
                     <Send size={18} />
                  </button>
               </div>
               <div className="mt-4 flex items-center justify-center gap-2 px-2">
                  <Sparkles size={12} className="text-amber-500" />
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Smart Registry Awareness Integrated</span>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAdvisor;
