
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product } from '../types';
import { PRODUCTS as INITIAL_PRODUCTS } from '../constants';
import { db, isFirebaseConfigured } from '../firebase-config';
import { 
  collection, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  setDoc,
  updateDoc,
  increment
} from 'firebase/firestore';

interface ProductContextType {
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  updateProductStock: (productId: string, quantityToDeduct: number) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (isFirebaseConfigured && db) {
      // Real-time listener for Products via Firebase
      const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
        const productsList: Product[] = [];
        snapshot.forEach((doc) => {
          productsList.push(doc.data() as Product);
        });
        
        if (productsList.length === 0 && !localStorage.getItem('products_seeded')) {
          seedProducts();
        } else {
          setProducts(productsList);
        }
      });
      return () => unsubscribe();
    } else {
      // Mock / Local Storage
      const savedProducts = localStorage.getItem('vastra_products');
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts));
      } else {
        setProducts(INITIAL_PRODUCTS);
        localStorage.setItem('vastra_products', JSON.stringify(INITIAL_PRODUCTS));
      }
    }
  }, []);

  const seedProducts = async () => {
    try {
      localStorage.setItem('products_seeded', 'true');
      console.log("Seeding Database with Initial Products...");
      for (const product of INITIAL_PRODUCTS) {
        await setDoc(doc(db, "products", product.id), product);
      }
    } catch (error) {
      console.error("Error seeding products:", error);
    }
  };

  const addProduct = async (product: Product) => {
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, "products", product.id), product);
      } catch (error) {
        console.error("Error adding product:", error);
      }
    } else {
      // Local Mock
      setProducts(prev => {
        const updated = [...prev, product];
        localStorage.setItem('vastra_products', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const updateProduct = async (product: Product) => {
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, "products", product.id), product);
      } catch (error) {
        console.error("Error updating product:", error);
      }
    } else {
      // Local Mock
      setProducts(prev => {
        const updated = prev.map(p => p.id === product.id ? product : p);
        localStorage.setItem('vastra_products', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const deleteProduct = async (productId: string) => {
    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, "products", productId));
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    } else {
      // Local Mock
      setProducts(prev => {
        const updated = prev.filter(p => p.id !== productId);
        localStorage.setItem('vastra_products', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const updateProductStock = async (productId: string, quantityToDeduct: number) => {
    if (isFirebaseConfigured && db) {
      try {
        const productRef = doc(db, "products", productId);
        await updateDoc(productRef, {
          stock: increment(-quantityToDeduct)
        });
      } catch (error) {
        console.error("Error updating stock:", error);
      }
    } else {
      // Local Mock
      setProducts(prev => {
        const updated = prev.map(p => {
          if (p.id === productId) {
            return { ...p, stock: Math.max(0, p.stock - quantityToDeduct) };
          }
          return p;
        });
        localStorage.setItem('vastra_products', JSON.stringify(updated));
        return updated;
      });
    }
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, updateProductStock }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
