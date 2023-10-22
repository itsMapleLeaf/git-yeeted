import type { LinksFunction, MetaFunction } from "@remix-run/node"
import {
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "@remix-run/react"
import tailwindCss from "tailwindcss/tailwind.css?url"

export const meta: MetaFunction = () => {
	return [
		{ title: "git yeeted" },
		{ name: "description", content: "yeet repos, but do so with caution" },
	]
}

export const links: LinksFunction = () => [
	{ rel: "stylesheet", href: tailwindCss },
]

export default function App() {
	return (
		<html lang="en" className="bg-gray-900 text-gray-50">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body className="mx-auto max-w-screen-md p-4">
				<Outlet />
				<ScrollRestoration />
				<LiveReload />
				<Scripts />
			</body>
		</html>
	)
}
