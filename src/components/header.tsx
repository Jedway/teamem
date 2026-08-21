import { Link } from "@tanstack/react-router";
import { Leaf, Menu, ShieldCheck, Sparkles } from "lucide-react";
import * as React from "react";
import { Button } from "./ui/button";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "./ui/sheet";

export function Header() {
	const [isOpen, setIsOpen] = React.useState(false);

	return (
		<header className="sticky top-0 z-40 w-full transition-all duration-200 border-b border-line bg-white shadow-2xs">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
				{/* Logo / Brandmark */}
				<Link to="/" className="flex items-center gap-2.5 group">
					<div className="w-8 h-8 rounded-full bg-[#2f6a4a]/15 border border-[#2f6a4a]/25 flex items-center justify-center text-[#2f6a4a] transition-transform group-hover:scale-105">
						<Leaf className="w-4 h-4 text-[#2f6a4a]" />
					</div>
					<div className="flex flex-col">
						<span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#173a40] leading-none">
							TEAMEM
						</span>
						<span className="text-[9px] uppercase tracking-widest font-semibold text-[#2f6a4a]">
							Artisanal Botanicals
						</span>
					</div>
				</Link>

				{/* Desktop Navigation */}
				<nav className="hidden md:flex items-center gap-8">
					<Link
						to="/shop"
						className="text-sm font-semibold tracking-wide text-[#173a40] hover:text-[#328f97] transition-colors"
					>
						Shop Teas
					</Link>
					<a
						href="#about"
						className="text-sm font-semibold tracking-wide text-[#416166] hover:text-[#173a40] transition-colors"
					>
						About
					</a>
					<a
						href="#contact"
						className="text-sm font-semibold tracking-wide text-[#416166] hover:text-[#173a40] transition-colors"
					>
						Contact
					</a>
					<Link
						to="/admin"
						className="text-xs font-semibold text-[#416166] hover:text-[#173a40] flex items-center gap-1 px-3 py-1.5 rounded-full border border-line bg-foam hover:bg-sand transition-colors"
					>
						<ShieldCheck className="w-3.5 h-3.5" />
						Admin
					</Link>
				</nav>

				{/* Right Actions: Shop CTA Button on Desktop */}
				<div className="hidden md:flex items-center gap-3">
					<Button
						asChild
						size="sm"
						className="bg-[#173a40] hover:bg-[#2f6a4a] text-white font-bold rounded-full px-5 py-2 shadow-xs transition-all hover:shadow-md cursor-pointer"
					>
						<Link to="/shop">
							<span>Explore Catalog</span>
						</Link>
					</Button>
				</div>

				{/* Mobile Hamburger Menu */}
				<div className="flex md:hidden items-center gap-2">
					<Sheet open={isOpen} onOpenChange={setIsOpen}>
						<SheetTrigger asChild>
							<Button
								variant="ghost"
								size="icon-sm"
								className="text-[#173a40] hover:bg-foam rounded-xl p-2"
								aria-label="Open menu"
							>
								<Menu className="w-6 h-6 text-[#173a40]" />
							</Button>
						</SheetTrigger>
						<SheetContent
							side="right"
							className="w-full max-w-xs flex flex-col justify-between p-6 bg-white text-[#173a40] border-l border-line shadow-2xl"
						>
							<div className="space-y-6">
								<SheetHeader className="pb-4 border-b border-line">
									<div className="flex items-center gap-2.5">
										<div className="w-8 h-8 rounded-full bg-[#2f6a4a]/15 border border-[#2f6a4a]/25 flex items-center justify-center text-[#2f6a4a]">
											<Leaf className="w-4 h-4 text-[#2f6a4a]" />
										</div>
										<SheetTitle className="font-serif text-2xl font-bold text-[#173a40]">
											TEAMEM
										</SheetTitle>
									</div>
									<p className="text-xs text-[#416166] pt-1 font-medium">
										Curated loose leaf teas & herbal blends.
									</p>
								</SheetHeader>

								<nav className="flex flex-col gap-3">
									<SheetClose asChild>
										<Link
											to="/shop"
											className="flex items-center justify-between py-3 px-3 rounded-xl bg-foam hover:bg-sand text-base font-bold text-[#173a40] border border-line transition-colors"
										>
											<span>Shop All Teas</span>
											<Sparkles className="w-4 h-4 text-[#328f97]" />
										</Link>
									</SheetClose>
									<SheetClose asChild>
										<a
											href="#about"
											className="py-2.5 px-3 rounded-xl text-sm font-semibold text-[#416166] hover:text-[#173a40] hover:bg-foam transition-colors"
										>
											Our Story & Sourcing
										</a>
									</SheetClose>
									<SheetClose asChild>
										<a
											href="#contact"
											className="py-2.5 px-3 rounded-xl text-sm font-semibold text-[#416166] hover:text-[#173a40] hover:bg-foam transition-colors"
										>
											Contact & Inquiries
										</a>
									</SheetClose>
									<SheetClose asChild>
										<Link
											to="/admin"
											className="flex items-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold text-[#416166] hover:text-[#173a40] hover:bg-foam transition-colors"
										>
											<ShieldCheck className="w-4 h-4" />
											<span>Admin Management</span>
										</Link>
									</SheetClose>
								</nav>
							</div>

							<div className="space-y-3 pt-6 border-t border-line">
								<SheetClose asChild>
									<Button
										asChild
										className="w-full bg-[#173a40] hover:bg-[#2f6a4a] text-white font-bold rounded-xl py-5 shadow-sm"
									>
										<Link to="/shop">Browse Harvest</Link>
									</Button>
								</SheetClose>
								<Button
									asChild
									variant="outline"
									className="w-full border-line bg-foam font-semibold text-[#173a40] rounded-xl py-5 hover:bg-sand"
								>
									<a
										href="https://wa.me/2348073094612"
										target="_blank"
										rel="noopener noreferrer"
									>
										WhatsApp Support
									</a>
								</Button>
							</div>
						</SheetContent>
					</Sheet>
				</div>
			</div>
		</header>
	);
}
