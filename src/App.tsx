import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import SalesPrediction from './pages/SalesPrediction';
import ProductMatrix from './pages/ProductMatrix';
import ProductAnalytics from './pages/ProductAnalytics';
import Categories from './pages/Categories';
import CategoryProducts from './pages/CategoryProducts';
import Orders from './pages/Orders';
import Auth from './pages/Auth';
import AddProduct from './pages/AddProduct';
import Shop from './pages/Shop';
import Contact from './pages/Contact';
import ProductView from './pages/ProductView';
import FAQ from './pages/FAQ';
import BecomeSeller from './pages/BecomeSeller';
import Promotions from './pages/Promotions';
import Chatbot from './components/Chatbot';
import Affiliate from './pages/Affiliate';
import Forum from './pages/Forum';
import B2BPortal from './pages/B2BPortal';
import RecentlyViewed from './pages/RecentlyViewed';
import { useStore } from './store';
import { connectDB } from './config/db';
import Returns from './pages/Returns';
import ShippingPolicy from './pages/ShippingPolicy';
import Cart from './pages/cart';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import TrackOrder from './pages/TrackOrder';
import Wishlist from './pages/Wishlist';


function App() {
  const user = useStore((state) => state.user);
  const theme = useStore((state) => state.theme);

  useEffect(() => {
    // Connect to MongoDB
    connectDB().catch(console.error);
    
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex flex-col">
        <Navbar />
        <main className="container mx-auto px-4 py-8 pt-24 flex-grow">
          <Routes>
            <>
            <Route path="/shipping" element={<ShippingPolicy />} />
            <Route path="/returns" element={<Returns />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/products/:productId" element={<ProductView />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/categories/:category" element={<CategoryProducts />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/become-seller" element={<BecomeSeller />} />
            <Route path="/promotions" element={<Promotions />} />
            <Route path="/affiliate" element={<Affiliate />} />
            <Route path="/forum" element={<Forum />} />
            <Route path="/b2b" element={<B2BPortal />} />
            <Route path="/recently-viewed" element={<RecentlyViewed />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsConditions />} />
            <Route path="/track-order" element={<TrackOrder />} />
            <Route path="/wishlist" element={<Wishlist />} />

            <Route 
              path="/matrix" 
              element={user ? <Dashboard /> : <Navigate to="/auth" />} 
            />
            <Route 
              path="/matrix/predictions" 
              element={user ? <SalesPrediction /> : <Navigate to="/auth" />} 
            />
            <Route 
              path="/matrix/products" 
              element={user ? <ProductMatrix /> : <Navigate to="/auth" />} 
            />
            <Route 
              path="/matrix/products/add" 
              element={user ? <AddProduct /> : <Navigate to="/auth" />} 
            />
            <Route 
              path="/matrix/products/:productId/analytics" 
              element={user ? <ProductAnalytics /> : <Navigate to="/auth" />} 
            />
            <Route 
              path="/orders"
              element={user ? <Orders /> : <Navigate to="/auth" />} 
            />
            <Route path="/auth" element={<Auth />} />
            </>
          </Routes>
        </main>
        <Chatbot />
        <Footer />
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;