import { createFileRoute } from "@tanstack/react-router";
import {
	Check,
	Filter,
	Leaf,
	Plus,
	RotateCcw,
	Search,
	SlidersHorizontal,
	X,
} from "lucide-react";
import * as React from "react";
import { Footer } from "../components/footer";
import { Header } from "../components/header";
import { Stepper } from "../components/stepper";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Slider } from "../components/ui/slider";
import { useCart } from "../lib/cart-context";
import { getInventoryFn } from "../lib/server-functions";
import type { Item } from "../lib/types";

export const Route = createFileRoute("/shop")({
	loader: async () => {
		return await getInventoryFn();
	},
	component: ShopPage,
});

function ShopPage() {
	const initialItems = Route.useLoaderData() as Item[];
	const { addItem } = useCart();

	// Search & Filter States
	const [searchQuery, setSearchQuery] = React.useState("");
	const [selectedCategory, setSelectedCategory] = React.useState("all");

	// Compute min & max prices from dataset
	const minAvailablePrice = React.useMemo(() => {
		if (initialItems.length === 0) return 0;
		return Math.min(...initialItems.map((i) => i.price));
	}, [initialItems]);

	const maxAvailablePrice = React.useMemo(() => {
		if (initialItems.length === 0) return 10000;
		return Math.max(...initialItems.map((i) => i.price));
	}, [initialItems]);

	const [priceRange, setPriceRange] = React.useState<[number, number]>([
		minAvailablePrice,
		maxAvailablePrice,
	]);

	// On-card quantity states: { [itemId]: number }
	const [quantities, setQuantities] = React.useState<Record<string, number>>(
		{},
	);
	// Flash state for button feedback on add: { [itemId]: boolean }
	const [addedFlashes, setAddedFlashes] = React.useState<
		Record<string, boolean>
	>({});

	// Extract unique categories
	const categories = React.useMemo(() => {
		const cats = Array.from(new Set(initialItems.map((i) => i.category)));
		return ["all", ...cats];
	}, [initialItems]);

	// Filter and Sort Items (default alphabetical by name)
	const filteredItems = React.useMemo(() => {
		return initialItems
			.filter((item) => {
				// Category filter
				if (selectedCategory !== "all" && item.category !== selectedCategory) {
					return false;
				}

				// Price filter
				if (item.price < priceRange[0] || item.price > priceRange[1]) {
					return false;
				}

				// Search filter
				if (searchQuery.trim()) {
					const q = searchQuery.toLowerCase();
					const matchName = item.name.toLowerCase().includes(q);
					const matchDesc = item.description.toLowerCase().includes(q);
					const matchCat = item.category.toLowerCase().includes(q);
					if (!matchName && !matchDesc && !matchCat) return false;
				}

				return true;
			})
			.sort((a, b) => a.name.localeCompare(b.name));
	}, [initialItems, selectedCategory, priceRange, searchQuery]);

	// Handle Stepper on Card
	const handleQtyChange = (itemId: string, newQty: number) => {
		setQuantities((prev) => ({
			...prev,
			[itemId]: newQty,
		}));
	};

	// Handle Add to Cart
	const handleAddToCart = (item: Item) => {
		if (item.status === "sold_out") return;
		const qtyToAdd = quantities[item.id] || 1;
		addItem(item, qtyToAdd);

		// Flash button feedback
		setAddedFlashes((prev) => ({ ...prev, [item.id]: true }));
		setTimeout(() => {
			setAddedFlashes((prev) => ({ ...prev, [item.id]: false }));
		}, 1200);
	};

	// Reset Filters
	const handleResetFilters = () => {
		setSearchQuery("");
		setSelectedCategory("all");
		setPriceRange([minAvailablePrice, maxAvailablePrice]);
	};

	const hasActiveFilters =
		searchQuery !== "" ||
		selectedCategory !== "all" ||
		priceRange[0] !== minAvailablePrice ||
		priceRange[1] !== maxAvailablePrice;

	return (
		<div className="min-h-screen flex flex-col selection:bg-emerald-100 selection:text-[#173a40] bg-sand/30">
			<Header />

			<main className="grow">
				{/* ----------------------------------------------------------------- */}
				{/* SHOP HERO */}
				{/* ----------------------------------------------------------------- */}
				<section className="py-12 md:py-16 px-4 sm:px-6 bg-gradient-to-b from-white via-foam to-sand/40 border-b border-line">
					<div className="max-w-6xl mx-auto space-y-4">
						<div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-line text-xs font-bold text-[#2f6a4a] uppercase tracking-widest shadow-2xs">
							<Leaf className="w-3.5 h-3.5" />
							<span>Botanical Catalog</span>
						</div>

						<h1 className="display-title text-4xl sm:text-5xl font-bold text-[#173a40] tracking-tight">
							The Harvest Collection
						</h1>

						<p className="text-base sm:text-lg text-[#416166] max-w-2xl leading-relaxed font-medium">
							Browse single-estate whole leaf teas, revitalizing herbal
							infusions, and warming spice blends. Select your preferred
							quantities and complete checkout on WhatsApp.
						</p>
					</div>
				</section>

				{/* ----------------------------------------------------------------- */}
				{/* FILTER & SEARCH BAR */}
				{/* ----------------------------------------------------------------- */}
				<section className="sticky top-16 sm:top-20 z-30 bg-white border-b border-line py-4 px-4 sm:px-6 shadow-xs">
					<div className="max-w-6xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
						{/* Search Input */}
						<div className="relative grow max-w-md">
							<Search className="w-4 h-4 text-[#416166] absolute left-3.5 top-1/2 -translate-y-1/2" />
							<Input
								type="text"
								placeholder="Search blends, herbs, or flavours..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10 pr-10 py-2.5 rounded-full border-line bg-foam text-sm text-[#173a40] placeholder:text-[#416166]/60 focus:bg-white"
							/>
							{searchQuery && (
								<button
									type="button"
									onClick={() => setSearchQuery("")}
									className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#416166] hover:text-[#173a40]"
									aria-label="Clear search query"
								>
									<X className="w-4 h-4" />
								</button>
							)}
						</div>

						{/* Price Filter Control */}
						<div className="flex items-center gap-4 bg-foam px-4 py-2 rounded-full border border-line">
							<SlidersHorizontal className="w-4 h-4 text-[#416166] shrink-0" />
							<div className="flex flex-col gap-1 w-36 sm:w-44">
								<div className="flex items-center justify-between text-[11px] font-bold text-[#173a40]">
									<span>₦{priceRange[0].toLocaleString("en-NG")}</span>
									<span>₦{priceRange[1].toLocaleString("en-NG")}</span>
								</div>
								<Slider
									min={minAvailablePrice}
									max={maxAvailablePrice}
									step={100}
									value={[priceRange[0], priceRange[1]]}
									onValueChange={(val) => {
										if (Array.isArray(val) && val.length === 2) {
											setPriceRange([val[0], val[1]]);
										}
									}}
								/>
							</div>
						</div>

						{/* Reset Filters */}
						{hasActiveFilters && (
							<Button
								variant="ghost"
								size="sm"
								onClick={handleResetFilters}
								className="text-xs font-bold text-[#416166] hover:text-rose-600 self-start md:self-auto flex items-center gap-1.5"
							>
								<RotateCcw className="w-3.5 h-3.5" />
								<span>Reset</span>
							</Button>
						)}
					</div>

					{/* Category Filter Pills */}
					<div className="max-w-6xl mx-auto pt-3 overflow-x-auto no-scrollbar flex items-center gap-2">
						{categories.map((cat) => {
							const isActive = selectedCategory === cat;
							const label =
								cat === "all" ? `All Teas (${initialItems.length})` : cat;

							return (
								<button
									key={cat}
									type="button"
									onClick={() => setSelectedCategory(cat)}
									className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
										isActive
											? "bg-[#173a40] text-white shadow-xs"
											: "bg-foam text-[#416166] hover:text-[#173a40] hover:bg-sand border border-line"
									}`}
								>
									{label}
								</button>
							);
						})}
					</div>
				</section>

				{/* ----------------------------------------------------------------- */}
				{/* PRODUCT GRID */}
				{/* ----------------------------------------------------------------- */}
				<section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-6">
					{/* Status / Count bar */}
					<div className="flex items-center justify-between text-xs font-bold text-[#416166]">
						<span>
							Showing <strong>{filteredItems.length}</strong> of{" "}
							<strong>{initialItems.length}</strong> teas
						</span>
						<span className="italic font-medium">Alphabetical (A–Z)</span>
					</div>

					{filteredItems.length === 0 ? (
						/* Empty State */
						<div className="py-20 text-center space-y-4 rounded-3xl bg-white border border-line shadow-xs">
							<div className="w-16 h-16 rounded-full bg-foam border border-line mx-auto flex items-center justify-center text-[#416166]">
								<Filter className="w-8 h-8" />
							</div>
							<div className="space-y-1">
								<h3 className="font-serif text-xl font-bold text-[#173a40]">
									No blends found
								</h3>
								<p className="text-sm text-[#416166] max-w-sm mx-auto font-medium">
									Try adjusting your search terms or expanding the price range
									filter.
								</p>
							</div>
							<Button
								onClick={handleResetFilters}
								className="bg-[#173a40] hover:bg-[#2f6a4a] text-white font-bold rounded-full px-6 cursor-pointer"
							>
								Reset All Filters
							</Button>
						</div>
					) : (
						/* Product Card Grid */
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
							{filteredItems.map((item) => {
								const isSoldOut = item.status === "sold_out";
								const isLowStock = item.status === "low_stock";
								const currentQty = quantities[item.id] || 1;
								const isAdded = addedFlashes[item.id];

								return (
									<div
										key={item.id}
										className={`group rounded-3xl bg-white border border-line shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden ${
											isSoldOut ? "opacity-65 grayscale-[30%] bg-foam" : ""
										}`}
									>
										{/* Card Body */}
										<div className="p-6 space-y-4">
											{/* Image & Status Badge */}
											<div className="aspect-4/3 rounded-2xl overflow-hidden bg-foam border border-line relative flex items-center justify-center">
												<img
													src={item.image || "/placeholder-tea.svg"}
													alt={item.name}
													className={`w-full h-full object-cover transition-transform duration-500 ${
														isSoldOut ? "" : "group-hover:scale-105"
													}`}
												/>

												{/* Category Tag */}
												<span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/95 text-[#173a40] border border-line shadow-2xs">
													{item.category}
												</span>

												{/* Stock Status Badge */}
												<span
													className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-2xs ${
														isSoldOut
															? "bg-rose-600 text-white border border-rose-700"
															: isLowStock
																? "bg-amber-100 text-amber-900 border border-amber-300"
																: "bg-emerald-100 text-emerald-800 border border-emerald-300"
													}`}
												>
													{isSoldOut
														? "SOLD OUT"
														: isLowStock
															? `LOW STOCK (${item.stock} left)`
															: "IN STOCK"}
												</span>
											</div>

											{/* Item Details */}
											<div className="space-y-2">
												<h3
													className={`font-serif text-xl font-bold transition-colors ${
														isSoldOut
															? "text-[#416166]"
															: "text-[#173a40] group-hover:text-[#328f97]"
													}`}
												>
													{item.name}
												</h3>
												<p className="text-sm text-[#416166] line-clamp-3 leading-relaxed font-normal">
													{item.description}
												</p>
											</div>
										</div>

										{/* Card Footer: Price, Stepper & Add to Cart */}
										<div className="px-6 py-4 border-t border-line bg-foam space-y-3">
											<div className="flex items-center justify-between">
												<div>
													<span className="text-[10px] font-bold uppercase tracking-wider text-[#416166] block">
														Price (NGN)
													</span>
													<span className="font-serif text-xl font-bold text-[#173a40]">
														₦{item.price.toLocaleString("en-NG")}
													</span>
												</div>

												{/* Quantity Selector on Card (Bounded by Stock) */}
												<Stepper
													value={currentQty}
													min={1}
													max={item.stock || 1}
													disabled={isSoldOut}
													onChange={(newQty) =>
														handleQtyChange(item.id, newQty)
													}
												/>
											</div>

											{/* Add To Cart CTA Button */}
											<Button
												type="button"
												disabled={isSoldOut}
												onClick={() => handleAddToCart(item)}
												className={`w-full font-bold rounded-2xl py-5 transition-all flex items-center justify-center gap-2 cursor-pointer ${
													isSoldOut
														? "bg-slate-200 text-slate-500 cursor-not-allowed border border-line"
														: isAdded
															? "bg-emerald-700 text-white shadow-md"
															: "bg-[#173a40] hover:bg-[#2f6a4a] text-white shadow-sm hover:shadow-md"
												}`}
											>
												{isSoldOut ? (
													<span>Sold Out</span>
												) : isAdded ? (
													<>
														<Check className="w-4 h-4" />
														<span>Added {currentQty} to Cart</span>
													</>
												) : (
													<>
														<Plus className="w-4 h-4" />
														<span>Add to Cart ({currentQty})</span>
													</>
												)}
											</Button>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</section>
			</main>

			<Footer />
		</div>
	);
}
