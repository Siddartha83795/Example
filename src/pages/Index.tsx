import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Utensils, Users, Zap, ArrowRight, Coffee, Stethoscope, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, profile, demoLogin, isLoading } = useAuth();

  const handleClientDemo = async () => {
    const { error } = await demoLogin('client');
    if (!error) {
      navigate('/locations');
    }
  };

  const handleStaffDemo = async (location: 'medical' | 'bitbites') => {
    const demoRole = location === 'medical' ? 'staff-medical' : 'staff-bitbites';
    const { error } = await demoLogin(demoRole);
    if (!error) {
      navigate('/staff');
    }
  };

  const handleGetStarted = () => {
    if (isAuthenticated && profile) {
      if (profile.role === 'staff') {
        navigate('/staff');
      } else {
        navigate('/locations');
      }
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-20 right-10 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        
        <div className="container relative mx-auto px-4 py-20 lg:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/50 px-4 py-2 backdrop-blur-sm animate-fade-in">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Fast & Easy Ordering</span>
            </div>

            <h1 className="mb-6 font-display text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl animate-slide-up">
              Order Food,{' '}
              <span className="gradient-text">Skip the Line</span>
            </h1>

            <p className="mb-10 text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Quick ordering from Medical Cafeteria and Bit Bites. 
              Place your order, get a token, and pick up when ready.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Button
                variant="hero"
                size="xl"
                onClick={handleGetStarted}
                className="gap-2"
              >
                <Utensils className="h-5 w-5" />
                {isAuthenticated ? 'Continue Ordering' : 'Get Started'}
                <ArrowRight className="h-5 w-5" />
              </Button>
              
              {!isAuthenticated && (
                <Button
                  variant="outline"
                  size="xl"
                  onClick={() => navigate('/auth')}
                  className="gap-2"
                >
                  <LogIn className="h-5 w-5" />
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Locations Preview */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold mb-4">Two Locations, One App</h2>
            <p className="text-muted-foreground">Choose your favorite spot and start ordering</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-8 transition-all duration-300 hover:border-primary/50 hover:shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative z-10">
                <div className="mb-4 inline-flex rounded-xl bg-primary/20 p-4">
                  <Stethoscope className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-display text-2xl font-bold mb-2">Medical Cafeteria</h3>
                <p className="text-muted-foreground mb-4">
                  Healthy and nutritious meals designed for wellness. Fresh juices, 
                  salads, and balanced thalis.
                </p>
                <div className="flex gap-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-secondary">Healthy</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-secondary">Fresh</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-secondary">Nutritious</span>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-8 transition-all duration-300 hover:border-accent/50 hover:shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative z-10">
                <div className="mb-4 inline-flex rounded-xl bg-accent/20 p-4">
                  <Coffee className="h-8 w-8 text-accent" />
                </div>
                <h3 className="font-display text-2xl font-bold mb-2">Bit Bites</h3>
                <p className="text-muted-foreground mb-4">
                  Quick bites and cafe favorites. Burgers, wraps, 
                  specialty coffees, and delicious snacks.
                </p>
                <div className="flex gap-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-secondary">Fast Food</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-secondary">Coffee</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-secondary">Snacks</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent">
                <Utensils className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="font-display text-lg font-bold mb-2">Easy Ordering</h3>
              <p className="text-sm text-muted-foreground">Browse menu, add to cart, checkout in seconds</p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent">
                <Zap className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="font-display text-lg font-bold mb-2">Instant Token</h3>
              <p className="text-sm text-muted-foreground">Get your unique token immediately after payment</p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent">
                <Users className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="font-display text-lg font-bold mb-2">Skip the Queue</h3>
              <p className="text-sm text-muted-foreground">No waiting in line, just pick up when ready</p>
            </div>
          </div>
        </div>
      </section>

      {/* Staff Demo Section */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display text-2xl font-bold mb-4">Quick Demo Access</h2>
            <p className="text-muted-foreground mb-8">
              Try the app instantly without registration
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="default"
                size="lg"
                onClick={handleClientDemo}
                className="gap-2"
                disabled={isLoading}
              >
                <Utensils className="h-4 w-4" />
                Customer Demo
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleStaffDemo('medical')}
                className="gap-2"
                disabled={isLoading}
              >
                <Stethoscope className="h-4 w-4" />
                Medical Staff Demo
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleStaffDemo('bitbites')}
                className="gap-2"
                disabled={isLoading}
              >
                <Coffee className="h-4 w-4" />
                Bit Bites Staff Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 QuickBite Express. Demo Application.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
