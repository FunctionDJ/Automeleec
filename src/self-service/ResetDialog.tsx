import { Check, Close } from "@mui/icons-material";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import type { CurrentSet } from "../../backend/state";
import { entrantLabel } from "../../shared/entrant-utilities";
import { trpcVanilla } from "../trpc-client";

interface Props {
	currentSet: typeof CurrentSet.infer;
	open: boolean;
	onClose: () => void;
	stationNumber: number;
}

export const ResetDialog = ({
	currentSet,
	open,
	onClose,
	stationNumber,
}: Props) => {
	const resetSetMutation = useMutation({
		mutationFn: () =>
			trpcVanilla.selfService.resetSet.mutate({
				stationNumber,
			}),
	});

	return (
		<Dialog open={open} onClose={onClose}>
			<DialogTitle>
				Resetting set {entrantLabel(currentSet.entrantA)} vs.{" "}
				{entrantLabel(currentSet.entrantB)}
			</DialogTitle>
			<DialogContent>
				<DialogContentText>
					This will reset the set score (!) and mark the set as
					&quot;ready&quot; (like resetting on start.gg).
				</DialogContentText>
			</DialogContent>
			<DialogContent>
				<DialogContentText>Are you sure you want to reset?</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button
					startIcon={<Close />}
					color="inherit"
					disabled={resetSetMutation.isPending}
					onClick={onClose}
				>
					cancel
				</Button>
				<Button
					startIcon={<Check />}
					loading={resetSetMutation.isPending}
					color="warning"
					onClick={() =>
						resetSetMutation.mutate(undefined, {
							onSuccess: onClose,
						})
					}
				>
					reset
				</Button>
			</DialogActions>
		</Dialog>
	);
};
