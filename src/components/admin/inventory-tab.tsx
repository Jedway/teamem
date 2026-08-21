import {
	AlertTriangle,
	CheckCircle2,
	Edit3,
	Filter,
	Minus,
	Package,
	Plus,
	RotateCcw,
	Search,
	Sparkles,
	Trash2,
	XCircle,
} from "lucide-react";
import * as React from "react";
import { deleteItemFn, saveItemFn } from "../../lib/server-functions";
import type { Item } from "../../lib/types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ItemFormDialog } from "./item-form-dialog";

interface InventoryTabProps {
	items: Item[];
	onRefresh: () => Promise<void> | void;
}

export function InventoryTab({ items, onRefresh }: InventoryTabProps) {
	const [searchQuery, setSearchQuery] = React.useState("");
	const [categoryFilter, setCategoryFilter] = React.useState("all");

	// Dialog states
	const [isFormOpen, setIsFormOpen] = React.useState(false);
	const [editingItem, setEditingItem] = React.useState<Item | null>(null);
	const [deletingId, setDeletingId] = React.useState<string | null>(null);

	// Quick stock update in flight
	const [updatingStockId, setUpdatingStockId] = React.useState<string | null>(
		null,
	);

	// Summary Statistics
	const stats = React.useMemo(() => {
		const totalBlends = items.length;
		const totalStockUnits = items.reduce((sum, item) => sum + item.stock, 0);
		const inStockCount = items.filter((i) => i.status === "in_stock").length;
		const lowStockCount = items.filter((i) => i.status === "low_stock").length;
		const soldOutCount = items.filter((i) => i.status === "sold_out").length;

		return {
			totalBlends,
			totalStockUnits,
			inStockCount,
			lowStockCount,
			soldOutCount,
		};
	}, [items]);

	// Extract unique categories
	const categories = React.useMemo(() => {
		const cats = Array.from(new Set(items.map((i) => i.category)));
		return ["all", ...cats];
	}, [items]);

	// Filter items
	const filteredItems = React.useMemo(() => {
		return items
			.filter((item) => {
				if (categoryFilter !== "all" && item.category !== categoryFilter) {
					return false;
				}
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
	}, [items, categoryFilter, searchQuery]);

	// Quick stock adjust
	const handleAdjustStock = async (item: Item, delta: number) => {
		const newStock = Math.max(0, item.stock + delta);
		if (newStock === item.stock || updatingStockId) return;

		setUpdatingStockId(item.id);
		try {
			await saveItemFn({
				data: {
					item: {
						...item,
						stock: newStock,
					},
				},
			});
			await onRefresh();
		} catch (err) {
			console.error("Failed to adjust stock:", err);
		} finally {
			setUpdatingStockId(null);
		}
	};

	// Delete item
	const handleDelete = async (itemId: string, itemName: string) => {
		if (
			!window.confirm(
				`Are you sure you want to delete "${itemName}" from the catalog?`,
			)
		) {
			return;
		}

		setDeletingId(itemId);
		try {
			await deleteItemFn({
				data: { itemId },
			});
			await onRefresh();
		} catch (err) {
			console.error("Failed to delete item:", err);
			alert("Failed to delete the blend. Please try again.");
		} finally {
			setDeletingId(null);
		}
	};

	const handleOpenAdd = () => {
		setEditingItem(null);
		setIsFormOpen(true);
	};

	const handleOpenEdit = (item: Item) => {
		setEditingItem(item);
		setIsFormOpen(true);
	};

	return (
		<div className="space-y-6">
			{/* Stats Cards Row */}
			<div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
				<div className="p-4 sm:p-5 rounded-2xl bg-white border border-line shadow-2xs space-y-1">
					<div className="flex items-center justify-between text-[#416166]">
						<span className="text-[11px] font-bold uppercase tracking-wider">
							Total Blends
						</span>
						<Package className="w-4 h-4 text-[#2f6a4a]" />
					</div>
					<p className="font-serif text-2xl sm:text-3xl font-bold text-[#173a40]">
						{stats.totalBlends}
					</p>
				</div>

				<div className="p-4 sm:p-5 rounded-2xl bg-white border border-line shadow-2xs space-y-1">
					<div className="flex items-center justify-between text-[#416166]">
						<span className="text-[11px] font-bold uppercase tracking-wider">
							Total Stock
						</span>
						<Sparkles className="w-4 h-4 text-[#328f97]" />
					</div>
					<p className="font-serif text-2xl sm:text-3xl font-bold text-[#173a40]">
						{stats.totalStockUnits}{" "}
						<span className="text-xs font-sans font-normal text-[#416166]">
							units
						</span>
					</p>
				</div>

				<div className="p-4 sm:p-5 rounded-2xl bg-white border border-emerald-200 shadow-2xs space-y-1">
					<div className="flex items-center justify-between text-emerald-800">
						<span className="text-[11px] font-bold uppercase tracking-wider">
							In Stock
						</span>
						<CheckCircle2 className="w-4 h-4 text-emerald-600" />
					</div>
					<p className="font-serif text-2xl sm:text-3xl font-bold text-emerald-950">
						{stats.inStockCount}
					</p>
				</div>

				<div className="p-4 sm:p-5 rounded-2xl bg-white border border-amber-200 shadow-2xs space-y-1">
					<div className="flex items-center justify-between text-amber-800">
						<span className="text-[11px] font-bold uppercase tracking-wider">
							Low Stock
						</span>
						<AlertTriangle className="w-4 h-4 text-amber-600" />
					</div>
					<p className="font-serif text-2xl sm:text-3xl font-bold text-amber-950">
						{stats.lowStockCount}
					</p>
				</div>

				<div className="col-span-2 lg:col-span-1 p-4 sm:p-5 rounded-2xl bg-white border border-rose-200 shadow-2xs space-y-1">
					<div className="flex items-center justify-between text-rose-800">
						<span className="text-[11px] font-bold uppercase tracking-wider">
							Sold Out
						</span>
						<XCircle className="w-4 h-4 text-rose-600" />
					</div>
					<p className="font-serif text-2xl sm:text-3xl font-bold text-rose-950">
						{stats.soldOutCount}
					</p>
				</div>
			</div>

			{/* Filter & Action Toolbar */}
			<div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-3xl bg-white border border-line shadow-2xs">
				<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 grow max-w-xl">
					{/* Search */}
					<div className="relative grow">
						<Search className="w-4 h-4 text-[#416166] absolute left-3.5 top-1/2 -translate-y-1/2" />
						<Input
							type="text"
							placeholder="Filter by blend name or notes..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10 rounded-xl bg-foam border-line text-sm text-[#173a40] focus:bg-white"
						/>
					</div>

					{/* Category Select */}
					<select
						value={categoryFilter}
						onChange={(e) => setCategoryFilter(e.target.value)}
						className="px-3.5 py-2 rounded-xl bg-foam border border-line text-xs font-bold text-[#173a40] focus:outline-hidden focus:ring-2 focus:ring-[#328f97] cursor-pointer"
					>
						{categories.map((cat) => (
							<option key={cat} value={cat}>
								{cat === "all" ? "All Categories" : cat}
							</option>
						))}
					</select>
				</div>

				{/* Add New Blend Trigger Button */}
				<Button
					onClick={handleOpenAdd}
					className="bg-[#173a40] hover:bg-[#2f6a4a] text-white font-bold rounded-xl gap-2 shadow-sm transition-all cursor-pointer"
				>
					<Plus className="w-4 h-4" />
					<span>Add New Tea Blend</span>
				</Button>
			</div>

			{/* Inventory Table Container */}
			<div className="rounded-3xl bg-white border border-line shadow-xs overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left text-sm">
						<thead className="border-b border-line bg-foam text-xs font-bold text-[#173a40] uppercase tracking-wider">
							<tr>
								<th className="px-6 py-4">Product</th>
								<th className="px-4 py-4">Category</th>
								<th className="px-4 py-4">Price</th>
								<th className="px-4 py-4">Stock Units</th>
								<th className="px-4 py-4">Status</th>
								<th className="px-6 py-4 text-right">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-line">
							{filteredItems.length === 0 ? (
								<tr>
									<td colSpan={6} className="py-16 text-center text-[#416166]">
										<div className="space-y-2">
											<Filter className="w-8 h-8 mx-auto text-[#416166]/40" />
											<p className="font-semibold text-base">
												No tea blends match your filter
											</p>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => {
													setSearchQuery("");
													setCategoryFilter("all");
												}}
												className="text-xs font-bold text-[#328f97] gap-1"
											>
												<RotateCcw className="w-3.5 h-3.5" />
												<span>Reset Filters</span>
											</Button>
										</div>
									</td>
								</tr>
							) : (
								filteredItems.map((item) => {
									const isUpdating = updatingStockId === item.id;
									const isDeleting = deletingId === item.id;
									const isSoldOut = item.status === "sold_out";
									const isLowStock = item.status === "low_stock";

									return (
										<tr
											key={item.id}
											className="hover:bg-foam/60 transition-colors"
										>
											{/* Thumbnail & Name */}
											<td className="px-6 py-4">
												<div className="flex items-center gap-3.5">
													<div className="w-12 h-12 rounded-xl overflow-hidden bg-foam border border-line shrink-0 flex items-center justify-center">
														<img
															src={item.image || "/placeholder-tea.svg"}
															alt={item.name}
															className="w-full h-full object-cover"
														/>
													</div>
													<div className="space-y-0.5 max-w-xs">
														<h4 className="font-serif font-bold text-sm text-[#173a40] leading-snug">
															{item.name}
														</h4>
														<p className="text-xs text-[#416166] line-clamp-1 font-normal">
															{item.description}
														</p>
													</div>
												</div>
											</td>

											{/* Category */}
											<td className="px-4 py-4 whitespace-nowrap">
												<span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-foam text-[#173a40] border border-line">
													{item.category}
												</span>
											</td>

											{/* Price */}
											<td className="px-4 py-4 whitespace-nowrap font-serif font-bold text-base text-[#173a40]">
												₦{item.price.toLocaleString("en-NG")}
											</td>

											{/* Stock & Quick Adjust Buttons */}
											<td className="px-4 py-4 whitespace-nowrap">
												<div className="flex items-center gap-2">
													<button
														type="button"
														disabled={isUpdating || item.stock === 0}
														onClick={() => handleAdjustStock(item, -1)}
														className="w-6 h-6 rounded-lg bg-foam border border-line flex items-center justify-center text-[#173a40] hover:bg-sand disabled:opacity-30 disabled:pointer-events-none transition-colors"
														aria-label="Decrease stock by 1"
													>
														<Minus className="w-3 h-3" />
													</button>

													<span className="font-mono text-sm font-bold min-w-8 text-center text-[#173a40]">
														{item.stock}
													</span>

													<button
														type="button"
														disabled={isUpdating}
														onClick={() => handleAdjustStock(item, 1)}
														className="w-6 h-6 rounded-lg bg-foam border border-line flex items-center justify-center text-[#173a40] hover:bg-sand disabled:opacity-30 disabled:pointer-events-none transition-colors"
														aria-label="Increase stock by 1"
													>
														<Plus className="w-3 h-3" />
													</button>
												</div>
											</td>

											{/* Status Badge */}
											<td className="px-4 py-4 whitespace-nowrap">
												<span
													className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
														isSoldOut
															? "bg-rose-100 text-rose-800 border border-rose-300"
															: isLowStock
																? "bg-amber-100 text-amber-900 border border-amber-300"
																: "bg-emerald-100 text-emerald-800 border border-emerald-300"
													}`}
												>
													{isSoldOut
														? "SOLD OUT"
														: isLowStock
															? "LOW STOCK"
															: "IN STOCK"}
												</span>
											</td>

											{/* Actions: Edit & Delete */}
											<td className="px-6 py-4 text-right whitespace-nowrap">
												<div className="flex items-center justify-end gap-1.5">
													<Button
														variant="outline"
														size="icon-xs"
														onClick={() => handleOpenEdit(item)}
														className="border-line text-[#173a40] hover:bg-foam"
														aria-label={`Edit ${item.name}`}
													>
														<Edit3 className="w-3.5 h-3.5" />
													</Button>

													<Button
														variant="outline"
														size="icon-xs"
														disabled={isDeleting}
														onClick={() => handleDelete(item.id, item.name)}
														className="border-line text-[#416166] hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50"
														aria-label={`Delete ${item.name}`}
													>
														<Trash2 className="w-3.5 h-3.5" />
													</Button>
												</div>
											</td>
										</tr>
									);
								})
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Item Form Modal */}
			<ItemFormDialog
				open={isFormOpen}
				onOpenChange={setIsFormOpen}
				item={editingItem}
				onSuccess={onRefresh}
			/>
		</div>
	);
}
