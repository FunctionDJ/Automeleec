import { FormControlLabel, Paper, Switch, Typography } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import type { EntrantInActiveSet } from "../../backend/state";
import { trpc } from "../trpc-client";
import NumberSpinner from "./NumberSpinner";
import { PlayerOverride } from "./PlayerOverride";

interface Props {
	entrant: typeof EntrantInActiveSet.infer;
	side: "left" | "right";
	stationNumber: number;
}

export const EntrantOverride = ({ entrant, side, stationNumber }: Props) => {
	const [localEntrant, setLocalEntrant] = useState(entrant);

	const { mutate } = useMutation(
		trpc.dashboard.setEntrantOverride.mutationOptions(),
	);

	const debounced = useDebouncedCallback(
		(entrantParameter: typeof EntrantInActiveSet.infer) =>
			mutate({
				entrantOverride: entrantParameter,
				side,
				stationNumber,
			}),
		500,
	);

	const update = (entrantParameter: typeof EntrantInActiveSet.infer) => {
		setLocalEntrant(entrantParameter);
		debounced(entrantParameter);
	};

	const setPlayer2Enabled = (enabled: boolean) => {
		if (enabled) {
			update({
				...localEntrant,
				player2: localEntrant.player2 ?? {
					tag: "",
					pronouns: "",
					character: null,
				},
			});

			return;
		}

		update({
			...localEntrant,
			player2: null,
		});
	};

	return (
		<Paper
			className="flex flex-wrap items-center gap-3 py-2 px-3"
			elevation={3}
		>
			<div className="flex gap-4 items-center w-full">
				<Typography variant="subtitle1">
					{side === "left" ? "Entrant A" : "Entrant B"}
				</Typography>
				<div className="grow flex justify-end gap-4">
					<Paper className="flex gap-2 py-1 px-3">
						<FormControlLabel
							control={
								<Switch
									checked={localEntrant.player2 !== null}
									onChange={(event) => setPlayer2Enabled(event.target.checked)}
								/>
							}
							label="Enable Teams / Two Players"
						/>
					</Paper>
					<Paper className="flex gap-2 py-1 px-3">
						<FormControlLabel
							className="mr-0!"
							control={
								<Switch
									checked={localEntrant.score !== null}
									onChange={() =>
										update({
											...localEntrant,
											score: localEntrant.score === null ? 0 : null,
										})
									}
								/>
							}
							label="Score"
						/>
						<NumberSpinner
							disabled={localEntrant.score === null}
							value={localEntrant.score}
							onValueChange={(newValue) =>
								update({
									...localEntrant,
									score: newValue,
								})
							}
						/>
					</Paper>
				</div>
			</div>
			<PlayerOverride
				label={localEntrant.player2 === null ? "" : "Player 1"}
				player={localEntrant.player1}
				onChange={(player1) => update({ ...localEntrant, player1 })}
			/>

			{localEntrant.player2 !== null && (
				<PlayerOverride
					label="Player 2"
					player={localEntrant.player2}
					onChange={(player2) => update({ ...localEntrant, player2 })}
				/>
			)}
		</Paper>
	);
};
