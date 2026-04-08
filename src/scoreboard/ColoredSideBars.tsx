import { scoreboardAccentColors } from "./colors";

export const ColoredSideBars = () => (
	<div id="colored-side-bars" className="h-full">
		<div className="h-1/2 flex justify-between *:w-1/20">
			<div
				className="rounded-r-[1vw]"
				style={{
					backgroundColor: scoreboardAccentColors.orange,
				}}
			/>
			<div
				className="rounded-l-[1vw]"
				style={{
					backgroundColor: scoreboardAccentColors.cherry,
				}}
			/>
		</div>
		<div className="h-1/2 flex justify-between *:w-1/20">
			<div
				className="rounded-r-[1vw]"
				style={{
					backgroundColor: scoreboardAccentColors.grape,
				}}
			/>
			<div
				className="rounded-l-[1vw]"
				style={{
					backgroundColor: scoreboardAccentColors.apple,
				}}
			/>
		</div>
	</div>
);
