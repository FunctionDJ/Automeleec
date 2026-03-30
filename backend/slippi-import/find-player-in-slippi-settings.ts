import type { GameStartType } from "@slippi/slippi-js/node";
import type { PlayerInCurrentSet, Ports } from "../state";

export const findPlayerInSlippiSettings = (
	player: typeof PlayerInCurrentSet.infer,
	settings: GameStartType,
	ports: typeof Ports.infer,
) => {
	const portNumber = ports.findIndex(
		(port) => port === player.startggParticipantId,
	);

	return settings.players.find((p) => p.port === portNumber) ?? null;
};
