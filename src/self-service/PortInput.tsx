import { Close } from "@mui/icons-material";
import { DialogContentText, Radio } from "@mui/material";
import type { Dispatch } from "react";
import type { PlayerInCurrentSet } from "../../backend/state";

interface Props {
	player: typeof PlayerInCurrentSet.infer;
	portsInput: (number | null)[];
	setPortsInput: Dispatch<(number | null)[]>;
}

export const PortInput = ({ player, portsInput, setPortsInput }: Props) => (
	<div className="border-b-4 py-2 border-gray-300 flex justify-center">
		<div>
			<DialogContentText>Port of {player.tag}</DialogContentText>
			<div>
				{[1, 2, 3, 4, null].map((radioValue) => {
					const foundIndex = portsInput.indexOf(player.startggParticipantId);

					let checked = false;

					if (radioValue === null) {
						checked = foundIndex === -1;
					} else {
						checked = foundIndex === radioValue - 1;
					}

					return (
						<Radio
							key={radioValue}
							checked={checked}
							checkedIcon={radioValue === null ? <Close /> : undefined}
							icon={radioValue === null ? <Close /> : undefined}
							onChange={() => {
								const newPorts = [...portsInput];

								if (foundIndex !== -1) {
									newPorts[foundIndex] = null;
								}

								if (radioValue !== null) {
									newPorts[radioValue - 1] = player.startggParticipantId;
								}

								setPortsInput(newPorts);
							}}
							disabled={
								radioValue !== null &&
								!checked &&
								portsInput[radioValue - 1] !== null
							}
							sx={{
								"& .MuiSvgIcon-root": {
									fontSize: 50,
								},
							}}
						/>
					);
				})}
			</div>
		</div>
	</div>
);
