import { prefixLogger } from "../logger/logger";
import type {
	CurrentSet,
	EntrantInCurrentSet,
	EntrantInUpcomingSet,
	PlayerInCurrentSet,
	PlayerInUpcomingSet,
	Station,
	UpcomingSet,
} from "../state";
import type { Participant, SetType, Slot } from "./startgg-schemas";

const participantToPlayerInCurrentSet = (
	participant: typeof Participant.infer,
): typeof PlayerInCurrentSet.infer => ({
	startggParticipantId: participant.id,
	tag: participant.gamerTag,
	pronouns: participant.user?.genderPronoun ?? "",
	slippiCharacterId: null,
	slippiCharacterColorId: null,
});

const slotToCurrentSetEntrant = (
	slot: typeof Slot.infer,
): typeof EntrantInCurrentSet.infer => ({
	startggEntrantId: slot.entrant.id,
	score: slot.standing.stats.score.value ?? null,
	player1: slot.entrant.participants[0]
		? participantToPlayerInCurrentSet(slot.entrant.participants[0])
		: {
				startggParticipantId: null,
				tag: "[missing participant]",
				pronouns: "",
				slippiCharacterId: null,
				slippiCharacterColorId: null,
			},
	player2: slot.entrant.participants[1]
		? participantToPlayerInCurrentSet(slot.entrant.participants[1])
		: null,
});

const participantToPlayerInUpcomingSet = (
	participant: typeof Participant.infer,
): typeof PlayerInUpcomingSet.infer => ({
	tag: participant.gamerTag,
	pronouns: participant.user?.genderPronoun ?? "",
});

const slotToUpcomingSetEntrant = (
	slot: typeof Slot.infer,
): typeof EntrantInUpcomingSet.infer => ({
	player1: slot.entrant.participants[0]
		? participantToPlayerInUpcomingSet(slot.entrant.participants[0])
		: {
				tag: "[missing participant]",
				pronouns: "",
			},
	player2: slot.entrant.participants[1]
		? participantToPlayerInUpcomingSet(slot.entrant.participants[1])
		: null,
});

const getSlotsFromSetOrThrow = (set: typeof SetType.infer) => {
	const [slotA, slotB] = set.slots;

	if (slotA === undefined || slotB === undefined) {
		throw new Error(
			`Expected 2 slots for set ${set.id}, but got ${set.slots.length}`,
		);
	}

	return [slotA, slotB] as const;
};

const setToCurrentSet = (
	set: typeof SetType.infer,
): typeof CurrentSet.infer => {
	const [slotA, slotB] = getSlotsFromSetOrThrow(set);

	return {
		startggSetId: set.id,
		fullRoundText: set.fullRoundText,
		round: set.round,
		state: set.state,
		phaseGroup: set.phaseGroup,
		startedAt: set.startedAt ? new Date(set.startedAt) : null,
		slippiStage: null,
		entrantA: slotToCurrentSetEntrant(slotA),
		entrantB: slotToCurrentSetEntrant(slotB),
	};
};

const setToUpcomingSet = (
	set: typeof SetType.infer,
): typeof UpcomingSet.infer => {
	const [slotA, slotB] = getSlotsFromSetOrThrow(set);

	return {
		startggSetId: set.id,
		fullRoundText: set.fullRoundText,
		round: set.round,
		state: set.state,
		phaseGroup: set.phaseGroup,
		entrantA: slotToUpcomingSetEntrant(slotA),
		entrantB: slotToUpcomingSetEntrant(slotB),
	};
};

export const transformStationByStreamQueueSets = (
	station: typeof Station.infer,
	allSetsInStreamQueue: (typeof SetType.infer)[],
) => {
	const logger = prefixLogger(
		"StartggImport",
		`Station ${station.startggStationNumber}`,
	);

	const sggSetsAtThisStation = allSetsInStreamQueue.filter(
		(set) => set.station.number === station.startggStationNumber,
	);

	station.upcomingSets = sggSetsAtThisStation
		.filter((set) => set.id !== station.currentSet?.startggSetId)
		.map((set) => setToUpcomingSet(set));

	const activeSSGSetsAtThisStation = sggSetsAtThisStation.filter(
		(set) => set.state === "active",
	);

	if (activeSSGSetsAtThisStation.length > 1) {
		logger.warn(
			`Found multiple active sets at this station in the stream queue. First one is picked, other(s) are considered upcoming!`,
		);
	}

	// [STARTGG] asking on the discord right now.

	/**
	 *  the below code might not be as resilient as it could be because it should just do
	 * "from the stream queue, take the top set from the queue at this station" and ignore the set state.
	 * but as i learned now, the queue is basically completely up to the TOs to control, so i guess
	 * you could have a two active sets in the queue.
	 */

	const [currentSGGSet] = activeSSGSetsAtThisStation;

	// update current set if id changed
	if (
		currentSGGSet !== undefined &&
		currentSGGSet.id !== station.currentSet?.startggSetId // TODO we want to have a feature where when a set finished, the currentSet lingers around for like a 30 seconds till a minute, so maybe we expand the currentSet to include a finishedAt field and only override it once the time has passed
	) {
		station.currentSet = setToCurrentSet(currentSGGSet);
		station.ports = [null, null, null, null];
	} else {
		// update score

		const { currentSet } = station;

		if (currentSet === null) {
			// this case is shown via dashboard as "no current set in state"
			station.currentSet = null;
			return;
		}

		if (currentSGGSet === undefined) {
			logger.warn(
				`Station has currentSet, but no active set (startgg) at this station, skipping score update`,
			);

			return;
		}

		const [slotA, slotB] = getSlotsFromSetOrThrow(currentSGGSet);
		const valueA = slotA.standing.stats.score.value;
		const valueB = slotB.standing.stats.score.value;

		currentSet.entrantA.score = valueA;
		currentSet.entrantB.score = valueB;
	}
};
