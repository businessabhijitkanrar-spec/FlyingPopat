
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
  increment,
  getDocs,
  query
} from 'firebase/firestore';

interface ProductContextType {
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  updateProductStock: (productId: string, quantityToDeduct: number) => Promise<void>;
  restoreDefaults: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  // Define seedProducts before useEffect to ensure it's available
  const seedProducts = async () => {
    try {
      localStorage.setItem('flyingpopat_products_seeded', 'true');
      if (INITIAL_PRODUCTS.length > 0 && isFirebaseConfigured && db) {
        console.log("Seeding Database with Initial Products...");
        for (const product of INITIAL_PRODUCTS) {
          await setDoc(doc(db, "products", product.id), product);
        }
      }
    } catch (error) {
      console.error("Error seeding products:", error);
    }
  };

  useEffect(() => {
    if (isFirebaseConfigured && db) {
      // Real-time listener for Products via Firebase
      const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
        const productsList: Product[] = [];
        snapshot.forEach((doc) => {
          productsList.push(doc.data() as Product);
        });
        
        // Auto-seed only if DB is empty and we haven't tried seeding yet
        if (productsList.length === 0 && !localStorage.getItem('flyingpopat_products_seeded')) {
          seedProducts();
        } else {
          setProducts(productsList);
        }
      });
      return () => unsubscribe();
    } else {
      // Mock / Local Storage
      // Changed key to 'flyingpopat_products' to ensure old 'vastra_products' are ignored
      const savedProducts = localStorage.getItem('flyingpopat_products');
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts));
      } else {
        setProducts(INITIAL_PRODUCTS);
        localStorage.setItem('flyingpopat_products', JSON.stringify(INITIAL_PRODUCTS));
      }
    }
  }, []);

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
        localStorage.setItem('flyingpopat_products', JSON.stringify(updated));
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
        localStorage.setItem('flyingpopat_products', JSON.stringify(updated));
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
        localStorage.setItem('flyingpopat_products', JSON.stringify(updated));
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
        localStorage.setItem('flyingpopat_products', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const restoreDefaults = async () => {
    if (isFirebaseConfigured && db) {
        try {
            console.log("Restoring default products...");
            const q = query(collection(db, "products"));
            const snapshot = await getDocs(q);
            const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);

            if (INITIAL_PRODUCTS.length > 0) {
               const addPromises = INITIAL_PRODUCTS.map(product => setDoc(doc(db, "products", product.id), product));
               await Promise.all(addPromises);
            }
            console.log("Products restored to defaults.");
        } catch (error) {
            console.error("Error restoring defaults:", error);
        }
    } else {
        setProducts(INITIAL_PRODUCTS);
        localStorage.setItem('flyingpopat_products', JSON.stringify(INITIAL_PRODUCTS));
    }
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, updateProductStock, restoreDefaults }}>
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
