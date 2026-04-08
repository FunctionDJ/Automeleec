import {
	ConnectionEvent,
	ConnectionStatus,
	ConsoleConnection,
	SlpParser,
	SlpStream,
	SlpStreamEvent,
	type GameEndType,
	type GameStartType,
} from "@slippi/slippi-js/node";
import { startReplayWriter } from "../replay-export/replay-export";
import { updateStationSync, type Station } from "../state";
import { prefixLogger } from "../logger";

// [FUTURE] maybe we should just use ConnectionStatus directly for state instead of having to do mapping

const statusMap = {
	[ConnectionStatus.CONNECTING]: "connecting",
	[ConnectionStatus.CONNECTED]: "connected",
	[ConnectionStatus.DISCONNECTED]: "disconnected",
	[ConnectionStatus.RECONNECT_WAIT]: "reconnect-wait",
} satisfies Record<
	ConnectionStatus,
	typeof Station.infer.slippi.slippiState.status
>;

export const createSlippiConnectionSet = (stationNumber: number) => {
	const logger = prefixLogger("SlippiController", `Station ${stationNumber}`);
	const conn = new ConsoleConnection({ autoReconnect: true });
	const stream = new SlpStream();
	const parser = new SlpParser();

	conn.on(ConnectionEvent.STATUS_CHANGE, (newSlippiStatus) => {
		const newStationSlippiStatus = statusMap[newSlippiStatus];

		logger.info(
			`[${conn.getSettings().ipAddress}:${conn.getSettings().port}] New connection status: ${newStationSlippiStatus}`,
		);

		updateStationSync(stationNumber, (station) => {
			station.slippi.slippiState =
				newStationSlippiStatus === "connected"
					? {
							status: "connected",
							consoleNick: conn.getDetails().consoleNick,
							version: conn.getDetails().version,
						}
					: { status: newStationSlippiStatus };
		});
	});

	conn.on(ConnectionEvent.ERROR, (error) => {
		logger.error(
			`[${conn.getSettings().ipAddress}:${conn.getSettings().port}] Connection error:`,
			error,
		);

		updateStationSync(stationNumber, (station) => {
			station.slippi.slippiState = {
				status: "error",
				errorMessage: "Connection error: " + String(error),
			};
		});
	});

	conn.on(ConnectionEvent.DATA, (data) => stream.process(data));

	stream.on(SlpStreamEvent.COMMAND, ({ command, payload }) =>
		parser.handleCommand(command, payload),
	);

	startReplayWriter(stream, stationNumber).catch((error: unknown) => {
		logger.error(
			`[${conn.getSettings().ipAddress}:${conn.getSettings().port}] ReplayWriter error:`,
			error,
		);
	});

	return {
		conn,
		stream,
		parser,
		/**
		 * the following two are function references that we need to store
		 * so that we can unregister them when registering new ones
		 * when the connection is stopped/started.
		 */
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		parserSettingsListenerReference: (_settings: GameStartType) => {
			/* empty */
		},
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		parserEndListenerReference: (_gameEnd: GameEndType) => {
			/* empty */
		},
	};
};
