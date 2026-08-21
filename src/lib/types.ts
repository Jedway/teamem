export const LOW_STOCK_THRESHOLD = 5;

export type ItemStatus = "in_stock" | "low_stock" | "sold_out";

export type Item = {
	id: string;
	name: string;
	description: string;
	price: number; // NGN, integer
	stock: number;
	category: string; // freeform for now, e.g. "Herbal Infusion", "Black Tea", "Green Tea"
	image: string | null; // blob URL or null -> use placeholder
	status: ItemStatus;
};

export type OrderLine = {
	itemId: string;
	name: string;
	qty: number;
	unitPrice: number;
};

export type OrderStatus = "checked_out" | "purchased" | "returned";

export type Order = {
	id: string;
	items: OrderLine[];
	total: number;
	status: OrderStatus;
	createdAt: string; // ISO date string
	updatedAt: string; // ISO date string
	receiptUrl: string | null;
};

/**
 * Derives the stock status based on the current stock level.
 * - stock === 0 => "sold_out"
 * - stock <= LOW_STOCK_THRESHOLD => "low_stock"
 * - else => "in_stock"
 */
export function deriveItemStatus(stock: number): ItemStatus {
	if (stock <= 0) {
		return "sold_out";
	}
	if (stock <= LOW_STOCK_THRESHOLD) {
		return "low_stock";
	}
	return "in_stock";
}
