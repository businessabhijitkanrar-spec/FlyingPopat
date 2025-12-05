
import React, { useState } from 'react';
import { Mail, MapPin, MessageCircle, Send, Loader2 } from 'lucide-react';
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
  const [submitted, setSubmitted] = useState(false);

  const SUBJECT_LIMIT = 100;
  const MESSAGE_LIMIT = 500;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await addInquiry({
        id: Date.now().toString(),
        ...formData,
        date: new Date().toISOString().split('T')[0],
        status: 'New'
      });
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error("Error sending message", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'subject' && value.length > SUBJECT_LIMIT) return;
    if (name === 'message' && value.length > MESSAGE_LIMIT) return;
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-fade-in-down">
          <h1 className="font-serif text-4xl font-bold text-stone-900 mb-4">Get in Touch</h1>
          <p className="text-stone-600 max-w-2xl mx-auto">
            Have a question about our collection or need styling advice? We're here to help you find your perfect drape.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16">
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

        {/* Contact Form */}
        <div className="bg-white rounded-xl shadow-lg border border-stone-100 overflow-hidden flex flex-col md:flex-row">
            <div className="bg-royal-900 p-8 md:w-1/3 text-white flex flex-col justify-center">
              <h3 className="font-serif text-2xl font-bold mb-4">Send us a Message</h3>
              <p className="text-royal-100 mb-6">
                Fill out the form and our team will get back to you within 24 hours.
              </p>
              <div className="mt-auto">
                 <p className="text-sm opacity-70">Looking for order status?</p>
                 <a href="/my-orders" className="text-white underline font-medium">Check My Orders</a>
              </div>
            </div>

            <div className="p-8 md:w-2/3">
              {submitted ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-10">
                   <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                     <Send size={32} />
                   </div>
                   <h3 className="text-2xl font-bold text-stone-900 mb-2">Message Sent!</h3>
                   <p className="text-stone-600">Thank you for contacting us. We will reply to your email shortly.</p>
                   <button 
                    onClick={() => setSubmitted(false)}
                    className="mt-6 text-royal-700 font-medium hover:underline"
                   >
                     Send another message
                   </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Your Name</label>
                      <input 
                        type="text" 
                        required
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-royal-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Email Address</label>
                      <input 
                        type="email" 
                        required
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-royal-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-stone-700">Subject</label>
                      <span className="text-xs text-stone-400">{formData.subject.length}/{SUBJECT_LIMIT}</span>
                    </div>
                    <input 
                      type="text" 
                      required
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      maxLength={SUBJECT_LIMIT}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-royal-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-stone-700">Message</label>
                      <span className="text-xs text-stone-400">{formData.message.length}/{MESSAGE_LIMIT}</span>
                    </div>
                    <textarea 
                      rows={4}
                      required
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      maxLength={MESSAGE_LIMIT}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-royal-500 focus:outline-none resize-none"
                    ></textarea>
                  </div>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-royal-700 text-white rounded-lg hover:bg-royal-800 transition-colors font-medium flex items-center gap-2 disabled:opacity-70"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                    Send Message
                  </button>
                </form>
              )}
            </div>
        </div>

      </div>
    </div>
  );
};
