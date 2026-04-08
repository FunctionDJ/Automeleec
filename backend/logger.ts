import { type } from "arktype";
import * as winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const winstonLogger = winston.createLogger({
	transports: [
		new winston.transports.Console(),
		new DailyRotateFile({
			dirname: "logs",
		}),
	],
});

export const loggingEmitter = new EventTarget();

export const LogEntry = type({
	level: "'info'|'warn'|'error'",
	message: "string",
});

// [FUTURE] maybe emit can be baked into winston as a transport

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
				winstonLogger.info(assembled);
			} else {
				winstonLogger.info(assembled, "\nDetails:\n", details);
			}

			emit(
				"info",
				assembled + (details === undefined ? "" : ` (details in app console)`),
			);
		},
		warn(message: string, details?: unknown) {
			const assembled = assembleMessage(message);

			if (details === undefined) {
				winstonLogger.warn(assembled);
			} else {
				winstonLogger.warn(assembled, "\nDetails:\n", details);
			}

			emit(
				"warn",
				assembled + (details === undefined ? "" : ` (details in app console)`),
			);
		},
		error(message: string, details?: unknown) {
			const assembled = assembleMessage(message);

			if (details === undefined) {
				winstonLogger.error(assembled);
			} else {
				winstonLogger.error(assembled, "\nDetails:\n", details);
			}

			emit(
				"error",
				assembled + (details === undefined ? "" : ` (details in app console)`),
			);
		},
	};
};
