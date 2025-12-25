import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import MenuItemCard from '@/components/MenuItemCard';
import CartSummary from '@/components/CartSummary';
import { useCart } from '@/context/CartContext';
import { getMenuByLocation } from '@/data/menuData';

const Menu: React.FC = () => {
  const navigate = useNavigate();
  const { location, items: cartItems } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  if (!location) {
    navigate('/locations');
    return null;
  }

  const menuItems = getMenuByLocation(location);
  const locationName = location === 'medical' ? 'Medical Cafeteria' : 'Bit Bites';

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getCartItem = (itemId: string) => {
    return cartItems.find((item) => item.id === itemId);
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        {/* Back Button & Title */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/locations')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Change Location
          </Button>
          
          <h1 className="font-display text-2xl font-bold">{locationName}</h1>
          <p className="text-muted-foreground">Browse our menu and add items to your cart</p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Tabs */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-6">
          <TabsList className="grid w-full grid-cols-4 bg-secondary/50">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="food">Food</TabsTrigger>
            <TabsTrigger value="drink">Drinks</TabsTrigger>
            <TabsTrigger value="snack">Snacks</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Menu Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              cartItem={getCartItem(item.id)}
            />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No items found</p>
          </div>
        )}
      </main>

      <CartSummary />
    </div>
  );
};

export default Menu;
