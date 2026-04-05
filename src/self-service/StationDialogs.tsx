import { Check } from "@mui/icons-material";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from "@mui/material";
import type { CurrentSet, Ports } from "../../backend/state";
import { entrantLabel } from "../../shared/entrant-utils";
import { PortsDialog } from "./PortsDialog";
import { ResetDialog } from "./ResetDialog";

interface Props {
	currentSet: typeof CurrentSet.infer;
	ports: typeof Ports.infer;
	hwDialogOpen: boolean;
	setHwDialogOpen: (open: boolean) => void;
	portDialogOpen: boolean;
	setPortDialogOpen: (open: boolean) => void;
	resetDialogOpen: boolean;
	setResetDialogOpen: (open: boolean) => void;
	stationId: number;
}

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
				Starting set {entrantLabel(currentSet.entrantA)} vs.{" "}
				{entrantLabel(currentSet.entrantB)}
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
