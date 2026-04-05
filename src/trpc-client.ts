import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import {
	createTRPCClient,
	httpBatchLink,
	httpSubscriptionLink,
	loggerLink,
	splitLink,
} from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import superjson from "superjson";
import type { AppRouter } from "../backend/router.js";
import { reportTrpcError } from "./trpc-error-store.ts";

export const queryClient = new QueryClient({
	queryCache: new QueryCache({
		onError: (error, query) => {
			reportTrpcError(error, query.queryKey);
		},
	}),
	mutationCache: new MutationCache({
		onError: (error, _variables, _context, mutation) => {
			reportTrpcError(error, mutation.options.mutationKey);
		},
	}),
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
		},
	},
});

export const trpcVanilla = createTRPCClient<AppRouter>({
	links: [
		loggerLink(),
		splitLink({
			condition: (op) => op.type === "subscription",
			true: httpSubscriptionLink({ url: "/trpc", transformer: superjson }),
			false: httpBatchLink({ url: "/trpc", transformer: superjson }),
		}),
	],
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
	client: trpcVanilla,
	queryClient,
});
