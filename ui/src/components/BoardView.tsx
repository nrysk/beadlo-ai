import { Piece } from "@engine";
import clsx from "clsx";
import CellView from "./CellView";
import { FlickHintView, PutHintView } from "./HintView";

const VALUE_MAP: { [key: string]: Piece } = {
	Player1: Piece.Player1,
	Player2: Piece.Player2,
};

interface BoardViewProps {
	board: Piece[];
	onCellClick: (index: number) => void;
	onFlick: (index: number, dx: number, dy: number) => void;
	selectedIndex: number | null;
	hintAction: { type: string; data: any } | null;
	className?: string;
}

export default function BoardView({
	board,
	onCellClick,
	onFlick,
	selectedIndex,
	hintAction,
	className,
}: BoardViewProps) {
	let hintIndex: number | null = null;
	let hintElement: React.ReactNode;
	switch (hintAction?.type) {
		case "Put": {
			const data = hintAction.data as { index: number; value: Piece };
			hintIndex = data.index;
			hintElement = <PutHintView value={VALUE_MAP[data.value]} />;
			break;
		}
		case "Flick": {
			const data = hintAction.data as { index: number; dx: number; dy: number };
			hintIndex = data.index;
			hintElement = <FlickHintView dx={data.dx} dy={data.dy} />;
			break;
		}

		default:
			hintElement = undefined;
	}

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
					hintElement={hintIndex === index ? hintElement : undefined}
				/>
			))}
		</div>
	);
}
