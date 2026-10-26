import React, { useEffect, useRef, useState } from 'react';
import { MessageSquare, Send, X, Bot } from 'lucide-react';
import { api } from '../lib/api';
import { Link } from '../lib/router';

interface Msg { role: 'user' | 'assistant'; content: string }

const GREETING: Msg = { role: 'assistant', content: 'Namaste! I am Shraddha AI. Ask me about bags, suitcases or jewellery – prices, sizes, gifting ideas or delivery.' };

// Turns product codes like [N20902.06] into links to the product page.
const renderText = (text: string) =>
  text.split(/(\[[A-Za-z0-9._-]+\])/g).map((part, i) => {
    const m = part.match(/^\[([A-Za-z0-9._-]+)\]$/);
    return m ? <Link key={i} to={`/products/${encodeURIComponent(m[1])}`} className="text-blue-600 font-semibold underline">{m[1]}</Link> : <React.Fragment key={i}>{part}</React.Fragment>;
  });

const AIAdvisor: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, isTyping]);

  const send = async () => {
    const text = input.trim();
    if (!text || isTyping) return;
    const next = [...messages, { role: 'user' as const, content: text }];
    setMessages(next);
    setInput('');
    setIsTyping(true);
    try {
      // The greeting is UI-only; the conversation sent to the server starts with the visitor.
      const history = next.slice(next.findIndex((m) => m.role === 'user')).slice(-12);
      const res = await api<{ reply: string }>('/ai/chat', { body: { messages: history } });
      setMessages((m) => [...m, { role: 'assistant', content: res.reply }]);
    } catch (e) {
      setMessages((m) => [...m, { role: 'assistant', content: (e as Error).message }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {isOpen && (
        <div className="mb-3 w-[min(92vw,380px)] h-[min(70vh,540px)] card shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white">
            <div className="flex items-center gap-2"><Bot size={20} /><div><p className="text-sm font-semibold leading-none">Shraddha AI</p><p className="text-[11px] text-slate-400 mt-1">Shopping assistant</p></div></div>
            <button onClick={() => setIsOpen(false)} aria-label="Close chat" className="p-1 hover:bg-white/10 rounded"><X size={18} /></button>
          </div>
          <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-3 bg-slate-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm whitespace-pre-line ${m.role === 'user' ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm'}`}>
                  {m.role === 'assistant' ? renderText(m.content) : m.content}
                </div>
              </div>
            ))}
            {isTyping && <div className="text-xs text-slate-400 px-1">Typing…</div>}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); send(); }} className="p-3 border-t border-slate-200 flex gap-2 bg-white">
            <input value={input} onChange={(e) => setInput(e.target.value)} maxLength={1500} placeholder="Type your question…" className="input py-2.5" aria-label="Message" />
            <button type="submit" disabled={!input.trim() || isTyping} className="btn-primary px-3.5 py-2.5" aria-label="Send"><Send size={18} /></button>
          </form>
        </div>
      )}
      <button onClick={() => setIsOpen(!isOpen)} aria-label={isOpen ? 'Close assistant' : 'Open shopping assistant'} className="ml-auto w-14 h-14 rounded-full bg-slate-900 text-white shadow-xl flex items-center justify-center hover:scale-105 transition">
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
    </div>
  );
};

export default AIAdvisor;
