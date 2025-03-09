import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Store, 
  UserCircle, 
  LogOut, 
  Menu, 
  X, 
  Search, 
  ShoppingBag, 
  Phone, 
  Heart,
  LayoutDashboard,
  Package,
  BarChart3,
  Tag,
  Users,
  MessageSquare,
  Clock,
  ChevronDown
} from 'lucide-react';
import { useStore } from '../store';
import ThemeToggle from './ThemeToggle';
import AuthModal from './AuthModal';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDashboardMenuOpen, setIsDashboardMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const user = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    setUser(null);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/shop', label: 'Shop' },
    { path: '/categories', label: 'Categories' },
    { path: '/contact', label: 'Contact' },
  ];

  const dashboardLinks = [
    {
      group: 'Overview',
      items: [
        { path: '/matrix', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/matrix/orders', label: 'Orders', icon: Package },
      ]
    },
    {
      group: 'Products',
      items: [
        { path: '/matrix/products', label: 'Product Matrix', icon: Package },
        { path: '/matrix/products/add', label: 'Add Product', icon: Package },
        { path: '/matrix/products/analytics', label: 'Product Analytics', icon: BarChart3 },
        { path: '/matrix/predictions', label: 'Sales Prediction', icon: BarChart3 },
      ]
    },
    {
      group: 'Marketing',
      items: [
        { path: '/promotions', label: 'Promotions', icon: Tag },
        { path: '/affiliate', label: 'Affiliate Program', icon: Users },
        { path: '/b2b', label: 'B2B Portal', icon: Store },
      ]
    },
    {
      group: 'Community',
      items: [
        { path: '/forum', label: 'Forum', icon: MessageSquare },
        { path: '/recently-viewed', label: 'Recently Viewed', icon: Clock },
        { path: '/become-seller', label: 'Become a Seller', icon: Store },
      ]
    }
  ];

  const isActivePath = (path: string) => {
    if (path === '/matrix') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <nav className={`fixed w-full z-50 transition-all duration-200 ${
        isScrolled 
          ? 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-md' 
          : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center space-x-3">
              <Store className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-400 text-transparent bg-clip-text">
                Matrix Commerce
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <form onSubmit={handleSearch} className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 rounded-full bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-gray-600 transition-all dark:text-white"
                />
              </form>
              
              {navLinks.map((link) => (
                <Link 
                  key={link.path}
                  to={link.path} 
                  className={`text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium ${
                    location.pathname === link.path ? 'text-indigo-600 dark:text-indigo-400' : ''
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsDashboardMenuOpen(!isDashboardMenuOpen)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
                      location.pathname.startsWith('/matrix')
                        ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                    } hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors`}
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Dashboard</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {isDashboardMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 max-h-[calc(100vh-100px)] overflow-y-auto no-scrollbar">
                      {dashboardLinks.map((group, index) => (
                        <div key={group.group}>
                          {index > 0 && <hr className="my-2 border-gray-200 dark:border-gray-700" />}
                          <div className="px-4 py-2">
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              {group.group}
                            </p>
                            {group.items.map((item) => (
                              <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm ${
                                  isActivePath(item.path)
                                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                                onClick={() => setIsDashboardMenuOpen(false)}
                              >
                                <item.icon className="w-4 h-4" />
                                <span>{item.label}</span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center space-x-2 px-6 py-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                >
                  <UserCircle className="w-5 h-5" />
                  <span>Sign In</span>
                </button>
              )}

              <div className="flex items-center space-x-4">
                <ThemeToggle />
                
                <Link to="/wishlist" className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <Heart className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center">
                    0
                  </span>
                </Link>
                
                <Link to="/cart" className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <ShoppingBag className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center">
                    0
                  </span>
                </Link>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center space-x-4 md:hidden">
              <ThemeToggle />
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700 max-h-[calc(100vh-80px)] overflow-y-auto">
              <div className="flex flex-col space-y-4">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full rounded-lg bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-gray-600 transition-all dark:text-white"
                  />
                </form>
                
                {navLinks.map((link) => (
                  <Link 
                    key={link.path}
                    to={link.path} 
                    className={`px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg ${
                      location.pathname === link.path ? 'bg-gray-100 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400' : ''
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}

                {user ? (
                  <>
                    {dashboardLinks.map((group) => (
                      <div key={group.group} className="py-2">
                        <p className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                          {group.group}
                        </p>
                        {group.items.map((item) => (
                          <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center space-x-2 px-4 py-2 ${
                              isActivePath(item.path)
                                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <item.icon className="w-4 h-4" />
                            <span>{item.label}</span>
                          </Link>
                        ))}
                      </div>
                    ))}
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setIsAuthModalOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    <UserCircle className="w-5 h-5" />
                    <span>Sign In</span>
                  </button>
                )}

                <div className="flex justify-between items-center px-4 py-2">
                  <Link to="/wishlist" className="flex items-center space-x-2 text-gray-700 dark:text-gray-200">
                    <Heart className="w-5 h-5" />
                    <span>Wishlist</span>
                  </Link>
                  <Link to="/cart" className="flex items-center space-x-2 text-gray-700 dark:text-gray-200">
                    <ShoppingBag className="w-5 h-5" />
                    <span>Cart (0)</span>
                  </Link>
                </div>
                
                <Link to="/contact" className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <Phone className="w-5 h-5" />
                  <span>Contact Us</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}