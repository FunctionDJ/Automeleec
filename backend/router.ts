import { on } from "node:events";
import { dashboardRouter } from "./dashboard-import/dashboard-import.js";
import { selfServiceRouter } from "./selfservice-import/selfservice-import.js";
import { emitter, state, type State } from "./state.js";
import { publicProcedure, router } from "./trpc-server.js";

// await createSlippiConnection({
// 	ip: "localhost",
// 	port: 53742,
// 	stationId: 3,
// 	onGameEnd,
// 	replayFolder: "./replays",
// });
// await createSlippiConnection({
// 	ip: "10.0.2.48",
// 	stationId: 3,
// 	onGameEnd,
// 	replayFolder: "./replays",
// });

export const appRouter = router({
	selfService: selfServiceRouter,
	dashboard: dashboardRouter,
	stateSubscription: publicProcedure.subscription(async function* ({ signal }) {
		// for first load
		yield state;

		for await (const [data] of on(emitter, "data", { signal }) as AsyncIterable<
			State[]
		>) {
			if (data !== undefined) {
				yield data;
			}
		}
	}),
});

export type AppRouter = typeof appRouter;
