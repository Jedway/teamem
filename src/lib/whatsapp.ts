import type { OrderLine } from "./types";

export const WHATSAPP_PHONE_NUMBER = "2348073094612";

/**
 * Formats a number as Nigerian Naira (e.g. ₦4,500).
 */
export function formatNaira(amount: number): string {
	return `₦${amount.toLocaleString("en-NG")}`;
}

/**
 * Builds the structured purchase message and WhatsApp URL.
 *
 * Spec:
 * Hi, goodday, I'd like to purchase the following:
 * {name} {qty}x₦{unitPrice formatted with commas}
 * ...
 * Total: ₦{total formatted}
 * thank you very much.
 */
export function buildWhatsAppMessage(
	items: OrderLine[],
	total: number,
): string {
	const lines = items.map(
		(item) => `${item.name} ${item.qty}x${formatNaira(item.unitPrice)}`,
	);

	return [
		"Hi, goodday, I'd like to purchase the following:",
		...lines,
		`Total: ${formatNaira(total)}`,
		"thank you very much.",
	].join("\n");
}

/**
 * Generates the complete wa.me checkout link.
 */
export function buildWhatsAppCheckoutUrl(
	items: OrderLine[],
	total: number,
): string {
	const message = buildWhatsAppMessage(items, total);
	const encoded = encodeURIComponent(message);
	return `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encoded}`;
}
