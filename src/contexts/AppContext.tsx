"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CartItem, Order, User } from "@/lib/types";
import { products } from "@/lib/mockData";
import { authApi, SmsPurpose } from "@/lib/auth/api";
import { logClientEvent } from "@/lib/clientLog";
import { ApiError } from "@/lib/api";

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  authLoading: boolean;
  routeLoading: boolean;
  authNotice: string | null;
  clearAuthNotice: () => void;

  requestSmsCode: (input: { purpose: SmsPurpose; phone?: string }) => Promise<void>
  signIn: (input: { phone: string; password: string }) => Promise<void>;
  signUp: (input: { phone?: string; password: string; email?: string; first_name?: string; last_name?: string; code?: string }) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  updateProfile: (input: { first_name?: string; last_name?: string }) => Promise<void>;
  changeEmail: (input: { email?: string; code?: string }) => Promise<void>;
  changePhone: (input: { new_phone: string; code?: string }) => Promise<void>;
  changePassword: (input: { new_password: string; code?: string }) => Promise<void>;

  cart: CartItem[];
  addToCart: (productId: string, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  orders: Order[];
  addOrder: (order: Order) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const GUEST_CART_KEY = "cart:guest";
const GUEST_ORDERS_KEY = "orders:guest";
const AUTH_SEEN_KEY = "auth:seen";

function getScopedStorageKey(prefix: "cart" | "orders", userId?: string | number | null) {
  return userId ? `${prefix}:${userId}` : `${prefix}:guest`;
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [routeLoading, setRouteLoading] = useState(false);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem(GUEST_CART_KEY) ?? localStorage.getItem("cart");
    if (savedCart) setCart(JSON.parse(savedCart));

    const savedOrders = localStorage.getItem(GUEST_ORDERS_KEY) ?? localStorage.getItem("orders");
    if (savedOrders) setOrders(JSON.parse(savedOrders));
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await authApi.me();
        if (!cancelled) setUser(me);
      } catch {
        if (!cancelled) {
          setUser(null);
          if (localStorage.getItem(AUTH_SEEN_KEY) === "1") {
            setAuthNotice("notification.signedOut");
          }
        }
      } finally {
        if (!cancelled) setAuthLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setRouteLoading(true);
    const timer = setTimeout(() => setRouteLoading(false), 220);
    return () => clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    const onAuthExpired = () => {
      setUser(null);
      setAuthNotice("notification.signedOut");
      logClientEvent('auth_expired');
    };

    window.addEventListener('app:auth-expired', onAuthExpired as EventListener);
    return () => window.removeEventListener('app:auth-expired', onAuthExpired as EventListener);
  }, []);

  useEffect(() => {
    const key = getScopedStorageKey("cart", user?.id ?? null);
    localStorage.setItem(key, JSON.stringify(cart));
  }, [cart, user?.id]);

  useEffect(() => {
    const key = getScopedStorageKey("orders", user?.id ?? null);
    localStorage.setItem(key, JSON.stringify(orders));
  }, [orders, user?.id]);

  useEffect(() => {
    const userId = user?.id ?? null;
    const cartKey = getScopedStorageKey("cart", userId);
    const ordersKey = getScopedStorageKey("orders", userId);

    const savedCart = localStorage.getItem(cartKey);
    setCart(savedCart ? JSON.parse(savedCart) : []);

    const savedOrders = localStorage.getItem(ordersKey);
    setOrders(savedOrders ? JSON.parse(savedOrders) : []);
  }, [user?.id]);

  const addToCart = (productId: string, quantity: number = 1) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === productId);
      if (existing) {
        return prev.map((i) => (i.product.id === productId ? { ...i, quantity: i.quantity + quantity } : i));
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) => prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i)));
  };

  const clearCart = () => setCart([]);

  const addOrder = (order: Order) => setOrders((prev) => [order, ...prev]);

  const requestSmsCode = async (input: { purpose: SmsPurpose; phone?: string }) => {
    await authApi.requestSmsCode(input);
  };

  const signIn = async (input: { phone: string; password: string }) => {
    setAuthLoading(true);
    try {
      await authApi.signIn(input);
      const me = await authApi.me();
      setUser(me);
      setAuthNotice(null);
      localStorage.setItem(AUTH_SEEN_KEY, "1");
      logClientEvent('sign_in_success');
    } finally {
      setAuthLoading(false);
    }
  };

  const signUp = async (input: { phone?: string; password: string; email?: string; first_name?: string; last_name?: string; code?: string }) => {
    setAuthLoading(true);
    try {
      await authApi.signUp(input);
      const me = await authApi.me();
      setUser(me);
      localStorage.setItem(AUTH_SEEN_KEY, "1");
      logClientEvent('sign_up_success');
    } finally {
      setAuthLoading(false);
    }
  };

  const signOut = async () => {
    setAuthLoading(true);
    try {
      await authApi.signOut();
      logClientEvent('sign_out');
    } catch (error) {
      // Silently ignore auth errors during sign-out — if the token is already expired
      // the session is effectively terminated. Log unexpected errors only.
      if (!(error instanceof ApiError && error.status === 401)) {
        console.error('Unexpected error during sign out:', error);
      }
    } finally {
      localStorage.removeItem(AUTH_SEEN_KEY);
      setUser(null);
      setAuthLoading(false);
    }
  };

  const refreshSession = async () => {
    try {
      await authApi.refresh();
      const me = await authApi.me();
      setUser(me);
    } catch {
      setUser(null);
    }
  };

  const updateProfile = async (input: { first_name?: string; last_name?: string }) => {
    const updated = await authApi.updateProfile(input);
    setUser(updated);
  };

  const changeEmail = async (input: { email?: string; code?: string }) => {
    const updated = await authApi.changeEmail(input);
    setUser(updated);
  };

  const changePhone = async (input: { new_phone: string; code?: string }) => {
    const updated = await authApi.changePhone(input);
    setUser(updated);
  };

  const changePassword = async (input: { new_password: string; code?: string }) => {
    await authApi.changePassword(input);
    setUser(null);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        authLoading,
        routeLoading,
        authNotice,
        clearAuthNotice: () => setAuthNotice(null),
        requestSmsCode,
        signIn,
        signUp,
        signOut,
        refreshSession,
        updateProfile,
        changeEmail,
        changePhone,
        changePassword,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        orders,
        addOrder,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
