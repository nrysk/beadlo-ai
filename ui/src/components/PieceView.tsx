import { Piece } from "../../../engine/pkg/engine";
import clsx from "clsx";
import { Circle } from "lucide-react";

interface PieceViewProps {
	player: Piece;
	className?: string;
}

export default function PieceView({ player, className }: PieceViewProps) {
	if (player === Piece.Empty) {
		return null;
	}

	return (
		<Circle
			className={clsx(
				"size-32",
				{
					"text-red-500": player === Piece.Player1,
					"text-blue-500": player === Piece.Player2,
				},
				className,
			)}
		/>
	);
}
