import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Location } from '@/types';

export interface MenuItemDB {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image: string | null;
  location: 'medical' | 'bitbites';
  available: boolean;
  created_at: string;
}

export const useMenuItems = (location?: Location) => {
  return useQuery({
    queryKey: ['menu-items', location],
    queryFn: async () => {
      let query = supabase
        .from('menu_items')
        .select('*')
        .eq('available', true);
      
      if (location) {
        query = query.eq('location', location);
      }
      
      const { data, error } = await query.order('category', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      return data as MenuItemDB[];
    },
  });
};

export const useMenuItemsByLocation = (location: Location) => {
  return useQuery({
    queryKey: ['menu-items', location],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('location', location)
        .eq('available', true)
        .order('category', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      return data as MenuItemDB[];
    },
    enabled: !!location,
  });
};
