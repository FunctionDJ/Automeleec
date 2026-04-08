import { MenuItem, Paper, TextField, Typography } from "@mui/material";
import { characters } from "@slippi/slippi-js";
import type { EntrantInActiveSet } from "../../backend/state";
import { StockIcon } from "../shared-frontend/StockIcon";

type PlayerValue = (typeof EntrantInActiveSet.infer)["player1"];

const playableCharacters = characters
	.getAllCharacters()
	.filter((character) => character.id <= 25);

interface Props {
	label: string;
	player: PlayerValue;
	onChange: (player: PlayerValue) => void;
}

export const PlayerOverride = ({ label, player, onChange }: Props) => {
	const selectedCharacter = playableCharacters.find(
		(character) => character.id === player.character?.slippiCharacterId,
	);

	const costumeValue =
		selectedCharacter === undefined
			? ""
			: (player.character?.slippiCharacterColorId ?? 0);

	return (
		<Paper className="flex w-full flex-wrap items-center gap-4 px-3 py-2">
			{label !== "" && <Typography variant="subtitle2">{label}</Typography>}
			<TextField
				label="Name / Tag"
				className="w-30 grow"
				size="small"
				value={player.tag}
				onChange={(event) =>
					onChange({
						...player,
						tag: event.target.value,
					})
				}
			/>
			<TextField
				label="Pronouns"
				className="w-28"
				size="small"
				value={player.pronouns}
				onChange={(event) =>
					onChange({
						...player,
						pronouns: event.target.value,
					})
				}
			/>
			<TextField
				select
				label="Character"
				size="small"
				className="w-30"
				value={player.character?.slippiCharacterId ?? ""}
				onChange={(event) => {
					const characterId =
						event.target.value === "" ? null : Number(event.target.value);

					const nextCharacter = playableCharacters.find(
						(character) => character.id === characterId,
					);

					onChange({
						...player,
						character:
							nextCharacter === undefined
								? null
								: {
										slippiCharacterId: nextCharacter.id,
										slippiCharacterColorId:
											(player.character?.slippiCharacterColorId ?? 0) <
											nextCharacter.colors.length
												? (player.character?.slippiCharacterColorId ?? 0)
												: 0,
									},
					});
				}}
			>
				<MenuItem value="">None</MenuItem>
				{playableCharacters.map((character) => (
					<MenuItem key={character.id} value={character.id}>
						{character.name}
					</MenuItem>
				))}
			</TextField>
			<TextField
				select
				label="Costume"
				size="small"
				className="w-20"
				disabled={selectedCharacter === undefined}
				value={costumeValue}
				onChange={(event) => {
					const colorId =
						event.target.value === ""
							? null
							: Number.parseInt(event.target.value, 10);

					const characterId = player.character?.slippiCharacterId;

					if (colorId === null || characterId === undefined) {
						onChange({
							...player,
							character: null,
						});

						return;
					}

					onChange({
						...player,
						character: {
							slippiCharacterColorId: colorId,
							slippiCharacterId: characterId,
						},
					});
				}}
			>
				{(selectedCharacter?.colors ?? []).map((colorName, index) => (
					<MenuItem key={colorName} value={index}>
						{colorName}
					</MenuItem>
				))}
			</TextField>
			<div className="flex items-center gap-2">
				<StockIcon className="h-8 w-8" character={player.character} />
			</div>
		</Paper>
	);
};
