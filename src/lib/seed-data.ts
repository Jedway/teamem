import { deriveItemStatus, type Item } from "./types";

export const INITIAL_TEA_PRODUCTS: Item[] = [
	{
		id: "tea-hibiscus-zest",
		name: "Royal Hibiscus Zest",
		description:
			"Sun-dried Nigerian hibiscus calyces infused with sweet orange peel, dried ginger, and clove. Tart, vibrant, and invigorating hot or iced.",
		price: 4500,
		stock: 18,
		category: "Herbal Infusions",
		image: null,
		status: deriveItemStatus(18),
	},
	{
		id: "tea-calabar-earl-grey",
		name: "Calabar Earl Grey",
		description:
			"Full-bodied single-estate black tea scented with cold-pressed Italian bergamot and blue cornflower petals. Citrusy, bold, and aromatic.",
		price: 5200,
		stock: 9,
		category: "Black Tea",
		image: null,
		status: deriveItemStatus(9),
	},
	{
		id: "tea-jos-green",
		name: "Plateau Highland Green",
		description:
			"Grown in the cool elevations of the Jos Plateau. Steamed whole green tea leaves with gentle grassy notes, sweet lingering vegetal finish.",
		price: 6000,
		stock: 4, // low stock (<= 5)
		category: "Green Tea",
		image: null,
		status: deriveItemStatus(4),
	},
	{
		id: "tea-lemongrass-ginger",
		name: "Lemongrass & Ginger Tonic",
		description:
			"Wild-harvested lemongrass stalks paired with spicy sun-cured ginger roots. Soothing, clarifying, and naturally caffeine-free.",
		price: 4000,
		stock: 22,
		category: "Herbal Infusions",
		image: null,
		status: deriveItemStatus(22),
	},
	{
		id: "tea-spiced-chai",
		name: "Warming Spiced Chai Masala",
		description:
			"Crushed black tea leaves blended with cardamom pods, cinnamon bark, allspice, and black pepper. Rich, comforting, and deeply spicy.",
		price: 5800,
		stock: 0, // sold out (0)
		category: "Spiced Black Tea",
		image: null,
		status: deriveItemStatus(0),
	},
	{
		id: "tea-peppermint-breeze",
		name: "Peppermint Breeze",
		description:
			"Pure crushed Egyptian peppermint leaves. Delivers a crisp, cooling sensation and clean menthol aroma that refreshes the palate.",
		price: 3800,
		stock: 14,
		category: "Herbal Infusions",
		image: null,
		status: deriveItemStatus(14),
	},
	{
		id: "tea-chamomile-honey",
		name: "Chamomile Blossom & Honeycomb",
		description:
			"Whole golden chamomile flower heads with delicate floral sweetness and subtle notes of green apple. The ultimate evening relaxation blend.",
		price: 4800,
		stock: 3, // low stock (<= 5)
		category: "Floral Infusions",
		image: null,
		status: deriveItemStatus(3),
	},
	{
		id: "tea-smoky-oolong",
		name: "Smoky Oolong Reserve",
		description:
			"Artisanal semi-oxidized oolong leaves slow-roasted over charcoal. Complex roasted aroma with notes of dried plum and toasted honey.",
		price: 7500,
		stock: 0, // sold out (0)
		category: "Oolong Tea",
		image: null,
		status: deriveItemStatus(0),
	},
];
