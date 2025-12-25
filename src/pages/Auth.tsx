import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, Stethoscope, Coffee, Utensils, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Location } from '@/types';

// Validation schemas
const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  email: z.string().trim().email('Invalid email address').max(255, 'Email is too long'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
});

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, isLoading, signIn, signUp, demoLogin, profile } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'demo'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupRole, setSignupRole] = useState<'client' | 'staff'>('client');
  const [signupLocation, setSignupLocation] = useState<Location | ''>('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading && profile) {
      if (profile.role === 'staff') {
        navigate('/staff');
      } else {
        navigate('/locations');
      }
    }
  }, [isAuthenticated, isLoading, profile, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = loginSchema.safeParse({ email: loginEmail, password: loginPassword });
    if (!validation.success) {
      toast({
        title: 'Validation Error',
        description: validation.error.errors[0].message,
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setIsSubmitting(false);

    if (error) {
      toast({
        title: 'Login Failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Welcome back!',
        description: 'You have been logged in successfully.',
      });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = signupSchema.safeParse({
      name: signupName,
      email: signupEmail,
      password: signupPassword,
      phone: signupPhone,
    });

    if (!validation.success) {
      toast({
        title: 'Validation Error',
        description: validation.error.errors[0].message,
        variant: 'destructive',
      });
      return;
    }

    if (signupRole === 'staff' && !signupLocation) {
      toast({
        title: 'Location Required',
        description: 'Staff members must select a location.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    const { error } = await signUp(
      signupEmail,
      signupPassword,
      signupName,
      signupPhone || undefined,
      signupRole,
      signupLocation as Location || undefined
    );
    setIsSubmitting(false);

    if (error) {
      toast({
        title: 'Registration Failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Account Created!',
        description: 'You have been registered successfully.',
      });
    }
  };

  const handleDemoLogin = async (role: 'client' | 'staff-medical' | 'staff-bitbites') => {
    setIsSubmitting(true);
    const { error } = await demoLogin(role);
    setIsSubmitting(false);

    if (error) {
      toast({
        title: 'Demo Login Failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Demo Login Successful',
        description: 'Welcome to the demo!',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-20 right-10 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Home
        </Button>

        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <Utensils className="h-8 w-8 text-primary" />
              <span className="font-display text-2xl font-bold">QuickBite</span>
            </div>
            <h1 className="font-display text-3xl font-bold mb-2">Welcome</h1>
            <p className="text-muted-foreground">Sign in or create an account to continue</p>
          </div>

          <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-6">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
                <TabsTrigger value="demo">Demo</TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" variant="hero" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>

              {/* Signup Tab */}
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <Label htmlFor="signup-name">Full Name</Label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="John Doe"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@example.com"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="At least 6 characters"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="signup-phone">Phone (Optional)</Label>
                    <div className="relative mt-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-phone"
                        type="tel"
                        placeholder="+1 234 567 8900"
                        value={signupPhone}
                        onChange={(e) => setSignupPhone(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Role Selection */}
                  <div>
                    <Label>Account Type</Label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <button
                        type="button"
                        onClick={() => setSignupRole('client')}
                        className={`p-4 rounded-xl border-2 transition-all ${signupRole === 'client'
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                          }`}
                      >
                        <User className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <p className="text-sm font-medium">Customer</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSignupRole('staff')}
                        className={`p-4 rounded-xl border-2 transition-all ${signupRole === 'staff'
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                          }`}
                      >
                        <Utensils className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <p className="text-sm font-medium">Staff</p>
                      </button>
                    </div>
                  </div>

                  {/* Location Selection for Staff */}
                  {signupRole === 'staff' && (
                    <div>
                      <Label>Work Location</Label>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        <button
                          type="button"
                          onClick={() => setSignupLocation('medical')}
                          className={`p-4 rounded-xl border-2 transition-all ${signupLocation === 'medical'
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50'
                            }`}
                        >
                          <Stethoscope className="h-5 w-5 mx-auto mb-1 text-primary" />
                          <p className="text-xs font-medium">Medical Cafeteria</p>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSignupLocation('bitbites')}
                          className={`p-4 rounded-xl border-2 transition-all ${signupLocation === 'bitbites'
                              ? 'border-accent bg-accent/10'
                              : 'border-border hover:border-accent/50'
                            }`}
                        >
                          <Coffee className="h-5 w-5 mx-auto mb-1 text-accent" />
                          <p className="text-xs font-medium">Bit Bites</p>
                        </button>
                      </div>
                    </div>
                  )}

                  <Button type="submit" variant="hero" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>

              {/* Demo Tab */}
              <TabsContent value="demo">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground text-center mb-6">
                    Quick access to test the application without registration
                  </p>

                  <Button
                    variant="outline"
                    className="w-full h-auto py-4"
                    onClick={() => handleDemoLogin('client')}
                    disabled={isSubmitting}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold">Customer Demo</p>
                        <p className="text-xs text-muted-foreground">Browse menu and place orders</p>
                      </div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full h-auto py-4"
                    onClick={() => handleDemoLogin('staff-medical')}
                    disabled={isSubmitting}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                        <Stethoscope className="h-6 w-6 text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold">Medical Staff Demo</p>
                        <p className="text-xs text-muted-foreground">Manage Medical Cafeteria orders</p>
                      </div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full h-auto py-4"
                    onClick={() => handleDemoLogin('staff-bitbites')}
                    disabled={isSubmitting}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center">
                        <Coffee className="h-6 w-6 text-accent" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold">Bit Bites Staff Demo</p>
                        <p className="text-xs text-muted-foreground">Manage Bit Bites orders</p>
                      </div>
                    </div>
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
