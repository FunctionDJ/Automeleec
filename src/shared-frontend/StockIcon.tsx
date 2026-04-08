import { characters } from "@slippi/slippi-js";
import { AnimatePresence, motion } from "motion/react";
import type { Character } from "../../backend/state";

const playableCharacters = characters
	.getAllCharacters()
	.filter((character) => character.id <= 25);

const getStockIconSource = (
	characterId: number | null,
	colorId: number | null,
) => {
	if (characterId === null) {
		return null;
	}

	const characterInfo = playableCharacters.find(
		(character) => character.id === characterId,
	);

	if (characterInfo === undefined) {
		return null;
	}

	const selectedColor =
		colorId === null || colorId === 0
			? null
			: (characterInfo.colors[colorId] ?? null);

	return `/stock-icons/${characterInfo.shortName}${selectedColor === null ? "" : `_${selectedColor}`}.png`;
};

interface Props {
	className?: string;
	character: typeof Character.infer | null;
}

export const StockIcon = ({ className, character }: Props) => {
	const characterId = character?.slippiCharacterId ?? null;
	const colorId = character?.slippiCharacterColorId ?? null;

	return (
		<AnimatePresence mode="wait">
			<motion.img
				transition={{ duration: 0.3 }}
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				key={`${characterId}-${colorId}`}
				className={`drop-shadow-xs drop-shadow-black/75 ${className ?? ""}`}
				style={{ imageRendering: "pixelated" }}
				src={
					getStockIconSource(characterId, colorId) ?? "/stock-icons/Blank.png"
				}
			/>
		</AnimatePresence>
	);
};
