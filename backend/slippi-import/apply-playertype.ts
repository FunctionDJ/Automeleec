import type { PlayerType } from "@slippi/slippi-js/node";
import type { PlayerInActiveStartGGSet } from "../state";

export const applyPlayerTypeToState = (
	playerInCurrentSet: typeof PlayerInActiveStartGGSet.infer,
	playerType: PlayerType,
) => {
	const { characterId, characterColor } = playerType;

	playerInCurrentSet.character =
		characterId === undefined || characterColor === undefined
			? null
			: {
					slippiCharacterId: characterId,
					slippiCharacterColorId: characterColor,
				};
};
