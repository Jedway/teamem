import { Info, Loader2, Save, Trash2 } from "lucide-react";
import * as React from "react";
import { updateOrderLinesFn } from "../../lib/server-functions";
import type { Order, OrderLine } from "../../lib/types";
import { Stepper } from "../stepper";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../ui/dialog";

interface OrderEditDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	order: Order | null;
	onSuccess: () => Promise<void> | void;
}

export function OrderEditDialog({
	open,
	onOpenChange,
	order,
	onSuccess,
}: OrderEditDialogProps) {
	const [lines, setLines] = React.useState<OrderLine[]>([]);
	const [isSaving, setIsSaving] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);

	React.useEffect(() => {
		if (order) {
			setLines([...order.items]);
		} else {
			setLines([]);
		}
		setError(null);
	}, [order]);

	const handleQtyChange = (itemId: string, newQty: number) => {
		setLines((prev) =>
			prev.map((l) => (l.itemId === itemId ? { ...l, qty: newQty } : l)),
		);
	};

	const handleRemoveLine = (itemId: string) => {
		setLines((prev) => prev.filter((l) => l.itemId !== itemId));
	};

	const totalAmount = React.useMemo(
		() => lines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0),
		[lines],
	);

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!order) return;
		if (lines.length === 0) {
			setError("Order must contain at least one blend.");
			return;
		}

		setIsSaving(true);
		setError(null);
		try {
			await updateOrderLinesFn({
				data: {
					orderId: order.id,
					items: lines,
				},
			});
			onOpenChange(false);
			await onSuccess();
		} catch (err) {
			console.error("Failed to update order lines:", err);
			setError("Failed to save renegotiated order items.");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-lg bg-white text-[#173a40] border border-line shadow-2xl">
				<form onSubmit={handleSave} className="space-y-4">
					<DialogHeader>
						<DialogTitle>
							Edit Order #{order?.id.replace("ord_", "")}
						</DialogTitle>
						<DialogDescription>
							Adjust blend quantities and totals following WhatsApp
							renegotiations.
						</DialogDescription>
					</DialogHeader>

					{error && (
						<div className="p-3 rounded-xl bg-rose-100 border border-rose-300 text-rose-900 text-xs font-semibold">
							{error}
						</div>
					)}

					{/* Notice about inventory judgment call */}
					<div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2 leading-relaxed">
						<Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
						<span>
							<strong>Note:</strong> Modifying line items updates this invoice
							record and recalculates the total. It does not re-adjust inventory
							stock.
						</span>
					</div>

					{/* Lines List */}
					<div className="space-y-2.5 max-h-[40vh] overflow-y-auto pr-1">
						{lines.map((line) => (
							<div
								key={line.itemId}
								className="p-3.5 rounded-2xl bg-surface-strong border border-line flex items-center justify-between gap-3"
							>
								<div className="space-y-0.5 grow">
									<h4 className="font-serif font-bold text-sm text-sea-ink">
										{line.name}
									</h4>
									<p className="text-xs text-sea-ink-soft">
										₦{line.unitPrice.toLocaleString("en-NG")} / unit
									</p>
								</div>

								<div className="flex items-center gap-3">
									<Stepper
										size="sm"
										value={line.qty}
										min={1}
										max={99}
										onChange={(newQty) => handleQtyChange(line.itemId, newQty)}
									/>

									<span className="font-serif font-bold text-sm text-sea-ink min-w-16 text-right">
										₦{(line.qty * line.unitPrice).toLocaleString("en-NG")}
									</span>

									<button
										type="button"
										onClick={() => handleRemoveLine(line.itemId)}
										className="p-1 rounded-lg text-sea-ink-soft hover:text-rose-600 hover:bg-rose-50 transition-colors"
										aria-label={`Remove ${line.name}`}
									>
										<Trash2 className="w-4 h-4" />
									</button>
								</div>
							</div>
						))}
					</div>

					{/* Total */}
					<div className="p-3 rounded-2xl bg-surface border border-line flex items-center justify-between">
						<span className="font-semibold text-xs text-sea-ink-soft uppercase tracking-wider">
							Recalculated Total
						</span>
						<span className="font-serif text-xl font-bold text-sea-ink">
							₦{totalAmount.toLocaleString("en-NG")}
						</span>
					</div>

					<DialogFooter className="pt-2 border-t border-line">
						<Button
							type="button"
							variant="outline"
							disabled={isSaving}
							onClick={() => onOpenChange(false)}
							className="rounded-xl border-line text-sea-ink"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={isSaving || lines.length === 0}
							className="rounded-xl bg-sea-ink hover:bg-palm text-white font-bold gap-2 px-6"
						>
							{isSaving ? (
								<>
									<Loader2 className="w-4 h-4 animate-spin text-emerald-300" />
									<span>Updating...</span>
								</>
							) : (
								<>
									<Save className="w-4 h-4" />
									<span>Save Changes</span>
								</>
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
