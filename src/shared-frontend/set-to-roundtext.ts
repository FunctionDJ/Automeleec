import type { UpcomingSet } from "../../backend/state";

export const setToRoundText = (set: typeof UpcomingSet.infer) => {
	if (set.phaseGroup.bracketType === "ROUND_ROBIN") {
		return `Pool ${set.phaseGroup.displayIdentifier}`;
	}

	if (
		set.phaseGroup.bracketType === "DOUBLE_ELIMINATION" ||
		set.phaseGroup.bracketType === "SINGLE_ELIMINATION"
	) {
		return set.fullRoundText;
	}

	return `
			[Unsupported Bracket Type ${set.phaseGroup.bracketType}, fullRoundText ${set.fullRoundText}]
		`;
};
