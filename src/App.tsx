import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Locations from "./pages/Locations";
import Menu from "./pages/Menu";
import Checkout from "./pages/Checkout";
import Confirmation from "./pages/Confirmation";
import StaffDashboard from "./pages/StaffDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/locations" element={<Locations />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/confirmation" element={<Confirmation />} />
              <Route path="/client/dashboard" element={<ClientDashboard />} />
              <Route path="/staff" element={<StaffDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
