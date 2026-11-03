import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useRef,
  ReactNode,
} from 'react';
import {
  Product,
  Order,
  OrderItem,
  OrderStatus,
  OrderType,
  PaymentMethod,
  DailySummary,
  Category,
} from '../types';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_CATEGORIES } from '../mockData';
import { soundManager } from '../utils/sound';
import { isFirebaseConfigured } from '../firebase';
import {
  saveOrder,
  patchOrder,
  subscribeOrders,
  saveAllProducts,
  subscribeProducts,
  saveAllCategories,
  subscribeCategories,
  saveLastCalledOrder,
  subscribeMeta,
  seedIfEmpty,
} from '../services/firestore';

// ─── Types ───────────────────────────────────────────────────────────────────

interface BroadcastEvent {
  type:
    | 'ORDER_CREATED'
    | 'ORDER_STATUS_CHANGED'
    | 'ORDER_CALLED'
    | 'PRODUCTS_UPDATED'
    | 'CATEGORIES_UPDATED';
  payload?: any;
}

interface FoodTruckContextType {
  activeView: 'pdv' | 'kds' | 'tv' | 'menu' | 'reports';
  setActiveView: (view: 'pdv' | 'kds' | 'tv' | 'menu' | 'reports') => void;
  categories: Category[];
  addCategory: (name: string) => void;
  updateCategory: (id: string, name: string) => void;
  deleteCategory: (id: string) => void;
  products: Product[];
  orders: Order[];
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  lastCalledOrderNumber: number | null;
  isFirebase: boolean;
  // Cart
  cart: OrderItem[];
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  customerPhone: string;
  setCustomerPhone: (phone: string) => void;
  orderNotes: string;
  setOrderNotes: (notes: string) => void;
  addToCart: (product: Product, quantity?: number, customization?: OrderItem['customization']) => void;
  updateCartItemQty: (itemId: string, delta: number) => void;
  updateCartItemNotes: (itemId: string, notes: string) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartTotal: number;
  // Order actions
  checkoutOrder: (paymentMethod: PaymentMethod, cashReceived?: number, discount?: number) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  callOrder: (orderNumber: number) => void;
  cancelOrder: (orderId: string) => void;
  // Product actions
  toggleProductAvailability: (productId: string) => void;
  updateProductPrice: (productId: string, newPrice: number) => void;
  updateProductImage: (productId: string, newImage: string) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  deleteProduct: (productId: string) => void;
  // Stats
  dailySummary: DailySummary;
  resetDemoData: () => void;
  simulateSampleOrder: () => void;
}

// ─── Storage keys (localStorage fallback) ───────────────────────────────────

const ORDERS_STORAGE_KEY     = 'rattan_levain_orders_v1';
const PRODUCTS_STORAGE_KEY   = 'rattan_levain_products_v1';
const CATEGORIES_STORAGE_KEY = 'rattan_levain_categories_v1';

// ─── Context ─────────────────────────────────────────────────────────────────

const FoodTruckContext = createContext<FoodTruckContextType | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────────────

