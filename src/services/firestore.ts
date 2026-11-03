/**
 * Firestore service layer for RattanPDV.
 *
 * All Firestore reads/writes are centralised here so that FoodTruckContext
 * stays clean and can easily fall back to localStorage when Firebase is not
 * configured.
 *
 * Collections:
 *   orders     – one document per Order
 *   products   – one document per Product
 *   categories – one document per Category
 *   meta       – singleton "state" doc with lastCalledOrderNumber
 */

import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe,
  writeBatch,
  getDoc,
  getDocs,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Order, Product, Category, SystemUser } from '../types';

// ─── Collection refs ────────────────────────────────────────────────────────

const ordersCol     = () => collection(db!, 'orders');
const productsCol   = () => collection(db!, 'products');
const categoriesCol = () => collection(db!, 'categories');
const usersCol      = () => collection(db!, 'users');
const metaDoc       = () => doc(db!, 'meta', 'state');

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Remove undefined fields recursively before sending to Firestore */
function cleanForFirestore<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

// ─── Orders ─────────────────────────────────────────────────────────────────

/** Write a new order (merge so it doesn't clobber existing). */
export async function saveOrder(order: Order): Promise<void> {
  const clean = cleanForFirestore(order);
  await setDoc(doc(ordersCol(), order.id), clean);
}

/** Patch only changed fields on an existing order. */
export async function patchOrder(orderId: string, fields: Partial<Order>): Promise<void> {
  const clean = cleanForFirestore(fields);
  await updateDoc(doc(ordersCol(), orderId), clean as Record<string, unknown>);
}

/**
 * Subscribe to live order updates.
 * Orders are sorted in memory by createdAt descending.
 * @returns unsubscribe function
 */
