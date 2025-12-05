
import React from 'react';
import { Mail, MapPin, MessageCircle } from 'lucide-react';

export const ContactUs: React.FC = () => {
  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-fade-in-down">
          <h1 className="font-serif text-4xl font-bold text-stone-900 mb-4">Get in Touch</h1>
          <p className="text-stone-600 max-w-2xl mx-auto">
            Have a question about our collection or need styling advice? We're here to help you find your perfect drape.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {/* Contact Info */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className="p-3 bg-royal-50 text-royal-700 rounded-full mb-4">
                <MessageCircle size={28} />
              </div>
              <h3 className="font-bold text-stone-900 mb-1">WhatsApp</h3>
              <p className="text-sm text-stone-600">+91 9674283413</p>
              <p className="text-xs text-stone-400 mt-1">Mon-Sat, 9am - 6pm IST</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className="p-3 bg-royal-50 text-royal-700 rounded-full mb-4">
                <Mail size={28} />
              </div>
              <h3 className="font-bold text-stone-900 mb-1">Email</h3>
              <p className="text-sm text-stone-600">help.flyingpopat@gmail.com</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className="p-3 bg-royal-50 text-royal-700 rounded-full mb-4">
                <MapPin size={28} />
              </div>
              <h3 className="font-bold text-stone-900 mb-1">Store Address</h3>
              <p className="text-sm text-stone-600">
                FlyingPopat Boutique,<br />
                Hirapur, Howrah,<br />
                West Bengal - 711310
              </p>
            </div>
        </div>
      </div>
    </div>
  );
};
