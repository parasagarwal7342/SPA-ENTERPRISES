import React, { useState } from 'react';
import { useProducts } from '../ProductContext';
import { ShoppingCart, ShieldCheck, CreditCard, ChevronRight, CheckCircle2, ArrowLeft, Zap, ArrowRight, Package, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Declare Razorpay on window for TypeScript
declare global {
  interface Window { Razorpay: any; }
}

const Checkout: React.FC = () => {
    const { cartItems, clearCart } = useProducts();
    const [step, setStep] = useState<'cart' | 'payment' | 'success'>('cart');
    const [isProcessing, setIsProcessing] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', address: '' });
    const [paymentId, setPaymentId] = useState('');

    const totalAmount = cartItems.reduce((acc, p) => acc + parseInt(p.price?.replace(/[₹,]/g, '') || '0'), 0);

    const handleRazorpayPayment = async () => {
        if (!form.name || !form.email || !form.address) {
            alert('Please fill all required fields before proceeding.');
            return;
        }
        setIsProcessing(true);

        try {
            // Step 1: Create order on backend
            const res = await fetch('http://localhost:5000/api/payment/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: totalAmount, currency: 'INR', receipt: `ord_${Date.now()}` })
            });
            const order = await res.json();

            // Step 2: If mock order, skip to success (no API key set)
            if (order.mock) {
                console.log('[Razorpay] Mock mode - skipping payment widget.');
                setPaymentId('MOCK_' + Date.now());
                clearCart();
                setStep('success');
                setIsProcessing(false);
                return;
            }

            // Step 3: Load Razorpay checkout widget
            const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder';
            const options = {
                key: RAZORPAY_KEY,
                amount: order.amount,
                currency: order.currency,
                name: 'SPA Enterprise',
                description: `Order from SPA Enterprise — ${cartItems.length} item(s)`,
                image: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/National_Geographic_logo.svg',
                order_id: order.id,
                prefill: { name: form.name, email: form.email },
                theme: { color: '#2563EB' },
                handler: async (response: any) => {
                    // Step 4: Verify payment signature on backend
                    const verifyRes = await fetch('http://localhost:5000/api/payment/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(response)
                    });
                    const result = await verifyRes.json();
                    if (result.verified) {
                        setPaymentId(result.payment_id);
                        clearCart();
                        setStep('success');
                    } else {
                        alert('Payment verification failed. Contact support.');
                    }
                    setIsProcessing(false);
                },
                modal: {
                    ondismiss: () => setIsProcessing(false)
                }
            };
            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            console.error('Payment error:', err);
            alert('Payment initialization failed. Please try again.');
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 pt-32 pb-20 px-10">
            {/* Inject Razorpay SDK */}
            <script src="https://checkout.razorpay.com/v1/checkout.js" async />

            <div className="max-w-6xl mx-auto">

                {/* Header with Steps */}
                <div className="flex items-center justify-between mb-16 border-b border-slate-100 pb-10">
                   <div>
                      <h1 className="text-4xl font-bold tracking-tight text-slate-930 mb-2">Checkout Protocol</h1>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[4px]">Verified Distribution Node DELHI-01</p>
                   </div>
                   <div className="flex items-center gap-4">
                      {[
                        { id: 'cart', label: 'Registry' },
                        { id: 'payment', label: 'Verification' },
                        { id: 'success', label: 'Complete' }
                      ].map((s, i) => (
                        <div key={s.id} className={`flex items-center gap-3 ${step === s.id ? 'text-blue-600' : 'text-slate-300'}`}>
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs border-2 ${step === s.id ? 'border-blue-600 bg-blue-50' : 'border-slate-100'}`}>{i+1}</div>
                           <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">{s.label}</span>
                           {i < 2 && <ChevronRight size={14} className="text-slate-200" />}
                        </div>
                      ))}
                   </div>
                </div>

                <AnimatePresence mode="wait">
                    {/* STEP 1: CART */}
                    {step === 'cart' && (
                        <motion.div key="cart" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="grid lg:grid-cols-3 gap-12">
                            <div className="lg:col-span-2 space-y-8">
                               {cartItems.map((item) => (
                                 <div key={item.id} className="p-8 bg-white border border-slate-100 rounded-[40px] shadow-xl shadow-slate-200/40 flex items-center justify-between relative overflow-hidden group">
                                    <div className="flex items-center gap-8">
                                       <div className="w-24 h-24 bg-slate-50 rounded-3xl p-4 border border-slate-100"><img src={item.image} className="w-full h-full object-contain mix-blend-multiply" alt="" /></div>
                                       <div>
                                          <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest mb-1">{item.brand}</p>
                                          <h4 className="text-xl font-bold text-slate-900">{item.name}</h4>
                                          <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-wide">ID: SPA-{item.id}</p>
                                       </div>
                                    </div>
                                    <div className="text-right">
                                       <p className="text-2xl font-black text-slate-930 tracking-tight">{item.price}</p>
                                       <p className="text-[10px] text-green-600 font-black uppercase tracking-widest mt-2">In Stock</p>
                                    </div>
                                 </div>
                               ))}
                               {cartItems.length === 0 && <div className="text-center py-20 text-slate-300 text-lg font-bold">Your cart is empty</div>}
                            </div>

                            <div className="bg-white p-12 rounded-[56px] border border-slate-200 shadow-2xl shadow-slate-200/50 flex flex-col h-fit sticky top-40">
                                <h3 className="text-2xl font-bold text-slate-930 mb-8 border-b border-slate-50 pb-6 uppercase tracking-tight">Order Summary</h3>
                                <div className="space-y-6 flex-grow">
                                    <div className="flex justify-between text-sm font-bold text-slate-400 uppercase tracking-widest"><span>Subtotal</span> <span>₹{totalAmount.toLocaleString()}</span></div>
                                    <div className="flex justify-between text-sm font-bold text-slate-400 uppercase tracking-widest"><span>Shipping</span> <span className="text-green-600">FREE</span></div>
                                    <div className="flex justify-between text-sm font-bold text-slate-400 uppercase tracking-widest"><span>GST</span> <span>Included</span></div>
                                </div>
                                <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-baseline mb-12">
                                    <span className="text-xs font-black uppercase tracking-[4px] text-slate-400">Total</span>
                                    <span className="text-5xl font-black text-slate-930 tracking-tighter">₹{totalAmount.toLocaleString()}</span>
                                </div>
                                <button
                                   onClick={() => setStep('payment')}
                                   disabled={cartItems.length === 0}
                                   className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-xs uppercase tracking-[5px] hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-4 group disabled:opacity-40"
                                >
                                    Proceed to Payment <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                                <div className="mt-8 flex items-center justify-center gap-3">
                                   <ShieldCheck size={18} className="text-blue-600" />
                                   <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Secured by Razorpay</p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: DETAILS + PAYMENT */}
                    {step === 'payment' && (
                        <motion.div key="payment" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="max-w-4xl mx-auto">
                            <div className="bg-white p-16 rounded-[64px] border border-slate-200 shadow-2xl relative overflow-hidden">
                                <div className="relative z-10">
                                   <h3 className="text-3xl font-black text-slate-930 mb-4 tracking-tight">Your Details</h3>
                                   <p className="text-slate-400 text-sm font-bold uppercase tracking-[3px] mb-12">Required for delivery</p>

                                   <div className="grid md:grid-cols-2 gap-10">
                                      <div className="space-y-6">
                                         <div className="flex flex-col gap-3">
                                            <label className="text-[10px] font-black tracking-[4px] uppercase text-slate-400 ml-4">Full Name *</label>
                                            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold outline-none focus:bg-white focus:border-blue-600 transition-all" placeholder="e.g. Paras Sharma" />
                                         </div>
                                         <div className="flex flex-col gap-3">
                                            <label className="text-[10px] font-black tracking-[4px] uppercase text-slate-400 ml-4">Email Address *</label>
                                            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold outline-none focus:bg-white focus:border-blue-600 transition-all" placeholder="your@email.com" />
                                         </div>
                                      </div>
                                      <div className="flex flex-col gap-3">
                                         <label className="text-[10px] font-black tracking-[4px] uppercase text-slate-400 ml-4">Delivery Address *</label>
                                         <textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-[24px] p-5 text-sm font-bold outline-none focus:bg-white focus:border-blue-600 transition-all resize-none h-full" rows={5} placeholder="Full delivery address with PIN code..." />
                                      </div>
                                   </div>

                                   <div className="mt-14 bg-slate-900 rounded-[48px] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-10">
                                      <div>
                                         <p className="text-[10px] font-black uppercase tracking-[3px] text-blue-400 mb-2">Total Payable</p>
                                         <h4 className="text-5xl font-black">₹{totalAmount.toLocaleString()}</h4>
                                         <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">All taxes included</p>
                                      </div>
                                      <button
                                         onClick={handleRazorpayPayment}
                                         disabled={isProcessing}
                                         className="px-12 py-6 bg-blue-600 text-white rounded-3xl font-black text-xs uppercase tracking-[5px] hover:bg-blue-700 shadow-2xl shadow-blue-500/20 transition-all flex items-center gap-4 disabled:opacity-60"
                                      >
                                         {isProcessing ? (
                                             <><Loader2 size={20} className="animate-spin" /> Processing...</>
                                         ) : (
                                             <><CreditCard size={20} /> Pay with Razorpay</>
                                         )}
                                      </button>
                                   </div>

                                   <div className="mt-8 flex items-center justify-center gap-6">
                                      {['UPI', 'Cards', 'Net Banking', 'Wallets', 'EMI'].map(m => (
                                          <span key={m} className="text-[9px] bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl font-black uppercase tracking-wider text-slate-400">{m}</span>
                                      ))}
                                   </div>
                                </div>
                            </div>
                            <button onClick={() => setStep('cart')} className="mt-12 text-xs font-black uppercase tracking-[4px] text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-3">
                               <ArrowLeft size={18} /> Back to Cart
                            </button>
                        </motion.div>
                    )}

                    {/* STEP 3: SUCCESS */}
                    {step === 'success' && (
                        <motion.div key="success" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-2xl mx-auto text-center py-20">
                            <div className="w-40 h-40 bg-green-50 text-green-500 rounded-[64px] flex items-center justify-center mx-auto mb-16 shadow-2xl shadow-green-100 relative overflow-hidden">
                               <CheckCircle2 size={70} className="relative z-10" />
                               <div className="absolute inset-0 bg-green-100/50 animate-ping"></div>
                            </div>
                            <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-4">Order Confirmed!</h1>
                            {paymentId && <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mb-4">Payment ID: {paymentId}</p>}
                            <p className="text-lg text-slate-500 font-medium leading-relaxed mb-16 max-w-md mx-auto">
                                Your order has been placed successfully. You'll receive a confirmation email shortly from our Delhi distribution hub.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-6 justify-center">
                               <button onClick={() => window.location.hash = '#products'} className="px-10 py-5 bg-slate-900 text-white rounded-3xl font-black text-xs uppercase tracking-[4px] hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
                                   Continue Shopping
                               </button>
                               <button onClick={() => window.location.hash = '#home'} className="px-10 py-5 bg-white border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-[4px] hover:bg-slate-50 transition-all flex items-center justify-center gap-3">
                                   <Package size={20} /> Back to Home
                               </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Checkout;
