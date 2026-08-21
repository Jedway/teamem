import { useRouter } from "@tanstack/react-router";
import {
	ArrowRight,
	Loader2,
	MessageCircle,
	ShoppingBag,
	Trash2,
} from "lucide-react";
import * as React from "react";
import { useCart } from "../lib/cart-context";
import { checkoutOrderFn } from "../lib/server-functions";
import { buildWhatsAppCheckoutUrl } from "../lib/whatsapp";
import { Stepper } from "./stepper";
import { Button } from "./ui/button";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "./ui/sheet";

export function CartDrawer() {
	const {
		items,
		totalItems,
		totalPrice,
		isCartOpen,
		setIsCartOpen,
		updateQty,
		removeItem,
		clearCart,
	} = useCart();

	const [isCheckingOut, setIsCheckingOut] = React.useState(false);
	const router = useRouter();

	const handleCheckout = async () => {
		if (items.length === 0 || isCheckingOut) return;
		setIsCheckingOut(true);

		try {
			// 1. Build WhatsApp formatted link
			const waUrl = buildWhatsAppCheckoutUrl(items, totalPrice);

			// 2. POST order to server function (appends to orders.json, decrements inventory stock)
			await checkoutOrderFn({
				data: {
					items: items.map((i) => ({
						itemId: i.itemId,
						name: i.name,
						qty: i.qty,
						unitPrice: i.unitPrice,
					})),
				},
			});

			// 3. Open WhatsApp link in new tab
			window.open(waUrl, "_blank", "noopener,noreferrer");

			// 4. Clear local cart & close drawer
			clearCart();
			setIsCartOpen(false);

			// 5. Invalidate router to refresh inventory and stock badges on screen
			await router.invalidate();
		} catch (err) {
			console.error("Checkout error:", err);
			alert(
				"There was an issue recording your order. You can still message us directly on WhatsApp.",
			);
			// Still open WhatsApp as fallback
			const waUrl = buildWhatsAppCheckoutUrl(items, totalPrice);
			window.open(waUrl, "_blank", "noopener,noreferrer");
		} finally {
			setIsCheckingOut(false);
		}
	};

	return (
		<Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
			<SheetContent
				side="right"
				className="w-full max-w-md flex flex-col justify-between p-6 bg-white text-[#173a40] border-l border-line shadow-2xl sm:max-w-lg"
			>
				{/* Drawer Header */}
				<div className="space-y-4">
					<SheetHeader className="pb-4 border-b border-line">
						<div className="flex items-center justify-between pr-8">
							<div className="flex items-center gap-2.5">
								<div className="w-8 h-8 rounded-full bg-[#2f6a4a]/15 border border-[#2f6a4a]/25 flex items-center justify-center text-[#2f6a4a]">
									<ShoppingBag className="w-4 h-4 text-[#2f6a4a]" />
								</div>
								<SheetTitle className="font-serif text-2xl font-bold text-[#173a40]">
									Your Tea Cart
								</SheetTitle>
							</div>
							{items.length > 0 && (
								<span className="text-xs font-semibold text-[#2f6a4a] bg-foam px-3 py-1 rounded-full border border-line">
									{totalItems} {totalItems === 1 ? "blend" : "blends"}
								</span>
							)}
						</div>
						<SheetDescription className="text-xs text-[#416166] font-medium">
							Review your selected artisanal harvests before checkout.
						</SheetDescription>
					</SheetHeader>

					{/* Cart Items List */}
					<div className="overflow-y-auto max-h-[calc(100vh-340px)] space-y-3 pr-1">
						{items.length === 0 ? (
							<div className="py-16 text-center space-y-4">
								<div className="w-16 h-16 rounded-full bg-foam border border-line mx-auto flex items-center justify-center text-[#416166]">
									<ShoppingBag className="w-8 h-8" />
								</div>
								<div className="space-y-1">
									<h4 className="font-serif text-lg font-bold text-[#173a40]">
										Your cart is empty
									</h4>
									<p className="text-xs text-[#416166] max-w-xs mx-auto">
										Explore our harvest catalog to add fragrant whole-leaf teas
										and restorative infusions.
									</p>
								</div>
								<Button
									size="sm"
									className="bg-[#173a40] hover:bg-[#2f6a4a] text-white font-semibold rounded-full px-6 mt-2 shadow-xs cursor-pointer"
									onClick={() => setIsCartOpen(false)}
								>
									Explore Catalog
								</Button>
							</div>
						) : (
							items.map((line) => (
								<div
									key={line.itemId}
									className="p-4 rounded-2xl bg-foam border border-line shadow-2xs space-y-3"
								>
									<div className="flex items-start justify-between gap-3">
										<div>
											<h4 className="font-serif font-bold text-base text-[#173a40] leading-tight">
												{line.name}
											</h4>
											<p className="text-xs font-semibold text-[#416166]">
												₦{line.unitPrice.toLocaleString("en-NG")} each
											</p>
										</div>
										<button
											type="button"
											onClick={() => removeItem(line.itemId)}
											className="p-1.5 rounded-lg text-[#416166] hover:text-rose-600 hover:bg-rose-50 transition-colors"
											aria-label={`Remove ${line.name} from cart`}
										>
											<Trash2 className="w-4 h-4" />
										</button>
									</div>

									<div className="flex items-center justify-between pt-1 border-t border-line/60">
										<Stepper
											size="sm"
											value={line.qty}
											min={1}
											max={99}
											onChange={(newQty) => updateQty(line.itemId, newQty)}
										/>
										<span className="font-serif font-bold text-base text-[#173a40]">
											₦{(line.qty * line.unitPrice).toLocaleString("en-NG")}
										</span>
									</div>
								</div>
							))
						)}
					</div>
				</div>

				{/* Drawer Footer & Checkout Trigger */}
				{items.length > 0 && (
					<div className="space-y-4 pt-4 border-t border-line bg-foam p-4 rounded-2xl mt-2">
						<div className="space-y-2 text-sm">
							<div className="flex items-center justify-between text-[#416166] text-xs font-medium">
								<span>Subtotal</span>
								<span className="font-bold text-[#173a40]">
									₦{totalPrice.toLocaleString("en-NG")}
								</span>
							</div>
							<div className="flex items-center justify-between text-[#416166] text-xs">
								<span>Shipping / Delivery</span>
								<span className="italic font-medium">
									Calculated on WhatsApp
								</span>
							</div>
							<div className="flex items-center justify-between pt-2 border-t border-line font-serif text-lg font-bold text-[#173a40]">
								<span>Estimated Total</span>
								<span className="text-xl text-[#173a40]">
									₦{totalPrice.toLocaleString("en-NG")}
								</span>
							</div>
						</div>

						<div className="space-y-2">
							<Button
								id="cart-checkout-button"
								disabled={isCheckingOut}
								onClick={handleCheckout}
								className="w-full bg-[#173a40] hover:bg-[#2f6a4a] text-white font-bold rounded-2xl py-6 shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-75 cursor-pointer"
							>
								{isCheckingOut ? (
									<>
										<Loader2 className="w-5 h-5 animate-spin text-emerald-300" />
										<span>Preparing WhatsApp Order...</span>
									</>
								) : (
									<>
										<MessageCircle className="w-5 h-5 text-emerald-400" />
										<span>Purchase on WhatsApp</span>
										<ArrowRight className="w-4 h-4 ml-1" />
									</>
								)}
							</Button>

							<button
								type="button"
								disabled={isCheckingOut}
								onClick={clearCart}
								className="w-full text-center text-xs font-semibold text-[#416166] hover:text-rose-600 transition-colors py-1 disabled:opacity-50"
							>
								Clear entire cart
							</button>
						</div>
					</div>
				)}
			</SheetContent>
		</Sheet>
	);
}
