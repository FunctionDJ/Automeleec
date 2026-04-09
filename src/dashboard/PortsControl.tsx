import {
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	Typography,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import type {
	PlayerInActiveStartGGSet,
	Ports,
	Station,
} from "../../backend/state";
import { getPlayersFromCurrentSet } from "../../shared/entrant-utilities";
import { trpc } from "../trpc-client";

export function PortsControl({ station }: { station: typeof Station.infer }) {
	const [input, setInput] = useState(station.ports);

	const mutation = useMutation(trpc.dashboard.setPorts.mutationOptions());

	if (!station.currentSet) {
		return (
			<Typography variant="body2" color="text.secondary">
				No current set — port assignment unavailable
			</Typography>
		);
	}

	const players = getPlayersFromCurrentSet(station.currentSet);
	const assignedIds = input.filter((id): id is number => id !== null);
	const isValid = assignedIds.length === players.length;

	const submit = (next: typeof Ports.infer) => {
		mutation.mutate({
			stationNumber: station.startggStationNumber,
			ports: next,
		});
	};

	const availableForPort = (
		portIndex: number,
		allPlayers: (typeof PlayerInActiveStartGGSet.infer)[],
	) => {
		const currentId = input[portIndex];
		return allPlayers.filter(
			(p) =>
				p.startggParticipantId !== null &&
				(p.startggParticipantId === currentId ||
					!assignedIds.includes(p.startggParticipantId)),
		);
	};

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center gap-2">
				<Typography variant="subtitle2">
					{station.mode === "startgg"
						? "Ports"
						: "Ports (inactive because of mode)"}
				</Typography>
				{!isValid && (
					<Typography variant="caption" color="warning.main">
						Either players use the Self-Service portal (tablet) to assign ports
						themselves, or you should do it here, otherwise auto-reporting
						won&apos;t work.
					</Typography>
				)}
			</div>
			<div className="flex gap-2">
				{([0, 1, 2, 3] as const).map((stationNumber) => (
					<FormControl key={stationNumber} size="small" className="min-w-28">
						<InputLabel>Port {stationNumber + 1}</InputLabel>
						<Select
							className="w-30"
							label={`Port ${stationNumber + 1}`}
							value={input[stationNumber] ?? ""}
							onChange={(event) => {
								const value = event.target.value as number | "";
								const next = [...input] as typeof Ports.infer;
								next[stationNumber] = value === "" ? null : value;
								setInput(next);
								const nextAssigned = next.filter(
									(id): id is number => id !== null,
								);
								if (nextAssigned.length === players.length) {
									submit(next);
								}
							}}
						>
							<MenuItem value="">
								<em>None</em>
							</MenuItem>
							{availableForPort(stationNumber, players).map((p) => (
								<MenuItem
									key={p.startggParticipantId}
									value={p.startggParticipantId ?? undefined}
								>
									{p.tag}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				))}
			</div>
		</div>
	);
}
