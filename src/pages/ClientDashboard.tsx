import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCart, useCheckout, useClearCart, useClientOrders } from '@/hooks/useOrders';
import { CartItem } from '@/types';
import { ShoppingCart, Clock, History, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from "@/hooks/use-toast";

const ClientDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user, profile, signOut } = useAuth();
    const { toast } = useToast();

    // Data Hooks
    const { data: cart, isLoading: isCartLoading } = useCart();
    const { useActiveOrders, useOrderHistory } = useClientOrders();
    const { data: activeOrders, isLoading: isActiveLoading } = useActiveOrders();
    const { data: orderHistory, isLoading: isHistoryLoading } = useOrderHistory();

    // Mutations
    const checkoutMutation = useCheckout();
    const clearCartMutation = useClearCart();

    const handleLogout = async () => {
        try {
            await signOut();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const handleCheckout = async () => {
        if (!cart?.items?.length) {
            toast({
                title: "Cart empty",
                description: "Please add items to your cart first.",
                variant: "destructive",
            });
            return;
        }

        // Simple prompt for location (could be a modal in future)
        // const locationChoice = prompt('Choose location:\n1. Medical Cafeteria\n2. Bit Bites', '1');
        // const location = locationChoice === '2' ? 'bitbites' : 'medical';

        // For now we can default or ask. Let's assume we use the location from the cart items if available, or default.
        // Ideally user selects location before adding to cart, or we prompt now.
        // Let's prompt with a simple window.confirm or similar for valid MVP.
        // Improved: Using a simple heuristic - if items are from 'bitbites', order there. Mixing? Warning.

        // Check mixed locations
        const locations = new Set(cart.items.map(item => item.location));
        if (locations.size > 1) {
            toast({
                title: "Multiple Locations",
                description: "You have items from different locations. Please clear cart and order from one location at a time.",
                variant: "destructive",
            });
            return;
        }

        const location = cart.items[0]?.location || 'medical';

        try {
            if (!cart.id) return;

            await checkoutMutation.mutateAsync({
                cartId: cart.id,
                location: location,
                clientName: profile?.name || 'Client',
            });

            toast({
                title: "Order Placed!",
                description: `Your order has been placed successfully at ${location === 'medical' ? 'Medical Cafeteria' : 'Bit Bites'}.`,
            });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast({
                title: "Checkout failed",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const handleClearCart = async () => {
        if (!cart?.id) return;
        if (!window.confirm('Clear all items from cart?')) return;

        try {
            await clearCartMutation.mutateAsync(cart.id);
            toast({
                title: "Cart cleared",
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error(error);
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            cart: 'bg-gray-100 text-gray-800',
            pending: 'bg-yellow-100 text-yellow-800',
            preparing: 'bg-blue-100 text-blue-800',
            ready: 'bg-green-100 text-green-800',
            completed: 'bg-purple-100 text-purple-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return colors[status] || colors.cart;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(amount);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Welcome, {profile?.name || 'User'}!
                            </h1>
                            <p className="text-gray-600">Your personal food ordering dashboard</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button onClick={() => navigate('/')} variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                                Order More Food
                            </Button>
                            <Button onClick={handleLogout} variant="ghost" className="text-gray-600">
                                <LogOut className="mr-2 h-4 w-4" /> Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5 text-gray-500" /> My Cart
                            </h3>
                            <p className="text-3xl font-bold mt-2">{cart?.items?.length || 0} items</p>
                            <p className="text-gray-600">Total: {formatCurrency(cart?.total || 0)}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                                <Clock className="h-5 w-5 text-blue-500" /> Active Orders
                            </h3>
                            <p className="text-3xl font-bold text-blue-600 mt-2">{activeOrders?.length || 0}</p>
                            <p className="text-gray-600">Being prepared</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                                <History className="h-5 w-5 text-purple-500" /> Past Orders
                            </h3>
                            <p className="text-3xl font-bold text-purple-600 mt-2">{orderHistory?.length || 0}</p>
                            <p className="text-gray-600">Completed history</p>
                        </CardContent>
                    </Card>
                </div>

                {/* My Cart Section */}
                <Card className="mb-8">
                    <CardHeader className="border-b">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-2xl flex items-center gap-2">
                                <ShoppingCart className="h-6 w-6" />
                                My Cart ({cart?.items?.length || 0} items)
                            </CardTitle>
                            <div className="flex gap-3">
                                <Button
                                    onClick={handleCheckout}
                                    disabled={!cart?.items?.length || checkoutMutation.isPending}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    {checkoutMutation.isPending ? 'Placing Order...' : 'Checkout Now'}
                                </Button>
                                <Button
                                    onClick={handleClearCart}
                                    variant="destructive"
                                    disabled={!cart?.items?.length}
                                >
                                    Clear Cart
                                </Button>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        {!cart?.items?.length ? (
                            <div className="p-8 text-center text-gray-500">
                                <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                                <h3 className="text-xl font-medium">Your cart is empty</h3>
                                <p className="mt-2">Add some delicious items to get started!</p>
                                <Button
                                    onClick={() => navigate('/')}
                                    className="mt-4 bg-blue-600 hover:bg-blue-700"
                                >
                                    Browse Menu
                                </Button>
                            </div>
                        ) : (
                            <div className="p-6">
                                <div className="space-y-4">
                                    {cart.items.map((item: CartItem, index: number) => (
                                        <div key={`${item.id}-${index}`} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-4">
                                                {item.image && (
                                                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
                                                )}
                                                <div>
                                                    <h4 className="font-medium text-lg">{item.name}</h4>
                                                    <p className="text-sm text-gray-500 capitalize">
                                                        {item.location === 'medical' ? '🏥 Medical Cafeteria' : '🍔 Bit Bites'}
                                                        {' • '}
                                                        Qty: {item.quantity}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-lg">{formatCurrency(item.price * item.quantity)}</p>
                                                <p className="text-sm text-gray-500">{formatCurrency(item.price)} each</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <Separator className="my-6" />

                                <div className="flex justify-between items-center">
                                    <span className="text-xl font-bold">Cart Total</span>
                                    <span className="text-2xl font-bold text-green-600">{formatCurrency(cart.total)}</span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Active Orders Section */}
                <Card className="mb-8">
                    <CardHeader className="border-b">
                        <CardTitle className="text-2xl flex items-center gap-2">
                            <Clock className="h-6 w-6" />
                            Active Orders ({activeOrders?.length || 0})
                        </CardTitle>
                        <p className="text-gray-500 text-sm">Orders being prepared for you</p>
                    </CardHeader>

                    <CardContent className="p-6">
                        {!activeOrders?.length ? (
                            <div className="text-center py-8 text-gray-500">
                                <Clock className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                                <h3 className="text-xl font-medium">No active orders</h3>
                                <p>Checkout your cart to place an order!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {activeOrders.map((order) => (
                                    <div key={order.id} className="border rounded-xl p-5 hover:shadow-md transition bg-white">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-sm font-bold px-3 py-1">
                                                    🎫 {order.token || '---'}
                                                </Badge>
                                                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Order ID: {order.token}</p>
                                            </div>
                                            <Badge className={`${getStatusColor(order.status)} border-0`}>
                                                {order.status.toUpperCase()}
                                            </Badge>
                                        </div>

                                        <div className="mb-4">
                                            <h4 className="font-medium mb-1 flex items-center gap-1">
                                                {order.location === 'medical' ? '🏥 Medical Cafeteria' : '🍔 Bit Bites'}
                                            </h4>
                                            <p className="text-sm text-gray-500">
                                                Ordered at {formatDate(order.created_at)}
                                            </p>
                                        </div>

                                        <Separator className="my-3" />

                                        <h5 className="font-medium mb-2 text-sm text-gray-700">Order Items:</h5>
                                        <ul className="space-y-1 text-sm mb-4">
                                            {order.items.map((item: CartItem, idx: number) => (
                                                <li key={idx} className="flex justify-between">
                                                    <span>{item.quantity}x {item.name}</span>
                                                    <span className="text-gray-600">{formatCurrency(item.price * item.quantity)}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        <div className="bg-gray-50 p-3 rounded-lg flex justify-between items-center font-bold">
                                            <span>Total Amount</span>
                                            <span>{formatCurrency(order.total)}</span>
                                        </div>

                                        <div className="mt-4 text-center text-sm text-gray-500 bg-yellow-50 p-2 rounded border border-yellow-100">
                                            Show token <span className="font-bold text-black">{order.token}</span> at counter
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Order History Section */}
                <Card>
                    <CardHeader className="border-b">
                        <CardTitle className="text-2xl flex items-center gap-2">
                            <History className="h-6 w-6" />
                            Order History ({orderHistory?.length || 0})
                        </CardTitle>
                        <p className="text-gray-500 text-sm">Your completed and cancelled orders</p>
                    </CardHeader>

                    <CardContent className="p-0">
                        {!orderHistory?.length ? (
                            <div className="text-center py-8 text-gray-500">
                                <History className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                                <h3 className="text-xl font-medium">No order history yet</h3>
                                <p>Your finished orders will appear here</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Token</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Location</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Items</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Total</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {orderHistory.map((order) => (
                                            <tr key={order.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                                    {order.token}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {order.location === 'medical' ? '🏥 Medical' : '🍔 Bit Bites'}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    <div className="max-w-xs truncate">
                                                        {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                                    {formatCurrency(order.total)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Badge className={`${getStatusColor(order.status)} border-0 hover:bg-opacity-80`}>
                                                        {order.status.toUpperCase()}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(order.created_at).toLocaleDateString()} {formatDate(order.created_at)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};

export default ClientDashboard;
