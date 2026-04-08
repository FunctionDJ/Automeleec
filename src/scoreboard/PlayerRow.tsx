import type { Character } from "../../backend/state";
import { StockIcon } from "../shared-frontend/StockIcon";
import { CustomAutoTextSize } from "./CustomAutoTextSize";
import { Stroked } from "./Stroked";

export interface EntrantInScoreboard {
	tag: string;
	pronouns: string;
	score: number | null;
	characters: (typeof Character.infer)[];
}

interface Props {
	className?: string;
	align: "L" | "R";
	entrant: EntrantInScoreboard;
}

export const PlayerRow = ({ className, align, entrant }: Props) => {
	const alignClass =
		align === "L" ? "left-[1vw] right-0" : "left-0 right-[1vw]";
	const flexClass = align === "L" ? "flex-row-reverse" : "flex-row";
	const pronounsClass = align === "L" ? "left-0" : "right-0";

	return (
		<div
			className={`absolute h-1/2 ${alignClass} flex ${flexClass} gap-[0.5vw] text-[3vw] ${className} px-1 py-0.5 items-center`}
		>
			<div className="relative flex grow h-full py-0.5">
				<Stroked
					className={`absolute z-10 -top-[1.8vw] ${pronounsClass} text-[1.4vw]`}
					stroke={0.6}
				>
					{entrant.pronouns}
				</Stroked>
				{/* TODO add framer motion... somehow */}
				<div
					className={`flex-1 ${align === "L" ? "justify-start" : "justify-end"} flex`}
				>
					{/* wrapper just for AutoTextSize because otherwise it shows a warning: "AutoTextSize has 1 siblings. This may interfere with the algorithm." */}

					<CustomAutoTextSize className="absolute self-center">
						{entrant.tag}
					</CustomAutoTextSize>
				</div>
			</div>
			<StockIcon className="h-3/4" character={entrant.characters[0] ?? null} />
			{entrant.characters.length > 1 && (
				<StockIcon
					className="h-3/4"
					character={entrant.characters[1] ?? null}
				/>
			)}
			<div className="flex justify-center w-[2.3vw] text-[3vw]">
				<Stroked>{entrant.score}</Stroked>
			</div>
		</div>
	);
};
