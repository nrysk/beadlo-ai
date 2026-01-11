import { Piece } from "../../../engine/pkg/engine";
import clsx from "clsx";
import PieceRed from "../assets/piece-red.png";
import PieceYellow from "../assets/piece-yellow.png";

interface PieceViewProps {
	player: Piece;
	className?: string;
}

export default function PieceView({ player, className }: PieceViewProps) {
	if (player === Piece.Empty) {
		return null;
	}

	return (
		<div className={clsx("w-full", className)}>
			<img
				src={player === Piece.Player1 ? PieceRed : PieceYellow}
				alt={player === Piece.Player1 ? "Red Piece" : "Yellow Piece"}
			/>
		</div>
	);
}
