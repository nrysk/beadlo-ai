import { useEffect, useState } from "react";

import init, { GameEngine, Piece } from "@engine";
import PieceView from "./components/PieceView";
import HandView from "./components/HandView";
import CellView from "./components/CellView";
import BoardView from "./components/BoardView";
import FlickControls from "./components/FliickControls";

function App() {
	const [engine, setEngine] = useState<GameEngine | null>(null);
	const [selected, setSelected] = useState<Piece | number | null>(null);

	useEffect(() => {
		init().then(() => {
			const engine = GameEngine.new();
			setEngine(engine);
			return () => {
				engine.free();
			};
		});
	}, []);

	return (
		<>
			<PieceView player={Piece.Player1} className="size-10" />
			<div className="w-dvh">
				<PieceView player={Piece.Player1} />
			</div>
			<PieceView player={Piece.Player2} />
			<HandView
				player={Piece.Player1}
				count={3}
				className="mt-4 w-lg"
				onClick={() => {
					setSelected(Piece.Player1);
				}}
				isSelected={selected === Piece.Player1}
			/>
			<CellView
				piece={Piece.Player2}
				isSelected={false}
				onClick={() => {
					alert("clicked");
				}}
				onFlick={() => {
					alert("flicked");
				}}
				className="size-30"
			/>
			<BoardView
				board={Array(25).fill(Piece.Player1)}
				onCellClick={(index) => {
					setSelected(index);
				}}
				onFlick={(index, dx, dy) => {
					alert(`Cell ${index} flicked with delta (${dx}, ${dy})`);
				}}
				selectedIndex={typeof selected === "number" ? selected : null}
				className="mt-4 w-lg"
			/>
			<FlickControls
				onFlick={(dx, dy) => {
					alert(`Flicked with delta (${dx}, ${dy})`);
				}}
				className="mt-4"
			/>
		</>
	);
}

export default App;
