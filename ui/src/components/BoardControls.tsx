import clsx from "clsx";
import { Repeat, RotateCcw } from "lucide-react";

interface BoardControlsProps {
	onReset: () => void;
	checkRepetition: boolean;
	onToggleRepetition: (value: boolean) => void;
	className?: string;
}

export default function BoardControls({
	onReset,
	checkRepetition,
	onToggleRepetition,
	className,
}: BoardControlsProps) {
	return (
		<div className={clsx("flex flex-col gap-2", className)}>
			{/* リセットボタン */}
			<button
				className="relative group bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded"
				onClick={onReset}
				type="button"
			>
				<RotateCcw className="" />
				{/* ホバー時に表示 */}
				<span className="absolute group-hover:inline-block z-50 text-nowrap bottom-full -translate-x-1/2 mb-1 px-2 py-1 text-xs bg-slate-600 text-white rounded hidden">
					Reset Game
				</span>
			</button>
			
			{/* 繰り返しチェック切替 */}
			<button
				className={clsx(
					"relative group bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded",
					{ "bg-green-600 hover:bg-green-700": checkRepetition },
				)}
				onClick={() => onToggleRepetition(!checkRepetition)}
				type="button"
			>
				<Repeat />
				{/* ホバー時に表示 */}
				<span className="absolute group-hover:inline-block z-50 text-nowrap bottom-full -translate-x-1/2 mb-1 px-2 py-1 text-xs bg-slate-600 text-white rounded hidden">
					{checkRepetition ? "Repetition Check: ON" : "Repetition Check: OFF"}
				</span>
			</button>
		</div>
	);
}
