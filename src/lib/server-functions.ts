import { createServerFn } from "@tanstack/react-start";
import {
	getInventory,
	getOrders,
	saveInventory,
	saveOrders,
	seedDatabase,
} from "./storage";
import {
	deriveItemStatus,
	type Item,
	type Order,
	type OrderLine,
	type OrderStatus,
} from "./types";

export const getInventoryFn = createServerFn({ method: "GET" }).handler(
	async () => {
		return await getInventory();
	},
);

export const getOrdersFn = createServerFn({ method: "GET" }).handler(
	async () => {
		return await getOrders();
	},
);

export const seedDatabaseFn = createServerFn({ method: "POST" }).handler(
	async () => {
		return await seedDatabase(false);
	},
);

export const checkoutOrderFn = createServerFn({ method: "POST" })
	.validator((data: unknown) => {
		if (!data || typeof data !== "object" || !("items" in data)) {
			throw new Error("Invalid order data");
		}
		const items = (data as { items: OrderLine[] }).items;
		if (!Array.isArray(items) || items.length === 0) {
			throw new Error("Cart is empty");
		}
		return { items };
	})
	.handler(async ({ data }) => {
		const { items: orderLines } = data;

		// 1. Fetch current inventory
		const inventory = await getInventory();

		// 2. Decrement stock for each item in the order
		const updatedInventory = inventory.map((item) => {
			const orderLine = orderLines.find((ol) => ol.itemId === item.id);
			if (orderLine) {
				const newStock = Math.max(0, item.stock - orderLine.qty);
				return {
					...item,
					stock: newStock,
					status: deriveItemStatus(newStock),
				};
			}
			return item;
		});

		await saveInventory(updatedInventory);

		// 3. Compute total
		const total = orderLines.reduce(
			(sum, line) => sum + line.qty * line.unitPrice,
			0,
		);

		// 4. Create new Order record
		const now = new Date().toISOString();
		const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

		const newOrder: Order = {
			id: orderId,
			items: orderLines,
			total,
			status: "checked_out",
			createdAt: now,
			updatedAt: now,
			receiptUrl: null,
		};

		// 5. Append order to storage
		const orders = await getOrders();
		await saveOrders([newOrder, ...orders]);

		return {
			success: true,
			order: newOrder,
		};
	});

export const updateOrderStatusFn = createServerFn({ method: "POST" })
	.validator((data: unknown) => {
		if (
			!data ||
			typeof data !== "object" ||
			!("orderId" in data) ||
			!("status" in data)
		) {
			throw new Error("Invalid order status payload");
		}
		const payload = data as { orderId: string; status: OrderStatus };
		return payload;
	})
	.handler(async ({ data }) => {
		const { orderId, status } = data;
		const orders = await getOrders();
		const now = new Date().toISOString();
		const updated = orders.map((o) =>
			o.id === orderId ? { ...o, status, updatedAt: now } : o,
		);
		await saveOrders(updated);
		return { success: true };
	});

export const updateOrderLinesFn = createServerFn({ method: "POST" })
	.validator((data: unknown) => {
		if (
			!data ||
			typeof data !== "object" ||
			!("orderId" in data) ||
			!("items" in data)
		) {
			throw new Error("Invalid order items payload");
		}
		const payload = data as { orderId: string; items: OrderLine[] };
		return payload;
	})
	.handler(async ({ data }) => {
		const { orderId, items } = data;
		const orders = await getOrders();
		const total = items.reduce(
			(sum, line) => sum + line.qty * line.unitPrice,
			0,
		);
		const now = new Date().toISOString();
		const updated = orders.map((o) =>
			o.id === orderId ? { ...o, items, total, updatedAt: now } : o,
		);
		await saveOrders(updated);
		return { success: true };
	});

export const saveItemFn = createServerFn({ method: "POST" })
	.validator((data: unknown) => {
		if (!data || typeof data !== "object" || !("item" in data)) {
			throw new Error("Invalid item payload");
		}
		const raw = (data as { item: Partial<Item> }).item;
		const name = String(raw.name || "").trim();
		if (!name) throw new Error("Item name is required");

		const price = Math.max(0, Math.round(Number(raw.price) || 0));
		const stock = Math.max(0, Math.round(Number(raw.stock) || 0));
		const category = String(raw.category || "Herbal Infusions").trim();
		const description = String(raw.description || "").trim();
		const image = raw.image ? String(raw.image) : null;
		const id = raw.id ? String(raw.id) : undefined;

		return {
			item: {
				id,
				name,
				price,
				stock,
				category,
				description,
				image,
			},
		};
	})
	.handler(async ({ data }) => {
		const { item: rawItem } = data;
		const inventory = await getInventory();

		const itemId =
			rawItem.id ||
			`tea-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
		const status = deriveItemStatus(rawItem.stock);

		const fullItem: Item = {
			id: itemId,
			name: rawItem.name,
			price: rawItem.price,
			stock: rawItem.stock,
			category: rawItem.category,
			description: rawItem.description,
			image: rawItem.image,
			status,
		};

		const existingIndex = inventory.findIndex((i) => i.id === itemId);
		let updatedInventory: Item[];

		if (existingIndex > -1) {
			updatedInventory = [...inventory];
			updatedInventory[existingIndex] = fullItem;
		} else {
			updatedInventory = [fullItem, ...inventory];
		}

		await saveInventory(updatedInventory);
		return { success: true, item: fullItem };
	});

export const deleteItemFn = createServerFn({ method: "POST" })
	.validator((data: unknown) => {
		if (!data || typeof data !== "object" || !("itemId" in data)) {
			throw new Error("Invalid itemId payload");
		}
		const itemId = String((data as { itemId: unknown }).itemId);
		return { itemId };
	})
	.handler(async ({ data }) => {
		const { itemId } = data;
		const inventory = await getInventory();
		const filtered = inventory.filter((i) => i.id !== itemId);
		await saveInventory(filtered);
		return { success: true };
	});

export const uploadImageFn = createServerFn({ method: "POST" })
	.validator((data: unknown) => {
		if (
			!data ||
			typeof data !== "object" ||
			!("base64" in data) ||
			!("filename" in data)
		) {
			throw new Error("Invalid image upload payload");
		}
		const payload = data as {
			base64: string;
			filename: string;
			contentType?: string;
		};
		return payload;
	})
	.handler(async ({ data }) => {
		const { base64, filename, contentType = "image/jpeg" } = data;

		if (
			process.env.BLOB_READ_WRITE_TOKEN &&
			(process.env.VERCEL || process.env.USE_VERCEL_BLOB === "true")
		) {
			const { put } = await import("@vercel/blob");
			const buffer = Buffer.from(
				base64.replace(/^data:image\/\w+;base64,/, ""),
				"base64",
			);
			const blob = await put(`items/${Date.now()}-${filename}`, buffer, {
				access: "public",
				contentType,
			});
			return { url: blob.url };
		}

		// Fallback for local development
		return { url: base64 };
	});
