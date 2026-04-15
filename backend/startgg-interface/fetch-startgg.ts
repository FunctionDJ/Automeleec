import { type } from "arktype";

const StartGGGraphQLResponse = type({
	data: "unknown",
}).or({
	errors: type({
		message: "string",
	}).array(),
});

export const fetchStartGG = async (
	query: string,
	variables: Record<string, unknown> = {},
) => {
	const response = await fetch("https://api.start.gg/gql/alpha", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${Bun.env.STARTGG_API_KEY}`,
		},
		body: JSON.stringify({ query, variables }),
	});

	let json;

	try {
		json = await response.json();
	} catch (error) {
		throw new Error("Startgg replied with invalid JSON: " + await response.text())
	}

	const result = StartGGGraphQLResponse(json);

	if (result instanceof type.errors) {
		throw new TypeError(
			`[FetchStartGG] Invalid response: ${result.summary}\nResponse was: ${JSON.stringify(json, null, 2)}`,
		);
	}

	if ("errors" in result) {
		throw new Error(
			`[FetchStartGG] GraphQL error(s): ${result.errors.map((error) => error.message).join(", ")}`,
		);
	}

	return result.data;
};
