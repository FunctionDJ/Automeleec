import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import {
	createTRPCClient,
	httpBatchLink,
	httpSubscriptionLink,
	loggerLink,
	splitLink,
} from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import reactHotToast from "react-hot-toast";
import superjson from "superjson";
import type { AppRouter } from "../backend/router.js";
import { type } from "arktype";

const getPathFromKeyLike = (keyLike: unknown) => {
	if (keyLike === undefined) {
		return null;
	}

	const parsedKeyResult = type("string[][]")(keyLike);

	if (parsedKeyResult instanceof type.errors) {
		return "(unsupported key path format)";
	}

	return parsedKeyResult.join(".");
};

export const queryClient = new QueryClient({
	queryCache: new QueryCache({
		onError: (error, query) => {
			const path = getPathFromKeyLike(query.queryKey);

			if (path === null) {
				reactHotToast.error(error.message);
			} else {
				reactHotToast.error(`${path}:\n${error.message}`);
			}
		},
	}),
	mutationCache: new MutationCache({
		onError: (error, _variables, _context, mutation) => {
			const path = getPathFromKeyLike(mutation.options.mutationKey);

			if (path === null) {
				reactHotToast.error(error.message);
			} else {
				reactHotToast.error(`${path}:\n${error.message}`);
			}
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
