import React from 'react';
import { ArrowLeft, Truck, Globe, Clock, PackageCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ShippingPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
            <Link to="/" className="text-stone-500 hover:text-royal-700 flex items-center gap-2 transition-colors mb-4">
                <ArrowLeft size={18} /> Back to Home
            </Link>
            <h1 className="font-serif text-4xl font-bold text-stone-900">Shipping Policy</h1>
            <p className="text-stone-600 mt-2">Information regarding delivery times and costs</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-8 space-y-8 text-stone-700 leading-relaxed">
            
            <section className="grid md:grid-cols-2 gap-6">
                <div className="bg-royal-50 p-6 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                        <Truck className="text-royal-700" size={24} />
                        <h3 className="font-bold text-stone-900 text-lg">Domestic Shipping</h3>
                    </div>
                    <p className="text-sm">
                        We offer <strong>FREE shipping</strong> on all orders across India. 
                    </p>
                </div>
                <div className="bg-stone-50 p-6 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                        <Globe className="text-stone-700" size={24} />
                        <h3 className="font-bold text-stone-900 text-lg">International Shipping</h3>
                    </div>
                    <p className="text-sm">
                        International shipping charges are calculated at checkout based on the destination and weight of the package.
                    </p>
                </div>
            </section>

            <section>
                <div className="flex items-center gap-2 mb-4">
                    <Clock className="text-royal-700" size={24} />
                    <h2 className="text-2xl font-serif font-bold text-stone-900">Order Processing</h2>
                </div>
                <p>
                    All orders are processed within <strong>1-2 business days</strong> (excluding weekends and holidays) after receiving your order confirmation email. You will receive another notification when your order has shipped.
                </p>
            </section>

            <section>
                <div className="flex items-center gap-2 mb-4">
                    <PackageCheck className="text-royal-700" size={24} />
                    <h2 className="text-2xl font-serif font-bold text-stone-900">Delivery Timelines</h2>
                </div>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Metro Cities:</strong> 3-5 business days</li>
                    <li><strong>Rest of India:</strong> 5-7 business days</li>
                    <li><strong>International:</strong> 10-15 business days</li>
                </ul>
                <p className="mt-4 text-sm text-stone-500 italic">
                    Note: Delivery times may be affected during holidays or extreme weather conditions.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-stone-900 mb-3">Tracking Your Order</h2>
                <p>
                    Once your order has shipped, you will receive an email notification from us which will include a tracking number you can use to check its status. Please allow 24 hours for the tracking information to become available.
                </p>
            </section>

             <section className="border-t border-stone-100 pt-6">
                <p className="text-sm text-stone-500">
                    If you haven’t received your order within 10 days of receiving your shipping confirmation email, please contact us at <a href="mailto:support@flyingpopat.com" className="text-royal-700 hover:underline">support@flyingpopat.com</a> with your name and order number, and we will look into it for you.
                </p>
            </section>

        </div>
      </div>
    </div>
  );
};