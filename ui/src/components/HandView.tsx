import clsx from "clsx";
import { Piece } from "../../../engine/pkg/engine";
import PieceView from "./PieceView";

interface HandViewProps {
	player: Piece;
	count: number;
	maxCount?: number;
	isSelected: boolean;
	onClick: () => void;
	className?: string;
}

export default function HandView({
	player,
	count,
	maxCount = 5,
	isSelected,
	onClick,
	className,
}: HandViewProps) {
	return (
		<button
			className={clsx(
				"flex flex-row gap-2 p-3 rounded-md bg-linear-to-br disabled:opacity-40",
				{
					"from-red-300 to-red-400 disabled:to-red-300":
						player === Piece.Player1,
					"from-yellow-300 to-yellow-400 disabled:to-yellow-300":
						player === Piece.Player2,
				},
				className,
			)}
			onClick={onClick}
			type="button"
			disabled={count <= 0}
		>
			{/* count個の駒を表示 */}
			<div
				className={clsx("flex flex-row bg-white rounded-md p-2", {
					"ring-4 ring-blue-400": isSelected,
				})}
			>
				{Array.from({ length: maxCount }).map((_, index) => (
					<>
						<PieceView
							key={index}
							player={player}
							className={clsx("flex-1 w-full px-2", {
								grayscale: index >= count,
							})}
						/>
						<span
							key={`sp${index}`}
							className="w-1 bg-stone-200 my-4 last:hidden"
						/>
					</>
				))}
			</div>
		</button>
	);
}
