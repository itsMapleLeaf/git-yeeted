import { Octokit } from "@octokit/core"
import { json, redirect, type ActionFunctionArgs } from "@remix-run/node"
import {
	Form,
	Link,
	useActionData,
	useNavigation,
	useSearchParams,
} from "@remix-run/react"
import {
	LucideArrowLeft,
	LucideCheckCircle2,
	LucideLoader2,
} from "lucide-react"
import { sessionStorage } from "~/session.server.ts"

export async function action({ request }: ActionFunctionArgs) {
	const session = await sessionStorage.getSession(request.headers.get("Cookie"))

	const token = session.get("githubAccessToken")
	if (!token) {
		throw new Response(undefined, {
			status: 401,
		})
	}

	const repos = new URL(request.url).searchParams.get("repos")?.split(",")
	console.log(repos)
	if (!repos?.length) {
		return redirect("/select-repos")
	}

	const octokit = new Octokit({ auth: token })

	const results = await Promise.allSettled(
		repos.map(async (repoFullName) => {
			try {
				const [owner, repo] = repoFullName.split("/")
				if (!owner || !repo) {
					throw new Error(`Invalid repo name "${repoFullName}"`)
				}
				await octokit.request("DELETE /repos/{owner}/{repo}", {
					owner,
					repo,
				})
			} catch (error) {
				throw new DeletionError(repoFullName, { cause: error })
			}
		}),
	)

	const errors = results.flatMap((result) => {
		if (result.status !== "rejected") return []

		if (result.reason instanceof DeletionError) {
			const message =
				result.reason.cause instanceof Error
					? result.reason.cause.message
					: String(result.reason.cause)
			return [`Failed to delete repo "${result.reason.repo}": ${message}`]
		}

		return [String(result.reason)]
	})

	if (errors.length > 0) {
		return json({ errors })
	}

	return redirect("/select-repos")
}

class DeletionError extends Error {
	readonly repo: string

	constructor(repo: string, options?: ErrorOptions) {
		super(`Failed to delete repo "${repo}"`, options)
		this.repo = repo
	}
}

export default function ConfirmDeletePage() {
	const [searchParams] = useSearchParams()
	const repos = searchParams.get("repos")?.split(",")
	const actionData = useActionData<typeof action>()
	const navigation = useNavigation()

	if (actionData?.errors.length) {
		return (
			<main className="grid gap-3">
				<h1 className="text-4xl font-light">Confirm deletion</h1>
				<p>Failed to delete the following repos:</p>
				<ul className="list-inside list-disc pl-4">
					{actionData.errors.map((error) => (
						<li key={error}>{error}</li>
					))}
				</ul>
				<Link to="/select-repos" className="inline-flex items-center gap-2">
					<LucideArrowLeft />
					Go back
				</Link>
			</main>
		)
	}

	if (!repos?.length) {
		return (
			<main className="grid gap-3">
				<h1 className="text-4xl font-light">Confirm deletion</h1>
				<p>No repos selected</p>
				<Link to="/select-repos" className="inline-flex items-center gap-2">
					<LucideArrowLeft />
					Go back
				</Link>
			</main>
		)
	}

	return (
		<main className="grid gap-3">
			<h1 className="text-4xl font-light">Confirm deletion</h1>
			<p>The following repos will be deleted:</p>
			<ul className="list-inside list-disc pl-4">
				{repos.map((repo) => (
					<li key={repo}>{repo}</li>
				))}
			</ul>
			<p>
				<strong>This cannot be undone.</strong> Are you sure?
			</p>
			<Form method="post">
				{navigation.state === "idle" ? (
					<button
						type="submit"
						className="flex h-12 cursor-pointer items-center justify-between gap-2 rounded-md border border-gray-700 bg-gray-800 p-3 leading-none ring-blue-400 transition-colors hover:bg-gray-700 focus:outline-none focus:ring-2"
					>
						<LucideCheckCircle2 />
						Yes, delete these repos
					</button>
				) : (
					<LucideLoader2 className="animate-spin" />
				)}
			</Form>
		</main>
	)
}
