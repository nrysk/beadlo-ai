import type { Piece } from "@engine";
import clsx from "clsx";
import CellView from "./CellView";

interface BoardViewProps {
	board: Piece[];
	onCellClick: (index: number) => void;
	onFlick: (index: number, dx: number, dy: number) => void;
	selectedIndex: number | null;
	className?: string;
}

export default function BoardView({
	board,
	onCellClick,
	onFlick,
	selectedIndex,
	className,
}: BoardViewProps) {
	return (
		<div
			className={clsx(
				"grid grid-cols-5 gap-3 bg-linear-to-br from-gray-300 to-slate-300 p-4 rounded-2xl",
				className,
			)}
		>
			{board.map((piece, index) => (
				<CellView
					key={index}
					isSelected={selectedIndex === index}
					piece={piece}
					onClick={() => onCellClick(index)}
					onFlick={(dx, dy) => onFlick(index, dx, dy)}
				/>
			))}
		</div>
	);
}
