import { Loader2, Save, Upload, X } from "lucide-react";
import * as React from "react";
import { saveItemFn, uploadImageFn } from "../../lib/server-functions";
import { deriveItemStatus, type Item } from "../../lib/types";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

interface ItemFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	item?: Item | null;
	onSuccess: () => Promise<void> | void;
}

const COMMON_CATEGORIES = [
	"Herbal Infusions",
	"Black Tea",
	"Green Tea",
	"Floral Infusions",
	"Spiced Black Tea",
	"Oolong Tea",
];

export function ItemFormDialog({
	open,
	onOpenChange,
	item,
	onSuccess,
}: ItemFormDialogProps) {
	const isEdit = Boolean(item?.id);

	const [name, setName] = React.useState("");
	const [category, setCategory] = React.useState("Herbal Infusions");
	const [price, setPrice] = React.useState<number>(4500);
	const [stock, setStock] = React.useState<number>(10);
	const [description, setDescription] = React.useState("");
	const [imageUrl, setImageUrl] = React.useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = React.useState(false);
	const [isUploading, setIsUploading] = React.useState(false);
	const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

	// Populate form when item changes or modal opens
	React.useEffect(() => {
		if (item) {
			setName(item.name);
			setCategory(item.category);
			setPrice(item.price);
			setStock(item.stock);
			setDescription(item.description);
			setImageUrl(item.image);
		} else {
			setName("");
			setCategory("Herbal Infusions");
			setPrice(4500);
			setStock(10);
			setDescription("");
			setImageUrl(null);
		}
		setErrorMessage(null);
	}, [item]);

	// Live status derived from current stock input
	const currentStatus = deriveItemStatus(stock);

	// Handle Image file selection
	const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setIsUploading(true);
		try {
			const reader = new FileReader();
			reader.onload = async () => {
				const base64 = reader.result as string;
				const uploadRes = await uploadImageFn({
					data: {
						base64,
						filename: file.name,
						contentType: file.type,
					},
				});
				setImageUrl(uploadRes.url);
				setIsUploading(false);
			};
			reader.readAsDataURL(file);
		} catch (err) {
			console.error("Image upload failed:", err);
			alert("Failed to upload image.");
			setIsUploading(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) {
			setErrorMessage("Item name is required.");
			return;
		}

		setIsSubmitting(true);
		setErrorMessage(null);

		try {
			await saveItemFn({
				data: {
					item: {
						id: item?.id,
						name: name.trim(),
						category: category.trim(),
						price: Number(price) || 0,
						stock: Number(stock) || 0,
						description: description.trim(),
						image: imageUrl,
					},
				},
			});

			onOpenChange(false);
			await onSuccess();
		} catch (err) {
			console.error("Failed to save item:", err);
			setErrorMessage("An error occurred while saving the blend.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto bg-white text-[#173a40] border border-line shadow-2xl">
				<form onSubmit={handleSubmit} className="space-y-5">
					<DialogHeader>
						<DialogTitle>
							{isEdit ? `Edit "${item?.name}"` : "Add New Tea Blend"}
						</DialogTitle>
						<DialogDescription>
							{isEdit
								? "Update product details, pricing, and available inventory."
								: "Add a new handcrafted blend or single-estate harvest to the catalog."}
						</DialogDescription>
					</DialogHeader>

					{errorMessage && (
						<div className="p-3 rounded-xl bg-rose-100 border border-rose-300 text-rose-900 text-xs font-semibold">
							{errorMessage}
						</div>
					)}

					<div className="space-y-4">
						{/* Product Name */}
						<div className="space-y-1.5">
							<Label
								htmlFor="item-name"
								className="text-xs font-semibold text-sea-ink"
							>
								Blend Name *
							</Label>
							<Input
								id="item-name"
								placeholder="e.g. Royal Hibiscus Zest"
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
								className="rounded-xl bg-surface border-line"
							/>
						</div>

						{/* Category & Suggestions */}
						<div className="space-y-1.5">
							<Label
								htmlFor="item-category"
								className="text-xs font-semibold text-sea-ink"
							>
								Category *
							</Label>
							<Input
								id="item-category"
								placeholder="e.g. Herbal Infusions"
								value={category}
								onChange={(e) => setCategory(e.target.value)}
								required
								className="rounded-xl bg-surface border-line"
							/>
							<div className="flex flex-wrap gap-1.5 pt-1">
								{COMMON_CATEGORIES.map((cat) => (
									<button
										key={cat}
										type="button"
										onClick={() => setCategory(cat)}
										className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors ${
											category === cat
												? "bg-sea-ink text-white"
												: "bg-surface text-sea-ink-soft hover:text-sea-ink border border-line"
										}`}
									>
										{cat}
									</button>
								))}
							</div>
						</div>

						{/* Price and Stock Grid */}
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-1.5">
								<Label
									htmlFor="item-price"
									className="text-xs font-semibold text-sea-ink"
								>
									Price in NGN (₦) *
								</Label>
								<Input
									id="item-price"
									type="number"
									min={0}
									step={100}
									placeholder="4500"
									value={price}
									onChange={(e) => setPrice(Number(e.target.value))}
									required
									className="rounded-xl bg-surface border-line"
								/>
							</div>

							<div className="space-y-1.5">
								<div className="flex items-center justify-between">
									<Label
										htmlFor="item-stock"
										className="text-xs font-semibold text-sea-ink"
									>
										Stock Units *
									</Label>
									<span
										className={`px-2 py-0.2 rounded-full text-[9px] font-bold uppercase tracking-wider ${
											currentStatus === "in_stock"
												? "bg-emerald-100 text-emerald-800 border border-emerald-300"
												: currentStatus === "low_stock"
													? "bg-amber-100 text-amber-800 border border-amber-300"
													: "bg-rose-100 text-rose-800 border border-rose-300"
										}`}
									>
										{currentStatus.replace("_", " ")}
									</span>
								</div>
								<Input
									id="item-stock"
									type="number"
									min={0}
									step={1}
									placeholder="10"
									value={stock}
									onChange={(e) => setStock(Number(e.target.value))}
									required
									className="rounded-xl bg-surface border-line"
								/>
							</div>
						</div>

						{/* Description */}
						<div className="space-y-1.5">
							<Label
								htmlFor="item-desc"
								className="text-xs font-semibold text-sea-ink"
							>
								Description & Aroma Notes
							</Label>
							<Textarea
								id="item-desc"
								rows={3}
								placeholder="Describe the herbs, tasting notes, and brewing suggestions..."
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								className="rounded-xl bg-surface border-line text-sm"
							/>
						</div>

						{/* Image Upload & Fallback */}
						<div className="space-y-2 pt-1 border-t border-line/60">
							<Label className="text-xs font-semibold text-sea-ink block">
								Product Image
							</Label>

							<div className="flex items-center gap-4">
								<div className="w-16 h-16 rounded-2xl overflow-hidden bg-surface border border-line shrink-0 flex items-center justify-center relative">
									<img
										src={imageUrl || "/placeholder-tea.svg"}
										alt="Preview"
										className="w-full h-full object-cover"
									/>
									{isUploading && (
										<div className="absolute inset-0 bg-black/40 flex items-center justify-center">
											<Loader2 className="w-5 h-5 animate-spin text-white" />
										</div>
									)}
								</div>

								<div className="grow space-y-1.5">
									<div className="flex items-center gap-2">
										<label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-line text-xs font-semibold text-sea-ink hover:bg-white transition-colors">
											<Upload className="w-3.5 h-3.5 text-palm" />
											<span>Upload Photo</span>
											<input
												type="file"
												accept="image/*"
												onChange={handleFileSelect}
												className="hidden"
												disabled={isUploading || isSubmitting}
											/>
										</label>

										{imageUrl && (
											<button
												type="button"
												onClick={() => setImageUrl(null)}
												className="inline-flex items-center gap-1 text-xs font-semibold text-sea-ink-soft hover:text-rose-600 px-2 py-1"
											>
												<X className="w-3 h-3" />
												<span>Use Placeholder</span>
											</button>
										)}
									</div>
									<p className="text-[11px] text-sea-ink-soft">
										Supports PNG, JPG, WebP. Falls back to artisanal placeholder
										if skipped.
									</p>
								</div>
							</div>
						</div>
					</div>

					<DialogFooter className="pt-3 border-t border-line">
						<Button
							type="button"
							variant="outline"
							disabled={isSubmitting}
							onClick={() => onOpenChange(false)}
							className="rounded-xl border-line text-sea-ink"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={isSubmitting || isUploading}
							className="rounded-xl bg-sea-ink hover:bg-palm text-white font-bold gap-2 px-6"
						>
							{isSubmitting ? (
								<>
									<Loader2 className="w-4 h-4 animate-spin text-emerald-300" />
									<span>Saving...</span>
								</>
							) : (
								<>
									<Save className="w-4 h-4" />
									<span>{isEdit ? "Update Blend" : "Add to Catalog"}</span>
								</>
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
