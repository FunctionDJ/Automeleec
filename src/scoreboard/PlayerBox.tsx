import { twMerge } from "tailwind-merge";
import type {
	Character,
	Entrant,
	EntrantInActiveSet,
	EntrantOverrides,
	Station,
} from "../../backend/state";
import { PlayerRow, type EntrantInScoreboard } from "./PlayerRow";

interface Props {
	className: string;
	align: "L" | "R";
	station: typeof Station.infer | undefined;
	style: React.CSSProperties;
}

const entrantsToCharacter = (entrant: typeof EntrantInActiveSet.infer) => {
	const charactersInScoreboard: (typeof Character.infer)[] = [];

	const pushIfExists = (character: typeof Character.infer | null) => {
		if (character !== null) {
			charactersInScoreboard.push(character);
		}
	};

	pushIfExists(entrant.player1.character);
	pushIfExists(entrant.player2?.character ?? null);

	return charactersInScoreboard;
};

const entrantToTag = (entrant: typeof Entrant.infer) => {
	let result = entrant.player1.tag;

	if (entrant.player2) {
		result += " & " + entrant.player2.tag;
	}

	return result;
};

const entrantToPronouns = (entrant: typeof Entrant.infer) => {
	let result = entrant.player1.pronouns;

	if (entrant.player2) {
		result += " & " + entrant.player2.pronouns;
	}

	return result;
};

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

export const PlayerBox = ({ className, align, station, style }: Props) => {
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
				className="bottom-1/2"
				entrant={entrantAInScoreBoard}
				align={align}
			/>
			<PlayerRow
				className="bottom-0"
				entrant={entrantBInScoreBoard}
				align={align}
			/>
		</div>
	);
};