export function subscribeOrders(
  onData: (orders: Order[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  return onSnapshot(
    ordersCol(),
    snapshot => {
      const orders = snapshot.docs.map(d => d.data() as Order);
      orders.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      onData(orders);
    },
    err => {
      console.error('Firestore subscribeOrders error:', err);
      onError?.(err);
    },
  );
}

// ─── Products ────────────────────────────────────────────────────────────────

/** Overwrite the full products list as individual docs in a batch. */
export async function saveAllProducts(products: Product[]): Promise<void> {
  const batch = writeBatch(db!);
  products.forEach(p => {
    const clean = cleanForFirestore(p);
    batch.set(doc(productsCol(), p.id), clean);
  });
  await batch.commit();
}

/** Subscribe to live product updates. */
export function subscribeProducts(
  onData: (products: Product[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  return onSnapshot(
    productsCol(),
    snapshot => {
      const products = snapshot.docs.map(d => d.data() as Product);
      onData(products);
    },
    err => {
      console.error('Firestore subscribeProducts error:', err);
      onError?.(err);
    },
  );
}

// ─── Categories ──────────────────────────────────────────────────────────────

/** Overwrite all categories in a batch. */
export async function saveAllCategories(categories: Category[]): Promise<void> {
  const batch = writeBatch(db!);

  // First, get all existing category docs so we can delete ones that were removed
  const existing = await getDocs(categoriesCol());
  existing.docs.forEach(d => {
    if (!categories.some(c => c.id === d.id)) {
      batch.delete(doc(categoriesCol(), d.id));
    }
  });

  categories.forEach(c => {
    const clean = cleanForFirestore(c);
    batch.set(doc(categoriesCol(), c.id), clean);
  });
  await batch.commit();
}

/** Subscribe to live category updates. */
export function subscribeCategories(
  onData: (categories: Category[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  return onSnapshot(
    categoriesCol(),
    snapshot => {
      const cats = snapshot.docs.map(d => d.data() as Category);
      onData(cats);
    },
    err => {
      console.error('Firestore subscribeCategories error:', err);
      onError?.(err);
    },
  );
}

// ─── Meta (lastCalledOrderNumber) ────────────────────────────────────────────

/** Persist the last called order number so the TV stays in sync across devices. */
export async function saveLastCalledOrder(orderNumber: number): Promise<void> {
  await setDoc(metaDoc(), { lastCalledOrderNumber: orderNumber }, { merge: true });
}

/** Subscribe to the meta singleton for real-time TV sync. */
export function subscribeMeta(
  onData: (lastCalledOrderNumber: number | null) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  return onSnapshot(
    metaDoc(),
    snap => {
      onData(snap.exists() ? (snap.data().lastCalledOrderNumber ?? null) : null);
    },
    err => {
      console.error('Firestore subscribeMeta error:', err);
      onError?.(err);
    },
  );
}

/** One-time read of meta (used on initial load). */
export async function getLastCalledOrder(): Promise<number | null> {
  const snap = await getDoc(metaDoc());
  return snap.exists() ? (snap.data().lastCalledOrderNumber ?? null) : null;
}

// ─── Seed helpers ────────────────────────────────────────────────────────────

/**
 * Seed initial data into Firestore if the collections are empty.
 * Called once on app startup so new projects get demo data automatically.
 */
export async function seedIfEmpty(
  initialProducts: Product[],
  initialCategories: Category[],
  initialOrders: Order[],
): Promise<void> {
  const [pSnap, cSnap, oSnap] = await Promise.all([
    getDocs(productsCol()),
    getDocs(categoriesCol()),
    getDocs(ordersCol()),
  ]);

  const batch = writeBatch(db!);

  if (pSnap.empty) {
    initialProducts.forEach(p => {
      const clean = cleanForFirestore(p);
      batch.set(doc(productsCol(), p.id), clean);
    });
  }
  if (cSnap.empty) {
    initialCategories.forEach(c => {
      const clean = cleanForFirestore(c);
      batch.set(doc(categoriesCol(), c.id), clean);
    });
  }
  if (oSnap.empty) {
    initialOrders.forEach(o => {
      const clean = cleanForFirestore(o);
      batch.set(doc(ordersCol(), o.id), clean);
    });
  }

  await batch.commit();
}

// ─── User Management ────────────────────────────────────────────────────────

/**
 * Ensures default user 'guilherme' exists in Firestore.
 */
export async function seedDefaultUserIfEmpty(): Promise<void> {
  try {
    const userDocRef = doc(usersCol(), 'guilherme');
    const snap = await getDoc(userDocRef);

    if (!snap.exists()) {
      await setDoc(userDocRef, {
        username: 'guilherme',
        name: 'Guilherme',
        password: '123456',
        role: 'Gerente',
        active: true,
        createdAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.warn('Could not seed default user in Firestore (may be offline or restricted):', err);
  }
}

/**
 * Validates credentials against Firestore 'users' collection.
 * Flexible enough to match Portuguese or English field names:
 * (username/usuario/login/email, password/senha/pin, name/nome, role/cargo).
 */
export async function validateUserInFirestore(
  usernameInput: string,
  passwordInput: string
): Promise<SystemUser | null> {
  const cleanUser = usernameInput.trim().toLowerCase();
  const cleanPass = passwordInput.trim();

  try {
    // 1. First check if document exists with id matching the username directly
    const directDocRef = doc(usersCol(), cleanUser);
    const directSnap = await getDoc(directDocRef);

    if (directSnap.exists()) {
      const data = directSnap.data();
      const u = (data.username || data.usuario || data.login || data.email || directSnap.id).toString().trim().toLowerCase();
      const p = (data.password || data.senha || data.pin || '').toString().trim();
      const isActive = data.active !== false && data.ativo !== false;

      if ((u === cleanUser || directSnap.id.toLowerCase() === cleanUser) && p === cleanPass && isActive) {
        return {
          id: directSnap.id,
          name: data.name || data.nome || data.displayName || 'Guilherme',
          username: u || cleanUser,
          role: data.role || data.cargo || data.funcao || 'Operador',
          active: true,
        };
      }
    }

    // 2. Scan all documents in 'users' collection
    const querySnapshot = await getDocs(usersCol());
    for (const d of querySnapshot.docs) {
      const data = d.data();
      const u = (data.username || data.usuario || data.login || data.email || d.id).toString().trim().toLowerCase();
      const p = (data.password || data.senha || data.pin || '').toString().trim();
      const isActive = data.active !== false && data.ativo !== false;

      if ((u === cleanUser || d.id.toLowerCase() === cleanUser) && p === cleanPass && isActive) {
        return {
          id: d.id,
          name: data.name || data.nome || data.displayName || 'Operador',
          username: u || cleanUser,
          role: data.role || data.cargo || data.funcao || 'Operador',
          active: true,
        };
      }
    }
  } catch (err) {
    console.error('Error querying users collection in Firestore:', err);
    throw err;
  }

  return null;
}

