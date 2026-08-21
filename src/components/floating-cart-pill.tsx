import { ShoppingBag } from "lucide-react";
import { useCart } from "../lib/cart-context";
import { Button } from "./ui/button";

export function FloatingCartPill() {
	const { totalItems, totalPrice, setIsCartOpen } = useCart();

	if (totalItems === 0) return null;

	return (
		<aside
			aria-label="Floating shopping cart quick access"
			className="fixed bottom-6 right-6 z-40 animate-in fade-in slide-in-from-bottom-6 duration-300"
		>
			<Button
				onClick={() => setIsCartOpen(true)}
				className="bg-[#173a40] hover:bg-[#2f6a4a] text-white font-bold rounded-full px-6 py-6 shadow-2xl border-2 border-emerald-400/30 flex items-center gap-3.5 transition-all hover:scale-105 active:scale-95 group cursor-pointer"
			>
				<div className="relative flex items-center justify-center">
					<ShoppingBag className="w-5 h-5 text-white transition-transform group-hover:-rotate-12" />
					<span className="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-extrabold flex items-center justify-center border-2 border-[#173a40] shadow-sm">
						{totalItems}
					</span>
				</div>

				<span className="font-serif text-sm tracking-wider font-bold text-white">
					GO TO CART
				</span>

				<span className="h-4 w-px bg-white/30" />

				<span className="text-xs font-extrabold text-emerald-300">
					₦{totalPrice.toLocaleString("en-NG")}
				</span>
			</Button>
		</aside>
	);
}
