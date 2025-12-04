
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Inquiry } from '../types';
import { db, isFirebaseConfigured } from '../firebase-config';
import { collection, addDoc, onSnapshot, orderBy, query, updateDoc, doc, deleteDoc, setDoc } from 'firebase/firestore';

interface InquiryContextType {
  inquiries: Inquiry[];
  addInquiry: (inquiry: Inquiry) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  deleteInquiry: (id: string) => Promise<void>;
}

const InquiryContext = createContext<InquiryContextType | undefined>(undefined);

export const InquiryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  // Initialize / Listen
  useEffect(() => {
    if (isFirebaseConfigured && db) {
      const q = query(collection(db, "inquiries"), orderBy("date", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list: Inquiry[] = [];
        snapshot.forEach((doc) => {
          list.push({ ...doc.data(), id: doc.id } as Inquiry);
        });
        setInquiries(list);
      });
      return () => unsubscribe();
    } else {
      const saved = localStorage.getItem('vastra_inquiries');
      if (saved) {
        setInquiries(JSON.parse(saved));
      }
    }
  }, []);

  const addInquiry = async (inquiry: Inquiry) => {
    if (isFirebaseConfigured && db) {
      try {
        // We let Firestore generate ID or use the one provided if we want specific ID logic
        // Using setDoc with specific ID for consistency with other contexts, or addDoc for auto ID
        await setDoc(doc(db, "inquiries", inquiry.id), inquiry);
      } catch (error) {
        console.error("Error adding inquiry:", error);
      }
    } else {
      setInquiries(prev => {
        const updated = [inquiry, ...prev];
        localStorage.setItem('vastra_inquiries', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const markAsRead = async (id: string) => {
    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, "inquiries", id), { status: 'Read' });
      } catch (error) {
        console.error("Error updating inquiry:", error);
      }
    } else {
      setInquiries(prev => {
        const updated = prev.map(item => item.id === id ? { ...item, status: 'Read' as const } : item);
        localStorage.setItem('vastra_inquiries', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const deleteInquiry = async (id: string) => {
    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, "inquiries", id));
      } catch (error) {
        console.error("Error deleting inquiry:", error);
      }
    } else {
      setInquiries(prev => {
        const updated = prev.filter(item => item.id !== id);
        localStorage.setItem('vastra_inquiries', JSON.stringify(updated));
        return updated;
      });
    }
  };

  return (
    <InquiryContext.Provider value={{ inquiries, addInquiry, markAsRead, deleteInquiry }}>
      {children}
    </InquiryContext.Provider>
  );
};

export const useInquiry = () => {
  const context = useContext(InquiryContext);
  if (!context) {
    throw new Error('useInquiry must be used within an InquiryProvider');
  }
  return context;
};
