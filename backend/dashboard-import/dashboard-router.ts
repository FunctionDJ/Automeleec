import { type } from "arktype";
import { slippiRouter } from "../slippi-import/slippi-controller-router";
import {
	Mode,
	EntrantInActiveSet,
	Ports,
	globalState as globalState,
	updateStateSync,
} from "../state";
import { stationProcedure } from "../station-procedure";
import { publicProcedure, router } from "../trpc-server";
import { TRPCError } from "@trpc/server";
import { fetchStartGG } from "../startgg-interface/fetch-startgg";

export const dashboardRouter = router({
	slippi: slippiRouter,
	setStartggTournamentIdViaSlug: publicProcedure
		.input(type({ startggTournamentSlug: "string" }))
		.mutation(async ({ input }) => {
			const response = await fetchStartGG(`
					query getEventId {
						tournament(slug: "${input.startggTournamentSlug}") {
							id
						}
					}`);

			const validatedData = type({
				tournament: type({
					id: "number.integer",
				}).or("null"),
			}).assert(response);

			const { tournament } = validatedData;

			if (tournament === null) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: `Tournament with slug ${input.startggTournamentSlug} not found`,
				});
			}

			updateStateSync((state) => {
				state.startggTournamentId = tournament.id;
				state.startggTournamentSlug = input.startggTournamentSlug;
				state.startggStreamQueueIdToTrack = null;
			});
		}),
	getStreamQueues: publicProcedure.query(async () => {
		if (globalState.startggTournamentId === null) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "startggTournamentId is not set",
			});
		}

		const response = await fetchStartGG(
			`
				query StreamQueues {
					streamQueue(tournamentId: ${globalState.startggTournamentId}, includePlayerStreams: false) {
						id
						stream {
							enabled
							isOnline
							shortName
							streamName
							streamSource
						}
					}
				}`,
		);

		const validatedData = type({
			streamQueue: type({
				id: "string",
				stream: {
					enabled: "boolean",
					isOnline: "boolean",
					shortName: "string",
					streamName: "string",
					streamSource: type.or(
						"'TWITCH'",
						"'HITBOX'",
						"'STREAMME'",
						"'MIXER'",
						"'YOUTUBE'",
					),
				},
			}).array(),
		}).assert(response);

		return validatedData.streamQueue;
	}),
	setStartggStreamQueueIdToTrack: publicProcedure
		.input(type({ startggStreamQueueIdToTrack: "string|null" }))
		.mutation(({ input }) => {
			// [FUTURE] dont auto-start startgg fetch-loop but start it when this is set?
			updateStateSync((state) => {
				state.startggStreamQueueIdToTrack = input.startggStreamQueueIdToTrack;
			});
		}),
	setCenterText: publicProcedure
		.input(type({ centerText: "string" }))
		.mutation(({ input }) => {
			updateStateSync((state) => {
				state.centerText = input.centerText;
			});
		}),
	setBestOf: stationProcedure
		.input(type({ bestOf: "number" }))
		.mutation(({ input, ctx }) => {
			ctx.station.bestOf = input.bestOf;
		}),
	setCommentators: stationProcedure
		.input(type({ commentators: "string" }))
		.mutation(({ input, ctx }) => {
			ctx.station.commentators = input.commentators;
		}),
	setHighlighted: stationProcedure
		.input(type({ highlighted: "boolean" }))
		.mutation(({ input, ctx }) => {
			if (input.highlighted) {
				for (const station of globalState.stations) {
					station.highlighted = false;
				}
			}

			ctx.station.highlighted = input.highlighted;
		}),
	setPorts: stationProcedure
		.input(type({ ports: Ports }))
		.mutation(({ input, ctx }) => {
			ctx.station.ports = input.ports;
			ctx.station.slippi.shouldReportSetOnGameEnd = false;
		}),
	setEntrantOverride: stationProcedure
		.input(
			type({ side: "'left'|'right'", entrantOverride: EntrantInActiveSet }),
		)
		.mutation(({ input, ctx }) => {
			ctx.station.entrantOverride[
				input.side === "left" ? "entrantA" : "entrantB"
			] = input.entrantOverride;
		}),
	setBasicTextOverride: stationProcedure
		.input(type({ basicTextOverride: "string" }))
		.mutation(({ input, ctx }) => {
			ctx.station.basicTextOverride = input.basicTextOverride;
		}),
	setMode: stationProcedure
		.input(type({ mode: Mode }))
		.mutation(({ input, ctx }) => {
			ctx.station.mode = input.mode;
		}),
});
