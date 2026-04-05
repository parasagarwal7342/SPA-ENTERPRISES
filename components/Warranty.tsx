
import React from 'react';
import { ShieldCheck, Calendar, RefreshCw, PhoneCall } from 'lucide-react';

const Warranty: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-amber-500 py-20 text-white text-center">
        <div className="max-w-7xl mx-auto px-4">
          <ShieldCheck className="mx-auto mb-6" size={64} />
          <h1 className="text-4xl font-bold mb-4">Warranty & Support</h1>
          <p className="text-amber-50 text-xl max-w-2xl mx-auto">
            We stand behind every product we distribute. Enjoy peace of mind with our 
            comprehensive global support and color coating warranties.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-16">
          {/* Main Policy */}
          <div className="space-y-12">
            <div>
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <Calendar className="text-amber-500" size={28} />
                1-Year Color Coating Warranty
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                Specifically for the Shraddha Brass collection, we provide a 1-year replacement warranty on the color coating. If your brass item experiences significant discoloration or coating failure within the first year of normal use, we will replace it.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-gray-700">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-1">✓</div>
                  <span>Covers natural oxidation or coating peeling.</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-1">✓</div>
                  <span>Available globally for all verified purchases.</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-1">✓</div>
                  <span>Seamless replacement process via our digital portal.</span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <ShieldCheck className="text-amber-500" size={28} />
                Nat Geo Luggage Support
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                National Geographic products come with standard international manufacturing warranties. As an official distributor, SPA Enterprise assists in processing claims related to wheels, handles, and shells.
              </p>
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                <h4 className="font-bold mb-2">How to Claim?</h4>
                <ol className="list-decimal list-inside text-gray-600 space-y-2">
                  <li>Keep your original invoice.</li>
                  <li>Click photographs of the defect.</li>
                  <li>Contact our support team via the form below.</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Right Column / Visuals */}
          <div className="bg-gray-900 rounded-3xl p-12 text-white">
            <h3 className="text-2xl font-bold mb-8">Quick Support</h3>
            <div className="space-y-8">
              <div className="flex gap-4">
                <RefreshCw className="text-amber-500 flex-shrink-0" size={28} />
                <div>
                  <h4 className="font-bold text-xl mb-1">Easy Exchanges</h4>
                  <p className="text-gray-400">Standard 7-day return policy for unused items in original packaging.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <PhoneCall className="text-amber-500 flex-shrink-0" size={28} />
                <div>
                  <h4 className="font-bold text-xl mb-1">B2B Priority</h4>
                  <p className="text-gray-400">Dedicated account managers for bulk buyers to handle quick logistics and warranty swaps.</p>
                </div>
              </div>
              <div className="pt-8 border-t border-gray-800">
                <p className="text-sm text-gray-500 italic mb-6">
                  * Warranty does not cover accidental damage, theft, or misuse contrary to product care instructions.
                </p>
                <a href="#contact" className="block w-full text-center bg-white text-gray-900 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all">
                  Initiate Claim
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Warranty;
