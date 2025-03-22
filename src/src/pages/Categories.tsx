import { ArrowRight, Star, Users, TrendingUp, Package } from "lucide-react"
import LazyImage from "../components/LazyImage"

export default function Categories() {
  const categories = [
    {
      id: "soccer",
      title: "Soccer",
      description: "Professional soccer gear and equipment",
      image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&q=80&w=800",
      products: 245,
      rating: 4.8,
    },
    {
      id: "basketball",
      title: "Basketball",
      description: "Premium basketball equipment and accessories",
      image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=800",
      products: 189,
      rating: 4.7,
    },
    {
      id: "running",
      title: "Running",
      description: "High-performance running gear",
      image: "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?auto=format&fit=crop&q=80&w=800",
      products: 312,
      rating: 4.9,
    },
    {
      id: "fitness",
      title: "Fitness & Training",
      description: "Complete range of fitness equipment",
      image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800",
      products: 423,
      rating: 4.6,
    },
    {
      id: "tennis",
      title: "Tennis",
      description: "Professional tennis equipment",
      image: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&q=80&w=800",
      products: 156,
      rating: 4.7,
    },
    {
      id: "swimming",
      title: "Swimming",
      description: "Swimming gear and accessories",
      image: "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&q=80&w=800",
      products: 178,
      rating: 4.8,
    },
    {
      id: "cycling",
      title: "Cycling",
      description: "Professional cycling equipment",
      image: "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&q=80&w=800",
      products: 234,
      rating: 4.7,
    },
    {
      id: "yoga",
      title: "Yoga & Wellness",
      description: "Complete yoga and wellness products",
      image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=80&w=800",
      products: 198,
      rating: 4.9,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Sports Categories</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Explore our wide range of professional sports equipment and gear
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <div
              key={category.id}
              className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              <div className="relative h-64">
                <LazyImage
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-4 left-4 right-4">
                    <button className="w-full bg-white text-gray-900 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center">
                      Explore Category
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{category.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{category.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Star className="w-5 h-5 text-yellow-400" />
                      <span className="ml-1 text-gray-900 dark:text-white font-medium">{category.rating}</span>
                    </div>
                    <div className="flex items-center">
                      <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      <span className="ml-1 text-gray-900 dark:text-white font-medium">
                        {category.products} Products
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Featured Categories */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">Trending Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
              <TrendingUp className="w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold mb-2">Fitness & Training</h3>
              <p className="text-indigo-100 mb-4">Most popular category with highest growth rate</p>
              <button className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-indigo-50 transition-colors">
                Explore Now
              </button>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl p-6 text-white">
              <Star className="w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold mb-2">Running</h3>
              <p className="text-green-100 mb-4">Highest rated products and customer satisfaction</p>
              <button className="bg-white text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors">
                View Collection
              </button>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white">
              <Users className="w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold mb-2">Team Sports</h3>
              <p className="text-orange-100 mb-4">Best deals for teams and group purchases</p>
              <button className="bg-white text-orange-600 px-4 py-2 rounded-lg font-medium hover:bg-orange-50 transition-colors">
                Shop Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

