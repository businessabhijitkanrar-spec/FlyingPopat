import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react';
import { useInquiry } from '../context/InquiryContext';

export const ContactUs: React.FC = () => {
  const { addInquiry } = useInquiry();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await addInquiry({
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        date: new Date().toISOString().split('T')[0],
        status: 'New'
      });
      
      // Artificial delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-fade-in-down">
          <h1 className="font-serif text-4xl font-bold text-stone-900 mb-4">Get in Touch</h1>
          <p className="text-stone-600 max-w-2xl mx-auto">
            Have a question about our collection or need styling advice? We're here to help you find your perfect drape.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100 flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="p-3 bg-royal-50 text-royal-700 rounded-lg">
                <Phone size={24} />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 mb-1">Phone</h3>
                <p className="text-sm text-stone-600">+91 98765 43210</p>
                <p className="text-xs text-stone-400 mt-1">Mon-Sat, 9am - 6pm IST</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100 flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="p-3 bg-royal-50 text-royal-700 rounded-lg">
                <Mail size={24} />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 mb-1">Email</h3>
                <p className="text-sm text-stone-600">hello@flyingpopat.com</p>
                <p className="text-sm text-stone-600">support@flyingpopat.com</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100 flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="p-3 bg-royal-50 text-royal-700 rounded-lg">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 mb-1">Store Address</h3>
                <p className="text-sm text-stone-600">
                  FlyingPopat Boutique,<br />
                  123 Silk Road, Indiranagar,<br />
                  Bangalore, Karnataka - 560038
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-stone-100 p-8">
              {isSuccess ? (
                <div className="text-center py-12 animate-fade-in-down">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-stone-900 mb-2">Message Sent!</h3>
                  <p className="text-stone-600">Thank you for reaching out. Our team will get back to you shortly.</p>
                  <button 
                    onClick={() => setIsSuccess(false)}
                    className="mt-6 text-royal-700 font-medium hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-1">Your Name</label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full border border-stone-300 rounded-lg px-4 py-2 focus:ring-1 focus:ring-royal-500 focus:outline-none"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full border border-stone-300 rounded-lg px-4 py-2 focus:ring-1 focus:ring-royal-500 focus:outline-none"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-stone-700 mb-1">Subject</label>
                    <input
                      type="text"
                      id="subject"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className="w-full border border-stone-300 rounded-lg px-4 py-2 focus:ring-1 focus:ring-royal-500 focus:outline-none"
                      placeholder="Order Inquiry / Styling Advice"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-stone-700 mb-1">Message</label>
                    <textarea
                      id="message"
                      rows={6}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="w-full border border-stone-300 rounded-lg px-4 py-2 focus:ring-1 focus:ring-royal-500 focus:outline-none resize-none"
                      placeholder="How can we help you today?"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-royal-700 text-white py-3 rounded-lg font-medium hover:bg-royal-800 transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" size={20} /> Sending...
                      </>
                    ) : (
                      <>
                        Send Message <Send size={20} />
                      </>
                    )}
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