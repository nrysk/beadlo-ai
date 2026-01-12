import { Piece } from "@engine";
import clsx from "clsx";

interface AnalysisViewProps {
	player: Piece;
	action: { type: string; data: JSON } | null;
	onHover?: (action: { type: string; data: JSON } | null) => void;
	className?: string;
}

export default function AnalysisView({
	player,
	action,
	onHover,
	className,
}: AnalysisViewProps) {
	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: <explanation>
		<div
			className={clsx(
				"flex items-center justify-center gap-2 p-3 rounded-md bg-linear-to-br disabled:opacity-40",
				{
					"from-red-300 to-red-400 disabled:to-red-300":
						player === Piece.Player1,
					"from-yellow-300 to-yellow-400 disabled:to-yellow-300":
						player === Piece.Player2,
				},
				className,
			)}
			onMouseEnter={() => {
				onHover?.(action);
			}}
			onMouseLeave={() => {
				onHover?.(null);
			}}
		>
			<div className="bg-white rounded-lg w-full">
				<pre className="p-2 text-sm">{JSON.stringify(action, null, 2)}</pre>
			</div>
		</div>
	);
}
