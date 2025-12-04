import React from 'react';
import { ArrowLeft, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ReturnPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
            <Link to="/" className="text-stone-500 hover:text-royal-700 flex items-center gap-2 transition-colors mb-4">
                <ArrowLeft size={18} /> Back to Home
            </Link>
            <h1 className="font-serif text-4xl font-bold text-stone-900">Return & Exchange Policy</h1>
            <p className="text-stone-600 mt-2">At FlyingPopat, we want you to love your saree. Here is how our return process works.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-8 space-y-8">
            
            {/* Key Policy */}
            <div className="bg-royal-50 border border-royal-100 rounded-lg p-6">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-royal-100 rounded-full text-royal-700">
                        <Clock size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-stone-900 mb-2">3-Day Return Window</h3>
                        <p className="text-stone-700 leading-relaxed">
                            You can initiate a return or exchange request only within <span className="font-bold">3 days</span> from the date of delivery. 
                            Requests made after this period will not be accepted.
                        </p>
                    </div>
                </div>
            </div>

            {/* How to Initiate */}
            <div>
                <h3 className="text-xl font-serif font-bold text-stone-900 mb-4">How to Initiate a Return</h3>
                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="mt-1 min-w-[24px] text-stone-400">1.</div>
                        <p className="text-stone-600">Go to the <b>My Orders</b> section in your profile.</p>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="mt-1 min-w-[24px] text-stone-400">2.</div>
                        <p className="text-stone-600">Select the order you wish to return. Ensure the status is marked as 'Delivered'.</p>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="mt-1 min-w-[24px] text-stone-400">3.</div>
                        <p className="text-stone-600">Click on the <b>Return / Exchange</b> button.</p>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="mt-1 min-w-[24px] text-stone-400">4.</div>
                        <p className="text-stone-600">Fill out the form, select your reason, and <b>upload a clear image</b> of the product.</p>
                    </div>
                </div>
            </div>

            {/* Guidelines */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-stone-50 p-6 rounded-lg">
                    <h4 className="font-bold text-stone-900 mb-3 flex items-center gap-2">
                        <CheckCircle size={18} className="text-green-600" /> Accepted
                    </h4>
                    <ul className="text-sm text-stone-600 space-y-2 list-disc pl-4">
                        <li>Defective or damaged products.</li>
                        <li>Wrong item received.</li>
                        <li>Product must be unused and unwashed.</li>
                        <li>Original tags and packaging must be intact.</li>
                    </ul>
                </div>
                <div className="bg-stone-50 p-6 rounded-lg">
                    <h4 className="font-bold text-stone-900 mb-3 flex items-center gap-2">
                        <AlertCircle size={18} className="text-red-500" /> Not Accepted
                    </h4>
                    <ul className="text-sm text-stone-600 space-y-2 list-disc pl-4">
                        <li>Returns requested after 3 days of delivery.</li>
                        <li>Used, washed, or altered products.</li>
                        <li>Missing original tags or blouse piece.</li>
                        <li>Minor color variations due to screen resolution.</li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-stone-100 pt-6">
                <p className="text-sm text-stone-500">
                    For further assistance, please contact us at <a href="mailto:support@flyingpopat.com" className="text-royal-700 hover:underline">support@flyingpopat.com</a>.
                </p>
            </div>

        </div>
      </div>
    </div>
  );
};
