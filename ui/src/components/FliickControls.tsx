import clsx from "clsx";

import { ArrowUp } from "lucide-react";

interface FlickControlsProps {
	onFlick: (dx: number, dy: number) => void;
	className?: string;
}

const DIRECTIONS = [
	{ dx: -1, dy: -1, rotate: "-rotate-45" },
	{ dx: 0, dy: -1, rotate: "rotate-0" },
	{ dx: 1, dy: -1, rotate: "rotate-45" },
	{ dx: -1, dy: 0, rotate: "-rotate-90" },
	{ dx: 0, dy: 0, rotate: "hidden" },
	{ dx: 1, dy: 0, rotate: "rotate-90" },
	{ dx: -1, dy: 1, rotate: "-rotate-135" },
	{ dx: 0, dy: 1, rotate: "rotate-180" },
	{ dx: 1, dy: 1, rotate: "rotate-135" },
];

export default function FlickControls({
	onFlick,
	className,
}: FlickControlsProps) {
	return (
		<div
			className={clsx("grid grid-cols-3 gap-2 z-20 aspect-square", className)}
		>
			{DIRECTIONS.map(({ dx, dy, rotate }, index) => (
				<button
					key={index}
					className={clsx(
						"flex items-center justify-center bg-none p-2 hover:text-blue-400 size-full",
						{
							invisible: dx === 0 && dy === 0,
						},
					)}
					onClick={() => {
						onFlick(dx, dy);
					}}
					type="button"
				>
					<ArrowUp className={clsx("size-full", rotate)} strokeWidth={10} />
				</button>
			))}
		</div>
	);
}
