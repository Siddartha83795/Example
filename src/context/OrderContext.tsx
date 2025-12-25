import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Order, CartItem, Location } from '@/types';

interface OrderContextType {
  orders: Order[];
  createOrder: (items: CartItem[], location: Location, clientName: string, tableNumber?: string) => Order;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  getOrdersByLocation: (location: Location) => Order[];
  getOrderByToken: (token: string) => Order | undefined;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const generateToken = (location: Location): string => {
  const prefix = location === 'medical' ? 'MED' : 'BIT';
  const number = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${number}`;
};

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([
    // Demo orders for staff dashboard
    {
      id: 'demo-1',
      token: 'MED-101',
      location: 'medical',
      items: [
        { id: 'med-1', name: 'Healthy Veg Thali', description: '', price: 120, category: 'food', image: '', location: 'medical', available: true, quantity: 2 },
        { id: 'med-4', name: 'Fresh Fruit Juice', description: '', price: 45, category: 'drink', image: '', location: 'medical', available: true, quantity: 1 },
      ],
      total: 285,
      status: 'pending',
      clientName: 'John Doe',
      tableNumber: 'T-5',
      createdAt: new Date(Date.now() - 10 * 60000),
      updatedAt: new Date(Date.now() - 10 * 60000),
    },
    {
      id: 'demo-2',
      token: 'MED-102',
      location: 'medical',
      items: [
        { id: 'med-2', name: 'Grilled Chicken Salad', description: '', price: 150, category: 'food', image: '', location: 'medical', available: true, quantity: 1 },
      ],
      total: 150,
      status: 'preparing',
      clientName: 'Jane Smith',
      createdAt: new Date(Date.now() - 5 * 60000),
      updatedAt: new Date(Date.now() - 3 * 60000),
    },
    {
      id: 'demo-3',
      token: 'BIT-201',
      location: 'bitbites',
      items: [
        { id: 'bit-1', name: 'Classic Burger', description: '', price: 149, category: 'food', image: '', location: 'bitbites', available: true, quantity: 2 },
        { id: 'bit-4', name: 'Cappuccino', description: '', price: 79, category: 'drink', image: '', location: 'bitbites', available: true, quantity: 2 },
      ],
      total: 456,
      status: 'pending',
      clientName: 'Mike Wilson',
      tableNumber: 'B-3',
      createdAt: new Date(Date.now() - 2 * 60000),
      updatedAt: new Date(Date.now() - 2 * 60000),
    },
  ]);

  const createOrder = (items: CartItem[], location: Location, clientName: string, tableNumber?: string): Order => {
    const order: Order = {
      id: `order-${Date.now()}`,
      token: generateToken(location),
      location,
      items,
      total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      status: 'pending',
      clientName,
      tableNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setOrders((prev) => [order, ...prev]);
    return order;
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, status, updatedAt: new Date() }
          : order
      )
    );
  };

  const getOrdersByLocation = (location: Location) => {
    return orders.filter((order) => order.location === location);
  };

  const getOrderByToken = (token: string) => {
    return orders.find((order) => order.token === token);
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        createOrder,
        updateOrderStatus,
        getOrdersByLocation,
        getOrderByToken,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
