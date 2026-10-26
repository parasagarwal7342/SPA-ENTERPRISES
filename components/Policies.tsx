import React from 'react';
import { useProducts } from '../ProductContext';
import { Link, useDocumentMeta } from '../lib/router';
import { inr } from '../lib/format';

// Shipping, returns, privacy and terms in one place. Payment gateways (Razorpay)
// require these pages to be public before enabling live payments.
const Section: React.FC<{ id: string; title: string; children: React.ReactNode }> = ({ id, title, children }) => (
  <section id={id} style={{ scrollMarginTop: 90 }} className="card p-6 sm:p-8 space-y-3 text-sm text-slate-600 leading-relaxed">
    <h2 className="text-xl font-bold text-slate-900">{title}</h2>
    {children}
  </section>
);

const Policies: React.FC = () => {
  useDocumentMeta('Shipping, Returns, Privacy & Terms');
  const { config } = useProducts();
  const s = config.shipping;

  return (
    <div className="max-w-3xl mx-auto px-4 pt-28 pb-20 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Store policies</h1>
        <nav className="flex flex-wrap gap-3 text-sm">
          {[['shipping', 'Shipping'], ['returns', 'Returns & refunds'], ['cancellation', 'Cancellation'], ['privacy', 'Privacy'], ['terms', 'Terms']].map(([id, label]) => (
            <a key={id} href={`#${id}`} className="text-blue-600 font-semibold">{label}</a>
          ))}
        </nav>
      </div>

      <Section id="shipping" title="Shipping">
        <p>All orders ship from our Delhi warehouse.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>{s.delhi.label}: {s.delhi.fee ? inr(s.delhi.fee) : 'free delivery'}.</li>
          <li>{s.india.label}: {inr(s.india.fee)}{s.india.freeAbove ? `, free on orders above ${inr(s.india.freeAbove)}` : ''}.</li>
          <li>{s.global.label}: {inr(s.global.fee)} per order.</li>
        </ul>
        <p>Once your order ships, the courier and tracking details appear on the <Link to="/track" className="text-blue-600 font-semibold">order tracking page</Link>.</p>
      </Section>

      <Section id="returns" title="Returns & refunds">
        <p>Unused items in their original packaging can be returned within 7 days of delivery. Shraddha jewellery carries a 1-year coating warranty; see <Link to="/warranty" className="text-blue-600 font-semibold">Warranty & Support</Link> to raise a claim.</p>
        <p>To start a return, contact us with your order number. Approved refunds are sent to the original payment method; for Cash on Delivery orders we refund by bank transfer or UPI. Banks usually take 5–7 working days to show the credit.</p>
      </Section>

      <Section id="cancellation" title="Cancellation">
        <p>You can cancel an order free of charge until it has been shipped. Call or WhatsApp +91 93122 77087 with your order number. Prepaid orders are refunded in full.</p>
      </Section>

      <Section id="privacy" title="Privacy">
        <p>We collect only what we need to fulfil your order and respond to you: name, phone, email and delivery address. Card and UPI details are handled by Razorpay and never reach our servers. Passwords are stored in hashed form.</p>
        <p>We do not sell your data. It is shared only with our courier partners and payment provider to complete your order. Write to spaenterprisesdelhi@gmail.com to see or delete your data.</p>
      </Section>

      <Section id="terms" title="Terms of sale">
        <p>M/S SPA Enterprises (GSTIN 07AFAFS5850H1ZW, UDYAM-DL-06-0094890) sells products on this website. Prices are in Indian Rupees and include GST. Product images are for illustration; minor colour variations may occur.</p>
        <p>If a price is listed incorrectly, we will contact you before dispatch and you may cancel for a full refund. Disputes are subject to the jurisdiction of courts in Delhi.</p>
      </Section>
    </div>
  );
};

export default Policies;
