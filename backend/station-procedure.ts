import { type } from "arktype";
import { getStationOrThrow, updateStateAsync } from "./state";
import { publicProcedure } from "./trpc-server";

export const stationProcedure = publicProcedure
	.input(type({ stationNumber: "number" }))
	.use(async ({ next, input, ctx }) =>
		updateStateAsync(() =>
			next({
				ctx: {
					...ctx,
					station: getStationOrThrow(input.stationNumber),
				},
			}),
		),
	);
