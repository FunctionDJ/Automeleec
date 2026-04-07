import { type } from "arktype";
import { fetchStartGG } from "../startgg-interface/fetch-startgg";

const id = type("number.integer >= 0");

const Game = type({
	orderNum: id,
	winnerId: id,
	stage: type({ id }).or("null"),
	selections: type({
		character: { id },
		entrant: { id },
	}).array(),
});

const Set_ = type({
	id,
	games: Game.array().or("null"),
	slots: type({
		entrant: {
			id,
			participants: type({
				id,
			}).array(),
		},
	}).array(),
});

// we fetch the active set basically just to get the game selections for the next report to startgg
// TODO do we use any other data from this?
export const fetchActiveSet = async (stationId: number) => {
	// TODO replace tournament slug with slug or id from state
	const data = await fetchStartGG(`
			query GetSetAtStation {
				tournament(slug: "${String(Bun.env.TOURNAMENT_SLUG)}") {
					events {
						sets(filters: {stationNumbers: [${String(stationId)}], state: 2}) {
							nodes {
								id
								slots {
									entrant {
										id
										participants {
											id
										}
									}
								}
								games {
									orderNum
									stage {
										id
									}
									winnerId
									selections {
										character {
											id
										}
										entrant {
											id
										}
									}
								}
							}
						}
					}
				}
			}
		`);

	const validatedData = type({
		tournament: {
			events: type({
				sets: {
					nodes: Set_.array(),
				},
			}).array(),
		},
	}).assert(data);

	return validatedData.tournament.events
		.flatMap((event) => event.sets.nodes)
		.at(0);
};
