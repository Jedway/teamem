import { Minus, Plus } from "lucide-react";
import type * as React from "react";
import { cn } from "#/lib/utils.ts";

interface StepperProps {
	value: number;
	min?: number;
	max: number;
	onChange: (value: number) => void;
	disabled?: boolean;
	size?: "sm" | "default" | "lg";
	className?: string;
}

export function Stepper({
	value,
	min = 1,
	max,
	onChange,
	disabled = false,
	size = "default",
	className,
}: StepperProps) {
	const canDecrement = !disabled && value > min;
	const canIncrement = !disabled && value < max;

	const handleDecrement = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (canDecrement) {
			onChange(value - 1);
		}
	};

	const handleIncrement = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (canIncrement) {
			onChange(value + 1);
		}
	};

	const buttonSizes = {
		sm: "w-7 h-7 text-xs",
		default: "w-8 h-8 text-sm",
		lg: "w-9 h-9 text-base",
	};

	const iconSizes = {
		sm: "w-3 h-3",
		default: "w-3.5 h-3.5",
		lg: "w-4 h-4",
	};

	const textSizes = {
		sm: "text-xs min-w-5",
		default: "text-sm min-w-6",
		lg: "text-base min-w-8",
	};

	return (
		<div
			className={cn(
				"inline-flex items-center gap-1 rounded-full border border-line bg-surface p-0.5 shadow-2xs transition-colors",
				disabled && "opacity-50 cursor-not-allowed bg-muted/30",
				className,
			)}
		>
			<button
				type="button"
				onClick={handleDecrement}
				disabled={!canDecrement}
				className={cn(
					"inline-flex items-center justify-center rounded-full text-sea-ink hover:bg-white hover:text-sea-ink active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none disabled:hover:bg-transparent",
					buttonSizes[size],
				)}
				aria-label="Decrease quantity"
			>
				<Minus className={iconSizes[size]} />
			</button>

			<span
				className={cn(
					"font-semibold text-center select-none text-sea-ink tabular-nums px-1",
					textSizes[size],
				)}
			>
				{value}
			</span>

			<button
				type="button"
				onClick={handleIncrement}
				disabled={!canIncrement}
				className={cn(
					"inline-flex items-center justify-center rounded-full text-sea-ink hover:bg-white hover:text-sea-ink active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none disabled:hover:bg-transparent",
					buttonSizes[size],
				)}
				aria-label="Increase quantity"
			>
				<Plus className={iconSizes[size]} />
			</button>
		</div>
	);
}
