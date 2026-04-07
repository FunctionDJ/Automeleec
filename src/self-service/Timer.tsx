import { useEffect, useState } from "react";

interface Props {
	startDate: Date;
}

const getCurrentTimerString = (startDate: Date) => {
	const now = new Date();
	const diff = Math.floor((now.getTime() - startDate.getTime()) / 1000);
	const minutes = Math.floor(diff / 60);
	const seconds = diff % 60;
	return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export const Timer = ({ startDate }: Props) => {
	const [elapsed, setElapsed] = useState(() =>
		getCurrentTimerString(startDate),
	);

	useEffect(() => {
		const interval = setInterval(() => {
			setElapsed(getCurrentTimerString(startDate));
		}, 1000);

		return () => clearInterval(interval);
	}, [startDate]);

	return <span>{elapsed}</span>;
};
