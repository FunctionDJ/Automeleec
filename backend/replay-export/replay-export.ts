import {
	SlpFileWriter,
	SlpFileWriterEvent,
	SlpStreamEvent,
	type SlpStream,
} from "@slippi/slippi-js/node";

// TODO if set is finished, rename the SLP files according to replay-manager and ZIP them up

export const startReplayWriter = (stream: SlpStream, stationId: number) => {
	const fileWriter = new SlpFileWriter({
		outputFiles: true,
		folderPath: "./replays",
		consoleNickname: `Station ${stationId}`,
	});

	stream.on(SlpStreamEvent.RAW, ({ payload }) => {
		fileWriter.write(Buffer.from(payload));
	});

	fileWriter.on(SlpFileWriterEvent.NEW_FILE, (filePath) => {
		console.log(`[ReplayWriter] Started recording replay: ${filePath}`);
	});

	fileWriter.on(SlpFileWriterEvent.FILE_COMPLETE, (filePath) => {
		console.log(`[ReplayWriter] Replay saved: ${filePath}`);
	});
};
