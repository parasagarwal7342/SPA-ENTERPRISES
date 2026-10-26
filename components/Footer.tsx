import React from 'react';
import { Globe, Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import { useProducts } from '../ProductContext';
import { Link } from '../lib/router';
import { whatsappLink } from '../lib/format';

const Footer: React.FC = () => {
  const { config } = useProducts();
  const columns = [
    { title: 'Shop', links: [['All products', '/products'], ['National Geographic', '/products?brand=National+Geographic'], ['Shraddha jewellery', '/products?brand=Shraddha'], ['Best deals', '/products?sort=discount']] },
    { title: 'Help', links: [['Track your order', '/track'], ['Warranty & returns', '/warranty'], ['Shipping & policies', '/policies'], ['Contact us', '/#contact']] },
    { title: 'Business', links: [['Bulk & corporate orders', '/bulk-order'], ['Become a dealer', '/bulk-order'], ['Printable catalogue', '/catalog'], ['Staff sign-in', '/login']] },
  ];

  return (
    <footer className="bg-white border-t border-slate-200 pt-16 pb-24 md:pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <img src="/logo.png" className="w-9 h-9 rounded-lg object-contain border border-slate-100" alt="" />
              <span className="text-xl font-bold tracking-tight">SPA <span className="text-blue-600">ENTERPRISE</span></span>
            </Link>
            <p className="text-sm text-slate-500 max-w-sm mb-5">
              Authorised distributor of <span className="font-semibold text-slate-700">National Geographic</span> and <span className="font-semibold text-slate-700">Shraddha Arts & Jewels</span> in India.
            </p>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li><a href="tel:+919312277087" className="flex items-center gap-2 hover:text-blue-600"><Phone size={15} /> +91 93122 77087</a></li>
              <li><a href={whatsappLink('Hi SPA Enterprise!', config.whatsappNumber)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-green-700"><MessageCircle size={15} /> WhatsApp us</a></li>
              <li><a href="mailto:spaenterprisesdelhi@gmail.com" className="flex items-center gap-2 hover:text-blue-600"><Mail size={15} /> spaenterprisesdelhi@gmail.com</a></li>
              <li className="flex items-start gap-2"><MapPin size={15} className="mt-0.5 flex-shrink-0" /> 53-B, Block-C, Gali No. 1, Karala, Rama Vihar, Delhi – 110081</li>
            </ul>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-slate-900 mb-4">{col.title}</h3>
              <ul className="space-y-2.5 text-sm text-slate-500">
                {col.links.map(([label, to]) => <li key={label}><Link to={to} className="hover:text-blue-600">{label}</Link></li>)}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-6 text-xs text-slate-500">
          <div className="text-center lg:text-left space-y-1">
            <p>© {new Date().getFullYear()} M/S SPA Enterprises. UDYAM-DL-06-0094890.</p>
            <p>GSTIN: 07AFAFS5850H1ZW · MSME registered micro enterprise</p>
          </div>
          <a href="https://portfolio-a6ccb.web.app/" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 px-5 py-3 bg-slate-950 rounded-xl text-white hover:bg-slate-800 transition">
            <Globe size={16} />
            <span className="flex flex-col items-start leading-tight">
              <span className="text-[9px] uppercase tracking-[2px] text-slate-400">Built & maintained for SPA Enterprises by</span>
              <span className="text-sm font-black uppercase tracking-[3px]">Paravion <span className="text-slate-400">Tech</span></span>
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
