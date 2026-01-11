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
				"flex flex-row gap-2 p-2 rounded-md ",
				{
					"bg-red-300": player === Piece.Player1,
					"bg-yellow-300": player === Piece.Player2,
				},
				className,
			)}
			onClick={onClick}
			type="button"
		>
			{/* count個の駒を表示 */}
			<div
				className={clsx("flex flex-row bg-white rounded-md p-2", {
					"border-4 border-blue-500": isSelected,
				})}
			>
				{Array.from({ length: maxCount }).map((_, index) =>
					index < count ? (
						<>
							<PieceView
								key={index}
								player={player}
								className="flex-1 w-full px-2"
							/>
							<span
								key={`sp${index}`}
								className="w-1 bg-stone-200 my-4 last:hidden"
							/>
						</>
					) : (
						<span key={index} className="flex-1 w-full px-2" />
					),
				)}
			</div>
		</button>
	);
}
