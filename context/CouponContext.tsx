
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Coupon } from '../types';
import { db, isFirebaseConfigured } from '../firebase-config';
import { collection, onSnapshot, setDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';

interface CouponContextType {
  coupons: Coupon[];
  addCoupon: (coupon: Coupon) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;
  toggleCouponStatus: (id: string, currentStatus: boolean) => Promise<void>;
  validateCoupon: (code: string) => Coupon | null;
}

const CouponContext = createContext<CouponContextType | undefined>(undefined);

// Mock Data
const INITIAL_COUPONS: Coupon[] = [
  { id: '1', code: 'WELCOME10', discountPercentage: 10, isActive: true },
  { id: '2', code: 'SAVE20', discountPercentage: 20, isActive: true },
  { id: '3', code: 'DIWALI50', discountPercentage: 50, isActive: false },
];

export const CouponProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  useEffect(() => {
    if (isFirebaseConfigured && db) {
      const unsubscribe = onSnapshot(collection(db, "coupons"), (snapshot) => {
        const list: Coupon[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as Coupon);
        });
        
        // Auto-seed if empty
        if (list.length === 0 && !localStorage.getItem('coupons_seeded')) {
           seedCoupons();
        } else {
           setCoupons(list);
        }
      });
      return () => unsubscribe();
    } else {
      const saved = localStorage.getItem('vastra_coupons');
      if (saved) {
        setCoupons(JSON.parse(saved));
      } else {
        setCoupons(INITIAL_COUPONS);
        localStorage.setItem('vastra_coupons', JSON.stringify(INITIAL_COUPONS));
      }
    }
  }, []);

  const seedCoupons = async () => {
    try {
      localStorage.setItem('coupons_seeded', 'true');
      for (const coupon of INITIAL_COUPONS) {
        await setDoc(doc(db, "coupons", coupon.id), coupon);
      }
    } catch (e) {
      console.error("Error seeding coupons", e);
    }
  };

  const addCoupon = async (coupon: Coupon) => {
    if (isFirebaseConfigured && db) {
      await setDoc(doc(db, "coupons", coupon.id), coupon);
    } else {
      setCoupons(prev => {
        const updated = [...prev, coupon];
        localStorage.setItem('vastra_coupons', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const deleteCoupon = async (id: string) => {
    if (isFirebaseConfigured && db) {
      await deleteDoc(doc(db, "coupons", id));
    } else {
      setCoupons(prev => {
        const updated = prev.filter(c => c.id !== id);
        localStorage.setItem('vastra_coupons', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const toggleCouponStatus = async (id: string, currentStatus: boolean) => {
    if (isFirebaseConfigured && db) {
      await updateDoc(doc(db, "coupons", id), { isActive: !currentStatus });
    } else {
      setCoupons(prev => {
        const updated = prev.map(c => c.id === id ? { ...c, isActive: !currentStatus } : c);
        localStorage.setItem('vastra_coupons', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const validateCoupon = (code: string): Coupon | null => {
    const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.isActive);
    return coupon || null;
  };

  return (
    <CouponContext.Provider value={{ coupons, addCoupon, deleteCoupon, toggleCouponStatus, validateCoupon }}>
      {children}
    </CouponContext.Provider>
  );
};

export const useCoupon = () => {
  const context = useContext(CouponContext);
  if (!context) {
    throw new Error('useCoupon must be used within a CouponProvider');
  }
  return context;
};
