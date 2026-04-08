// @ts-check

import react from "@eslint-react/eslint-plugin";
import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import typescript from "typescript-eslint";
import unicorn from "eslint-plugin-unicorn";
import tanstackQuery from "@tanstack/eslint-plugin-query";
import deMorganBooleanLogic from "eslint-plugin-de-morgan";
import importX from "eslint-plugin-import-x";
import reactCompiler from "eslint-plugin-react-compiler";
import reactRefresh from "eslint-plugin-react-refresh";

export default defineConfig([
	{ ignores: ["eslint.config.js", "eslint-rules/*.js"] },
	eslint.configs.recommended,
	importX.flatConfigs.recommended,
	importX.flatConfigs.typescript,
	...tanstackQuery.configs["flat/recommended-strict"],
	typescript.configs.strictTypeChecked,
	typescript.configs.stylisticTypeChecked,
	unicorn.configs.recommended,
	reactCompiler.configs.recommended,
	reactRefresh.configs.vite,
	deMorganBooleanLogic.configs.recommended,
	react.configs["strict-type-checked"],
	{
		settings: {
			react: {
				version: "detect",
			},
		},
		languageOptions: {
			parserOptions: {
				projectService: true,
			},
		},
		rules: {
			"no-console": "error",
			curly: "error",
			// allow null because i prefer explicit null and avoid undefined
			"unicorn/no-null": "off",
			"unicorn/prevent-abbreviations": [
				"error",
				// allow "Props" for react props interfaces and "Ref" for react refs
				{ allowList: { Props: true, Ref: true, ref: true } },
			],
			// dont enforce separators because of e.g. port numbers where it would be silly
			"unicorn/numeric-separators-style": "off",
			"@typescript-eslint/strict-boolean-expressions": "error",
			"@typescript-eslint/consistent-type-imports": "error",
			"@typescript-eslint/default-param-last": "error",
			"@typescript-eslint/method-signature-style": "error",
			"@typescript-eslint/no-import-type-side-effects": "error",
			"@typescript-eslint/no-loop-func": "error",
			"@typescript-eslint/no-shadow": "error",
			"@typescript-eslint/no-unsafe-type-assertion": "error",
			"@typescript-eslint/prefer-destructuring": "error",
			"@typescript-eslint/prefer-ts-expect-error": "error",
			"@typescript-eslint/prefer-optional-chain": [
				"error",
				{
					// resolves conflict with @typescript-eslint/strict-boolean-expressions
					requireNullish: true,
				},
			],
			"@typescript-eslint/strict-void-return": "error",
			"@typescript-eslint/switch-exhaustiveness-check": "error",
			"@typescript-eslint/restrict-template-expressions": "off",
			"@typescript-eslint/no-confusing-void-expression": "off",
		},
	},
	// force PascalCase for .tsx
	{
		files: ["**/*.tsx"],
		// common-main*.tsx are an exception because they're the only files that use JSX but aren't components
		ignores: ["src/common-main*.tsx"],
		rules: {
			"unicorn/filename-case": ["error", { case: "pascalCase" }],
		},
	},
]);
