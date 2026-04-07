import { type } from "arktype";

/* eslint-disable no-console */
export const loggingEmitter = new EventTarget();

export const LogEntry = type({
	level: "'info'|'warn'|'error'",
	message: "string",
});

const emit = (level: "info" | "warn" | "error", message: string) => {
	const logEntry: typeof LogEntry.infer = { level, message };

	loggingEmitter.dispatchEvent(
		new CustomEvent("entry", {
			detail: logEntry,
		}),
	);
};

type Modules =
	| "Main"
	| "LoadState"
	| "ReplayWriter"
	| "SlippiController"
	| "StartggExport"
	| "StartggImport";

export const prefixLogger = (module?: Modules, additionalPrefix?: string) => {
	const assembleMessage = (message: string) => {
		const additionalPrefixPart =
			additionalPrefix === undefined ? "" : ` ${additionalPrefix}`;

		return `[${module ?? "Unknown"}${additionalPrefixPart}] ${message}`;
	};

	return {
		info(message: string, details?: unknown) {
			const assembled = assembleMessage(message);

			if (details === undefined) {
				console.info(assembled);
			} else {
				console.info(assembled, "\nDetails:\n", details);
			}

			emit(
				"info",
				assembled + (details === undefined ? "" : ` (details in app console)`),
			);
		},
		warn(message: string, details?: unknown) {
			const assembled = assembleMessage(message);

			if (details === undefined) {
				console.warn(assembled);
			} else {
				console.warn(assembled, "\nDetails:\n", details);
			}

			emit(
				"warn",
				assembled + (details === undefined ? "" : ` (details in app console)`),
			);
		},
		error(message: string, details?: unknown) {
			const assembled = assembleMessage(message);

			if (details === undefined) {
				console.error(assembled);
			} else {
				console.error(assembled, "\nDetails:\n", details);
			}

			emit(
				"error",
				assembled + (details === undefined ? "" : ` (details in app console)`),
			);
		},
	};
};
