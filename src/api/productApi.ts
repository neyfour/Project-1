import Product, { IProduct } from '../models/Product';

export const getProducts = async (): Promise<IProduct[]> => {
  try {
    return await Product.find().sort({ created_at: -1 });
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getProductById = async (id: string): Promise<IProduct | null> => {
  try {
    return await Product.findById(id);
  } catch (error) {
    console.error(`Error fetching product with id ${id}:`, error);
    throw error;
  }
};

export const getProductsByCategory = async (category: string): Promise<IProduct[]> => {
  try {
    return await Product.find({ category: category.toLowerCase() }).sort({ created_at: -1 });
  } catch (error) {
    console.error(`Error fetching products in category ${category}:`, error);
    throw error;
  }
};

export const getProductsByUserId = async (userId: string): Promise<IProduct[]> => {
  try {
    return await Product.find({ user_id: userId }).sort({ created_at: -1 });
  } catch (error) {
    console.error(`Error fetching products for user ${userId}:`, error);
    throw error;
  }
};

export const createProduct = async (productData: Partial<IProduct>): Promise<IProduct> => {
  try {
    const product = new Product(productData);
    return await product.save();
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const updateProduct = async (id: string, productData: Partial<IProduct>): Promise<IProduct | null> => {
  try {
    return await Product.findByIdAndUpdate(id, productData, { new: true });
  } catch (error) {
    console.error(`Error updating product with id ${id}:`, error);
    throw error;
  }
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    const result = await Product.findByIdAndDelete(id);
    return !!result;
  } catch (error) {
    console.error(`Error deleting product with id ${id}:`, error);
    throw error;
  }
};

export const getPopularProducts = async (limit: number = 6): Promise<IProduct[]> => {
  try {
    return await Product.find().sort({ views_count: -1 }).limit(limit);
  } catch (error) {
    console.error('Error fetching popular products:', error);
    throw error;
  }
};

export const getFeaturedProducts = async (limit: number = 6): Promise<IProduct[]> => {
  try {
    return await Product.find({ rating: { $gte: 4.5 } }).sort({ rating: -1 }).limit(limit);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    throw error;
  }
};

export const searchProducts = async (query: string): Promise<IProduct[]> => {
  try {
    return await Product.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } }
      ]
    }).sort({ rating: -1 });
  } catch (error) {
    console.error(`Error searching products with query ${query}:`, error);
    throw error;
  }
};

export const incrementProductViews = async (id: string): Promise<void> => {
  try {
    await Product.findByIdAndUpdate(id, { $inc: { views_count: 1 } });
  } catch (error) {
    console.error(`Error incrementing views for product ${id}:`, error);
    throw error;
  }
};

export const incrementProductClicks = async (id: string): Promise<void> => {
  try {
    await Product.findByIdAndUpdate(id, { $inc: { clicks_count: 1 } });
  } catch (error) {
    console.error(`Error incrementing clicks for product ${id}:`, error);
    throw error;
  }
};