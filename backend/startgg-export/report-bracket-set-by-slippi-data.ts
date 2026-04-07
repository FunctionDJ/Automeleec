import type { GameEndType } from "@slippi/slippi-js/node";
import { getPlayersFromCurrentSet } from "../../shared/entrant-utilities";
import { getStationOrThrow } from "../state";
import { fetchActiveSet } from "./fetch-active-set";
import { reportBracketSet, type Selection } from "./report-bracket-set";
import {
	slippiCharacterToStartGGCharacter,
	slippiStageToStartGGStageId,
} from "./slippi-to-startgg";
import { prefixLogger } from "../logger/logger";

export const reportBracketSetBySlippiData = async ({
	gameEnd,
	stationNumber,
}: {
	gameEnd: GameEndType;
	stationNumber: number;
}) => {
	const logger = prefixLogger("StartggExport", `Station ${stationNumber}`);
	logger.info(`Reporting to startgg...`);

	const activeSet = await fetchActiveSet(stationNumber);

	if (activeSet === undefined) {
		logger.error(`No active set found`);
		return;
	}

	// Determine winner based on which port won
	const winnerPortIndex = gameEnd.placements.findIndex((p) => p.position === 0);
	logger.info(`winnerPortIndex: ${winnerPortIndex}`);

	if (winnerPortIndex === -1) {
		logger.error(`Could not determine winner from placements, skipping report`);
		return;
	}

	const station = getStationOrThrow(stationNumber);

	if (station.mode !== "startgg") {
		logger.warn(
			`Station mode is not "startgg" (is "${station.mode}"), skipping report`,
		);
		return;
	}

	const { currentSet } = station;

	if (currentSet === null) {
		logger.error(`No current set in state, skipping report`);
		return;
	}

	const winnerParticipantId = station.ports[winnerPortIndex];
	logger.info(`winnerParticipantId: ${winnerParticipantId}`);

	if (winnerParticipantId === null) {
		logger.error(
			`Winner port ${winnerPortIndex} has no participant mapped, skipping report`,
		);
		return;
	}

	const entrants = [currentSet.entrantA, currentSet.entrantB];

	const players = getPlayersFromCurrentSet(currentSet);

	const winnerEntrant = entrants.find(
		(entrant) =>
			entrant.player1.startggParticipantId === winnerParticipantId ||
			entrant.player2?.startggParticipantId === winnerParticipantId,
	);

	if (!winnerEntrant) {
		logger.error(
			`Could not find entrant for participant ${winnerParticipantId}`,
		);

		return;
	}

	logger.info("winnerEntrant", { winnerEntrant });

	const existingGames = activeSet.games ?? [];

	/**
	 * TODO
	 * for correct character display on start.gg, the selections
	 * should probably be sorted according to the order of the entrants
	 * and participants.
	 * i'm not sure if the current order is correct.
	 */

	const selections: Selection[] = players
		.map((player) => {
			const entrant = activeSet.slots.find((slot) =>
				slot.entrant.participants.some(
					(p) => p.id === player.startggParticipantId,
				),
			);

			const startggCharacterId = slippiCharacterToStartGGCharacter(
				player.slippiCharacterId,
			);

			if (entrant === undefined || startggCharacterId === null) {
				return null;
			}

			return {
				// this is correct. startgg stores an array of selections per entrant (which can be a team), not per participant.
				entrantId: entrant.entrant.id,
				characterId: startggCharacterId,
			};
		})
		.filter((s) => s !== null);

	const gameData = [
		...existingGames.map((game) => ({
			gameNum: game.orderNum,
			winnerId: game.winnerId,
			stageId: game.stage?.id ?? null,
			selections: game.selections.map((selection) => ({
				entrantId: selection.entrant.id,
				characterId: selection.character.id,
			})),
		})),
		{
			// this is just the winnerId for this match, not the whole set
			winnerId: winnerEntrant.startggEntrantId,
			gameNum: existingGames.length + 1,
			stageId: slippiStageToStartGGStageId(currentSet.slippiStage),
			selections,
		},
	];

	logger.info(`gameData`, { gameData });

	// the following is the winnerId for the whole set

	const sendWinnerId = existingGames.length + 1 >= station.bestOf;
	const winnerId = sendWinnerId ? winnerEntrant.startggEntrantId : null;

	await reportBracketSet({
		winnerId,
		setId: activeSet.id,
		gameData,
	});
};
