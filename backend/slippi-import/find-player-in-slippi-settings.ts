import type { GameStartType } from "@slippi/slippi-js/node";
import type { PlayerInActiveStartGGSet, Ports } from "../state";

export const findPlayerInSlippiSettings = (
	player: typeof PlayerInActiveStartGGSet.infer,
	settings: GameStartType,
	ports: typeof Ports.infer,
) => {
	const portNumber = ports.indexOf(player.startggParticipantId);
	return settings.players.find((p) => p.port === portNumber) ?? null;
};