export const FoodTruckProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const firebaseMode = isFirebaseConfigured();

  // ── Navigation ──────────────────────────────────────────────────────────
  const [activeView, setActiveView] = useState<'pdv' | 'kds' | 'tv' | 'menu' | 'reports'>('pdv');
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true);
  const [lastCalledOrderNumber, setLastCalledOrderNumber] = useState<number | null>(49);

  // ── Cart ────────────────────────────────────────────────────────────────
  const [cart, setCart]               = useState<OrderItem[]>([]);
  const [orderType, setOrderType]     = useState<OrderType>('dine_in');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [orderNotes, setOrderNotes]   = useState<string>('');

  // ── Persistent data ──────────────────────────────────────────────────────
  const [categories, setCategories] = useState<Category[]>(() => {
    if (firebaseMode) return INITIAL_CATEGORIES; // will be overwritten by Firestore listener
    try {
      const saved = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (saved) {
        const parsed: Category[] = JSON.parse(saved);
        const missing = INITIAL_CATEGORIES.filter(ic => !parsed.some(c => c.id === ic.id));
        return missing.length > 0 ? [...missing, ...parsed] : parsed;
      }
      return INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  const [products, setProducts] = useState<Product[]>(() => {
    if (firebaseMode) return INITIAL_PRODUCTS;
    try {
      const saved = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (saved) {
        const parsed: Product[] = JSON.parse(saved);
        const missing = INITIAL_PRODUCTS.filter(ip => !parsed.some(p => p.id === ip.id));
        return missing.length > 0 ? [...missing, ...parsed] : parsed;
      }
      return INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    if (firebaseMode) return INITIAL_ORDERS;
    try {
      const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  // ── Keep a ref to latest orders for sync callbacks that need it ──────────
  const ordersRef = useRef<Order[]>(orders);
  useEffect(() => { ordersRef.current = orders; }, [orders]);

  // ── Sound ────────────────────────────────────────────────────────────────
  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled);
    soundManager.enabled = enabled;
  };

  // ════════════════════════════════════════════════════════════════════════════
  // FIREBASE MODE — real-time Firestore listeners replace localStorage + BroadcastChannel
  // ════════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (!firebaseMode) return;

    // Seed demo data on first run, then subscribe
    seedIfEmpty(INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_ORDERS).catch(console.error);

    const unsubOrders     = subscribeOrders(setOrders,     console.error);
    const unsubProducts   = subscribeProducts(setProducts, console.error);
    const unsubCategories = subscribeCategories(cats => {
      if (cats && cats.length > 0) {
        setCategories(cats);
      }
    }, console.error);
    const unsubMeta = subscribeMeta(num => {
      if (num !== null) setLastCalledOrderNumber(num);
    }, console.error);

    return () => {
      unsubOrders();
      unsubProducts();
      unsubCategories();
      unsubMeta();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseMode]);

  // ════════════════════════════════════════════════════════════════════════════
  // LOCALSTORAGE MODE — persist on every change + BroadcastChannel for same-browser tabs
  // ════════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (firebaseMode) return;
    try { localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories)); } catch {}
  }, [categories, firebaseMode]);

  useEffect(() => {
    if (firebaseMode) return;
    try { localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products)); } catch {}
  }, [products, firebaseMode]);

  useEffect(() => {
    if (firebaseMode) return;
    try { localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders)); } catch {}
  }, [orders, firebaseMode]);

  // BroadcastChannel (only in localStorage mode — Firebase already handles cross-tab/device sync)
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    if (firebaseMode || !('BroadcastChannel' in window)) return;

    const channel = new BroadcastChannel('truckflow_channel');
    broadcastChannelRef.current = channel;

    channel.onmessage = (event: MessageEvent<BroadcastEvent>) => {
      const { type, payload } = event.data;
      if (type === 'ORDER_CREATED') {
        setOrders(prev => [payload, ...prev.filter((o: Order) => o.id !== payload.id)]);
        soundManager.playNewOrder();
      } else if (type === 'ORDER_STATUS_CHANGED') {
        setOrders(prev => prev.map(o => (o.id === payload.id ? { ...o, ...payload } : o)));
      } else if (type === 'ORDER_CALLED') {
        setLastCalledOrderNumber(payload.orderNumber);
        soundManager.playOrderReady();
      } else if (type === 'PRODUCTS_UPDATED') {
        setProducts(payload);
      } else if (type === 'CATEGORIES_UPDATED') {
        setCategories(payload);
      }
    };

    return () => {
      channel.close();
      broadcastChannelRef.current = null;
    };
  }, [firebaseMode]);

  const broadcastLocal = (event: BroadcastEvent) => {
    if (firebaseMode) return; // Firestore handles cross-device sync
    try {
      const ch = new BroadcastChannel('truckflow_channel');
      ch.postMessage(event);
      ch.close();
    } catch {}
  };

  // ─── Cart operations ─────────────────────────────────────────────────────

  const addToCart = (product: Product, quantity = 1, customization?: OrderItem['customization']) => {
    soundManager.playTap();
    const extrasTotal = customization?.extras?.reduce((sum, e) => sum + e.price, 0) || 0;
    const itemUnitPrice = product.price + extrasTotal;
    const newItem: OrderItem = {
      id: 'cart-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      productId: product.id,
      name: product.name,
      unitPrice: itemUnitPrice,
      quantity,
      customization,
      itemTotal: itemUnitPrice * quantity,
    };
    setCart(prev => [...prev, newItem]);
  };

  const updateCartItemQty = (itemId: string, delta: number) => {
    soundManager.playTap();
    setCart(prev =>
      prev
        .map(item => {
          if (item.id !== itemId) return item;
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          return { ...item, quantity: newQty, itemTotal: (item.itemTotal / item.quantity) * newQty };
        })
        .filter((i): i is OrderItem => i !== null),
    );
  };

  const updateCartItemNotes = (itemId: string, notes: string) => {
    setCart(prev =>
      prev.map(item => {
        if (item.id !== itemId) return item;
        const trimmed = notes.trim();
        const currentCustomization = item.customization || {};
        return {
          ...item,
          customization: trimmed
            ? { ...currentCustomization, notes: trimmed }
            : (currentCustomization.extras?.length || currentCustomization.doneness || currentCustomization.removals?.length)
            ? { ...currentCustomization, notes: undefined }
            : undefined,
        };
      }),
    );
  };

  const removeFromCart = (itemId: string) => {
    soundManager.playTap();
    setCart(prev => prev.filter(i => i.id !== itemId));
  };

  const clearCart = () => {
    soundManager.playTap();
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setOrderNotes('');
  };

  const cartSubtotal = useMemo(() => cart.reduce((acc, item) => acc + item.itemTotal, 0), [cart]);
  const cartTotal    = cartSubtotal;

  // ─── Checkout ────────────────────────────────────────────────────────────

  const checkoutOrder = (paymentMethod: PaymentMethod, cashReceived?: number, discount = 0): Order => {
    const highestNumber = ordersRef.current.reduce((max, o) => Math.max(max, o.orderNumber || 0), 40);
    const orderNumber = highestNumber + 1;
    const total = Math.max(0, cartSubtotal - discount);
    const cashChange =
      paymentMethod === 'cash' && cashReceived && cashReceived > total ? cashReceived - total : 0;

    const newOrder: Order = {
      id: `ORD-${1000 + orderNumber}`,
      orderNumber,
      customerName: customerName.trim() || `Cliente #${orderNumber}`,
      customerPhone: customerPhone.trim() || undefined,
      orderType,
      items: [...cart],
      subtotal: cartSubtotal,
      discount,
      total,
      paymentMethod,
      paymentStatus: 'paid',
      cashReceived: paymentMethod === 'cash' ? cashReceived : undefined,
      cashChange:   paymentMethod === 'cash' ? cashChange   : undefined,
      status: 'queued',
      createdAt: new Date().toISOString(),
      notes: orderNotes.trim() || undefined,
    };

    soundManager.playCashRegister();

    setOrders(prev => [newOrder, ...prev.filter(o => o.id !== newOrder.id)]);

    if (firebaseMode) {
      saveOrder(newOrder).catch(err => {
        console.error('Erro ao salvar pedido no Firestore:', err);
      });
    } else {
      broadcastLocal({ type: 'ORDER_CREATED', payload: newOrder });
    }

    clearCart();
    return newOrder;
  };

  // ─── Order status ─────────────────────────────────────────────────────────

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    soundManager.playTap();
    const now = new Date().toISOString();
    const order = ordersRef.current.find(o => o.id === orderId);
    if (!order) return;

    const updates: Partial<Order> = { status };
    if (status === 'preparing' && !order.startedPrepAt) updates.startedPrepAt = now;
    else if (status === 'ready')     updates.readyAt     = now;
    else if (status === 'delivered') updates.deliveredAt = now;

    setOrders(prev => {
      const updated = prev.map(o => {
        if (o.id !== orderId) return o;
        const patched = { ...o, ...updates };
        if (!firebaseMode) broadcastLocal({ type: 'ORDER_STATUS_CHANGED', payload: patched });
        return patched;
      });
      return updated;
    });

    if (firebaseMode) {
      patchOrder(orderId, updates).catch(err => {
        console.error('Erro ao atualizar status no Firestore:', err);
      });
    }

    if (status === 'ready' && order) {
      callOrder(order.orderNumber);
    }
  };

  const callOrder = (orderNumber: number) => {
    setLastCalledOrderNumber(orderNumber);
    soundManager.playOrderReady();
    if (firebaseMode) {
      saveLastCalledOrder(orderNumber).catch(console.error);
    } else {
      broadcastLocal({ type: 'ORDER_CALLED', payload: { orderNumber } });
    }
  };

  const cancelOrder = (orderId: string) => {
    soundManager.playTap();
    setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status: 'cancelled' as OrderStatus } : o)));
    if (firebaseMode) {
      patchOrder(orderId, { status: 'cancelled' }).catch(console.error);
    } else {
      broadcastLocal({ type: 'ORDER_STATUS_CHANGED', payload: { id: orderId, status: 'cancelled' } });
    }
  };

  // ─── Product management ───────────────────────────────────────────────────

  const _persistProducts = (updated: Product[]) => {
    setProducts(updated);
    if (firebaseMode) {
      saveAllProducts(updated).catch(console.error);
    } else {
      broadcastLocal({ type: 'PRODUCTS_UPDATED', payload: updated });
    }
  };

  const toggleProductAvailability = (productId: string) => {
    soundManager.playTap();
    _persistProducts(products.map(p => (p.id === productId ? { ...p, available: !p.available } : p)));
  };

  const updateProductPrice = (productId: string, newPrice: number) => {
    soundManager.playTap();
    _persistProducts(products.map(p => (p.id === productId ? { ...p, price: newPrice } : p)));
  };

  const updateProductImage = (productId: string, newImage: string) => {
    soundManager.playTap();
    _persistProducts(products.map(p => (p.id === productId ? { ...p, image: newImage } : p)));
  };

  const addProduct = (newProdData: Omit<Product, 'id'>) => {
    soundManager.playTap();
    const newProd: Product = { ...newProdData, id: 'prod-' + Date.now() };
    _persistProducts([...products, newProd]);
  };

  const deleteProduct = (productId: string) => {
    soundManager.playTap();
    _persistProducts(products.filter(p => p.id !== productId));
  };

  // ─── Category management ──────────────────────────────────────────────────

  const _persistCategories = (updated: Category[]) => {
    setCategories(updated);
    if (firebaseMode) {
      saveAllCategories(updated).catch(console.error);
    } else {
      broadcastLocal({ type: 'CATEGORIES_UPDATED', payload: updated });
    }
  };

  const addCategory = (name: string) => {
    soundManager.playTap();
    const trimmed = name.trim();
    if (!trimmed) return;
    const slug = trimmed
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '_');
    const newCat: Category = {
      id: `${slug || 'cat'}_${Date.now().toString().slice(-4)}`,
      name: trimmed,
      iconName: 'ShoppingBag',
    };
    _persistCategories([...categories, newCat]);
  };

  const updateCategory = (id: string, newName: string) => {
    soundManager.playTap();
    const trimmed = newName.trim();
    if (!trimmed) return;
    _persistCategories(categories.map(c => (c.id === id ? { ...c, name: trimmed } : c)));
  };

  const deleteCategory = (id: string) => {
    soundManager.playTap();
    const remaining = categories.filter(c => c.id !== id);
    const fallbackCat = remaining[0]?.id || 'esmagatto';
    const remappedProducts = products.map(p =>
      p.category === id ? { ...p, category: fallbackCat } : p,
    );
    _persistCategories(remaining);
    _persistProducts(remappedProducts);
  };

  // ─── Demo helpers ─────────────────────────────────────────────────────────

  const resetDemoData = () => {
    soundManager.playTap();
    if (firebaseMode) {
      // Re-seed Firestore with initial data
      Promise.all([
        saveAllProducts(INITIAL_PRODUCTS),
        saveAllCategories(INITIAL_CATEGORIES),
        ...INITIAL_ORDERS.map(o => saveOrder(o)),
        saveLastCalledOrder(46),
      ]).catch(console.error);
    } else {
      setOrders(INITIAL_ORDERS);
      setProducts(INITIAL_PRODUCTS);
      setCategories(INITIAL_CATEGORIES);
      setLastCalledOrderNumber(46);
      localStorage.removeItem(ORDERS_STORAGE_KEY);
      localStorage.removeItem(PRODUCTS_STORAGE_KEY);
      localStorage.removeItem(CATEGORIES_STORAGE_KEY);
    }
    clearCart();
  };

  const simulateSampleOrder = () => {
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    const randomQty = Math.floor(Math.random() * 2) + 1;
    const highestNumber = ordersRef.current.reduce((max, o) => Math.max(max, o.orderNumber || 0), 40);
    const orderNumber = highestNumber + 1;
    const sampleOrder: Order = {
      id: `ORD-${1000 + orderNumber}`,
      orderNumber,
      customerName: ['Bruno Henrique', 'Aline Castro', 'Felipe Santos', 'Fernanda Lima', 'Gustavo Rocha'][
        Math.floor(Math.random() * 5)
      ],
      orderType: Math.random() > 0.4 ? 'dine_in' : 'takeaway',
      items: [
        {
          id: 'test-item-' + Date.now(),
          productId: randomProduct.id,
          name: randomProduct.name,
          unitPrice: randomProduct.price,
          quantity: randomQty,
          itemTotal: randomProduct.price * randomQty,
        },
      ],
      subtotal: randomProduct.price * randomQty,
      discount: 0,
      total: randomProduct.price * randomQty,
      paymentMethod: (['pix', 'credit', 'debit', 'cash'] as PaymentMethod[])[Math.floor(Math.random() * 4)],
      paymentStatus: 'paid',
      status: 'queued',
      createdAt: new Date().toISOString(),
    };

    if (firebaseMode) {
      saveOrder(sampleOrder).catch(console.error);
    } else {
      setOrders(prev => [sampleOrder, ...prev]);
      broadcastLocal({ type: 'ORDER_CREATED', payload: sampleOrder });
    }
    soundManager.playNewOrder();
  };

  // ─── Daily summary ────────────────────────────────────────────────────────

  const dailySummary: DailySummary = useMemo(() => {
    const validOrders = orders.filter(o => o.status !== 'cancelled');
    const totalRevenue = validOrders.reduce((sum, o) => sum + o.total, 0);
    const ordersCount  = validOrders.length;
    const averageTicket = ordersCount > 0 ? totalRevenue / ordersCount : 0;

    const prepOrders = validOrders.filter(o => o.startedPrepAt && (o.readyAt || o.deliveredAt));
    let totalPrepMins = 0;
    prepOrders.forEach(o => {
      const start = new Date(o.startedPrepAt!).getTime();
      const end   = new Date(o.readyAt || o.deliveredAt!).getTime();
      totalPrepMins += (end - start) / (1000 * 60);
    });
    const avgPrepMinutes =
      prepOrders.length > 0 ? Math.round((totalPrepMins / prepOrders.length) * 10) / 10 : 8.5;

    const byPaymentMethod: Record<PaymentMethod, { count: number; total: number }> = {
      pix:    { count: 0, total: 0 },
      credit: { count: 0, total: 0 },
      debit:  { count: 0, total: 0 },
      cash:   { count: 0, total: 0 },
    };

    const itemCounts: Record<string, { quantity: number; revenue: number }> = {};

    validOrders.forEach(order => {
      if (byPaymentMethod[order.paymentMethod]) {
        byPaymentMethod[order.paymentMethod].count += 1;
        byPaymentMethod[order.paymentMethod].total += order.total;
      }
      order.items.forEach(item => {
        if (!itemCounts[item.name]) itemCounts[item.name] = { quantity: 0, revenue: 0 };
        itemCounts[item.name].quantity += item.quantity;
        itemCounts[item.name].revenue  += item.itemTotal;
      });
    });

    const topItems = Object.entries(itemCounts)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return { totalRevenue, ordersCount, averageTicket, avgPrepMinutes, byPaymentMethod, topItems };
  }, [orders]);

  // ─── Context value ────────────────────────────────────────────────────────

  return (
    <FoodTruckContext.Provider
      value={{
        activeView, setActiveView,
        categories, addCategory, updateCategory, deleteCategory,
        products,
        orders,
        soundEnabled, setSoundEnabled,
        lastCalledOrderNumber,
        isFirebase: firebaseMode,
        cart,
        orderType, setOrderType,
        customerName, setCustomerName,
        customerPhone, setCustomerPhone,
        orderNotes, setOrderNotes,
        addToCart, updateCartItemQty, updateCartItemNotes, removeFromCart, clearCart,
        cartSubtotal, cartTotal,
        checkoutOrder, updateOrderStatus, callOrder, cancelOrder,
        toggleProductAvailability, updateProductPrice, updateProductImage, addProduct, deleteProduct,
        dailySummary,
        resetDemoData, simulateSampleOrder,
      }}
    >
      {children}
    </FoodTruckContext.Provider>
  );
};

export const useFoodTruck = (): FoodTruckContextType => {
  const context = useContext(FoodTruckContext);
  if (!context) throw new Error('useFoodTruck must be used within a FoodTruckProvider');
  return context;
};
