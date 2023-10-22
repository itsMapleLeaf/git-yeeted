import extensions from "@itsmapleleaf/configs/tailwind-extensions"

/** @type {import("tailwindcss").Config} */
export default {
	presets: [extensions],
	content: ["./app/**/*.{ts,tsx}"],
	theme: {
		extend: {},
	},
	plugins: [],
}
