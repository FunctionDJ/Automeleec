import { QueryClient } from "@tanstack/react-query";
import {
	createTRPCClient,
	httpBatchLink,
	httpSubscriptionLink,
	loggerLink,
	splitLink,
} from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "../backend/router.js";

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
		},
	},
});

export const trpc = createTRPCClient<AppRouter>({
	links: [
		loggerLink(),
		splitLink({
			condition: (op) => op.type === "subscription",
			true: httpSubscriptionLink({ url: "/trpc", transformer: superjson }),
			false: httpBatchLink({ url: "/trpc", transformer: superjson }),
		}),
	],
});
