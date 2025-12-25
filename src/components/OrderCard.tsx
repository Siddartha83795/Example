import React from 'react';
import { Clock, User, MapPin, ChefHat, CheckCircle, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Order } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface OrderCardProps {
  order: Order;
  onStatusUpdate?: (orderId: string, status: Order['status']) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onStatusUpdate }) => {
  const statusConfig = {
    pending: {
      label: 'New Order',
      color: 'bg-warning text-warning-foreground',
      icon: Timer,
    },
    preparing: {
      label: 'Preparing',
      color: 'bg-primary text-primary-foreground',
      icon: ChefHat,
    },
    ready: {
      label: 'Ready',
      color: 'bg-success text-success-foreground',
      icon: CheckCircle,
    },
    completed: {
      label: 'Completed',
      color: 'bg-muted text-muted-foreground',
      icon: CheckCircle,
    },
  };

  const status = statusConfig[order.status];
  const StatusIcon = status.icon;

  const getNextStatus = (): Order['status'] | null => {
    switch (order.status) {
      case 'pending':
        return 'preparing';
      case 'preparing':
        return 'ready';
      case 'ready':
        return 'completed';
      default:
        return null;
    }
  };

  const getNextButtonLabel = () => {
    switch (order.status) {
      case 'pending':
        return 'Start Preparing';
      case 'preparing':
        return 'Mark Ready';
      case 'ready':
        return 'Complete Order';
      default:
        return null;
    }
  };

  const nextStatus = getNextStatus();
  const buttonLabel = getNextButtonLabel();

  const handleStatusUpdate = () => {
    if (nextStatus && onStatusUpdate) {
      onStatusUpdate(order.id, nextStatus);
    }
  };

  return (
    <div className={`group relative overflow-hidden rounded-xl border-2 bg-card p-4 transition-all duration-300 ${
      order.status === 'pending' ? 'border-warning animate-pulse-slow' : 'border-border/50'
    }`}>
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-display text-2xl font-bold text-primary">
              {order.token}
            </span>
            {order.status === 'pending' && (
              <span className="h-2 w-2 rounded-full bg-warning animate-ping" />
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{formatDistanceToNow(order.createdAt, { addSuffix: true })}</span>
          </div>
        </div>

        <Badge className={status.color}>
          <StatusIcon className="h-3 w-3 mr-1" />
          {status.label}
        </Badge>
      </div>

      <div className="mb-4 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{order.clientName}</span>
        </div>
        {order.tableNumber && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>Table: {order.tableNumber}</span>
          </div>
        )}
      </div>

      <div className="mb-4 space-y-1 rounded-lg bg-secondary/50 p-3">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span>
              {item.quantity}x {item.name}
            </span>
            <span className="text-muted-foreground">₹{item.price * item.quantity}</span>
          </div>
        ))}
        <div className="mt-2 border-t border-border pt-2 flex justify-between font-semibold">
          <span>Total</span>
          <span className="text-primary">₹{order.total}</span>
        </div>
      </div>

      {nextStatus && buttonLabel && onStatusUpdate && (
        <Button
          variant={order.status === 'pending' ? 'warning' : order.status === 'preparing' ? 'default' : 'success'}
          className="w-full"
          onClick={handleStatusUpdate}
        >
          {buttonLabel}
        </Button>
      )}
    </div>
  );
};

export default OrderCard;
