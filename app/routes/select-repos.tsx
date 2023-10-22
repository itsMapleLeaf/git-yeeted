import {
	redirect,
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
} from "@remix-run/node"
import { Form, useFetcher } from "@remix-run/react"
import {
	LucideArrowRight,
	LucideCheckCircle2,
	LucideLoader2,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Virtuoso } from "react-virtuoso"
import { sessionStorage } from "~/session.server.ts"
import { useReposFetcher } from "./api.repos.ts"

export async function loader({ request }: LoaderFunctionArgs) {
	const session = await sessionStorage.getSession(request.headers.get("Cookie"))

	const token = session.get("githubAccessToken")
	if (!token) {
		return redirect("/setup")
	}

	return {}
}

export async function action({ request }: ActionFunctionArgs) {
	return redirect("/")
}

export default function RepoList() {
	const reposFetcher = useReposFetcher()
	const [selectedRepos, setSelectedRepos] = useState(new Set<string>())

	const intersectionObserverRef = useIntersectionObserver((entries) => {
		if (entries[0]?.isIntersecting) {
			reposFetcher.loadMore()
		}
	})

	return (
		<main className="grid gap-3">
			<h1 className="text-4xl font-light">Select repos to yeet</h1>

			{selectedRepos.size > 0 ? (
				<p>
					Selected <strong>{selectedRepos.size}</strong> repos
				</p>
			) : (
				<p>No repos selected</p>
			)}

			<section>
				<Form action="/confirm-delete">
					<input
						type="hidden"
						name="repos"
						value={Array.from(selectedRepos)}
						required
					/>
					<button className="flex h-12 cursor-pointer items-center justify-between gap-2 rounded-md border border-gray-700 bg-gray-800 p-3 leading-none ring-blue-400 transition-colors hover:bg-gray-700 focus:outline-none focus:ring-2">
						Next <LucideArrowRight />
					</button>
				</Form>
			</section>

			<p>The next screen will ask to confirm before deleting anything.</p>

			<Virtuoso
				data={reposFetcher.repos}
				itemContent={(index, repo) => (
					<div className="pb-2">
						<RepoListItem
							repo={repo}
							selected={selectedRepos.has(repo.full_name)}
							onClick={() => {
								if (selectedRepos.has(repo.full_name)) {
									selectedRepos.delete(repo.full_name)
								} else {
									selectedRepos.add(repo.full_name)
								}
								setSelectedRepos(new Set(selectedRepos))
							}}
						/>
					</div>
				)}
				useWindowScroll
				overscan={32}
			/>

			{reposFetcher.isFinished ? null : (
				<p
					className="flex flex-col items-center p-4"
					ref={intersectionObserverRef}
				>
					<LucideLoader2 className="animate-spin s-8" aria-hidden />
					<span className="sr-only">Loading...</span>
				</p>
			)}
		</main>
	)
}

function RepoListItem({
	repo,
	selected,
	onClick,
}: {
	repo: { full_name: string }
	selected: boolean
	onClick: () => void
}) {
	const fetcher = useFetcher()
	return (
		<button
			type="button"
			role="checkbox"
			aria-checked={selected}
			className="flex h-12 w-full cursor-pointer items-center justify-between gap-2 rounded-md border border-gray-700 bg-gray-800 p-3 leading-none ring-blue-400 transition-colors hover:bg-gray-700 focus:outline-none focus:ring-2 aria-checked:border-blue-400"
			onClick={onClick}
		>
			{repo.full_name}
			{fetcher.state === "submitting" || fetcher.state === "loading" ? (
				<LucideLoader2 className="animate-spin" />
			) : selected ? (
				<LucideCheckCircle2 />
			) : null}
		</button>
	)
}

function useIntersectionObserver(
	callback: (entries: IntersectionObserverEntry[]) => void,
	options?: IntersectionObserverInit,
) {
	const [element, elementRef] = useState<HTMLElement | null>()

	const callbackRef = useRef(callback)
	useEffect(() => {
		callbackRef.current = callback
	})

	useEffect(() => {
		if (!element) return

		const observer = new IntersectionObserver((entries) => {
			callbackRef.current(entries)
		}, options)
		observer.observe(element)
		return () => observer.disconnect()
	}, [element, options])

	return elementRef
}
