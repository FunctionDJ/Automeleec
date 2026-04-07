import SettingsIcon from "@mui/icons-material/Settings";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	FormControl,
	IconButton,
	InputLabel,
	MenuItem,
	Select,
	TextField,
	Tooltip,
	Typography,
} from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { State } from "../../backend/state";
import { trpc } from "../trpc-client";

export function DashboardSettingsControl({
	state,
}: {
	state: typeof State.infer;
}) {
	const [settingsOpen, setSettingsOpen] = useState(false);

	const [tournamentSlug, setTournamentSlug] = useState(
		state.startggTournamentSlug,
	);

	const setTournamentMutation = useMutation(
		trpc.dashboard.setStartggTournamentIdViaSlug.mutationOptions(),
	);
	const setStreamQueueMutation = useMutation(
		trpc.dashboard.setStartggStreamQueueIdToTrack.mutationOptions(),
	);

	const streamQueuesQuery = useQuery({
		...trpc.dashboard.getStreamQueues.queryOptions(),
		enabled: settingsOpen && state.startggTournamentId !== null,
	});

	return (
		<>
			<Tooltip title="Tournament and stream settings">
				<IconButton
					onClick={() => {
						setTournamentSlug(state.startggTournamentSlug);
						setSettingsOpen(true);
					}}
					sx={{
						border: "1px solid",
						borderColor: "divider",
						bgcolor: "action.selected",
						"&:hover": {
							borderColor: "primary.main",
						},
					}}
				>
					<SettingsIcon />
				</IconButton>
			</Tooltip>

			<Dialog
				open={settingsOpen}
				onClose={() => setSettingsOpen(false)}
				fullWidth
			>
				<DialogTitle>Tournament & Stream Queue Settings</DialogTitle>
				<DialogContent className="flex flex-col gap-4">
					<Typography color="text.secondary">
						Current tournament ID: {state.startggTournamentId ?? "(none)"}
					</Typography>

					<div className="flex gap-2 items-center">
						<TextField
							label="start.gg Tournament Slug"
							size="small"
							className="grow"
							value={tournamentSlug}
							onChange={(event) => setTournamentSlug(event.target.value)}
							disabled={setTournamentMutation.isPending}
						/>
						<Button
							variant="contained"
							onClick={() => {
								if (tournamentSlug === null) {
									return;
								}

								if (
									state.startggTournamentId !== null &&
									!globalThis.confirm(
										"This will replace the current start.gg tournament and reset tracked stream queue. Continue?",
									)
								) {
									return;
								}

								setTournamentMutation.mutate({
									startggTournamentSlug: tournamentSlug,
								});
							}}
							disabled={setTournamentMutation.isPending}
						>
							Set Tournament
						</Button>
					</div>

					<Divider />

					<Typography color="text.secondary">
						Current stream queue:{" "}
						{state.startggStreamQueueIdToTrack ?? "(none)"}
					</Typography>

					<FormControl>
						<InputLabel>Stream Queue</InputLabel>
						<Select
							label="Stream Queue"
							disabled={
								state.startggTournamentId === null ||
								streamQueuesQuery.isLoading ||
								setStreamQueueMutation.isPending
							}
							value={state.startggStreamQueueIdToTrack}
							onChange={(event) => {
								const queueId = event.target.value;

								if (
									state.startggStreamQueueIdToTrack !== null &&
									state.startggStreamQueueIdToTrack !== queueId &&
									!globalThis.confirm(
										"This will replace the currently tracked stream queue. Continue?",
									)
								) {
									return;
								}

								setStreamQueueMutation.mutate({
									startggStreamQueueIdToTrack: queueId,
								});
							}}
						>
							{streamQueuesQuery.data?.map((queue) => (
								<MenuItem key={queue.id} value={queue.id}>
									{queue.stream.shortName} ({queue.stream.streamName})
									{" – Platform: "}
									{queue.stream.streamSource}
									{" – Online: "}
									{queue.stream.isOnline ? "🟢" : "🔴"}
									{" – Enabled: "}
									{queue.stream.enabled ? "✅" : "❌"}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={() => {
							setSettingsOpen(false);
						}}
					>
						Close
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}
