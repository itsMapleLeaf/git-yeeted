import { Octokit } from "@octokit/core"
import { json, type LoaderFunctionArgs } from "@remix-run/node"
import { useFetcher } from "@remix-run/react"
import { useEffect, useRef, useState } from "react"
import { sessionStorage } from "~/session.server.ts"

export type RepoListItem = {
	id: number
	full_name: string
}

export async function loader({ request }: LoaderFunctionArgs) {
	const session = await sessionStorage.getSession(request.headers.get("Cookie"))

	const token = session.get("githubAccessToken")
	if (!token) {
		throw new Response(undefined, {
			status: 401,
		})
	}

	const searchParams = new URL(request.url).searchParams

	const octokit = new Octokit({ auth: token })

	const response = await octokit.request("GET /user/repos", {
		page: Number(searchParams.get("page")),
		per_page: 100,
		sort: "created",
	})

	return json({
		repos: response.data.map<RepoListItem>((repo) => ({
			id: repo.id,
			full_name: repo.full_name,
		})),
		isFinished: !response.headers.link,
	})
}

export function useReposFetcher() {
	const { load, data, state } = useFetcher<typeof loader>()
	const [repos, setRepos] = useState<RepoListItem[]>([])
	const [isFinished, setIsFinished] = useState(false)
	const pageRef = useRef(1)

	useEffect(() => {
		if (data) {
			setRepos((repos) => [...repos, ...data.repos])
			setIsFinished(data.isFinished)
		}
	}, [data])

	const loadMore = () => {
		if (state === "loading" || isFinished) return
		load(`/api/repos?page=${pageRef.current}`)
		pageRef.current += 1
	}

	return {
		repos,
		loadMore,
		isLoading: state === "loading",
		isFinished,
	}
}
