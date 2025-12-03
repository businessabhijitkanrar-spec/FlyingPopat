import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Order, OrderStatus } from '../types';
import { db, isFirebaseConfigured } from '../firebase-config';
import { collection, updateDoc, doc, onSnapshot, query, orderBy, setDoc } from 'firebase/firestore';

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  cancelOrder: (orderId: string) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);

  // Real-time listener
  useEffect(() => {
    if (isFirebaseConfigured && db) {
      const q = query(collection(db, "orders"), orderBy("date", "desc"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const ordersList: Order[] = [];
        querySnapshot.forEach((doc) => {
          ordersList.push(doc.data() as Order);
        });
        setOrders(ordersList);
      }, (error) => {
         console.error("Error fetching orders:", error);
      });
      return () => unsubscribe();
    } else {
      // Mock Mode
      const savedOrders = localStorage.getItem('vastra_orders');
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      }
    }
  }, []);

  const addOrder = async (order: Order) => {
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, "orders", order.id), order);
      } catch (e) {
        console.error("Error adding order: ", e);
      }
    } else {
      // Mock Mode
      setOrders(prev => {
        const updated = [order, ...prev];
        localStorage.setItem('vastra_orders', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    if (isFirebaseConfigured && db) {
      try {
         const orderRef = doc(db, "orders", orderId);
         await updateDoc(orderRef, { status: status });
      } catch (e) {
         console.error("Error updating status: ", e);
      }
    } else {
      // Mock Mode
      setOrders(prev => {
        const updated = prev.map(o => o.id === orderId ? { ...o, status } : o);
        localStorage.setItem('vastra_orders', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const cancelOrder = async (orderId: string) => {
    if (isFirebaseConfigured && db) {
      try {
         const orderRef = doc(db, "orders", orderId);
         await updateDoc(orderRef, { status: 'Cancelled' });
      } catch (e) {
         console.error("Error cancelling order: ", e);
      }
    } else {
      // Mock Mode
      setOrders(prev => {
        const updated = prev.map(o => o.id === orderId ? { ...o, status: 'Cancelled' as OrderStatus } : o);
        localStorage.setItem('vastra_orders', JSON.stringify(updated));
        return updated;
      });
    }
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrderStatus, cancelOrder }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};