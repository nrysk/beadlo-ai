import {  useEffect, useState } from "react";

import init, { GameEngine, Piece } from "@engine";
import HandView from "./components/HandView";
import BoardView from "./components/BoardView";
import AnalysisView from "./components/AnalysisView";
import BoardControls from "./components/BoardControls";

function App() {
	const [engine, setEngine] = useState<GameEngine | null>(null);
	const [board, setBoard] = useState<Piece[]>([]);
	const [handCounts, setHandCounts] = useState({
		p1: 0,
		p2: 0,
	});
	const [bestActions, setBestActions] = useState({
		p1: null as { type: string; data: JSON } | null,
		p2: null as { type: string; data: JSON } | null,
	});

	const [selected, setSelected] = useState<
		"Player1" | "Player2" | number | null
	>(null);
	const [hintAction, setHintAction] = useState<{
		type: string;
		data: JSON;
	} | null>(null);
	const [aiDepth1, setAiDepth1] = useState<number>(6);
	const [aiDepth2, setAiDepth2] = useState<number>(6);

	const syncGameState = (eng: GameEngine) => {
        setBoard(Array.from(eng.get_board()));
        setHandCounts({
            p1: eng.get_hand_count(Piece.Player1),
            p2: eng.get_hand_count(Piece.Player2),
        });
        // 盤面が変わった瞬間は、古い解析結果を消しておく
        setBestActions({ p1: null, p2: null }); 
    };

	useEffect(() => {
        if (!engine) return;

        const timerId = setTimeout(() => {
            setBestActions({
                p1: engine.calc_best_action(Piece.Player1, aiDepth1),
                p2: engine.calc_best_action(Piece.Player2, aiDepth2),
            });
        }, 10); // 描画更新のために少し待つ

        return () => clearTimeout(timerId);
        
    }, [board, aiDepth1, aiDepth2, engine]);

	useEffect(() => {
		// アンマウント済みか判定するフラグ
		let active = true;
		// クリーンアップ用にローカル変数で保持する
		let localEngine: GameEngine | null = null;

		const loadEngine = async () => {
			await init(); // Wasm初期化

			if (!active) return; // すでにアンマウントされていたら中断

			localEngine = GameEngine.new();
			setEngine(localEngine);
			syncGameState(localEngine);
		};

		loadEngine();

		return () => {
			active = false;

			if (localEngine) {
				localEngine.free();
			}
		};
	}, []);

	const handleAction = (action: unknown) => {
		if (!engine) return;
		engine.apply_action(action);
		syncGameState(engine);
	};

	return engine ? (
		<div className="min-h-svh flex flex-row justify-center items-center bg-white p-4 gap-4">
			<BoardControls
				onReset={() => {
					if (!engine) return;
					engine.reset();
					syncGameState(engine);
				}}
			/>
			<div className="flex flex-col w-lg justify-center items-center gap-4">
				<HandView
					player={Piece.Player1}
					count={handCounts.p1}
					isSelected={selected === "Player1"}
					onClick={() => setSelected(selected === "Player1" ? null : "Player1")}
					className="w-md"
				/>
				<BoardView
					board={board}
					selectedIndex={
						typeof selected === "number" ? (selected as number) : null
					}
					onCellClick={(index) => {
						if (board[index] === Piece.Empty) {
							if (selected === "Player1" || selected === "Player2") {
								handleAction({
									type: "Put",
									data: {
										index,
										value: selected,
									},
								});
								setSelected(null);
							}
						} else setSelected(index === selected ? null : index);
					}}
					onFlick={(index, dx, dy) => {
						handleAction({
							type: "Flick",
							data: {
								index,
								dx,
								dy,
							},
						});
						setSelected(null);
					}}
					hintAction={hintAction}
					className="w-lg"
				/>
				<HandView
					player={Piece.Player2}
					count={handCounts.p2}
					isSelected={selected === "Player2"}
					onClick={() => setSelected(selected === "Player2" ? null : "Player2")}
					className="w-md"
				/>
			</div>
			<div className="flex flex-col gap-4 w-3xs">
				<AnalysisView
					player={Piece.Player1}
					action={bestActions.p1}
					onHover={(action) => setHintAction(action)}
					depth={aiDepth1}
					setDepth={setAiDepth1}
					className="w-full"
				/>
				<AnalysisView
					player={Piece.Player2}
					action={bestActions.p2}
					onHover={(action) => setHintAction(action)}
					depth={aiDepth2}
					setDepth={setAiDepth2}
					className="w-full"
				/>
			</div>
		</div>
	) : (
		<div className="min-h-svh flex flex-col justify-center items-center bg-white p-4 gap-4">
			Loading...
		</div>
	);
}

export default App;
