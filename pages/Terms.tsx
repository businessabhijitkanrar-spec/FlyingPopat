
import React from 'react';
import { ArrowLeft, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
            <Link to="/" className="text-stone-500 hover:text-royal-700 flex items-center gap-2 transition-colors mb-4">
                <ArrowLeft size={18} /> Back to Home
            </Link>
            <h1 className="font-serif text-4xl font-bold text-stone-900">Terms and Conditions</h1>
            <p className="text-stone-600 mt-2">Last updated: March 2024</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-8 space-y-8 text-stone-700 leading-relaxed">
            
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <FileText className="text-royal-700" size={24} />
                    <h2 className="text-2xl font-serif font-bold text-stone-900">1. Introduction</h2>
                </div>
                <p>
                    Welcome to FlyingPopat. By accessing or using our website, you agree to be bound by these Terms and Conditions. Please read them carefully before making a purchase.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-stone-900 mb-3">2. Products and Services</h2>
                <p className="mb-2">
                    We make every effort to display the colors, features, specifications, and details of the products available on the Site as accurately as possible. However, we do not guarantee that the colors, features, specifications, and details of the products will be accurate, complete, reliable, current, or free of other errors.
                </p>
                <p>
                    All products are subject to availability, and we cannot guarantee that items will be in stock. We reserve the right to discontinue any products at any time for any reason.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-stone-900 mb-3">3. Pricing and Payments</h2>
                <p>
                    All prices are listed in Indian Rupees (INR). We reserve the right to change prices at any time. You agree to provide current, complete, and accurate purchase and account information for all purchases made via the Site.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-stone-900 mb-3">4. Intellectual Property</h2>
                <p>
                    Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the “Content”) are owned or controlled by us and are protected by copyright and trademark laws.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-stone-900 mb-3">5. Limitation of Liability</h2>
                <p>
                    To the fullest extent permitted by law, FlyingPopat shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your access to or use of, or inability to access or use, the services or any content on the services.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-stone-900 mb-3">6. Governing Law</h2>
                <p>
                    These Terms shall be governed by and defined following the laws of India. FlyingPopat and yourself irrevocably consent that the courts of Bangalore, Karnataka shall have exclusive jurisdiction to resolve any dispute which may arise in connection with these terms.
                </p>
            </section>

            <section className="border-t border-stone-100 pt-6">
                <p className="text-sm text-stone-500">
                    Questions about the Terms of Service should be sent to us at <a href="mailto:help.flyingpopat@gmail.com" className="text-royal-700 hover:underline">help.flyingpopat@gmail.com</a>.
                </p>
            </section>

        </div>
      </div>
    </div>
  );
};
