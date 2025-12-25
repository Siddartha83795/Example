import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';

const CartSummary: React.FC = () => {
  const { items, total, itemCount } = useCart();
  const navigate = useNavigate();

  if (itemCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/50 bg-background/95 backdrop-blur-xl p-4 shadow-2xl animate-slide-up">
      <div className="container mx-auto">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
              <ShoppingBag className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-display text-sm font-semibold">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </p>
              <p className="text-xl font-bold text-primary">₹{total}</p>
            </div>
          </div>

          <Button
            variant="hero"
            size="lg"
            onClick={() => navigate('/checkout')}
            className="gap-2"
          >
            Checkout
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;
