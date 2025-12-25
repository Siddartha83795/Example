import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MenuItem, CartItem } from '@/types';
import { useCart } from '@/context/CartContext';

interface MenuItemCardProps {
  item: MenuItem;
  cartItem?: CartItem;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, cartItem }) => {
  const { addItem, updateQuantity } = useCart();

  const categoryColors = {
    food: 'bg-primary/20 text-primary',
    drink: 'bg-accent/20 text-accent',
    snack: 'bg-success/20 text-success',
  };

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-card p-4 transition-all duration-300 hover:border-primary/30 hover:shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      
      <div className="relative z-10">
        <div className="mb-3 flex items-start justify-between">
          <Badge className={`${categoryColors[item.category]} border-0`}>
            {item.category}
          </Badge>
          <span className="font-display text-lg font-bold text-primary">
            ₹{item.price}
          </span>
        </div>

        <h3 className="font-display text-lg font-semibold mb-1">{item.name}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {item.description}
        </p>

        <div className="flex items-center justify-between">
          {cartItem ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => updateQuantity(item.id, cartItem.quantity - 1)}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-semibold">
                {cartItem.quantity}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => updateQuantity(item.id, cartItem.quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={() => addItem(item)}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add to Cart
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;
