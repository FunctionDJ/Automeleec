import { CircularProgress, DialogContentText } from "@mui/material";
import { useEffect, useState } from "react";
import type { State } from "../../backend/state";
import { trpc } from "../trpc-client";
import { StationComponent } from "./Station";

export function App() {
	const [state, setState] = useState<State | null>(null);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		const sub = trpc.stateSubscription.subscribe(undefined, {
			onData: setState,
			onError: (err) =>
				setError(err instanceof Error ? err : new Error(String(err))),
		});

		return () => sub.unsubscribe();
	}, []);

	if (error) {
		return (
			<div>
				<p>error</p>
				<pre>{error.message}</pre>
			</div>
		);
	}

	if (!state) {
		return (
			<div className="h-dvh grid place-content-center">
				<div className="flex gap-4 items-center">
					<CircularProgress />
					<DialogContentText>Loading...</DialogContentText>
				</div>
			</div>
		);
	}

	return (
		<div className="h-dvh border p-4 flex flex-col gap-8">
			<span className="font-black text-5xl text-center">
				Side-Stream Self-Service
			</span>
			<div className="flex gap-4 grow overflow-scroll p-4">
				{state.stations.map((station) => (
					<StationComponent
						key={station.startggStationNumber}
						station={station}
					/>
				))}
			</div>
		</div>
	);
}
