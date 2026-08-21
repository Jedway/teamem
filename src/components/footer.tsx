import { Link } from "@tanstack/react-router";
import { Leaf, MessageCircle, ShieldCheck } from "lucide-react";

export function Footer() {
	return (
		<footer className="w-full border-t border-line bg-white mt-20">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16 space-y-12">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
					{/* Brand Column */}
					<div className="md:col-span-2 space-y-3">
						<div className="flex items-center gap-2">
							<div className="w-7 h-7 rounded-full bg-[#2f6a4a]/10 flex items-center justify-center text-[#2f6a4a]">
								<Leaf className="w-3.5 h-3.5" />
							</div>
							<span className="font-serif text-xl font-bold text-[#173a40] tracking-tight">
								TEAMEM
							</span>
						</div>
						<p className="text-sm text-[#416166] max-w-sm leading-relaxed font-normal">
							Artisanal loose-leaf teas and botanicals crafted for slow moments
							and daily vitality. Small-batch curated in Nigeria.
						</p>
					</div>

					{/* Navigation Links */}
					<div className="space-y-3">
						<h4 className="text-xs uppercase tracking-widest font-bold text-[#2f6a4a]">
							Navigation
						</h4>
						<ul className="space-y-2 text-sm">
							<li>
								<Link
									to="/"
									className="text-[#416166] hover:text-[#173a40] transition-colors"
								>
									Home
								</Link>
							</li>
							<li>
								<Link
									to="/shop"
									className="text-[#416166] hover:text-[#173a40] transition-colors font-bold"
								>
									Shop Teas
								</Link>
							</li>
							<li>
								<a
									href="#about"
									className="text-[#416166] hover:text-[#173a40] transition-colors"
								>
									About Our Harvest
								</a>
							</li>
							<li>
								<Link
									to="/admin"
									className="text-[#416166] hover:text-[#173a40] transition-colors flex items-center gap-1 text-xs"
								>
									<ShieldCheck className="w-3 h-3" />
									Admin Portal
								</Link>
							</li>
						</ul>
					</div>

					{/* Direct Contact */}
					<div className="space-y-3">
						<h4 className="text-xs uppercase tracking-widest font-bold text-[#2f6a4a]">
							Direct Inquiries
						</h4>
						<p className="text-xs text-[#416166] font-medium">
							Have questions or custom bulk orders? Reach us directly on
							WhatsApp.
						</p>
						<a
							href="https://wa.me/2348073094612"
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-300 text-xs font-bold hover:bg-emerald-100 transition-colors"
						>
							<MessageCircle className="w-4 h-4 text-emerald-700" />
							+234 807 309 4612
						</a>
					</div>
				</div>

				<div className="pt-8 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#416166] font-medium">
					<p>
						© {new Date().getFullYear()} Teamem Botanicals. All rights reserved.
					</p>
					<p className="flex items-center gap-1">
						Crafted with care for pure everyday rituals.
					</p>
				</div>
			</div>
		</footer>
	);
}
