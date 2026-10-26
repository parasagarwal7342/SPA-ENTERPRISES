import React from 'react';
import { MapPin, Phone, Mail, MessageCircle, Building } from 'lucide-react';
import { useProducts } from '../ProductContext';
import { whatsappLink } from '../lib/format';
import { InquiryForm } from './BulkQuote';

const Contact: React.FC = () => {
  const { config } = useProducts();
  return (
    <section className="bg-[#f8fafc] py-20 px-4 sm:px-6 scroll-mt-20" id="contact">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Contact us</h2>
          <p className="text-slate-500 max-w-xl mx-auto">Questions about a product, an order or a bulk requirement? We usually reply within one working day.</p>
        </div>

        <div className="grid lg:grid-cols-[1fr_1.3fr] gap-8">
          <div className="space-y-4">
            <div className="card p-6">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-3"><MapPin size={18} className="text-blue-600" /> Principal office</h3>
              <p className="text-sm text-slate-600">53-B, Block-C, Gali No. 1, Karala, Landmark: near Yuva Shakti, Rama Vihar, Delhi – 110081</p>
            </div>
            <div className="card p-6">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-3"><Building size={18} className="text-green-600" /> Branch office</h3>
              <p className="text-sm text-slate-600">Upper Ground, 104, Dream Hub Apartment-4, Najafgarh, Shyam Vihar Ph-II, New Delhi – 110043</p>
            </div>
            <div className="grid sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-3">
              <a href="tel:+919312277087" className="btn-outline"><Phone size={16} /> Call</a>
              <a href={whatsappLink('Hi SPA Enterprise!', config.whatsappNumber)} target="_blank" rel="noopener noreferrer" className="btn-outline text-green-700"><MessageCircle size={16} /> WhatsApp</a>
              <a href="mailto:spaenterprisesdelhi@gmail.com" className="btn-outline"><Mail size={16} /> Email</a>
            </div>
            <p className="text-sm text-slate-500 text-center lg:text-left">+91 93122 77087 · spaenterprisesdelhi@gmail.com</p>
          </div>
          <InquiryForm defaultType="contact" />
        </div>
      </div>
    </section>
  );
};

export default Contact;
