import { useState } from "react";
import type { State } from "../../backend/state";
import { ColoredSideBars } from "./ColoredSideBars";
import { LogoAndTitle } from "./LogoAndTitle";
import { PlayerBoxes } from "./PlayerBoxes";
import { useSubscription } from "@trpc/tanstack-react-query";
import { trpc } from "../trpc-client";

export const MiddleSection = () => {
	const [state, setState] = useState<typeof State.infer | null>(null);

	const subscription = useSubscription(
		trpc.stateSubscription.subscriptionOptions(undefined, {
			onData: (data) => {
				setState(data);
			},
		}),
	);

	if (subscription.status === "error") {
		return <p>Error: {subscription.error.message}</p>;
	}

	if (state === null) {
		return <p>Loading state...</p>;
	}

	return (
		<div
			id="middle-section"
			className="grow bg-linear-to-r from-yellow-200 via-yellow-100 to-yellow-200 relative"
		>
			<PlayerBoxes state={state} />
			<LogoAndTitle centerText={state.centerText} />
			<ColoredSideBars />
		</div>
	);
};
