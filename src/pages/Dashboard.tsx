import React from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  ShoppingBag,
  Users,
  DollarSign,
  TrendingUp,
  Package,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { useStore } from '../store';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const user = useStore((state) => state.user);

  // Sample data for demonstration
  const revenueData = [
    { date: '2024-01', revenue: 45000, orders: 380 },
    { date: '2024-02', revenue: 52000, orders: 420 },
    { date: '2024-03', revenue: 49000, orders: 400 },
    { date: '2024-04', revenue: 58000, orders: 450 },
    { date: '2024-05', revenue: 63000, orders: 480 },
    { date: '2024-06', revenue: 68000, orders: 520 },
  ];

  const metrics = [
    {
      title: 'Total Revenue',
      value: '$354,890',
      change: '+12.3%',
      icon: DollarSign,
      color: 'indigo',
    },
    {
      title: 'Total Orders',
      value: '2,650',
      change: '+8.1%',
      icon: ShoppingBag,
      color: 'blue',
    },
    {
      title: 'Active Customers',
      value: '1,245',
      change: '+15.4%',
      icon: Users,
      color: 'green',
    },
    {
      title: 'Conversion Rate',
      value: '4.2%',
      change: '+2.1%',
      icon: TrendingUp,
      color: 'purple',
    },
  ];

  const recentOrders = [
    {
      id: '1',
      customer: 'John Doe',
      amount: 299.99,
      status: 'processing',
      date: '2024-03-15',
    },
    {
      id: '2',
      customer: 'Jane Smith',
      amount: 159.50,
      status: 'shipped',
      date: '2024-03-14',
    },
    {
      id: '3',
      customer: 'Mike Johnson',
      amount: 499.99,
      status: 'delivered',
      date: '2024-03-13',
    },
  ];

  const lowStockProducts = [
    {
      id: '1',
      name: 'Wireless Headphones',
      stock: 3,
      threshold: 5,
    },
    {
      id: '2',
      name: 'Smart Watch',
      stock: 2,
      threshold: 10,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.full_name}</h1>
            <p className="text-gray-600 mt-1">Here's what's happening with your store today.</p>
          </div>
          <div className="flex gap-4">
            <Link
              to="/matrix/products"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              View Products
            </Link>
            <Link
              to="/matrix/orders"
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              View Orders
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{metric.value}</p>
              </div>
              <div className={`p-3 rounded-lg bg-${metric.color}-100`}>
                <metric.icon className={`w-6 h-6 text-${metric.color}-600`} />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-500 text-sm font-medium">{metric.change}</span>
              <span className="text-gray-600 text-sm ml-1">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Revenue Overview</h2>
            <p className="text-sm text-gray-600">Monthly revenue and orders</p>
          </div>
          <select className="px-3 py-2 bg-gray-100 rounded-lg text-sm">
            <option>Last 6 months</option>
            <option>Last year</option>
            <option>All time</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="date" stroke="#6B7280" />
            <YAxis stroke="#6B7280" />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#4F46E5"
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Orders & Low Stock Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            </div>
            <Link
              to="/matrix/orders"
              className="text-sm text-indigo-600 hover:text-indigo-700"
            >
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{order.customer}</p>
                  <p className="text-sm text-gray-600">{order.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">${order.amount}</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${
                      order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }
                  `}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-semibold text-gray-900">Low Stock Alert</h2>
            </div>
            <Link
              to="/matrix/products"
              className="text-sm text-indigo-600 hover:text-indigo-700"
            >
              View inventory
            </Link>
          </div>
          <div className="space-y-4">
            {lowStockProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-600">
                    Threshold: {product.threshold} units
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-amber-500">{product.stock}</p>
                  <p className="text-sm text-gray-600">units left</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}