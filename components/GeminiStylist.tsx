import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Image as ImageIcon, Loader2 } from 'lucide-react';
import { createChatSession, generateStylingAdvice } from '../services/gemini';
import { ChatMessage } from '../types';
import { Chat } from '@google/genai';

export const GeminiStylist: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'model',
      text: "Namaste! I am Veda, your personal AI stylist. Are you looking for a specific saree, or do you need advice for an upcoming occasion?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initialize chat session on mount
    setChatSession(createChatSession());
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async () => {
    if ((!inputValue.trim()) || !chatSession) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const responseText = await generateStylingAdvice(chatSession, userMessage.text);
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !chatSession) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = (reader.result as string).split(',')[1];
      
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        text: "What do you think of this?",
        image: reader.result as string,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const responseText = await generateStylingAdvice(chatSession, "Analyze this image and suggest matching sarees or jewelry styles.", base64String);
        
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: responseText,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botMessage]);
      } catch (error) {
          console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsDataURL(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'} bg-gradient-to-r from-royal-700 to-royal-500 text-white flex items-center gap-2`}
      >
        <Sparkles size={24} />
        <span className="font-semibold hidden md:inline">Ask Veda</span>
      </button>

      {/* Chat Window */}
      <div className={`fixed bottom-6 right-6 z-50 w-[90vw] md:w-96 bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden transition-all duration-300 origin-bottom-right flex flex-col ${isOpen ? 'scale-100 opacity-100 h-[600px] max-h-[80vh]' : 'scale-0 opacity-0 h-0 w-0'}`}>
        
        {/* Header */}
        <div className="bg-royal-900 p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full">
              <Sparkles size={18} className="text-gold-400" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg">Veda AI</h3>
              <p className="text-xs text-royal-100">Your Personal Saree Stylist</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-3 shadow-sm text-sm ${
                msg.role === 'user' 
                  ? 'bg-royal-700 text-white rounded-br-none' 
                  : 'bg-white text-stone-800 border border-stone-200 rounded-bl-none'
              }`}>
                {msg.image && (
                  <img src={msg.image} alt="User upload" className="w-full h-32 object-cover rounded-lg mb-2" />
                )}
                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                <span className={`text-[10px] mt-1 block opacity-70 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
               <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border border-stone-200">
                 <Loader2 size={20} className="animate-spin text-royal-700" />
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-stone-200">
          <div className="flex items-end gap-2 bg-stone-50 p-2 rounded-xl border border-stone-200 focus-within:border-royal-500 focus-within:ring-1 focus-within:ring-royal-500 transition-all">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-stone-400 hover:text-royal-700 transition-colors"
              title="Upload an image"
            >
              <ImageIcon size={20} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageUpload}
            />
            
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if(e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask for advice..."
              className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-24 py-2 px-1 text-sm text-stone-900 placeholder:text-stone-400 no-scrollbar"
              rows={1}
            />
            
            <button 
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="p-2 bg-royal-700 text-white rounded-lg shadow-md hover:bg-royal-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>

      </div>
    </>
  );
};
