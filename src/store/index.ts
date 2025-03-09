import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Product, Theme } from '../types';

interface StoreState {
  user: User | null;
  products: Product[];
  theme: Theme;
  setUser: (user: User | null) => void;
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  toggleTheme: () => void;
}

// Sample products data
const sampleProducts: Product[] = [
  {
    id: '1',
    user_id: '1',
    title: 'Professional Soccer Ball',
    description: 'FIFA-approved match ball with superior aerodynamics and durability. Perfect for professional matches and training.',
    price: 129.99,
    category: 'Soccer',
    image_url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&q=80&w=800',
    created_at: '2024-03-15T10:00:00Z',
    stock: 50,
    rating: 4.8,
    reviews_count: 125,
    views_count: 1500,
    clicks_count: 800,
    sales_count: 89,
    sku: 'SOC-PRO-001',
    brand: 'Elite Sports',
    sport_type: 'Soccer',
    specifications: {
      'Material': 'Premium synthetic leather',
      'Size': '5',
      'Weight': '450g',
      'Color': 'White/Black',
      'Technology': 'AeroPro™ Surface'
    }
  },
  {
    id: '2',
    user_id: '1',
    title: 'Premium Basketball',
    description: 'Official size and weight basketball with superior grip and control. Ideal for indoor and outdoor courts.',
    price: 89.99,
    category: 'Basketball',
    image_url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=800',
    created_at: '2024-03-14T09:30:00Z',
    stock: 75,
    rating: 4.7,
    reviews_count: 98,
    views_count: 1200,
    clicks_count: 650,
    sales_count: 72,
    sku: 'BSK-PRO-002',
    brand: 'Elite Sports',
    sport_type: 'Basketball',
    specifications: {
      'Material': 'Composite leather',
      'Size': '7',
      'Weight': '620g',
      'Color': 'Orange',
      'Surface': 'Indoor/Outdoor'
    }
  },
  {
    id: '3',
    user_id: '1',
    title: 'Professional Running Shoes',
    description: 'Lightweight and breathable running shoes with advanced cushioning technology. Perfect for marathon runners.',
    price: 159.99,
    category: 'Running',
    image_url: 'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?auto=format&fit=crop&q=80&w=800',
    created_at: '2024-03-13T08:45:00Z',
    stock: 100,
    rating: 4.9,
    reviews_count: 156,
    views_count: 2200,
    clicks_count: 1100,
    sales_count: 95,
    sku: 'RUN-PRO-003',
    brand: 'SpeedMax',
    sport_type: 'Running',
    specifications: {
      'Material': 'Mesh and synthetic',
      'Size Range': '7-13 US',
      'Weight': '280g',
      'Color': 'Black/Red',
      'Technology': 'AirFlow™ System'
    }
  },
  {
    id: '4',
    user_id: '1',
    title: 'Yoga Mat Premium',
    description: 'Extra thick and non-slip yoga mat with perfect cushioning and stability. Includes carrying strap.',
    price: 79.99,
    category: 'Yoga',
    image_url: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=80&w=800',
    created_at: '2024-03-12T15:20:00Z',
    stock: 120,
    rating: 4.8,
    reviews_count: 89,
    views_count: 950,
    clicks_count: 480,
    sales_count: 65,
    sku: 'YOG-PRO-004',
    brand: 'ZenFit',
    sport_type: 'Yoga',
    specifications: {
      'Material': 'TPE Eco-friendly foam',
      'Thickness': '6mm',
      'Size': '72" x 24"',
      'Weight': '1.1kg',
      'Features': 'Non-slip, Moisture-resistant'
    }
  },
  {
    id: '5',
    user_id: '1',
    title: 'Tennis Racket Pro',
    description: 'Professional grade tennis racket with advanced string pattern and optimal weight distribution.',
    price: 199.99,
    category: 'Tennis',
    image_url: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&q=80&w=800',
    created_at: '2024-03-11T14:15:00Z',
    stock: 45,
    rating: 4.7,
    reviews_count: 67,
    views_count: 780,
    clicks_count: 390,
    sales_count: 42,
    sku: 'TEN-PRO-005',
    brand: 'PowerServe',
    sport_type: 'Tennis',
    specifications: {
      'Material': 'Graphite composite',
      'Weight': '300g',
      'Head Size': '100 sq in',
      'Balance': 'Head-light',
      'String Pattern': '16x19'
    }
  }
];

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      user: null,
      products: sampleProducts,
      theme: 'light',
      setUser: (user) => set({ user }),
      setProducts: (products) => set({ products }),
      addProduct: (product) => set((state) => ({
        products: [...state.products, product]
      })),
      updateProduct: (product) => set((state) => ({
        products: state.products.map(p => p.id === product.id ? product : p)
      })),
      deleteProduct: (productId) => set((state) => ({
        products: state.products.filter(p => p.id !== productId)
      })),
      toggleTheme: () => set((state) => ({
        theme: state.theme === 'light' ? 'dark' : 'light'
      })),
    }),
    {
      name: 'matrix-store',
    }
  )
);