import { createCookieSessionStorage } from "@remix-run/node"
import { addDays } from "date-fns"

type SessionData = {
	githubAccessToken?: string
}

export const sessionStorage = createCookieSessionStorage<SessionData>({
	cookie: {
		name: "git-yeeted-session",
		path: "/",
		httpOnly: true,
		expires: addDays(Date.now(), 1),
		sameSite: "strict",
		secure: process.env.NODE_ENV === "production",
	},
})
