import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode, type JSX } from "react";
import { createRoot } from "react-dom/client";
import { queryClient } from "./trpc-client.ts";

// TODO i dont really like the "wrap" thing. maybe we can just render the TrpcErrorNotification in each App?

export const commonMain = (
	AppComponent: () => JSX.Element,
	wrap?: (content: JSX.Element) => JSX.Element,
) => {
	const root = document.getElementById("root");

	if (!root) {
		window.alert("Root element not found");
		return;
	}

	const content = (
		<QueryClientProvider client={queryClient}>
			<AppComponent />
		</QueryClientProvider>
	);

	createRoot(root).render(
		<StrictMode>{wrap ? wrap(content) : content}</StrictMode>,
	);
};
