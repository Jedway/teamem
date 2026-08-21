import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Order } from "./types";

interface ExportPdfOptions {
	dateRangeLabel?: string;
	filename?: string;
}

export function exportPurchasedOrdersPdf(
	orders: Order[],
	options: ExportPdfOptions = {},
) {
	const {
		dateRangeLabel = "All Recorded Purchases",
		filename = `teamem-sales-report-${new Date().toISOString().split("T")[0]}.pdf`,
	} = options;

	const doc = new jsPDF({
		orientation: "portrait",
		unit: "mm",
		format: "a4",
	});

	const grandTotal = orders.reduce((sum, o) => sum + o.total, 0);
	const totalUnitsSold = orders.reduce(
		(sum, o) => sum + o.items.reduce((itemSum, l) => itemSum + l.qty, 0),
		0,
	);

	// Document Title & Brand Header
	doc.setFont("helvetica", "bold");
	doc.setFontSize(20);
	doc.setTextColor(23, 58, 64); // --sea-ink #173a40
	doc.text("TEAMEM BOTANICALS", 14, 20);

	doc.setFont("helvetica", "normal");
	doc.setFontSize(10);
	doc.setTextColor(65, 97, 102); // --sea-ink-soft
	doc.text("Official Sales & Fulfillment Report", 14, 26);

	// Timestamp & Range info
	const now = new Date();
	const generatedAt = now.toLocaleDateString("en-GB", {
		day: "numeric",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});

	doc.setFontSize(9);
	doc.text(`Date Range: ${dateRangeLabel}`, 14, 34);
	doc.text(`Generated: ${generatedAt}`, 14, 39);

	// Summary KPI Box
	doc.setFillColor(231, 243, 236); // --bg-base / sand
	doc.roundedRect(14, 44, 182, 14, 3, 3, "F");

	doc.setFont("helvetica", "bold");
	doc.setFontSize(9);
	doc.setTextColor(23, 58, 64);
	doc.text(`Total Completed Orders: ${orders.length}`, 20, 52);
	doc.text(`Total Units Sold: ${totalUnitsSold}`, 85, 52);
	doc.text(`Total Revenue: NGN ${grandTotal.toLocaleString("en-NG")}`, 140, 52);

	// Table Body Rows
	const tableRows = orders.map((order) => {
		const dateStr = new Date(
			order.updatedAt || order.createdAt,
		).toLocaleDateString("en-GB", {
			day: "numeric",
			month: "short",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});

		const itemsStr = order.items
			.map(
				(l) =>
					`${l.name} (${l.qty}x @ NGN ${l.unitPrice.toLocaleString("en-NG")})`,
			)
			.join("\n");

		return [
			dateStr,
			`#${order.id.replace("ord_", "")}`,
			itemsStr,
			`NGN ${order.total.toLocaleString("en-NG")}`,
		];
	});

	// AutoTable
	autoTable(doc, {
		startY: 63,
		head: [["Date Completed", "Order ID", "Items & Quantities", "Total (NGN)"]],
		body: tableRows,
		foot: [
			[
				"",
				"",
				"Grand Total Revenue:",
				`NGN ${grandTotal.toLocaleString("en-NG")}`,
			],
		],
		theme: "striped",
		headStyles: {
			fillColor: [23, 58, 64],
			textColor: [255, 255, 255],
			fontSize: 9,
			fontStyle: "bold",
		},
		bodyStyles: {
			fontSize: 8.5,
			textColor: [30, 30, 30],
			cellPadding: 3,
		},
		footStyles: {
			fillColor: [231, 243, 236],
			textColor: [23, 58, 64],
			fontSize: 9,
			fontStyle: "bold",
		},
		columnStyles: {
			0: { cellWidth: 36 },
			1: { cellWidth: 32 },
			2: { cellWidth: 80 },
			3: { cellWidth: 34, halign: "right" },
		},
	});

	// Footer page numbering
	const pageCount = (
		doc as unknown as { internal: { getNumberOfPages: () => number } }
	).internal.getNumberOfPages();

	for (let i = 1; i <= pageCount; i++) {
		doc.setPage(i);
		doc.setFontSize(8);
		doc.setTextColor(150, 150, 150);
		doc.text(
			`Page ${i} of ${pageCount} — Teamem Artisanal Botanicals`,
			doc.internal.pageSize.getWidth() / 2,
			doc.internal.pageSize.getHeight() - 8,
			{ align: "center" },
		);
	}

	doc.save(filename);
}
