import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Loader2, Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Header from '@/components/Header';
import { useCart } from '@/context/CartContext';
import { useCreateOrder } from '@/hooks/useOrders';
import { toast } from 'sonner';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items, total, location, clearCart, updateQuantity, removeItem } = useCart();
  const createOrderMutation = useCreateOrder();
  
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!location || items.length === 0) {
    navigate('/menu');
    return null;
  }

  const handlePayment = async () => {
    if (!clientName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    setIsProcessing(true);

    try {
      const order = await createOrderMutation.mutateAsync({
        items,
        location,
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim() || undefined,
        tableNumber: tableNumber.trim() || undefined,
      });

      clearCart();
      
      // Navigate to confirmation with the order data
      navigate('/confirmation', { 
        state: { 
          order: {
            ...order,
            createdAt: new Date(order.created_at),
            updatedAt: new Date(order.updated_at),
          }
        } 
      });
    } catch (error) {
      console.error('Order creation failed:', error);
      toast.error('Failed to place order. Please try again.');
      setIsProcessing(false);
    }
  };

  const locationName = location === 'medical' ? 'Medical Cafeteria' : 'Bit Bites';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Back Button & Title */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/menu')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Menu
          </Button>
          
          <h1 className="font-display text-2xl font-bold">Checkout</h1>
          <p className="text-muted-foreground">Review your order for {locationName}</p>
        </div>

        {/* Order Summary */}
        <div className="rounded-xl border border-border/50 bg-card p-6 mb-6">
          <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
          
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">₹{item.price} each</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <p className="w-20 text-right font-medium">₹{item.price * item.quantity}</p>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 mt-4 border-t border-border">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-2xl font-bold text-primary">₹{total}</span>
          </div>
        </div>

        {/* Customer Details */}
        <div className="rounded-xl border border-border/50 bg-card p-6 mb-6">
          <h2 className="font-semibold text-lg mb-4">Your Details</h2>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input
                id="phone"
                placeholder="Enter your phone number"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="table">Table Number (optional)</Label>
              <Input
                id="table"
                placeholder="e.g., T-5"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Payment Button */}
        <Button
          variant="hero"
          size="lg"
          className="w-full gap-2"
          onClick={handlePayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="h-5 w-5" />
              Pay ₹{total}
            </>
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground mt-4">
          This is a demo payment. No actual payment will be processed.
        </p>
      </main>
    </div>
  );
};

export default Checkout;
