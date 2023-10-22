import { redirect, type ActionFunctionArgs } from "@remix-run/node"
import { Form } from "@remix-run/react"
import { sessionStorage } from "~/session.server.ts"

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()

	const token = formData.get("githubAccessToken")
	if (typeof token !== "string") {
		throw new Error("token is not a string")
	}

	const session = await sessionStorage.getSession(request.headers.get("Cookie"))
	session.set("githubAccessToken", token)

	return redirect("/select-repos", {
		headers: {
			"Set-Cookie": await sessionStorage.commitSession(session),
		},
	})
}

export default function SetupPage() {
	return (
		<main className="grid gap-3">
			<p className="grid gap-3">
				<a
					href="https://github.com/settings/personal-access-tokens/new"
					target="_blank"
					rel="noopener noreferrer"
				>
					Create a GitHub personal access token with the following settings:
				</a>
				<dl>
					<div className="flex gap-2">
						<dt>Repository access:</dt>
						<dd className="font-medium">All repositories</dd>
					</div>
					<div className="flex gap-2">
						<dt>Permissions:</dt>
						<dd className="font-medium">Administration, Metadata</dd>
					</div>
				</dl>
			</p>
			<Form method="post" className="grid justify-items-start gap-3">
				<div>
					<label
						className="mb-1 block text-sm font-medium leading-none"
						htmlFor="githubAccessToken"
					>
						GitHub Access Token
					</label>
					<input
						className="rounded-md border border-gray-700 bg-gray-800 px-3 py-2 leading-none ring-blue-400 focus:outline-none focus:ring-2"
						type="text"
						name="githubAccessToken"
						placeholder="github_pat_..."
						required
					/>
				</div>
				<button
					type="submit"
					className="rounded-md border border-gray-700 bg-gray-800 px-3 py-2 leading-none ring-blue-400 focus:outline-none focus:ring-2"
				>
					Submit
				</button>
			</Form>
		</main>
	)
}
