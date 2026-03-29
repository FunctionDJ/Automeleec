import { TableCell, TableRow, Typography } from "@mui/material";
import type { EntrantInCurrentSet } from "../../backend/state";

interface Props {
	entrant: EntrantInCurrentSet | undefined;
}

export const RunningSetRow = ({ entrant }: Props) => (
	<TableRow>
		<TableCell align="right">
			<Typography>{entrant?.score}</Typography>
		</TableCell>
		<TableCell></TableCell>
		<TableCell>
			<div style={{ width: 200 }}>
				<Typography noWrap>{entrant?.player1.tag}</Typography>
			</div>
			{entrant?.player2 && (
				<div style={{ width: 200 }}>
					<Typography fontSize={18} color="grey" noWrap>
						{entrant.player2.tag}
					</Typography>
				</div>
			)}
		</TableCell>
	</TableRow>
);
