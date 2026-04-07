import { Alert, Snackbar } from "@mui/material";
import { useSyncExternalStore } from "react";
import {
	clearTrpcErrors,
	listenerContainer,
	tRPCErrorRecord,
} from "./trpc-error-store.ts";

export const TrpcErrorNotifications = () => {
	const record = useSyncExternalStore(
		(listener) => {
			listenerContainer.listener = listener;
			return () => {
				listenerContainer.listener = () => {
					/** no-op */
				};
			};
		},
		() => tRPCErrorRecord,
	);

	const path = record?.path ?? null;

	return (
		<Snackbar open={record !== null}>
			<Alert
				className="items-center max-w-lg"
				severity="error"
				variant="filled"
				onClose={clearTrpcErrors}
			>
				{path === null ? (
					record?.summary
				) : (
					<>
						{path}:
						<br />
						{record?.summary}
					</>
				)}
			</Alert>
		</Snackbar>
	);
};
