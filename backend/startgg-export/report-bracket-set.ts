import { prefixLogger } from "../logger/logger";
import { fetchStartGG } from "../startgg-interface/fetch-startgg";

export interface Selection {
	entrantId: number;
	characterId: number;
}

export const reportBracketSet = async ({
	setId,
	gameData,
	winnerId,
}: {
	setId: number;
	winnerId: number | null;
	gameData: {
		gameNum: number;
		winnerId: number;
		stageId: number | null;
		selections: Selection[];
	}[];
}) => {
	const logger = prefixLogger("StartggExport", `SetId ${setId}`);
	logger.info(`winnerId: ${winnerId}`);
	logger.info(`gameData`, { gameData });

	const variables: {
		setId: number;
		gameData: typeof gameData;
		winnerId?: number;
	} = {
		setId,
		gameData,
	};

	if (winnerId !== null) {
		variables.winnerId = winnerId;
	}

	await fetchStartGG(
		`
			mutation ReportSet($setId: ID!, $gameData: [BracketSetGameDataInput], $winnerId: Int) {
				reportBracketSet(setId: $setId, gameData: $gameData, winnerId: $winnerId) {
					id
				}
			}
		`,
		variables,
	);
};
