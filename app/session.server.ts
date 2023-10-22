import { createCookieSessionStorage } from "@remix-run/node"

type SessionData = {
	githubAccessToken?: string
}

export const sessionStorage = createCookieSessionStorage<SessionData>({
	cookie: {
		name: "git-yeeted-session",
		path: "/",
		httpOnly: true,
		maxAge: 60 * 60 * 24, // 1 day
		sameSite: "strict",
		secure: process.env.NODE_ENV === "production",
	},
})
