import clsx from "clsx";
import { RotateCcw } from "lucide-react";

interface BoardControlsProps {
	onReset: () => void;
	className?: string;
}

export default function BoardControls({
	onReset,
	className,
}: BoardControlsProps) {
	return (
		<div className={clsx("flex flex-col gap-2", className)}>
			<button
				className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded"
				onClick={onReset}
				type="button"
			>
				<RotateCcw className="" />
			</button>
		</div>
	);
}
