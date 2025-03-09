import Order, { IOrder } from '../models/Order';

export const getOrders = async (): Promise<IOrder[]> => {
  try {
    return await Order.find().sort({ created_at: -1 });
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

export const getOrderById = async (id: string): Promise<IOrder | null> => {
  try {
    return await Order.findById(id);
  } catch (error) {
    console.error(`Error fetching order with id ${id}:`, error);
    throw error;
  }
};

export const getOrdersByUserId = async (userId: string): Promise<IOrder[]> => {
  try {
    return await Order.find({ user_id: userId }).sort({ created_at: -1 });
  } catch (error) {
    console.error(`Error fetching orders for user ${userId}:`, error);
    throw error;
  }
};

export const getOrdersBySellerId = async (sellerId: string): Promise<IOrder[]> => {
  try {
    return await Order.find({ seller_id: sellerId }).sort({ created_at: -1 });
  } catch (error) {
    console.error(`Error fetching orders for seller ${sellerId}:`, error);
    throw error;
  }
};

export const createOrder = async (orderData: Partial<IOrder>): Promise<IOrder> => {
  try {
    const order = new Order(orderData);
    return await order.save();
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const updateOrderStatus = async (id: string, status: IOrder['status']): Promise<IOrder | null> => {
  try {
    return await Order.findByIdAndUpdate(id, { status }, { new: true });
  } catch (error) {
    console.error(`Error updating status for order ${id}:`, error);
    throw error;
  }
};

export const updateOrderPaymentStatus = async (id: string, paymentStatus: IOrder['payment_status']): Promise<IOrder | null> => {
  try {
    return await Order.findByIdAndUpdate(id, { payment_status: paymentStatus }, { new: true });
  } catch (error) {
    console.error(`Error updating payment status for order ${id}:`, error);
    throw error;
  }
};

export const addTrackingUpdate = async (id: string, trackingUpdate: IOrder['tracking_updates'][0]): Promise<IOrder | null> => {
  try {
    return await Order.findByIdAndUpdate(
      id, 
      { $push: { tracking_updates: trackingUpdate } },
      { new: true }
    );
  } catch (error) {
    console.error(`Error adding tracking update for order ${id}:`, error);
    throw error;
  }
};

export const getRecentOrders = async (limit: number = 5): Promise<IOrder[]> => {
  try {
    return await Order.find().sort({ created_at: -1 }).limit(limit);
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    throw error;
  }
};

export const getOrdersByStatus = async (status: IOrder['status']): Promise<IOrder[]> => {
  try {
    return await Order.find({ status }).sort({ created_at: -1 });
  } catch (error) {
    console.error(`Error fetching orders with status ${status}:`, error);
    throw error;
  }
};