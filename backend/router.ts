import { on } from "node:events";
import { dashboardRouter } from "./dashboard-import/dashboard-router.js";
import { selfServiceRouter } from "./selfservice-import/selfservice-import.js";
import { emitter, globalState, State } from "./state.js";
import { publicProcedure, router } from "./trpc-server.js";

export const appRouter = router({
	selfService: selfServiceRouter,
	dashboard: dashboardRouter,
	stateSubscription: publicProcedure.subscription(async function* ({ signal }) {
		// for first load
		yield globalState;

		for await (const [event] of on(emitter, "data", { signal })) {
			if (!(event instanceof CustomEvent)) {
				throw new TypeError("State Emitter emitted non-CustomEvent");
			}

			yield State.assert(event.detail);
		}
	}),
});

export type AppRouter = typeof appRouter;
