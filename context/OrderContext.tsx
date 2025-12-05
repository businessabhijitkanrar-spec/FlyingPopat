import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Order, OrderStatus, RefundStatus, ReturnRequest } from '../types';
import { db, isFirebaseConfigured } from '../firebase-config';
import { collection, updateDoc, doc, onSnapshot, query, orderBy, setDoc } from 'firebase/firestore';

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Order) => Promise<void>; // Updated signature to Promise
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => void;
  updateRefundStatus: (orderId: string, status: RefundStatus) => void;
  cancelOrder: (orderId: string) => void;
  requestReturn: (orderId: string, request: ReturnRequest) => void;
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
        // We do NOT use try/catch here intentionally. 
        // We want the error to propagate to the PaymentVerification component so it can show the error to the user.
        await setDoc(doc(db, "orders", order.id), order);
    } else {
      // Mock Mode
      setOrders(prev => {
        const updated = [order, ...prev];
        localStorage.setItem('vastra_orders', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus, note?: string) => {
    const updateData: any = { status: status };
    if (note) updateData.statusNote = note;
    
    // If delivering, set the delivery date automatically for tracking return policy
    if (status === 'Delivered') {
        updateData.deliveryDate = new Date().toISOString().split('T')[0];
    }

    if (isFirebaseConfigured && db) {
      try {
         const orderRef = doc(db, "orders", orderId);
         await updateDoc(orderRef, updateData);
      } catch (e) {
         console.error("Error updating status: ", e);
      }
    } else {
      // Mock Mode
      setOrders(prev => {
        const updated = prev.map(o => o.id === orderId ? { ...o, ...updateData } : o);
        localStorage.setItem('vastra_orders', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const updateRefundStatus = async (orderId: string, status: RefundStatus) => {
    if (isFirebaseConfigured && db) {
      try {
         const orderRef = doc(db, "orders", orderId);
         await updateDoc(orderRef, { refundStatus: status });
      } catch (e) {
         console.error("Error updating refund status: ", e);
      }
    } else {
      // Mock Mode
      setOrders(prev => {
        const updated = prev.map(o => o.id === orderId ? { ...o, refundStatus: status } : o);
        localStorage.setItem('vastra_orders', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const cancelOrder = async (orderId: string) => {
    const updates = { status: 'Cancelled' as OrderStatus, refundStatus: 'Pending' as RefundStatus };
    
    if (isFirebaseConfigured && db) {
      try {
         const orderRef = doc(db, "orders", orderId);
         await updateDoc(orderRef, updates);
      } catch (e) {
         console.error("Error cancelling order: ", e);
      }
    } else {
      // Mock Mode
      setOrders(prev => {
        const updated = prev.map(o => o.id === orderId ? { ...o, ...updates } : o);
        localStorage.setItem('vastra_orders', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const requestReturn = async (orderId: string, request: ReturnRequest) => {
    const status = request.type === 'Return' ? 'Return Requested' : 'Exchange Requested';
    const updates = { 
        status: status as OrderStatus, 
        returnRequest: request 
    };

    if (isFirebaseConfigured && db) {
      try {
         const orderRef = doc(db, "orders", orderId);
         await updateDoc(orderRef, updates);
      } catch (e) {
         console.error("Error requesting return: ", e);
      }
    } else {
      // Mock Mode
      setOrders(prev => {
        const updated = prev.map(o => o.id === orderId ? { ...o, ...updates } : o);
        localStorage.setItem('vastra_orders', JSON.stringify(updated));
        return updated;
      });
    }
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrderStatus, updateRefundStatus, cancelOrder, requestReturn }}>
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