export type Location = 'medical' | 'bitbites';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'food' | 'drink' | 'snack';
  image: string;
  location: Location;
  available: boolean;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Order {
  id: string;
  token: string;
  location: Location;
  items: CartItem[];
  total: number;
  status: 'cart' | 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  clientName: string;
  tableNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'client' | 'staff';
  location?: Location;
}

export type UserRole = 'client' | 'staff';
