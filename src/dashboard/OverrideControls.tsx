import { Typography } from "@mui/material";
import type { EntrantInActiveSet } from "../../backend/state";
import { EntrantOverride } from "./EntrantOverride";

export function OverrideControls({
	stationNumber,
	entrantOverride,
}: {
	stationNumber: number;
	entrantOverride: {
		entrantA: typeof EntrantInActiveSet.infer;
		entrantB: typeof EntrantInActiveSet.infer;
	};
}) {
	return (
		<div className="flex flex-col gap-2">
			<Typography variant="subtitle2">Entrant Override</Typography>
			<div className="flex flex-col gap-2">
				<EntrantOverride
					entrant={entrantOverride.entrantA}
					side="left"
					stationNumber={stationNumber}
				/>
				<EntrantOverride
					entrant={entrantOverride.entrantB}
					side="right"
					stationNumber={stationNumber}
				/>
			</div>
		</div>
	);
}
