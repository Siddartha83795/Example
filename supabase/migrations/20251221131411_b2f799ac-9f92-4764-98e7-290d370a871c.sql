-- Create role enum
CREATE TYPE public.app_role AS ENUM ('client', 'staff', 'admin');

-- Create location enum
CREATE TYPE public.app_location AS ENUM ('medical', 'bitbites');

-- Create order status enum
CREATE TYPE public.order_status AS ENUM ('pending', 'preparing', 'ready', 'completed', 'cancelled');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create user_roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'client',
  location app_location, -- Only for staff
  UNIQUE (user_id, role)
);

-- Create menu_items table
CREATE TABLE public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  location app_location NOT NULL,
  image TEXT,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT,
  table_number TEXT,
  location app_location NOT NULL,
  items JSONB NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status order_status DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Get user's staff location
CREATE OR REPLACE FUNCTION public.get_staff_location(_user_id UUID)
RETURNS app_location
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT location
  FROM public.user_roles
  WHERE user_id = _user_id
    AND role = 'staff'
  LIMIT 1
$$;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- User roles policies
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own client role"
ON public.user_roles FOR INSERT
WITH CHECK (auth.uid() = user_id AND role = 'client');

-- Menu items policies (public read)
CREATE POLICY "Anyone can view available menu items"
ON public.menu_items FOR SELECT
USING (available = true);

CREATE POLICY "Staff can manage menu items"
ON public.menu_items FOR ALL
USING (public.has_role(auth.uid(), 'staff') OR public.has_role(auth.uid(), 'admin'));

-- Orders policies
CREATE POLICY "Clients can view their own orders"
ON public.orders FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Staff can view orders for their location"
ON public.orders FOR SELECT
USING (
  public.has_role(auth.uid(), 'staff') 
  AND location = public.get_staff_location(auth.uid())
);

CREATE POLICY "Authenticated users can create orders"
ON public.orders FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can update orders for their location"
ON public.orders FOR UPDATE
USING (
  public.has_role(auth.uid(), 'staff') 
  AND location = public.get_staff_location(auth.uid())
);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', 'User'),
    NEW.email,
    NEW.raw_user_meta_data ->> 'phone'
  );
  
  INSERT INTO public.user_roles (user_id, role, location)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data ->> 'role')::app_role, 'client'),
    (NEW.raw_user_meta_data ->> 'location')::app_location
  );
  
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for orders
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;