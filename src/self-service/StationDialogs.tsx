import { Check } from "@mui/icons-material";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from "@mui/material";
import type { CurrentSet, EntrantInCurrentSet } from "../../backend/state";
import { PortsDialog } from "./PortsDialog";
import { ResetDialog } from "./ResetDialog";

interface Props {
	currentSet: CurrentSet;
	ports: (number | null)[];
	hwDialogOpen: boolean;
	setHwDialogOpen: (open: boolean) => void;
	portDialogOpen: boolean;
	setPortDialogOpen: (open: boolean) => void;
	resetDialogOpen: boolean;
	setResetDialogOpen: (open: boolean) => void;
	stationId: number;
}

const entrantName = (entrant: EntrantInCurrentSet) =>
	entrant.player2
		? `${entrant.player1.tag} / ${entrant.player2.tag}`
		: entrant.player1.tag;

export const StationDialogs = ({
	currentSet,
	ports,
	hwDialogOpen,
	setHwDialogOpen,
	portDialogOpen,
	setPortDialogOpen,
	resetDialogOpen,
	setResetDialogOpen,
	stationId,
}: Props) => (
	<>
		<ResetDialog
			currentSet={currentSet}
			open={resetDialogOpen}
			onClose={() => setResetDialogOpen(false)}
			stationNumber={stationId}
		/>
		<Dialog open={hwDialogOpen} onClose={() => setHwDialogOpen(false)}>
			<DialogTitle>
				Starting set {entrantName(currentSet.entrantA)} vs.{" "}
				{entrantName(currentSet.entrantB)}
			</DialogTitle>
			<DialogContent>
				<DialogContentText color="black" fontWeight={900}>
					Did you complete handwarmers?
				</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button
					startIcon={<Check />}
					onClick={() => {
						setHwDialogOpen(false);
						setPortDialogOpen(true);
					}}
				>
					Yes
				</Button>
			</DialogActions>
		</Dialog>
		<PortsDialog
			currentSet={currentSet}
			open={portDialogOpen}
			setOpen={setPortDialogOpen}
			ports={ports}
			stationNumber={stationId}
		/>
	</>
);
