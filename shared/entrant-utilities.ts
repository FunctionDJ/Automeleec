import type { CurrentSet } from "../backend/state";

export const entrantLabel = (entrant: {
	player1: { tag: string };
	player2: { tag: string } | null;
}) =>
	entrant.player2
		? `${entrant.player1.tag} / ${entrant.player2.tag}`
		: entrant.player1.tag;

export const getPlayersFromCurrentSet = (currentSet: typeof CurrentSet.infer) =>
	[currentSet.entrantA, currentSet.entrantB].flatMap((event) =>
		event.player2 ? [event.player1, event.player2] : [event.player1],
	);
