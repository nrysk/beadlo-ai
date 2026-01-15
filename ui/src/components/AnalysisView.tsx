import { Piece } from "@engine";
import clsx from "clsx";

interface AnalysisViewProps {
	player: Piece;
	action: { type: string; data: JSON } | null;
	onHover?: (action: { type: string; data: JSON } | null) => void;
	depth: number;
	setDepth: (depth: number) => void;
	className?: string;
}

export default function AnalysisView({
	player,
	action,
	onHover,
	depth,
	setDepth,
	className,
}: AnalysisViewProps) {
	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: <explanation>
		<div
			className={clsx(
				"flex flex-col items-center justify-center gap-2 p-3 rounded-md bg-linear-to-br disabled:opacity-40",
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
			<div className="flex flex-col gap-1 w-full">
                <div className="flex justify-between items-center text-white font-bold text-sm drop-shadow-md">
                    <label htmlFor="depth-slider" className="select-none">
                        AI Strength (Depth)
                    </label>
                    <span className="font-mono bg-black/20 px-2 rounded">
                        {depth}
                    </span>
                </div>
                <input
                    id="depth-slider"
                    type="range"
                    min={1}
                    max={7} 
                    step={1}
                    value={depth}
                    onChange={(e) => setDepth(Number(e.target.value))}
                    className="w-full h-2 bg-white/30 rounded-lg appearance-none cursor-pointer accent-white hover:bg-white/40 transition-colors"
                />
            </div>
		</div>
	);
}
