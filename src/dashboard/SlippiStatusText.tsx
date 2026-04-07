import { Typography } from "@mui/material";
import type { Station } from "../../backend/state";

interface Props {
	slippiState: (typeof Station.infer)["slippi"]["slippiState"];
}

export const SlippiStatusText = ({ slippiState }: Props) => {
	if (slippiState.status === "error") {
		return (
			<Typography variant="body2" color="textSecondary">
				error (hover for details)
			</Typography>
		);
	}

	if (slippiState.status === "connected") {
		return (
			<Typography variant="body2" color="textSecondary">
				connected: {slippiState.consoleNick}, v{slippiState.version}
			</Typography>
		);
	}

	return (
		<Typography variant="body2" color="textSecondary">
			{slippiState.status}
		</Typography>
	);
};
