import { createHTTPHandler } from "@trpc/server/adapters/standalone";
import { createServer } from "node:http";
import { createServer as createViteServer, type ViteDevServer } from "vite";
import { appRouter } from "./router";
import "./startgg-import/sapfpresse-updater";

const PORT =
	Bun.env.PORT === undefined ? 3000 : Number.parseInt(Bun.env.PORT, 10);

const isDevelopment = Bun.env.NODE_ENV !== "production";

const trpcHandler = createHTTPHandler({
	router: appRouter,
	basePath: "/trpc/",
});

const vite: ViteDevServer = await createViteServer({
	server: {
		middlewareMode: true,
		hmr: isDevelopment,
	},
	mode: isDevelopment ? "development" : "production",
});

const server = createServer((request, response) => {
	if (request.url !== undefined && request.url.startsWith("/trpc/")) {
		return trpcHandler(request, response);
	}

	return vite.middlewares(request, response);
});

server.listen(PORT, () => {
	console.log(`[Main] Server listening on http://localhost:${PORT}`);
});
