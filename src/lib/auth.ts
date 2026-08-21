import { createServerFn } from "@tanstack/react-start";
import {
	deleteCookie,
	getCookie,
	setCookie,
} from "@tanstack/react-start/server";

const ADMIN_COOKIE_NAME = "teamem_admin_session";
const SESSION_VALUE = "authenticated";

// Hardcoded admin credentials (verified strictly on server)
const VALID_ADMIN_USER = "ememette";
const VALID_ADMIN_PASS = "ememette#";

export interface LoginResult {
	success: boolean;
	error?: string;
}

/**
 * Validates admin credentials and issues an httpOnly session cookie.
 */
export const adminLoginFn = createServerFn({ method: "POST" })
	.validator((data: unknown) => {
		if (
			!data ||
			typeof data !== "object" ||
			!("username" in data) ||
			!("password" in data)
		) {
			throw new Error("Invalid login payload");
		}
		const payload = data as { username: unknown; password: unknown };
		return {
			username: String(payload.username || "").trim(),
			password: String(payload.password || ""),
		};
	})
	.handler(async ({ data }): Promise<LoginResult> => {
		const { username, password } = data;

		if (username === VALID_ADMIN_USER && password === VALID_ADMIN_PASS) {
			setCookie(ADMIN_COOKIE_NAME, SESSION_VALUE, {
				httpOnly: true,
				sameSite: "lax",
				path: "/",
				maxAge: 60 * 60 * 24 * 7, // 7 days
			});
			return { success: true };
		}

		return {
			success: false,
			error: "Invalid username or password. Please check your credentials.",
		};
	});

/**
 * Clears the admin session cookie.
 */
export const adminLogoutFn = createServerFn({ method: "POST" }).handler(
	async () => {
		deleteCookie(ADMIN_COOKIE_NAME);
		setCookie(ADMIN_COOKIE_NAME, "", {
			httpOnly: true,
			sameSite: "lax",
			path: "/",
			maxAge: 0,
		});
		return { success: true };
	},
);

/**
 * Checks if the current request has a valid admin session cookie.
 */
export const checkAdminAuthFn = createServerFn({ method: "GET" }).handler(
	async () => {
		const session = getCookie(ADMIN_COOKIE_NAME);
		return {
			isAuthenticated: session === SESSION_VALUE,
		};
	},
);
