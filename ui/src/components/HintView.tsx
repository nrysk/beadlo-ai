import type { Piece } from "@engine";
import PieceView from "./PieceView";
import { clsx } from "clsx";
import { ArrowUp } from "lucide-react";

interface PutHintViewProps {
	value: Piece;
	className?: string;
}

interface FlickHintViewProps {
	dx: number;
	dy: number;
	className?: string;
}

export function PutHintView({ value, className }: PutHintViewProps) {
	return (
		<div
			className={clsx(
				"flex items-center justify-center absolute top-0 left-0 p-4 animate-pulse",
				className,
			)}
		>
			<PieceView player={value} />
		</div>
	);
}

const ARROW_MAP: { [key: string]: string } = {
	"-1,-1": "-rotate-45 -translate-x-10 -translate-y-10",
	"-1,0": "-rotate-90 -translate-x-10",
	"-1,1": "-rotate-135 -translate-x-10 translate-y-10",
	"0,-1": "rotate-0 -translate-y-10",
	"0,0": "hidden",
	"0,1": "rotate-180 translate-y-10",
	"1,-1": "rotate-45 translate-x-10 -translate-y-10",
	"1,0": "rotate-90 translate-x-10",
	"1,1": "rotate-135 translate-x-10 translate-y-10",
};

export function FlickHintView({ dx, dy, className }: FlickHintViewProps) {
	return (
		<div
			className={clsx(
				"w-full h-full flex items-center  justify-center absolute p-4 animate-pulse z-10",
				className,
			)}
		>
			<ArrowUp
				className={clsx("w-12 h-12", ARROW_MAP[`${dx},${dy}`])}
				strokeWidth={8}
			/>
		</div>
	);
}
