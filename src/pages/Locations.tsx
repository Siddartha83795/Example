import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import LocationCard from '@/components/LocationCard';
import { useCart } from '@/context/CartContext';
import { Location } from '@/types';

const Locations: React.FC = () => {
  const navigate = useNavigate();
  const { location, setLocation } = useCart();

  const handleLocationSelect = (loc: Location) => {
    setLocation(loc);
  };

  const handleContinue = () => {
    if (location) {
      navigate('/menu');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="font-display text-3xl font-bold mb-3">
              Choose Your Location
            </h1>
            <p className="text-muted-foreground">
              Select where you'd like to order from
            </p>
          </div>

          <div className="grid gap-4 mb-8">
            <LocationCard
              location="medical"
              title="Medical Cafeteria"
              description="Healthy meals, fresh juices, and nutritious options for your wellbeing"
              icon="medical"
              isSelected={location === 'medical'}
              onClick={() => handleLocationSelect('medical')}
            />

            <LocationCard
              location="bitbites"
              title="Bit Bites"
              description="Quick bites, burgers, specialty coffees, and delicious snacks"
              icon="cafe"
              isSelected={location === 'bitbites'}
              onClick={() => handleLocationSelect('bitbites')}
            />
          </div>

          <Button
            variant="hero"
            size="xl"
            className="w-full gap-2"
            disabled={!location}
            onClick={handleContinue}
          >
            Continue to Menu
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Locations;
