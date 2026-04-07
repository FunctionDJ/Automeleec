import {
	Button,
	CircularProgress,
	IconButton,
	Paper,
	Popover,
	TextField,
	Tooltip,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { type } from "arktype";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import type { Station } from "../../backend/state";
import { trpc } from "../trpc-client";
import slippiLogo from "./SlippiLogo.svg";
import { SlippiStatusText } from "./SlippiStatusText";

export function SlippiConnectionControl({
	station,
}: {
	station: typeof Station.infer;
}) {
	const n = station.startggStationNumber;

	const [slippiAnchorElement, setSlippiAnchorElement] =
		useState<HTMLElement | null>(null);
	const [editIp, setEditIp] = useState(station.slippi.ip);
	const [editPort, setEditPort] = useState(station.slippi.port);

	const editIpMutation = useMutation(
		trpc.dashboard.slippi.editIp.mutationOptions(),
	);
	const editPortMutation = useMutation(
		trpc.dashboard.slippi.editPort.mutationOptions(),
	);
	const submitSlippiIp = useDebouncedCallback(
		(ip: string) => editIpMutation.mutate({ stationNumber: n, ip }),
		500,
	);
	const submitSlippiPort = useDebouncedCallback(
		(port: number) => editPortMutation.mutate({ stationNumber: n, port }),
		500,
	);
	const startConnectionMutation = useMutation(
		trpc.dashboard.slippi.startStationConnection.mutationOptions(),
	);
	const stopConnectionMutation = useMutation(
		trpc.dashboard.slippi.stopStationConnection.mutationOptions(),
	);
	const resetErrorMutation = useMutation(
		trpc.dashboard.slippi.resetError.mutationOptions(),
	);

	const isConnected = station.slippi.slippiState.status === "connected";
	const isConnecting =
		station.slippi.slippiState.status === "connecting" ||
		station.slippi.slippiState.status === "reconnect-wait";
	const isInactive = !isConnected && !isConnecting;
	const canConnect = type("string.ip").allows(station.slippi.ip.trim());

	return (
		<Paper className="flex gap-3 items-center px-4 py-1.5" elevation={4}>
			<Tooltip
				title={
					station.slippi.slippiState.status === "error"
						? station.slippi.slippiState.errorMessage
						: ""
				}
			>
				<SlippiStatusText slippiState={station.slippi.slippiState} />
			</Tooltip>
			<Tooltip title="Open Slippi Connection Management">
				<IconButton
					onClick={(event) => {
						setSlippiAnchorElement(event.currentTarget);
					}}
					sx={{
						position: "relative",
						backgroundColor: {
							error: "error.dark",
							connected: "#44A963",
							connecting: "warning.dark",
							disconnected: "grey.800",
							"reconnect-wait": "warning.dark",
						}[station.slippi.slippiState.status],
					}}
					className={
						station.slippi.slippiState.status === "error" ? "animate-pulse" : ""
					}
				>
					<img
						src={slippiLogo}
						alt="Slippi Logo"
						className={`h-6 w-6 ${isConnecting ? "opacity-40" : ""}`}
					/>
					{/* using the below instead of the indicator prop for <IconButton> because the indicator prop prevents interaction. this is also why the position-relative on the IconButton */}
					{isConnecting && (
						<CircularProgress className="absolute" sx={{ color: "white" }} />
					)}
				</IconButton>
			</Tooltip>

			<Popover
				open={slippiAnchorElement !== null}
				anchorEl={slippiAnchorElement}
				onClose={() => setSlippiAnchorElement(null)}
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "center",
				}}
				transformOrigin={{
					vertical: "top",
					horizontal: "center",
				}}
			>
				<div className="flex flex-col gap-5 p-4 w-72">
					<TextField
						label="IP Address"
						value={editIp}
						disabled={!isInactive}
						onChange={(event) => {
							if (/[^0-9.]/.test(event.target.value)) {
								return;
							}

							setEditIp(event.target.value);
							submitSlippiIp(event.target.value);
						}}
					/>
					<TextField
						label="Port"
						value={editPort}
						disabled={!isInactive}
						onChange={(event) => {
							if (/\D/.test(event.target.value)) {
								return;
							}

							const port = Number.parseInt(event.target.value, 10);
							setEditPort(port);
							submitSlippiPort(port);
						}}
					/>
					{isInactive ? (
						<>
							<Button
								variant="contained"
								color="success"
								disabled={startConnectionMutation.isPending || !canConnect}
								onClick={() => {
									startConnectionMutation.mutate({ stationNumber: n });
									setSlippiAnchorElement(null);
								}}
							>
								Connect
							</Button>
							{station.slippi.slippiState.status === "error" && (
								<Button
									variant="outlined"
									color="warning"
									disabled={resetErrorMutation.isPending}
									onClick={() => {
										resetErrorMutation.mutate({ stationNumber: n });
										setSlippiAnchorElement(null);
									}}
								>
									Reset Error
								</Button>
							)}
						</>
					) : (
						<Button
							variant="contained"
							color="error"
							disabled={stopConnectionMutation.isPending}
							onClick={() => {
								const confirmDisconnect = globalThis.confirm(
									`Disconnect station ${n} from Slippi?`,
								);

								if (!confirmDisconnect) {
									return;
								}

								stopConnectionMutation.mutate({ stationNumber: n });
								setSlippiAnchorElement(null);
							}}
						>
							Disconnect
						</Button>
					)}
				</div>
			</Popover>
		</Paper>
	);
}
