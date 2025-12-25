import React from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { CheckCircle, Home, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import { Order } from '@/types';

const Confirmation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order as Order | undefined;

  if (!order) {
    return <Navigate to="/" replace />;
  }

  const locationName = order.location === 'medical' ? 'Medical Cafeteria' : 'Bit Bites';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center">
          {/* Success Animation */}
          <div className="mb-8 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-32 w-32 rounded-full bg-success/20 animate-ping" />
            </div>
            <div className="relative inline-flex h-24 w-24 items-center justify-center rounded-full bg-success animate-scale-in">
              <CheckCircle className="h-12 w-12 text-success-foreground" />
            </div>
          </div>

          <h1 className="font-display text-3xl font-bold mb-2 animate-slide-up">
            Order Confirmed!
          </h1>
          <p className="text-muted-foreground mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Your order has been placed successfully
          </p>

          {/* Token Display */}
          <div className="rounded-2xl border-2 border-primary bg-primary/10 p-8 mb-8 glow-effect animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <p className="text-sm text-muted-foreground mb-2">Your Token Number</p>
            <p className="font-display text-5xl font-bold text-primary tracking-wider">
              {order.token}
            </p>
          </div>

          {/* Order Details */}
          <div className="rounded-xl border border-border/50 bg-card p-6 text-left mb-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Location:</span>
                <span className="font-medium">{locationName}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Status:</span>
                <span className="font-medium text-warning">Preparing</span>
              </div>

              <div className="border-t border-border pt-3 mt-3">
                <p className="text-sm text-muted-foreground mb-2">Order Items:</p>
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm py-1">
                    <span>{item.quantity}x {item.name}</span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold pt-2 border-t border-border mt-2">
                  <span>Total</span>
                  <span className="text-primary">₹{order.total}</span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-6">
            Please wait for your token to be called at the counter. 
            Show this token number when collecting your order.
          </p>

          <Button
            variant="hero"
            size="lg"
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <Home className="h-5 w-5" />
            Back to Home
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Confirmation;
