
import React from 'react';
import { Target, Eye, Globe2, History } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="py-24 bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8">
              Decades of Excellence in Distribution.
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              SPA Enterprise stands as a pillar of reliability in the premium product distribution sector. 
              With a focus on curated brand partnerships, we bring world-class quality to local and global markets.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-amber-500 mb-2">15+</div>
            <p className="text-gray-600 font-medium">Years Experience</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-amber-500 mb-2">500+</div>
            <p className="text-gray-600 font-medium">Retail Partners</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-amber-500 mb-2">25k+</div>
            <p className="text-gray-600 font-medium">Products Shipped</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-amber-500 mb-2">2</div>
            <p className="text-gray-600 font-medium">Global Regions</p>
          </div>
        </div>
      </section>

      {/* Mission Vision */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-20">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Target className="text-amber-500" size={32} />
                <h2 className="text-3xl font-bold">Our Mission</h2>
              </div>
              <p className="text-gray-400 text-lg leading-relaxed">
                To bridge the gap between world-renowned brands and discerning consumers by providing efficient distribution, authentic products, and unparalleled B2B support. We aim to elevate the standard of travel gear and traditional jewelry across the globe.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Eye className="text-amber-500" size={32} />
                <h2 className="text-3xl font-bold">Our Vision</h2>
              </div>
              <p className="text-gray-400 text-lg leading-relaxed">
                To be the primary destination for explorers and jewelry enthusiasts who value quality, heritage, and durability. We envision a future where SPA Enterprise is synonymous with trust and premium lifestyle solutions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline/History */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Our Journey</h2>
            <p className="text-gray-600">The milestones that shaped SPA Enterprise.</p>
          </div>
          
          <div className="space-y-12">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="md:w-1/2">
                <img src="https://picsum.photos/id/1/800/400" className="rounded-2xl shadow-lg" alt="History" />
              </div>
              <div className="md:w-1/2">
                <h3 className="text-2xl font-bold mb-4">The Foundation (2010)</h3>
                <p className="text-gray-600 leading-relaxed">
                  Founded with a vision to provide authentic brass jewelry to local markets. Starting with a small team of artisans and a passion for traditional Indian craftsmanship.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row-reverse gap-8 items-center">
              <div className="md:w-1/2">
                <img src="https://picsum.photos/id/2/800/400" className="rounded-2xl shadow-lg" alt="Expansion" />
              </div>
              <div className="md:w-1/2">
                <h3 className="text-2xl font-bold mb-4">The National Geographic Partnership (2018)</h3>
                <p className="text-gray-600 leading-relaxed">
                  Secured official distribution rights for National Geographic Luggage. This expanded our portfolio into high-performance travel gear and attracted global B2B partners.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
