
import { Product, ProductCategory } from './types';

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Traditional Red Jamdani',
    description: 'A handcrafted crimson red Jamdani saree with intricate traditional motifs. Lightweight and perfect for cultural events.',
    price: 12500,
    mrp: 15000,
    stock: 12,
    section: 'Saree',
    category: ProductCategory.JAMDANI,
    image: 'https://picsum.photos/id/1080/600/800',
    colors: ['Red', 'Gold'],
    fabric: 'Cotton Silk',
    occasion: ['Wedding', 'Reception'],
    tags: ['Hot Selling']
  },
  {
    id: '5',
    name: 'Ivory Handloom Cotton',
    description: 'Minimalist ivory handloom cotton saree with a simple golden border. Breathable and chic for office wear or day events.',
    price: 3200,
    stock: 25,
    section: 'Saree',
    category: ProductCategory.COTTON,
    image: 'https://picsum.photos/id/600/600/800',
    colors: ['White', 'Gold'],
    fabric: 'Cotton',
    occasion: ['Office', 'Casual']
  },
  {
    id: '6',
    name: 'Teal Blue Linen',
    description: 'Contemporary teal blue linen saree with silver motifs. A modern twist on traditional draping.',
    price: 4200,
    stock: 8,
    section: 'Saree',
    category: ProductCategory.LINEN,
    image: 'https://picsum.photos/id/700/600/800',
    colors: ['Blue', 'Silver'],
    fabric: 'Linen',
    occasion: ['Office', 'Casual']
  },
  {
    id: '7',
    name: 'Golden Tissue Saree',
    description: 'A magnificent golden tissue saree that shimmers under the lights. Perfect for evening receptions.',
    price: 8500,
    stock: 5,
    section: 'Saree',
    category: ProductCategory.TISSUE,
    image: 'https://picsum.photos/id/800/600/800',
    colors: ['Gold'],
    fabric: 'Tissue',
    occasion: ['Wedding', 'Party']
  },
  {
    id: '8',
    name: 'Bengal Taant Saree',
    description: 'Authentic Bengal Taant saree known for its crisp texture and airy feel. Ideal for humid weather.',
    price: 2700,
    stock: 0, // Mock Out of Stock
    section: 'Saree',
    category: ProductCategory.TAANT,
    image: 'https://picsum.photos/id/400/600/800',
    colors: ['White', 'Red'],
    fabric: 'Cotton',
    occasion: ['Daily Wear', 'Puja']
  },
  // KIDS WEAR MOCK DATA
  {
    id: 'k1',
    name: 'Denim Dungaree Set',
    description: 'Comfortable denim dungarees with a striped t-shirt. Playful and durable.',
    price: 1500,
    mrp: 1800,
    stock: 15,
    section: 'Kids',
    category: ProductCategory.DUNGAREES,
    image: 'https://picsum.photos/id/338/600/800',
    colors: ['Blue', 'White'],
    fabric: 'Denim',
    occasion: ['Casual'],
    tags: ['New Arrival']
  },
  {
    id: 'k2',
    name: 'Floral Summer Dress',
    description: 'Lightweight cotton dress with vibrant floral prints.',
    price: 1200,
    stock: 20,
    section: 'Kids',
    category: ProductCategory.DRESSES,
    image: 'https://picsum.photos/id/433/600/800',
    colors: ['Yellow', 'Pink'],
    fabric: 'Cotton',
    occasion: ['Party', 'Casual']
  },
  {
    id: 'k3',
    name: 'Cozy Sweat Wear Set',
    description: 'Warm and cozy sweat wear set for winter days. Includes sweatshirt and joggers.',
    price: 2200,
    stock: 10,
    section: 'Kids',
    category: ProductCategory.SWEAT_WEAR,
    image: 'https://picsum.photos/id/514/600/800',
    colors: ['Grey', 'Black'],
    fabric: 'Cotton Fleece',
    occasion: ['Winter', 'Casual']
  },
  {
    id: 'k4',
    name: 'Formal Waist Coat',
    description: 'Smart waist coat to layer over shirts for a formal look.',
    price: 1400,
    stock: 3, // Low stock
    section: 'Kids',
    category: ProductCategory.WAIST_COAT,
    image: 'https://picsum.photos/id/515/600/800',
    colors: ['Black'],
    fabric: 'Blend',
    occasion: ['Party', 'Wedding']
  }
];
