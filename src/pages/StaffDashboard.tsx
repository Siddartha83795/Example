import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { RefreshCw, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OrderCard from '@/components/OrderCard';
import { useAuth } from '@/context/AuthContext';
import { useLocationOrders, useUpdateOrderStatus, OrderStatus } from '@/hooks/useOrders';

const StaffDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { profile, signOut, isLoading: authLoading } = useAuth();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const staffLocation = profile?.location;
  const { data: locationOrders = [], isLoading: ordersLoading, refetch } = useLocationOrders(staffLocation!);
  const updateOrderStatus = useUpdateOrderStatus();

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(new Date());
      refetch();
    }, 30000);
    return () => clearInterval(interval);
  }, [refetch]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile || profile.role !== 'staff') {
    return <Navigate to="/" replace />;
  }

  const filteredOrders = statusFilter === 'all'
    ? locationOrders
    : locationOrders.filter((order) => order.status === statusFilter);

  const pendingCount = locationOrders.filter((o) => o.status === 'pending').length;
  const preparingCount = locationOrders.filter((o) => o.status === 'preparing').length;
  const readyCount = locationOrders.filter((o) => o.status === 'ready').length;

  const locationName = staffLocation === 'medical' ? 'Medical Cafeteria' : 'Bit Bites';

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleStatusUpdate = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus.mutate({ orderId, status: newStatus });
  };

  const handleRefresh = () => {
    setLastRefresh(new Date());
    refetch();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div>
            <h1 className="font-display text-xl font-bold">Staff Dashboard</h1>
            <p className="text-sm text-muted-foreground">{locationName}</p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl border border-warning/50 bg-warning/10 p-4 text-center">
            <p className="text-3xl font-bold text-warning">{pendingCount}</p>
            <p className="text-sm text-muted-foreground">New Orders</p>
          </div>
          <div className="rounded-xl border border-primary/50 bg-primary/10 p-4 text-center">
            <p className="text-3xl font-bold text-primary">{preparingCount}</p>
            <p className="text-sm text-muted-foreground">Preparing</p>
          </div>
          <div className="rounded-xl border border-success/50 bg-success/10 p-4 text-center">
            <p className="text-3xl font-bold text-success">{readyCount}</p>
            <p className="text-sm text-muted-foreground">Ready</p>
          </div>
        </div>

        {/* Filter Tabs */}
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)} className="mb-6">
          <TabsList className="grid w-full grid-cols-4 bg-secondary/50">
            <TabsTrigger value="all" className="gap-1">
              All
              <Badge variant="secondary" className="ml-1">{locationOrders.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="pending" className="gap-1">
              New
              {pendingCount > 0 && (
                <Badge className="ml-1 bg-warning text-warning-foreground">{pendingCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="preparing">Preparing</TabsTrigger>
            <TabsTrigger value="ready">Ready</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Orders Grid */}
        {ordersLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={{
                    id: order.id,
                    token: order.token,
                    location: order.location,
                    items: order.items,
                    total: Number(order.total),
                    status: order.status,
                    clientName: order.client_name,
                    tableNumber: order.table_number || undefined,
                    createdAt: new Date(order.created_at),
                    updatedAt: new Date(order.updated_at),
                  }}
                  onStatusUpdate={handleStatusUpdate}
                />
              ))}
            </div>

            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No orders found</p>
              </div>
            )}
          </>
        )}

        {/* Last refresh indicator */}
        <div className="fixed bottom-4 right-4">
          <Badge variant="outline" className="text-xs">
            Last refresh: {lastRefresh.toLocaleTimeString()}
          </Badge>
        </div>
      </main>
    </div>
  );
};

export default StaffDashboard;
