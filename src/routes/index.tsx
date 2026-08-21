import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ArrowRight,
	Leaf,
	MessageCircle,
	Sparkles,
	Thermometer,
} from "lucide-react";
import { Footer } from "../components/footer";
import { Header } from "../components/header";
import { Button } from "../components/ui/button";
import { getInventoryFn } from "../lib/server-functions";
import type { Item } from "../lib/types";

export const Route = createFileRoute("/")({
	loader: async () => {
		return await getInventoryFn();
	},
	component: LandingPage,
});

function LandingPage() {
	const items = Route.useLoaderData() as Item[];
	const featuredItems = items.slice(0, 3);

	return (
		<div className="min-h-screen flex flex-col selection:bg-emerald-100 selection:text-[#173a40] bg-sand/30">
			<Header />

			<main className="grow">
				{/* ----------------------------------------------------------------- */}
				{/* HERO SECTION */}
				{/* ----------------------------------------------------------------- */}
				<section className="relative overflow-hidden pt-8 pb-16 md:py-24 px-4 sm:px-6">
					<div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
						{/* Left: Headline & CTA */}
						<div className="lg:col-span-7 space-y-6 sm:space-y-8 text-left rise-in">
							<div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-line shadow-xs">
								<Sparkles className="w-3.5 h-3.5 text-[#2f6a4a]" />
								<span className="text-xs uppercase tracking-widest font-bold text-[#2f6a4a]">
									Hand-Harvested Botanicals
								</span>
							</div>

							<div className="space-y-4">
								<h1 className="display-title text-4xl sm:text-5xl md:text-6xl font-bold text-[#173a40] tracking-tight leading-[1.1]">
									Pure Botanicals.
									<br />
									<span className="italic text-[#328f97]">
										Everyday Rituals.
									</span>
								</h1>
								<p className="text-base sm:text-lg md:text-xl text-[#416166] max-w-xl font-normal leading-relaxed">
									Small-batch loose leaf harvests, restorative herbal infusions,
									and spiced blends crafted to slow down your morning and soothe
									your evening.
								</p>
							</div>

							<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
								<Button
									asChild
									size="lg"
									className="bg-[#173a40] hover:bg-[#2f6a4a] text-white text-base font-bold rounded-2xl px-8 py-6 shadow-md hover:shadow-xl transition-all group cursor-pointer"
								>
									<Link
										to="/shop"
										className="flex items-center gap-3 justify-center"
									>
										<span>SHOP</span>
										<ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
									</Link>
								</Button>

								<Button
									asChild
									variant="outline"
									size="lg"
									className="border-line bg-white hover:bg-foam text-[#173a40] font-semibold rounded-2xl px-6 py-6"
								>
									<a href="#about">Learn Our Story</a>
								</Button>
							</div>

							{/* Trust / Sourcing badges */}
							<div className="grid grid-cols-3 gap-3 pt-6 border-t border-line">
								<div>
									<p className="font-serif text-lg font-bold text-[#173a40]">
										100%
									</p>
									<p className="text-xs text-[#416166] font-medium">
										Natural & Additive-Free
									</p>
								</div>
								<div>
									<p className="font-serif text-lg font-bold text-[#173a40]">
										Direct
									</p>
									<p className="text-xs text-[#416166] font-medium">
										Estate Sourced
									</p>
								</div>
								<div>
									<p className="font-serif text-lg font-bold text-[#173a40]">
										WhatsApp
									</p>
									<p className="text-xs text-[#416166] font-medium">
										Direct Checkout
									</p>
								</div>
							</div>
						</div>

						{/* Right: Atmospheric Visual Canvas */}
						<div className="lg:col-span-5 relative">
							<div className="relative mx-auto max-w-md lg:max-w-none rounded-3xl overflow-hidden shadow-2xl border border-line group">
								{/* Tea Harvest Photo with warm botanical lighting */}
								<img
									src="https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1000&q=80"
									alt="Freshly harvested tea leaves"
									className="w-full h-[380px] sm:h-[480px] object-cover transition-transform duration-700 group-hover:scale-105"
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-[#173a40]/80 via-[#173a40]/20 to-transparent" />

								{/* Floating Card Badge */}
								<div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white text-[#173a40] border border-line shadow-xl space-y-1">
									<div className="flex items-center justify-between">
										<span className="text-[10px] uppercase font-bold tracking-wider text-[#2f6a4a]">
											Featured Harvest
										</span>
										<span className="text-xs font-bold text-[#173a40]">
											₦4,500
										</span>
									</div>
									<h4 className="font-serif font-bold text-base text-[#173a40]">
										Royal Hibiscus Zest
									</h4>
									<p className="text-xs text-[#416166] line-clamp-1 font-medium">
										Sun-dried Nigerian calyces with ginger & sweet orange.
									</p>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* ----------------------------------------------------------------- */}
				{/* FEATURED BLENDS PREVIEW */}
				{/* ----------------------------------------------------------------- */}
				<section className="py-16 px-4 sm:px-6 bg-white border-y border-line">
					<div className="max-w-6xl mx-auto space-y-10">
						<div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
							<div className="space-y-2">
								<span className="text-xs uppercase tracking-widest font-bold text-[#2f6a4a]">
									Handpicked Selection
								</span>
								<h2 className="display-title text-3xl md:text-4xl font-bold text-[#173a40]">
									Explore Signature Teas
								</h2>
							</div>
							<Button
								asChild
								variant="ghost"
								className="text-[#328f97] hover:text-[#173a40] font-bold self-start md:self-auto gap-2"
							>
								<Link to="/shop">
									<span>View all {items.length} teas</span>
									<ArrowRight className="w-4 h-4" />
								</Link>
							</Button>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
							{featuredItems.map((item) => (
								<div
									key={item.id}
									className="group rounded-3xl bg-white border border-line shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
								>
									<div className="p-6 space-y-4">
										<div className="aspect-4/3 rounded-2xl overflow-hidden bg-foam border border-line relative flex items-center justify-center">
											<img
												src={item.image || "/placeholder-tea.svg"}
												alt={item.name}
												className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
											/>
											<span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/95 text-[#173a40] border border-line shadow-2xs">
												{item.category}
											</span>
										</div>

										<div className="space-y-2">
											<h3 className="font-serif text-xl font-bold text-[#173a40] group-hover:text-[#328f97] transition-colors">
												{item.name}
											</h3>
											<p className="text-sm text-[#416166] line-clamp-2 leading-relaxed">
												{item.description}
											</p>
										</div>
									</div>

									<div className="px-6 py-4 border-t border-line bg-foam flex items-center justify-between">
										<span className="font-serif text-lg font-bold text-[#173a40]">
											₦{item.price.toLocaleString("en-NG")}
										</span>
										<Button
											asChild
											size="sm"
											className="bg-[#173a40] hover:bg-[#2f6a4a] text-white font-bold rounded-full px-5 cursor-pointer shadow-2xs"
										>
											<Link to="/shop">Shop Now</Link>
										</Button>
									</div>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* ----------------------------------------------------------------- */}
				{/* ABOUT & SOURCING PHILOSOPHY (#about) */}
				{/* ----------------------------------------------------------------- */}
				<section id="about" className="py-20 px-4 sm:px-6">
					<div className="max-w-5xl mx-auto space-y-12">
						<div className="text-center space-y-4 max-w-2xl mx-auto">
							<span className="text-xs uppercase tracking-widest font-bold text-[#2f6a4a]">
								Our Philosophy
							</span>
							<h2 className="display-title text-3xl md:text-5xl font-bold text-[#173a40]">
								Cultivated for Calm & Clarity
							</h2>
							<p className="text-base text-[#416166] leading-relaxed font-medium">
								We believe that a cup of tea is a sanctuary. Every herb and leaf
								in the Teamem collection is selected for aroma, depth, and
								restorative botanical benefits.
							</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
							<div className="p-6 rounded-3xl bg-white border border-line shadow-xs space-y-3">
								<div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
									<Leaf className="w-5 h-5" />
								</div>
								<h3 className="font-serif text-xl font-bold text-[#173a40]">
									Whole Loose Botanicals
								</h3>
								<p className="text-sm text-[#416166] leading-relaxed font-medium">
									Never dusty fannings or synthetic aromas. We preserve intact
									leaves, floral petals, and root botanicals for full
									extraction.
								</p>
							</div>

							<div className="p-6 rounded-3xl bg-white border border-line shadow-xs space-y-3">
								<div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center">
									<Thermometer className="w-5 h-5" />
								</div>
								<h3 className="font-serif text-xl font-bold text-[#173a40]">
									Small-Batch Curing
								</h3>
								<p className="text-sm text-[#416166] leading-relaxed font-medium">
									Blended in limited batches to guarantee freshness, rich
									essential oils, and peak therapeutic potency upon delivery.
								</p>
							</div>

							<div className="p-6 rounded-3xl bg-white border border-line shadow-xs space-y-3">
								<div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
									<MessageCircle className="w-5 h-5" />
								</div>
								<h3 className="font-serif text-xl font-bold text-[#173a40]">
									Direct WhatsApp Flow
								</h3>
								<p className="text-sm text-[#416166] leading-relaxed font-medium">
									No complex signups or payment gates. Add your items, and
									checkout instantly via direct WhatsApp messaging with our
									team.
								</p>
							</div>
						</div>
					</div>
				</section>

				{/* ----------------------------------------------------------------- */}
				{/* CONTACT & ORDER CALLOUT (#contact) */}
				{/* ----------------------------------------------------------------- */}
				<section id="contact" className="py-16 px-4 sm:px-6">
					<div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-[#173a40] to-[#2f6a4a] p-8 sm:p-12 text-white shadow-2xl space-y-6 text-center">
						<span className="text-xs uppercase tracking-widest font-bold text-emerald-300">
							Personalized Service
						</span>
						<h2 className="display-title text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
							Ready to elevate your daily tea ritual?
						</h2>
						<p className="text-white/90 max-w-lg mx-auto text-sm sm:text-base leading-relaxed font-medium">
							Browse our full harvest, adjust your blend quantities, and send
							your order straight to our WhatsApp line for prompt delivery
							across Nigeria.
						</p>
						<div className="pt-2 flex flex-wrap justify-center gap-4">
							<Button
								asChild
								size="lg"
								className="bg-[#4fb8b2] hover:bg-white hover:text-[#173a40] text-[#173a40] font-bold rounded-2xl px-8 py-6 shadow-lg transition-all cursor-pointer"
							>
								<Link to="/shop">SHOP THE HARVEST</Link>
							</Button>
							<Button
								asChild
								variant="outline"
								size="lg"
								className="border-white/40 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-2xl px-6 py-6 cursor-pointer"
							>
								<a
									href="https://wa.me/2348073094612"
									target="_blank"
									rel="noopener noreferrer"
								>
									Chat on WhatsApp
								</a>
							</Button>
						</div>
					</div>
				</section>
			</main>

			<Footer />
		</div>
	);
}
