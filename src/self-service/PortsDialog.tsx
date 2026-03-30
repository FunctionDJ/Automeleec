import { Sync } from "@mui/icons-material";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useState, type Dispatch } from "react";
import type { CurrentSet, EntrantInCurrentSet } from "../../backend/state";
import { trpc } from "../trpc-client";
import { PortInput } from "./PortInput";

interface Props {
	currentSet: CurrentSet;
	open: boolean;
	setOpen: Dispatch<boolean>;
	ports: (number | null)[];
	stationNumber: number;
}

const entrantName = (entrant: typeof EntrantInCurrentSet.infer) =>
	entrant.player2
		? `${entrant.player1.tag} / ${entrant.player2.tag}`
		: entrant.player1.tag;

export const PortsDialog = ({
	currentSet,
	open,
	setOpen,
	ports,
	stationNumber,
}: Props) => {
	const players = [currentSet.entrantA, currentSet.entrantB].flatMap((e) =>
		e.player2 ? [e.player1, e.player2] : [e.player1],
	);
	const [portsInput, setPortsInput] = useState(ports);

	// TODO port resetting is not working properly

	// useEffect(() => {
	// 	setPortsInput(ports);
	// }, [ports]);

	const onClose = () => {
		setOpen(false);
		setPortsInput(ports);
	};

	const startSetMutation = useMutation({
		mutationFn: () =>
			trpc.selfService.markSetInProgress.mutate({
				setId: currentSet.startggSetId,
			}),
	});

	const updatePortsMutation = useMutation({
		mutationFn: () =>
			trpc.selfService.updatePorts.mutate({
				stationNumber,
				ports: portsInput as [
					number | null,
					number | null,
					number | null,
					number | null,
				],
			}),
	});

	return (
		<Dialog open={open} onClose={onClose}>
			<DialogTitle>
				{currentSet.state !== "active"
					? "Starting set "
					: "Updating ports for "}
				{entrantName(currentSet.entrantA)} vs.{" "}
				{entrantName(currentSet.entrantB)}
			</DialogTitle>
			<DialogContent>
				{players.map((player) => (
					<PortInput
						player={player}
						portsInput={portsInput}
						setPortsInput={setPortsInput}
						key={player.startggParticipantId}
					/>
				))}
			</DialogContent>
			<DialogActions>
				<Button
					loading={startSetMutation.isPending || updatePortsMutation.isPending}
					onClick={() => {
						updatePortsMutation.mutate(undefined, {
							onSuccess: () => {
								if (currentSet.state !== "active") {
									startSetMutation.mutate(undefined, {
										onSuccess: () => onClose(),
									});
								} else {
									onClose();
								}
							},
						});
					}}
					disabled={
						players.length !== portsInput.filter((port) => port !== null).length
					}
					startIcon={<Sync />}
					color="success"
				>
					{currentSet.state === "active" ? "update ports" : "START SET"}
				</Button>
			</DialogActions>
		</Dialog>
	);
};
