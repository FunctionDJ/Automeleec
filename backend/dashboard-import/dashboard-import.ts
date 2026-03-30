import { TRPCError } from "@trpc/server";
import { type } from "arktype";
import { EntrantInCurrentSet, Mode, signalUpdate, state } from "../state";
import { publicProcedure, router } from "../trpc-server";

export const stationProcedure = publicProcedure
	.input(type({ stationNumber: "number" }))
	.use(({ next, input, ctx }) => {
		const station = state.stations.find(
			(s) => s.startggStationNumber === input.stationNumber,
		);

		if (station === undefined) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: `Station with number ${input.stationNumber} not found`,
			});
		}

		return next({ ctx: { ...ctx, station } });
	});

export const dashboardRouter = router({
	setPlayerOverride: stationProcedure
		.input(
			type({ entrantOverride: [EntrantInCurrentSet, EntrantInCurrentSet] }),
		)
		.mutation(({ input, ctx }) => {
			ctx.station.entrantOverride = input.entrantOverride;
			signalUpdate();
		}),
	setBasicTextOverride: stationProcedure
		.input(type({ basicTextOverride: "string" }))
		.mutation(({ input, ctx }) => {
			ctx.station.basicTextOverride = input.basicTextOverride;
			signalUpdate();
		}),
	setMode: stationProcedure
		.input(type({ mode: Mode }))
		.mutation(({ input, ctx }) => {
			ctx.station.mode = input.mode;
			signalUpdate();
		}),
});
