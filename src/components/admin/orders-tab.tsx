import {
	Calendar,
	CheckCircle,
	CheckCircle2,
	Clock,
	Download,
	Edit,
	FileText,
	Loader2,
	PackageCheck,
	RotateCcw,
	Upload,
	XCircle,
} from "lucide-react";
import * as React from "react";
import { exportPurchasedOrdersPdf } from "../../lib/pdf-export";
import { updateOrderStatusFn } from "../../lib/server-functions";
import type { Order } from "../../lib/types";
import { Button } from "../ui/button";
import { OrderEditDialog } from "./order-edit-dialog";

interface OrdersTabProps {
	orders: Order[];
	onRefresh: () => Promise<void> | void;
}

export function OrdersTab({ orders, onRefresh }: OrdersTabProps) {
	const [activeSubTab, setActiveSubTab] = React.useState<
		"checked_out" | "purchased"
	>("checked_out");

	// Dialog & Action states
	const [editingOrder, setEditingOrder] = React.useState<Order | null>(null);
	const [actionInProgressId, setActionInProgressId] = React.useState<
		string | null
	>(null);
	const [isExportingPdf, setIsExportingPdf] = React.useState(false);

	// Date Range Filter States for PURCHASED tab
	const [startDate, setStartDate] = React.useState<string>("");
	const [endDate, setEndDate] = React.useState<string>("");
	const [datePreset, setDatePreset] = React.useState<string>("all");

	// Filter orders by status
	const checkedOutOrders = React.useMemo(
		() => orders.filter((o) => o.status === "checked_out"),
		[orders],
	);

	const allPurchasedOrders = React.useMemo(
		() => orders.filter((o) => o.status === "purchased"),
		[orders],
	);

	// Apply date-range filter to purchased orders
	const filteredPurchasedOrders = React.useMemo(() => {
		return allPurchasedOrders.filter((order) => {
			const orderDate = new Date(order.updatedAt || order.createdAt);
			if (startDate) {
				const start = new Date(`${startDate}T00:00:00`);
				if (orderDate < start) return false;
			}
			if (endDate) {
				const end = new Date(`${endDate}T23:59:59`);
				if (orderDate > end) return false;
			}
			return true;
		});
	}, [allPurchasedOrders, startDate, endDate]);

	const filteredPurchasedRevenue = React.useMemo(
		() => filteredPurchasedOrders.reduce((sum, o) => sum + o.total, 0),
		[filteredPurchasedOrders],
	);

	// Handle Date Presets
	const handlePresetChange = (preset: string) => {
		setDatePreset(preset);
		const today = new Date();
		const todayStr = today.toISOString().split("T")[0];

		if (preset === "all") {
			setStartDate("");
			setEndDate("");
		} else if (preset === "today") {
			setStartDate(todayStr);
			setEndDate(todayStr);
		} else if (preset === "month") {
			const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
				.toISOString()
				.split("T")[0];
			setStartDate(firstDay);
			setEndDate(todayStr);
		} else if (preset === "last30") {
			const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
				.toISOString()
				.split("T")[0];
			setStartDate(thirtyDaysAgo);
			setEndDate(todayStr);
		}
	};

	const handleStatusChange = async (
		orderId: string,
		status: "purchased" | "returned",
	) => {
		setActionInProgressId(orderId);
		try {
			await updateOrderStatusFn({
				data: { orderId, status },
			});
			await onRefresh();
		} catch (err) {
			console.error("Failed to update order status:", err);
			alert("Failed to update order status. Please try again.");
		} finally {
			setActionInProgressId(null);
		}
	};

	const handleExportPdf = () => {
		if (filteredPurchasedOrders.length === 0) {
			alert(
				"No purchased orders found within the selected date range to export.",
			);
			return;
		}

		setIsExportingPdf(true);
		try {
			let label = "All Completed Purchases";
			if (startDate && endDate) {
				label = `${startDate} to ${endDate}`;
			} else if (startDate) {
				label = `From ${startDate}`;
			} else if (endDate) {
				label = `Up to ${endDate}`;
			}

			exportPurchasedOrdersPdf(filteredPurchasedOrders, {
				dateRangeLabel: label,
				filename: `teamem-sales-report-${startDate || "all"}-${endDate || "time"}.pdf`,
			});
		} catch (err) {
			console.error("PDF Export failed:", err);
			alert("Failed to generate PDF. Please try again.");
		} finally {
			setIsExportingPdf(false);
		}
	};

	const formatDate = (isoString: string) => {
		try {
			const date = new Date(isoString);
			return date.toLocaleDateString("en-GB", {
				day: "numeric",
				month: "short",
				year: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			});
		} catch {
			return isoString;
		}
	};

	return (
		<div className="space-y-6">
			{/* Sub-tab Navigation Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-white border border-line shadow-2xs">
				<div className="flex items-center gap-2 bg-foam p-1 rounded-2xl border border-line">
					<button
						type="button"
						onClick={() => setActiveSubTab("checked_out")}
						className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
							activeSubTab === "checked_out"
								? "bg-[#173a40] text-white shadow-xs"
								: "text-[#416166] hover:text-[#173a40]"
						}`}
					>
						<Clock className="w-3.5 h-3.5" />
						<span>CHECKED OUT</span>
						<span
							className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
								activeSubTab === "checked_out"
									? "bg-white/20 text-white"
									: "bg-white text-[#173a40]"
							}`}
						>
							{checkedOutOrders.length}
						</span>
					</button>

					<button
						type="button"
						onClick={() => setActiveSubTab("purchased")}
						className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
							activeSubTab === "purchased"
								? "bg-[#173a40] text-white shadow-xs"
								: "text-[#416166] hover:text-[#173a40]"
						}`}
					>
						<CheckCircle className="w-3.5 h-3.5" />
						<span>PURCHASED</span>
						<span
							className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
								activeSubTab === "purchased"
									? "bg-white/20 text-white"
									: "bg-white text-[#173a40]"
							}`}
						>
							{allPurchasedOrders.length}
						</span>
					</button>
				</div>

				<div className="text-xs text-[#416166] font-bold flex items-center gap-2 self-end sm:self-auto">
					<span>Total Completed Revenue:</span>
					<span className="font-serif text-base font-bold text-emerald-800">
						₦
						{allPurchasedOrders
							.reduce((sum, o) => sum + o.total, 0)
							.toLocaleString("en-NG")}
					</span>
				</div>
			</div>

			{/* ================================================================= */}
			{/* SUB-TAB 1: CHECKED OUT ORDERS */}
			{/* ================================================================= */}
			{activeSubTab === "checked_out" && (
				<div className="space-y-4">
					{checkedOutOrders.length === 0 ? (
						<div className="py-20 text-center space-y-3 rounded-3xl bg-white border border-line shadow-xs">
							<PackageCheck className="w-10 h-10 text-[#2f6a4a] mx-auto" />
							<h3 className="font-serif text-xl font-bold text-[#173a40]">
								No Pending Checkouts
							</h3>
							<p className="text-xs text-[#416166] max-w-sm mx-auto font-medium">
								When buyers place orders via the WhatsApp checkout flow on the
								storefront, they will appear here awaiting fulfillment.
							</p>
						</div>
					) : (
						<div className="grid grid-cols-1 gap-4">
							{checkedOutOrders.map((order) => {
								const isInProgress = actionInProgressId === order.id;

								return (
									<div
										key={order.id}
										className="p-5 rounded-3xl bg-white border border-line shadow-xs space-y-4 transition-all hover:shadow-md"
									>
										{/* Order Top Meta */}
										<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line pb-3">
											<div className="flex items-center gap-2.5">
												<div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center">
													<Clock className="w-4 h-4" />
												</div>
												<div>
													<h4 className="font-serif font-bold text-base text-[#173a40]">
														Order #{order.id.replace("ord_", "")}
													</h4>
													<p className="text-[11px] text-[#416166] font-medium">
														Checked out on {formatDate(order.createdAt)}
													</p>
												</div>
											</div>

											<div className="flex items-center gap-3">
												<span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
													CHECKED OUT (AWAITING PAYMENT)
												</span>
												<span className="font-serif text-xl font-bold text-[#173a40]">
													₦{order.total.toLocaleString("en-NG")}
												</span>
											</div>
										</div>

										{/* Line Items List */}
										<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 bg-foam p-3.5 rounded-2xl border border-line">
											{order.items.map((line) => (
												<div
													key={line.itemId}
													className="flex items-center justify-between text-xs p-2 rounded-xl bg-white border border-line"
												>
													<span className="font-bold text-[#173a40] truncate max-w-[160px]">
														{line.name}
													</span>
													<span className="font-semibold text-[#416166]">
														{line.qty} × ₦
														{line.unitPrice.toLocaleString("en-NG")}
													</span>
												</div>
											))}
										</div>

										{/* Actions Row */}
										<div className="flex flex-wrap items-center justify-between gap-3 pt-2">
											<div className="flex items-center gap-2">
												{/* SOLD Button */}
												<Button
													disabled={isInProgress}
													onClick={() =>
														handleStatusChange(order.id, "purchased")
													}
													className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs gap-1.5 px-4 shadow-2xs cursor-pointer"
												>
													{isInProgress ? (
														<Loader2 className="w-3.5 h-3.5 animate-spin" />
													) : (
														<CheckCircle2 className="w-3.5 h-3.5" />
													)}
													<span>SOLD</span>
												</Button>

												{/* RETURNED Button */}
												<Button
													variant="outline"
													disabled={isInProgress}
													onClick={() =>
														handleStatusChange(order.id, "returned")
													}
													className="border-rose-300 text-rose-700 hover:bg-rose-50 font-bold rounded-xl text-xs gap-1.5 px-3.5 cursor-pointer"
												>
													<XCircle className="w-3.5 h-3.5 text-rose-500" />
													<span>RETURNED</span>
												</Button>

												{/* Edit Line Items */}
												<Button
													variant="outline"
													disabled={isInProgress}
													onClick={() => setEditingOrder(order)}
													className="border-line text-[#173a40] font-bold rounded-xl text-xs gap-1.5 px-3.5 hover:bg-foam cursor-pointer"
												>
													<Edit className="w-3.5 h-3.5 text-[#2f6a4a]" />
													<span>Edit Lines</span>
												</Button>
											</div>

											{/* Receipt Upload button (No-op / disabled per spec) */}
											<Button
												variant="ghost"
												disabled
												className="opacity-50 cursor-not-allowed text-xs text-[#416166] flex items-center gap-1.5 border border-dashed border-line rounded-xl px-3"
												title="Receipt upload is wired to no-op for MVP spec"
											>
												<Upload className="w-3.5 h-3.5" />
												<span>Upload Receipt (Disabled)</span>
											</Button>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>
			)}

			{/* ================================================================= */}
			{/* SUB-TAB 2: PURCHASED ORDERS with PDF Export */}
			{/* ================================================================= */}
			{activeSubTab === "purchased" && (
				<div className="space-y-4">
					{/* Toolbar: Date Range Picker & PDF Export Button */}
					<div className="p-4 rounded-3xl bg-white border border-line shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
						{/* Date Filtering Inputs & Presets */}
						<div className="flex flex-wrap items-center gap-3">
							<div className="flex items-center gap-1.5 bg-foam px-3 py-1.5 rounded-xl border border-line text-xs">
								<Calendar className="w-3.5 h-3.5 text-[#416166]" />
								<span className="text-[#416166] font-bold">From:</span>
								<input
									type="date"
									value={startDate}
									onChange={(e) => {
										setStartDate(e.target.value);
										setDatePreset("custom");
									}}
									className="bg-transparent text-xs text-[#173a40] font-semibold focus:outline-hidden"
								/>
							</div>

							<div className="flex items-center gap-1.5 bg-foam px-3 py-1.5 rounded-xl border border-line text-xs">
								<Calendar className="w-3.5 h-3.5 text-[#416166]" />
								<span className="text-[#416166] font-bold">To:</span>
								<input
									type="date"
									value={endDate}
									onChange={(e) => {
										setEndDate(e.target.value);
										setDatePreset("custom");
									}}
									className="bg-transparent text-xs text-[#173a40] font-semibold focus:outline-hidden"
								/>
							</div>

							{/* Preset Pills */}
							<div className="flex items-center gap-1">
								{[
									{ id: "all", label: "All Time" },
									{ id: "today", label: "Today" },
									{ id: "month", label: "This Month" },
									{ id: "last30", label: "Last 30 Days" },
								].map((p) => (
									<button
										key={p.id}
										type="button"
										onClick={() => handlePresetChange(p.id)}
										className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
											datePreset === p.id
												? "bg-[#173a40] text-white"
												: "bg-foam text-[#416166] hover:text-[#173a40] border border-line"
										}`}
									>
										{p.label}
									</button>
								))}
							</div>

							{(startDate || endDate) && (
								<Button
									variant="ghost"
									size="sm"
									onClick={() => handlePresetChange("all")}
									className="text-xs font-bold text-[#416166] hover:text-rose-600 gap-1 px-2 h-7"
								>
									<RotateCcw className="w-3 h-3" />
									<span>Clear Dates</span>
								</Button>
							)}
						</div>

						{/* Export PDF Button */}
						<Button
							disabled={isExportingPdf || filteredPurchasedOrders.length === 0}
							onClick={handleExportPdf}
							className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs gap-2 px-5 py-2.5 shadow-sm transition-all self-start lg:self-auto cursor-pointer"
						>
							{isExportingPdf ? (
								<>
									<Loader2 className="w-4 h-4 animate-spin" />
									<span>Generating PDF...</span>
								</>
							) : (
								<>
									<Download className="w-4 h-4" />
									<span>Export PDF ({filteredPurchasedOrders.length})</span>
								</>
							)}
						</Button>
					</div>

					{/* Summary metrics of filtered range */}
					<div className="flex items-center justify-between text-xs text-[#416166] font-bold px-2">
						<span>
							Showing <strong>{filteredPurchasedOrders.length}</strong> of{" "}
							<strong>{allPurchasedOrders.length}</strong> completed purchases
						</span>
						<span>
							Filtered Period Revenue:{" "}
							<strong className="text-emerald-900 font-serif text-sm">
								₦{filteredPurchasedRevenue.toLocaleString("en-NG")}
							</strong>
						</span>
					</div>

					{filteredPurchasedOrders.length === 0 ? (
						<div className="py-20 text-center space-y-3 rounded-3xl bg-white border border-line shadow-xs">
							<FileText className="w-10 h-10 text-[#416166]/40 mx-auto" />
							<h3 className="font-serif text-xl font-bold text-[#173a40]">
								No Purchases in Selected Date Range
							</h3>
							<p className="text-xs text-[#416166] max-w-sm mx-auto font-medium">
								Try widening your date filters or switching to "All Time" to
								view past transactions.
							</p>
						</div>
					) : (
						<div className="rounded-3xl bg-white border border-line shadow-xs overflow-hidden">
							<div className="overflow-x-auto">
								<table className="w-full text-left text-sm">
									<thead className="border-b border-line bg-foam text-xs font-bold text-[#173a40] uppercase tracking-wider">
										<tr>
											<th className="px-6 py-4">Date Completed</th>
											<th className="px-4 py-4">Order ID</th>
											<th className="px-4 py-4">Items Purchased</th>
											<th className="px-4 py-4">Total Amount</th>
											<th className="px-6 py-4 text-right">Status</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-line">
										{filteredPurchasedOrders.map((order) => (
											<tr
												key={order.id}
												className="hover:bg-foam/60 transition-colors"
											>
												<td className="px-6 py-4 text-xs text-[#416166] font-medium whitespace-nowrap">
													{formatDate(order.updatedAt || order.createdAt)}
												</td>
												<td className="px-4 py-4 font-mono text-xs font-bold text-[#173a40] whitespace-nowrap">
													#{order.id.replace("ord_", "")}
												</td>
												<td className="px-4 py-4">
													<div className="space-y-1">
														{order.items.map((line) => (
															<div
																key={line.itemId}
																className="text-xs text-[#173a40]"
															>
																<strong>{line.qty}×</strong> {line.name} (₦
																{line.unitPrice.toLocaleString("en-NG")})
															</div>
														))}
													</div>
												</td>
												<td className="px-4 py-4 font-serif font-bold text-base text-emerald-900 whitespace-nowrap">
													₦{order.total.toLocaleString("en-NG")}
												</td>
												<td className="px-6 py-4 text-right whitespace-nowrap">
													<span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
														PURCHASED
													</span>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					)}
				</div>
			)}

			{/* Line Items Edit Dialog */}
			<OrderEditDialog
				open={Boolean(editingOrder)}
				onOpenChange={(open) => !open && setEditingOrder(null)}
				order={editingOrder}
				onSuccess={onRefresh}
			/>
		</div>
	);
}
