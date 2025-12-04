
import React from 'react';
import { ArrowLeft, Shield, Lock, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
            <Link to="/" className="text-stone-500 hover:text-royal-700 flex items-center gap-2 transition-colors mb-4">
                <ArrowLeft size={18} /> Back to Home
            </Link>
            <h1 className="font-serif text-4xl font-bold text-stone-900">Privacy Policy</h1>
            <p className="text-stone-600 mt-2">Last updated: March 2024</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-8 space-y-8 text-stone-700 leading-relaxed">
            
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <Shield className="text-royal-700" size={24} />
                    <h2 className="text-2xl font-serif font-bold text-stone-900">1. Information We Collect</h2>
                </div>
                <p className="mb-4">
                    At FlyingPopat, we collect information to provide you with a better shopping experience. This includes:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Personal Information:</strong> Name, email address, phone number, and shipping address when you make a purchase or register.</li>
                    <li><strong>Payment Information:</strong> We do not store your credit card details. All payment transactions are processed through secure gateways like Razorpay.</li>
                    <li><strong>Usage Data:</strong> Information about how you interact with our website, including device type and browser information.</li>
                </ul>
            </section>

            <section>
                <div className="flex items-center gap-2 mb-4">
                    <Eye className="text-royal-700" size={24} />
                    <h2 className="text-2xl font-serif font-bold text-stone-900">2. How We Use Your Information</h2>
                </div>
                <p className="mb-4">We use the collected information for the following purposes:</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li>To process and fulfill your orders.</li>
                    <li>To communicate with you regarding order updates, offers, and support.</li>
                    <li>To improve our website functionality and customer service.</li>
                    <li>To prevent fraud and ensure the security of our platform.</li>
                </ul>
            </section>

            <section>
                <div className="flex items-center gap-2 mb-4">
                    <Lock className="text-royal-700" size={24} />
                    <h2 className="text-2xl font-serif font-bold text-stone-900">3. Data Security</h2>
                </div>
                <p>
                    We implement industry-standard security measures to protect your personal information. Your data is encrypted during transmission using SSL technology. We do not sell or trade your personal identifiable information to third parties.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-stone-900 mb-3">4. Cookies</h2>
                <p>
                    We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. You can choose to disable cookies through your browser settings, but this may affect certain site functionalities.
                </p>
            </section>

            <section className="border-t border-stone-100 pt-6">
                <p className="text-sm text-stone-500">
                    If you have any questions about this Privacy Policy, please contact us at <a href="mailto:help.flyingpopat@gmail.com" className="text-royal-700 hover:underline">help.flyingpopat@gmail.com</a>.
                </p>
            </section>

        </div>
      </div>
    </div>
  );
};
