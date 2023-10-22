import { redirect, type LoaderFunctionArgs } from "@remix-run/node"
import { sessionStorage } from "~/session.server.ts"

export async function loader({ request }: LoaderFunctionArgs) {
	const session = await sessionStorage.getSession(request.headers.get("Cookie"))
	const token = session.get("githubAccessToken")
	return token ? redirect("/select-repos") : redirect("/setup")
}
