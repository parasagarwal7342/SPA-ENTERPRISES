import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Loader2, AlertCircle } from 'lucide-react';
import { InquiryFormData } from '../types';
import { z } from 'zod';

const inquirySchema = z.object({
  name: z.string().min(2, "Name is too short").max(100).regex(/^[a-zA-Z\s.-]+$/, "Invalid characters in name"),
  email: z.string().email("Invalid email address"),
  company: z.string().max(100).optional(),
  phone: z.string().min(10, "Phone number too short").regex(/^\+?[0-9\s-]+$/, "Invalid phone format"),
  message: z.string().min(10, "Message must be detailed enough (min 10 chars)").max(1000),
  type: z.enum(['B2B', 'Retail', 'Support']),
});

const Contact: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<InquiryFormData>({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: '',
    type: 'B2B'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    try {
      inquirySchema.parse(formData);
      setErrors({});
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.flatten().fieldErrors;
        const newErrors: Record<string, string> = {};
        Object.keys(fieldErrors).forEach(key => {
          // @ts-ignore
          if (fieldErrors[key] && fieldErrors[key].length > 0) {
            // @ts-ignore
            newErrors[key] = fieldErrors[key][0];
          }
        });
        setErrors(newErrors);
        return;
      }
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', company: '', phone: '', message: '', type: 'B2B' });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Let's Connect</h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Whether you're looking for wholesale opportunities, a custom export quote, or product support, we're here to help.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-2xl font-bold mb-8">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                    <Phone size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-lg font-bold text-gray-900">+91 9650045621</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 rounded-xl text-blue-600 flex-shrink-0">
                    <Mail size={24} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-base md:text-lg font-bold text-gray-900 break-words">
                      spaenterprisesdelhi@gmail.com
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 flex-shrink-0">
                    <MapPin size={24} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-500">Headquarters</p>
                    <p className="text-base md:text-lg font-bold text-gray-900 leading-tight">
                      C-53/B BLOCK- C RAMA VIHAR,<br />
                      ROHINI SECTOR-39, DELHI-110081
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-gray-100">
                <h4 className="font-bold mb-4">Business Hours</h4>
                <p className="text-gray-600 text-sm">Mon - Fri: 9:00 AM - 6:00 PM IST</p>
                <p className="text-gray-600 text-sm">Sat: 10:00 AM - 2:00 PM IST</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
              {submitted ? (
                <div className="text-center py-20">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Send size={40} />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">Message Sent!</h3>
                  <p className="text-gray-600 mb-8">We have received your inquiry. One of our specialists will contact you within 24 hours.</p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-amber-600 font-bold hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        required
                        type="text"
                        className={`w-full px-4 py-3 bg-gray-50 border ${errors.name ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all`}
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                      {errors.name && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input
                        required
                        type="email"
                        className={`w-full px-4 py-3 bg-gray-50 border ${errors.email ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all`}
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                      {errors.email && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.email}</p>}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company / Retailer Name</label>
                      <input
                        type="text"
                        className={`w-full px-4 py-3 bg-gray-50 border ${errors.company ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all`}
                        placeholder="Enterprise Ltd"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      />
                      {errors.company && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.company}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        className={`w-full px-4 py-3 bg-gray-50 border ${errors.phone ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all`}
                        placeholder="+91 ..."
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                      {errors.phone && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.phone}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Inquiry Type</label>
                    <select
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    >
                      <option value="B2B">B2B / Bulk Ordering</option>
                      <option value="Retail">Retail Inquiry</option>
                      <option value="Support">Warranty & Support</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea
                      required
                      rows={4}
                      className={`w-full px-4 py-3 bg-gray-50 border ${errors.message ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all resize-none`}
                      placeholder="Tell us about your requirements..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    ></textarea>
                    {errors.message && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.message}</p>}
                  </div>

                  <button
                    disabled={loading}
                    type="submit"
                    className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all disabled:opacity-70"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                    Submit Inquiry
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
