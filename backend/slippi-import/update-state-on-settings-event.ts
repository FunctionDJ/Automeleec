import type { GameStartType, PlayerType } from "@slippi/slippi-js/node";
import { prefixLogger } from "../logger";
import { updateStationSync } from "../state";
import { applyPlayerTypeToState } from "./apply-playertype";
import { findPlayerInSlippiSettings } from "./find-player-in-slippi-settings";

export const updateStateOnSettingsEvent = (
	settingsEvent: GameStartType,
	stationNumber: number,
) => {
	updateStationSync(stationNumber, (station) => {
		const logger = prefixLogger("SlippiController", `Station ${stationNumber}`);
		const { currentSet } = station;

		if (currentSet === null) {
			const message = `Received SETTINGS event but there is no current set in state.`;
			logger.error(message);
			throw new Error(message);
		}

		const { stageId } = settingsEvent;

		if (stageId === undefined) {
			const message = `Received SETTINGS event but stageId is undefined.`;
			logger.error(message);
			throw new Error(message);
		}

		const entrantAP1 = findPlayerInSlippiSettings(
			currentSet.entrantA.player1,
			settingsEvent,
			station.ports,
		);

		const entrantBP1 = findPlayerInSlippiSettings(
			currentSet.entrantB.player1,
			settingsEvent,
			station.ports,
		);

		let entrantAP2: PlayerType | null = null;
		let entrantBP2: PlayerType | null = null;

		if (currentSet.entrantA.player2 !== null) {
			entrantAP2 = findPlayerInSlippiSettings(
				currentSet.entrantA.player2,
				settingsEvent,
				station.ports,
			);
		}

		if (currentSet.entrantB.player2 !== null) {
			entrantBP2 = findPlayerInSlippiSettings(
				currentSet.entrantB.player2,
				settingsEvent,
				station.ports,
			);
		}

		if (
			entrantAP1 === null ||
			entrantBP1 === null ||
			(settingsEvent.isTeams === true &&
				(entrantAP2 === null || entrantBP2 === null))
		) {
			logger.warn(
				`Could not find all players from currentSet in SETTINGS event (i.e. no port found), so it's skipped.`,
			);

			return;
		}

		applyPlayerTypeToState(currentSet.entrantA.player1, entrantAP1);
		applyPlayerTypeToState(currentSet.entrantB.player1, entrantBP1);

		if (
			currentSet.entrantA.player2 !== null &&
			currentSet.entrantB.player2 !== null &&
			entrantAP2 !== null &&
			entrantBP2 !== null
		) {
			applyPlayerTypeToState(currentSet.entrantA.player2, entrantAP2);
			applyPlayerTypeToState(currentSet.entrantB.player2, entrantBP2);
		}

		currentSet.slippiStage = stageId;
	});
};
