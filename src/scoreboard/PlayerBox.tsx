import { twMerge } from "tailwind-merge";
import type { EntrantOverrides, Station } from "../../backend/state";
import {
	entrantsToCharacter,
	entrantToPronouns,
	entrantToTag,
} from "../shared-frontend/entrant-to-x";
import { PlayerRow, type EntrantInScoreboard } from "./PlayerRow";

interface Props {
	uniqueKey: string;
	className: string;
	align: "L" | "R";
	station: typeof Station.infer | undefined;
	style: React.CSSProperties;
}

const emptyEntrantInScoreboard: EntrantInScoreboard = {
	tag: "",
	pronouns: "",
	score: null,
	characters: [],
};

const getEntrantInScoreboard = (
	station: typeof Station.infer | undefined,
	entrantKey: keyof typeof EntrantOverrides.infer,
): EntrantInScoreboard => {
	if (station === undefined) {
		return emptyEntrantInScoreboard;
	}

	switch (station.mode) {
		case "basic-text-override": {
			return entrantKey === "entrantB"
				? {
						tag: station.basicTextOverride,
						pronouns: "",
						score: null,
						characters: [],
					}
				: emptyEntrantInScoreboard;
		}
		case "entrant-override": {
			const { entrantOverride } = station;
			const entrant = entrantOverride[entrantKey];

			return {
				tag: entrantToTag(entrant),
				pronouns: entrantToPronouns(entrant),
				score: entrant.score ?? null,
				characters: entrantsToCharacter(entrant),
			};
		}
		case "startgg": {
			const { currentSet } = station;

			if (currentSet == null) {
				return {
					tag: "",
					pronouns: "",
					score: null,
					characters: [],
				};
			}

			return {
				tag: entrantToTag(currentSet[entrantKey]),
				pronouns: entrantToPronouns(currentSet[entrantKey]),
				score: currentSet[entrantKey].score,
				characters: entrantsToCharacter(currentSet[entrantKey]),
			};
		}
	}
};

export const PlayerBox = ({
	uniqueKey,
	className,
	align,
	station,
	style,
}: Props) => {
	const roundedClass = align === "L" ? "rounded-r-[2vw]" : "rounded-l-[2vw]";
	const alignClass = align === "L" ? "left-0" : "right-0";

	const entrantAInScoreBoard = getEntrantInScoreboard(station, "entrantA");
	const entrantBInScoreBoard = getEntrantInScoreboard(station, "entrantB");

	return (
		<div
			className={twMerge(
				`h-1/8 w-5/6 ${roundedClass} ${alignClass} absolute leading-[3vw]`,
				className,
			)}
			style={style}
		>
			<PlayerRow
				uniqueKey={`${uniqueKey}-A`}
				className="bottom-1/2"
				entrant={entrantAInScoreBoard}
				align={align}
			/>
			<PlayerRow
				uniqueKey={`${uniqueKey}-B`}
				className="bottom-0"
				entrant={entrantBInScoreBoard}
				align={align}
			/>
		</div>
	);
};
