import { Piece } from "../../../engine/pkg/engine";
import clsx from "clsx";
import PieceRed from "../assets/piece-red.png";
import PieceYellow from "../assets/piece-yellow.png";
import PieceOrange from "../assets/piece-orange.png";
interface PieceViewProps {
	player: Piece;
	className?: string;
}

export default function PieceView({ player, className }: PieceViewProps) {
	if (player === Piece.Empty) {
		return null;
	}
	let imgSrc: string;
	switch (player) {
		case Piece.Player1:
			imgSrc = PieceRed;
			break;
		case Piece.Player2:
			imgSrc = PieceYellow;
			break;
		default:
			imgSrc = PieceOrange; // デバッグ用
			break;
	}

	return (
		<div className={clsx("w-full", className)}>
			<img
				src={imgSrc}
				alt={player === Piece.Player1 ? "Red Piece" : "Yellow Piece"}
				draggable={false}
				className=" select-none"
			/>
		</div>
	);
}
