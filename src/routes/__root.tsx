import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { CartDrawer } from "../components/cart-drawer";
import { FloatingCartPill } from "../components/floating-cart-pill";
import { CartProvider } from "../lib/cart-context";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Teamem — Artisanal Botanicals & Fine Teas",
			},
			{
				name: "description",
				content:
					"Artisanal loose-leaf teas, single-estate harvests, and nourishing botanical infusions crafted for everyday rituals.",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/placeholder-tea.svg",
			},
		],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<CartProvider>
					{children}
					<CartDrawer />
					<FloatingCartPill />
				</CartProvider>
				<Scripts />
			</body>
		</html>
	);
}
