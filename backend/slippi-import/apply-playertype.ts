import type { PlayerType } from "@slippi/slippi-js/node";
import type { PlayerInCurrentSet } from "../state";

export const applyPlayerTypeToState = (
	playerInCurrentSet: PlayerInCurrentSet,
	playerType: PlayerType,
) => {
	playerInCurrentSet.character = playerType.characterId ?? null;
	playerInCurrentSet.characterColor = playerType.characterColor ?? null;
};
