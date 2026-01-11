import clsx from "clsx";
import type { Piece } from "@engine";
import PieceView from "./PieceView";
import FlickControls from "./FliickControls";

interface CellViewProps {
	piece: Piece;
	isSelected: boolean;
	onClick: () => void;
	onFlick: (dx: number, dy: number) => void;
	className?: string;
}

export default function CellView({
	piece,
	isSelected,
	onClick,
	onFlick,
	className,
}: CellViewProps) {
	return (
		// biome-ignore lint/a11y/useSemanticElements: ゲーム実装の都合上
		<div
			role="button"
			tabIndex={0}
			onKeyDown={onClick}
			className={clsx(
				"relative flex items-center justify-center bg-white rounded-xl shadow-md p-4 aspect-square",
				className,
				{ "ring-4 ring-blue-400": isSelected },
			)}
			onClick={onClick}
		>
			<PieceView player={piece} />
			{isSelected && (
				<FlickControls
					onFlick={onFlick}
					className="absolute size-48 opacity-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
				/>
			)}
		</div>
	);
}
