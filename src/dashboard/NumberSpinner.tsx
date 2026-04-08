import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import AddIcon from "@mui/icons-material/Add";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import RemoveIcon from "@mui/icons-material/Remove";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";

// from MUI number field docs

export default function NumberSpinner({
	size = "small",
	onValueChange,
	value,
	disabled,
}: {
	size?: "small" | "medium";
	value: number | null;
	onValueChange: (value: number | null) => void;
	disabled: boolean;
}) {
	return (
		<BaseNumberField.Root
			disabled={disabled}
			value={value}
			onValueChange={onValueChange}
			render={(properties, state) => (
				<FormControl
					size={size}
					ref={properties.ref}
					disabled={state.disabled}
					required={state.required}
					variant="outlined"
					sx={{
						"& .MuiButton-root": {
							borderColor: "divider",
							minWidth: 0,
							bgcolor: "action.hover",
							"&:not(.Mui-disabled)": {
								color: "text.primary",
							},
						},
					}}
				>
					{properties.children}
				</FormControl>
			)}
		>
			<BaseNumberField.ScrubArea
				render={
					<Box
						component="span"
						sx={{ userSelect: "none", width: "max-content" }}
					/>
				}
			>
				<BaseNumberField.ScrubAreaCursor>
					<OpenInFullIcon
						fontSize="small"
						sx={{ transform: "translateY(12.5%) rotate(45deg)" }}
					/>
				</BaseNumberField.ScrubAreaCursor>
			</BaseNumberField.ScrubArea>
			<Box sx={{ display: "flex" }}>
				<BaseNumberField.Decrement
					render={
						<Button
							variant="outlined"
							aria-label="Decrease"
							size={size}
							sx={{
								borderTopRightRadius: 0,
								borderBottomRightRadius: 0,
								borderRight: "0px",
								"&.Mui-disabled": {
									borderRight: "0px",
								},
							}}
						/>
					}
				>
					<RemoveIcon fontSize={size} />
				</BaseNumberField.Decrement>

				<BaseNumberField.Input
					render={(properties, state) => (
						<OutlinedInput
							inputRef={properties.ref}
							value={state.inputValue}
							onBlur={properties.onBlur}
							onChange={properties.onChange}
							onKeyUp={properties.onKeyUp}
							onKeyDown={properties.onKeyDown}
							onFocus={properties.onFocus}
							slotProps={{
								input: {
									...properties,
									size: Math.max(0, state.inputValue.length || 1) + 1,
									sx: {
										textAlign: "center",
									},
								},
							}}
							sx={{ pr: 0, borderRadius: 0, flex: 1 }}
						/>
					)}
				/>

				<BaseNumberField.Increment
					render={
						<Button
							variant="outlined"
							aria-label="Increase"
							size={size}
							sx={{
								borderTopLeftRadius: 0,
								borderBottomLeftRadius: 0,
								borderLeft: "0px",
								"&.Mui-disabled": {
									borderLeft: "0px",
								},
							}}
						/>
					}
				>
					<AddIcon fontSize={size} />
				</BaseNumberField.Increment>
			</Box>
		</BaseNumberField.Root>
	);
}
