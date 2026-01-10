import { useEffect, useState } from "react";

import * as Core from "../../engine/pkg/engine";
import PieceView from "./components/PieceView";

function App() {
	return (
		<>
			<PieceView player={Core.Piece.Player1} className="text-yellow-500" />
			<PieceView player={Core.Piece.Player2} />
		</>
	);
}

export default App;
