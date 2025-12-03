import { Product, SareeCategory } from './types';

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Royal Crimson Banarasi',
    description: 'A handcrafted crimson red Banarasi silk saree with intricate golden zari work featuring traditional floral motifs. Perfect for weddings and grand celebrations.',
    price: 12500,
    category: SareeCategory.BANARASI,
    image: 'https://picsum.photos/id/1080/600/800',
    colors: ['Red', 'Gold'],
    fabric: 'Pure Silk',
    occasion: ['Wedding', 'Reception']
  },
  {
    id: '2',
    name: 'Midnight Blue Kanjeevaram',
    description: 'An exquisite midnight blue Kanjeevaram saree with a contrasting pink border and temple border design. Woven with pure mulberry silk.',
    price: 18900,
    category: SareeCategory.KANJEEVARAM,
    image: 'https://picsum.photos/id/106/600/800',
    colors: ['Blue', 'Pink'],
    fabric: 'Silk',
    occasion: ['Festival', 'Wedding']
  },
  {
    id: '3',
    name: 'Sunset Orange Chiffon',
    description: 'Lightweight and breezy sunset orange chiffon saree with delicate sequins scattered throughout. Ideal for evening parties and summer events.',
    price: 4500,
    category: SareeCategory.CHIFFON,
    image: 'https://picsum.photos/id/305/600/800',
    colors: ['Orange', 'Yellow'],
    fabric: 'Chiffon',
    occasion: ['Party', 'Casual']
  },
  {
    id: '4',
    name: 'Emerald Green Georgette',
    description: 'A stunning emerald green georgette saree with Chikankari embroidery. Elegance personified for sophisticated gatherings.',
    price: 7800,
    category: SareeCategory.GEORGETTE,
    image: 'https://picsum.photos/id/550/600/800',
    colors: ['Green'],
    fabric: 'Georgette',
    occasion: ['Party', 'Festival']
  },
  {
    id: '5',
    name: 'Ivory Handloom Cotton',
    description: 'Minimalist ivory handloom cotton saree with a simple golden border. Breathable and chic for office wear or day events.',
    price: 3200,
    category: SareeCategory.COTTON,
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
    category: SareeCategory.LINEN,
    image: 'https://picsum.photos/id/700/600/800',
    colors: ['Blue', 'Silver'],
    fabric: 'Linen',
    occasion: ['Office', 'Casual']
  },
   {
    id: '7',
    name: 'Magenta Mysore Silk',
    description: 'Soft and lustrous magenta Mysore silk saree with a simple gold stripe pallu. Lightweight yet grand.',
    price: 9500,
    category: SareeCategory.BANARASI, // Grouping under silk for simplicity in demo
    image: 'https://picsum.photos/id/800/600/800',
    colors: ['Magenta', 'Gold'],
    fabric: 'Silk',
    occasion: ['Festival', 'Wedding']
  },
  {
    id: '8',
    name: 'Floral Print Organza',
    description: 'Dreamy pastel floral print on high-quality organza fabric. A romantic choice for day weddings.',
    price: 6700,
    category: SareeCategory.GEORGETTE, // Closest proxy
    image: 'https://picsum.photos/id/400/600/800',
    colors: ['Pink', 'White'],
    fabric: 'Organza',
    occasion: ['Party', 'Wedding']
  }
];
