import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { ExternalLink, History, Leaf, LogOut, Package } from "lucide-react";
import * as React from "react";
import { InventoryTab } from "../../components/admin/inventory-tab";
import { OrdersTab } from "../../components/admin/orders-tab";
import { Button } from "../../components/ui/button";
import { adminLogoutFn, checkAdminAuthFn } from "../../lib/auth";
import { getInventoryFn, getOrdersFn } from "../../lib/server-functions";
import type { Item, Order } from "../../lib/types";

export const Route = createFileRoute("/admin/dashboard")({
	loader: async () => {
		const auth = await checkAdminAuthFn();
		if (!auth.isAuthenticated) {
			throw redirect({ to: "/admin" });
		}

		const [inventory, orders] = await Promise.all([
			getInventoryFn(),
			getOrdersFn(),
		]);

		return {
			inventory: inventory as Item[],
			orders: orders as Order[],
		};
	},
	component: AdminDashboardPage,
});

function AdminDashboardPage() {
	const { inventory, orders } = Route.useLoaderData();
	const [activeTab, setActiveTab] = React.useState<"inventory" | "orders">(
		"inventory",
	);
	const [isLoggingOut, setIsLoggingOut] = React.useState(false);
	const router = useRouter();

	const handleRefresh = async () => {
		await router.invalidate();
	};

	const handleLogout = async () => {
		setIsLoggingOut(true);
		try {
			await adminLogoutFn();
			await router.invalidate();
			await router.navigate({ to: "/admin" });
		} catch (err) {
			console.error("Logout failed:", err);
		} finally {
			setIsLoggingOut(false);
		}
	};

	return (
		<div className="min-h-screen flex flex-col bg-sand/30 selection:bg-emerald-100 selection:text-[#173a40]">
			{/* Admin Header */}
			<header className="sticky top-0 z-30 border-b border-line bg-white shadow-xs">
				<div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
					{/* Left: Brand & Admin Badge */}
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 rounded-full bg-[#2f6a4a]/15 border border-[#2f6a4a]/25 flex items-center justify-center text-[#2f6a4a]">
							<Leaf className="w-4 h-4 text-[#2f6a4a]" />
						</div>
						<div className="flex flex-col">
							<div className="flex items-center gap-2">
								<span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#173a40] leading-none">
									TEAMEM
								</span>
								<span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
									Admin
								</span>
							</div>
							<span className="text-[10px] uppercase tracking-widest font-bold text-[#416166]">
								Management Portal
							</span>
						</div>
					</div>

					{/* Center: Tabs Switcher */}
					<div className="hidden sm:flex items-center gap-1 bg-foam p-1 rounded-full border border-line">
						<button
							type="button"
							onClick={() => setActiveTab("inventory")}
							className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
								activeTab === "inventory"
									? "bg-[#173a40] text-white shadow-xs"
									: "text-[#416166] hover:text-[#173a40]"
							}`}
						>
							<Package className="w-3.5 h-3.5" />
							<span>Inventory ({inventory.length})</span>
						</button>
						<button
							type="button"
							onClick={() => setActiveTab("orders")}
							className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
								activeTab === "orders"
									? "bg-[#173a40] text-white shadow-xs"
									: "text-[#416166] hover:text-[#173a40]"
							}`}
						>
							<History className="w-3.5 h-3.5" />
							<span>Purchase History ({orders.length})</span>
						</button>
					</div>

					{/* Right: Actions */}
					<div className="flex items-center gap-3">
						<a
							href="/shop"
							target="_blank"
							rel="noopener noreferrer"
							className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold text-[#416166] hover:text-[#173a40] transition-colors px-3.5 py-1.5 rounded-full bg-foam border border-line"
						>
							<span>View Storefront</span>
							<ExternalLink className="w-3 h-3" />
						</a>

						<Button
							variant="outline"
							size="sm"
							disabled={isLoggingOut}
							onClick={handleLogout}
							className="border-line text-[#173a40] font-bold rounded-full gap-1.5 text-xs hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 transition-colors cursor-pointer"
						>
							<LogOut className="w-3.5 h-3.5" />
							<span>Logout</span>
						</Button>
					</div>
				</div>

				{/* Mobile Tab Switcher */}
				<div className="flex sm:hidden border-t border-line px-4 py-2 gap-2 bg-white">
					<button
						type="button"
						onClick={() => setActiveTab("inventory")}
						className={`flex-1 py-2 rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
							activeTab === "inventory"
								? "bg-[#173a40] text-white shadow-xs"
								: "bg-foam text-[#416166] border border-line"
						}`}
					>
						Inventory ({inventory.length})
					</button>
					<button
						type="button"
						onClick={() => setActiveTab("orders")}
						className={`flex-1 py-2 rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
							activeTab === "orders"
								? "bg-[#173a40] text-white shadow-xs"
								: "bg-foam text-[#416166] border border-line"
						}`}
					>
						Orders ({orders.length})
					</button>
				</div>
			</header>

			{/* Main Content Area */}
			<main className="grow max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
				{activeTab === "inventory" ? (
					<InventoryTab items={inventory} onRefresh={handleRefresh} />
				) : (
					<OrdersTab orders={orders} onRefresh={handleRefresh} />
				)}
			</main>
		</div>
	);
}
