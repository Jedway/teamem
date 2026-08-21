import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { INITIAL_TEA_PRODUCTS } from "./seed-data";
import { deriveItemStatus, type Item, type Order } from "./types";

const isServerless = Boolean(
	process.env.VERCEL ||
		process.env.AWS_LAMBDA_FUNCTION_NAME ||
		process.env.NOW_REGION,
);

const DATA_DIR = isServerless
	? path.resolve("/tmp", ".data")
	: path.resolve(process.cwd(), ".data");

const INVENTORY_FILE = path.join(DATA_DIR, "inventory.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

function shouldUseBlob(): boolean {
	return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

async function ensureLocalDataDir() {
	if (!existsSync(DATA_DIR)) {
		await fs.mkdir(DATA_DIR, { recursive: true });
	}
}

// ---------------------------------------------------------------------------
// Vercel Blob Helpers
// ---------------------------------------------------------------------------
async function readJsonFromBlob<T>(filename: string): Promise<T | null> {
	try {
		const { list } = await import("@vercel/blob");
		const response = await list({ prefix: filename });
		const match = response.blobs.find((b) => b.pathname === filename);
		if (!match) return null;

		const res = await fetch(match.url, { cache: "no-store" });
		if (!res.ok) return null;
		return (await res.json()) as T;
	} catch (error) {
		console.error(`Error reading ${filename} from Vercel Blob:`, error);
		return null;
	}
}

async function writeJsonToBlob<T>(filename: string, data: T): Promise<void> {
	try {
		const { put } = await import("@vercel/blob");
		await put(filename, JSON.stringify(data, null, 2), {
			access: "public",
			addRandomSuffix: false,
			contentType: "application/json",
		});
	} catch (error) {
		console.error(`Error writing ${filename} to Vercel Blob:`, error);
	}
}

// ---------------------------------------------------------------------------
// Local Filesystem Helpers
// ---------------------------------------------------------------------------
async function readJsonFromLocal<T>(filePath: string): Promise<T | null> {
	try {
		await ensureLocalDataDir();
		if (!existsSync(filePath)) return null;
		const raw = await fs.readFile(filePath, "utf-8");
		return JSON.parse(raw) as T;
	} catch (error) {
		console.error(`Error reading ${filePath}:`, error);
		return null;
	}
}

async function writeJsonToLocal<T>(filePath: string, data: T): Promise<void> {
	try {
		await ensureLocalDataDir();
		await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
	} catch (error) {
		console.error(`Error writing ${filePath}:`, error);
	}
}

// ---------------------------------------------------------------------------
// Public Storage API
// ---------------------------------------------------------------------------

/**
 * Retrieves the current inventory of tea products.
 * If empty or non-existent, seeds the database with INITIAL_TEA_PRODUCTS.
 */
export async function getInventory(): Promise<Item[]> {
	let items: Item[] | null = null;

	if (shouldUseBlob()) {
		items = await readJsonFromBlob<Item[]>("inventory.json");
	} else {
		items = await readJsonFromLocal<Item[]>(INVENTORY_FILE);
	}

	if (!items || items.length === 0) {
		items = INITIAL_TEA_PRODUCTS.map((item) => ({
			...item,
			status: deriveItemStatus(item.stock),
		}));
		await saveInventory(items);
	} else {
		// Ensure all items have correctly derived statuses
		items = items.map((item) => ({
			...item,
			status: deriveItemStatus(item.stock),
		}));
	}

	return items;
}

/**
 * Saves the inventory of tea products, automatically re-deriving statuses.
 */
export async function saveInventory(items: Item[]): Promise<void> {
	const normalizedItems = items.map((item) => ({
		...item,
		status: deriveItemStatus(item.stock),
	}));

	if (shouldUseBlob()) {
		await writeJsonToBlob("inventory.json", normalizedItems);
	} else {
		await writeJsonToLocal(INVENTORY_FILE, normalizedItems);
	}
}

/**
 * Retrieves all order records.
 */
export async function getOrders(): Promise<Order[]> {
	let orders: Order[] | null = null;

	if (shouldUseBlob()) {
		orders = await readJsonFromBlob<Order[]>("orders.json");
	} else {
		orders = await readJsonFromLocal<Order[]>(ORDERS_FILE);
	}

	if (!orders) {
		orders = [];
		await saveOrders(orders);
	}

	return orders;
}

/**
 * Saves all order records.
 */
export async function saveOrders(orders: Order[]): Promise<void> {
	if (shouldUseBlob()) {
		await writeJsonToBlob("orders.json", orders);
	} else {
		await writeJsonToLocal(ORDERS_FILE, orders);
	}
}

/**
 * Seeds or resets the database with initial tea products and empty orders.
 */
export async function seedDatabase(force = false): Promise<{
	inventory: Item[];
	orders: Order[];
}> {
	const currentInventory = await getInventory();
	if (force || currentInventory.length === 0) {
		const freshInventory = INITIAL_TEA_PRODUCTS.map((item) => ({
			...item,
			status: deriveItemStatus(item.stock),
		}));
		await saveInventory(freshInventory);
		await saveOrders([]);
		return { inventory: freshInventory, orders: [] };
	}

	const currentOrders = await getOrders();
	return { inventory: currentInventory, orders: currentOrders };
}
