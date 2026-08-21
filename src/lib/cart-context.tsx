import * as React from "react";
import type { Item, OrderLine } from "./types";

interface CartContextType {
	items: OrderLine[];
	addItem: (item: Item, qty?: number) => void;
	updateQty: (itemId: string, qty: number) => void;
	removeItem: (itemId: string) => void;
	clearCart: () => void;
	totalItems: number;
	totalPrice: number;
	isCartOpen: boolean;
	setIsCartOpen: (open: boolean) => void;
}

const CartContext = React.createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "teamem_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
	const [items, setItems] = React.useState<OrderLine[]>([]);
	const [isCartOpen, setIsCartOpen] = React.useState(false);
	const [isHydrated, setIsHydrated] = React.useState(false);

	// Load from sessionStorage on mount
	React.useEffect(() => {
		try {
			const saved = sessionStorage.getItem(STORAGE_KEY);
			if (saved) {
				const parsed = JSON.parse(saved);
				if (Array.isArray(parsed)) {
					setItems(parsed);
				}
			}
		} catch (e) {
			console.error("Failed to load cart from sessionStorage:", e);
		} finally {
			setIsHydrated(true);
		}
	}, []);

	// Save to sessionStorage on change
	React.useEffect(() => {
		if (!isHydrated) return;
		try {
			sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
		} catch (e) {
			console.error("Failed to save cart to sessionStorage:", e);
		}
	}, [items, isHydrated]);

	const addItem = React.useCallback((item: Item, qty = 1) => {
		if (item.stock <= 0 || qty <= 0) return;

		setItems((prev) => {
			const existingIndex = prev.findIndex((line) => line.itemId === item.id);
			if (existingIndex > -1) {
				const updated = [...prev];
				const newQty = Math.min(item.stock, updated[existingIndex].qty + qty);
				updated[existingIndex] = {
					...updated[existingIndex],
					qty: newQty,
				};
				return updated;
			}
			return [
				...prev,
				{
					itemId: item.id,
					name: item.name,
					qty: Math.min(item.stock, qty),
					unitPrice: item.price,
				},
			];
		});
	}, []);

	const updateQty = React.useCallback((itemId: string, qty: number) => {
		setItems((prev) => {
			if (qty <= 0) {
				return prev.filter((line) => line.itemId !== itemId);
			}
			return prev.map((line) =>
				line.itemId === itemId ? { ...line, qty } : line,
			);
		});
	}, []);

	const removeItem = React.useCallback((itemId: string) => {
		setItems((prev) => prev.filter((line) => line.itemId !== itemId));
	}, []);

	const clearCart = React.useCallback(() => {
		setItems([]);
		try {
			sessionStorage.removeItem(STORAGE_KEY);
		} catch {
			// ignore
		}
	}, []);

	const totalItems = React.useMemo(
		() => items.reduce((sum, line) => sum + line.qty, 0),
		[items],
	);

	const totalPrice = React.useMemo(
		() => items.reduce((sum, line) => sum + line.qty * line.unitPrice, 0),
		[items],
	);

	const value = React.useMemo(
		() => ({
			items,
			addItem,
			updateQty,
			removeItem,
			clearCart,
			totalItems,
			totalPrice,
			isCartOpen,
			setIsCartOpen,
		}),
		[
			items,
			addItem,
			updateQty,
			removeItem,
			clearCart,
			totalItems,
			totalPrice,
			isCartOpen,
		],
	);

	return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
	const context = React.useContext(CartContext);
	if (!context) {
		throw new Error("useCart must be used within a CartProvider");
	}
	return context;
}
