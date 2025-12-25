import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Location, CartItem, Order } from '@/types';

export type OrderStatus = 'cart' | 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface OrderDB {
  id: string;
  token: string | null;
  user_id: string | null;
  location: 'medical' | 'bitbites';
  items: CartItem[];
  total: number;
  status: OrderStatus;
  client_name: string;
  client_phone: string | null;
  table_number: string | null;
  created_at: string;
  updated_at: string;
  order_id?: string; // For display purposes like MED-001
}

interface CreateOrderInput {
  items: CartItem[];
  location: Location;
  clientName: string;
  clientPhone?: string;
  tableNumber?: string;
}

const generateToken = (location: Location): string => {
  const prefix = location === 'medical' ? 'MED' : 'BIT';
  const number = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${number}`;
};

const generateOrderId = async (location: Location) => {
  const prefix = location === 'medical' ? 'MED' : 'BIT';
  // This is a simple client-side generation, ideally DB sequence or similar
  const { count } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('location', location)
    .neq('status', 'cart');

  return `${prefix}-${1000 + (count || 0) + 1}`;
};

// --- CLIENT CART HOOKS ---

export const useCart = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['cart', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'cart')
        .maybeSingle();

      if (error) throw error;

      if (!data) return null;

      return {
        ...data,
        items: data.items as unknown as CartItem[],
      } as OrderDB;
    },
    enabled: !!user?.id,
  });
};

export const useUpdateCart = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ items, total, clientName }: { items: CartItem[], total: number, clientName: string }) => {
      if (!user?.id) throw new Error("User not authenticated");

      // Check if cart exists
      const { data: existingCart } = await supabase
        .from('orders')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'cart')
        .maybeSingle();

      if (existingCart) {
        // Update existing cart
        const { data, error } = await supabase
          .from('orders')
          .update({
            items: JSON.parse(JSON.stringify(items)),
            total,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingCart.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new cart (default location to medical, will be set on checkout)
        const { data, error } = await supabase
          .from('orders')
          .insert({
            user_id: user.id,
            status: 'cart',
            items: JSON.parse(JSON.stringify(items)),
            total,
            client_name: clientName,
            location: 'medical', // Default, updated on checkout
            token: null
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useCheckout = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      cartId,
      location,
      clientName
    }: {
      cartId: string,
      location: Location,
      clientName: string
    }) => {
      const token = generateToken(location);
      // const orderId = await generateOrderId(location); // Can generate here or display only

      // Update cart to pending order
      const { data, error } = await supabase
        .from('orders')
        .update({
          status: 'pending',
          token,
          location,
          client_name: clientName,
          created_at: new Date().toISOString() // Reset created_at to now for sorting active orders
        })
        .eq('id', cartId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useClearCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cartId: string) => {
      const { error } = await supabase
        .from('orders')
        .update({
          items: [],
          total: 0
        })
        .eq('id', cartId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};


// --- EXISTING HOOKS ADAPTED ---

export const useCreateOrder = () => {
  // This might still be used by Staff or direct non-cart flows if any
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateOrderInput): Promise<OrderDB> => {
      const token = generateToken(input.location);
      const total = input.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

      const { data, error } = await supabase
        .from('orders')
        .insert({
          token,
          user_id: user?.id || null,
          location: input.location as 'medical' | 'bitbites',
          items: JSON.parse(JSON.stringify(input.items)),
          total,
          status: 'pending' as const,
          client_name: input.clientName,
          client_phone: input.clientPhone || null,
          table_number: input.tableNumber || null,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        items: data.items as unknown as CartItem[],
      } as OrderDB;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useClientOrders = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Active Orders (Pending, Preparing, Ready)
  const useActiveOrders = () => useQuery({
    queryKey: ['orders', 'active', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['pending', 'preparing', 'ready'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(order => ({ ...order, items: order.items as unknown as CartItem[] })) as OrderDB[];
    },
    enabled: !!user?.id,
    // Refetch often for status updates
    refetchInterval: 5000,
  });

  // History Orders (Completed, Cancelled)
  const useOrderHistory = () => useQuery({
    queryKey: ['orders', 'history', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['completed', 'cancelled'])
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data.map(order => ({ ...order, items: order.items as unknown as CartItem[] })) as OrderDB[];
    },
    enabled: !!user?.id,
  });

  return { useActiveOrders, useOrderHistory };
};

export const useLocationOrders = (location: Location) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['orders', 'location', location],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('location', location)
        .neq('status', 'cart') // Exclude carts from staff view
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data.map((order) => ({
        ...order,
        items: order.items as unknown as CartItem[],
      })) as OrderDB[];
    },
    enabled: !!location,
  });

  // Real-time subscription for order updates
  useEffect(() => {
    if (!location) return;

    const channel = supabase
      .channel(`orders-${location}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `location=eq.${location}`,
        },
        () => {
          // Refetch orders when any change occurs
          queryClient.invalidateQueries({ queryKey: ['orders', 'location', location] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [location, queryClient]);

  return query;
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};
