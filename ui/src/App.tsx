import { useEffect, useState } from "react";
import "./App.css";

import init, { hello_world } from "../../engine/pkg/engine";

function App() {
	const [message, setMessage] = useState("");

	useEffect(() => {
		init().then(() => {
			const msg = hello_world("from Wasm");
			setMessage(msg);
		});
	}, []);

	return (
		<div className="App">
			<h1>{message}</h1>
		</div>
	);
}

export default App;
