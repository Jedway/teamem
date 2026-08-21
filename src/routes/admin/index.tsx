import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import {
	ArrowLeft,
	Eye,
	EyeOff,
	KeyRound,
	Leaf,
	Loader2,
	Lock,
	ShieldAlert,
	User,
} from "lucide-react";
import * as React from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { adminLoginFn, checkAdminAuthFn } from "../../lib/auth";

export const Route = createFileRoute("/admin/")({
	loader: async () => {
		const auth = await checkAdminAuthFn();
		if (auth.isAuthenticated) {
			throw redirect({ to: "/admin/dashboard" });
		}
		return null;
	},
	component: AdminLoginPage,
});

function AdminLoginPage() {
	const [username, setUsername] = React.useState("");
	const [password, setPassword] = React.useState("");
	const [showPassword, setShowPassword] = React.useState(false);
	const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = React.useState(false);

	const router = useRouter();

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrorMessage(null);

		if (!username.trim() || !password) {
			setErrorMessage("Please enter both username and password.");
			return;
		}

		setIsSubmitting(true);
		try {
			const result = await adminLoginFn({
				data: {
					username,
					password,
				},
			});

			if (result.success) {
				// Invalidate router and navigate to dashboard
				await router.invalidate();
				await router.navigate({ to: "/admin/dashboard" });
			} else {
				setErrorMessage(
					result.error || "Authentication failed. Invalid credentials.",
				);
			}
		} catch (err) {
			console.error("Login failed:", err);
			setErrorMessage("An unexpected server error occurred. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen bg-sand/40 flex flex-col justify-between p-4 sm:p-6 selection:bg-emerald-100 selection:text-[#173a40]">
			{/* Top Bar */}
			<div className="max-w-5xl w-full mx-auto flex items-center justify-between py-2">
				<a
					href="/"
					className="inline-flex items-center gap-2 text-xs font-bold text-[#416166] hover:text-[#173a40] transition-colors px-3.5 py-1.5 rounded-full bg-white border border-line shadow-2xs"
				>
					<ArrowLeft className="w-3.5 h-3.5" />
					<span>Back to Storefront</span>
				</a>

				<div className="flex items-center gap-1.5 text-xs font-bold text-[#2f6a4a] uppercase tracking-widest bg-white px-3.5 py-1.5 rounded-full border border-line shadow-2xs">
					<Lock className="w-3 h-3 text-[#2f6a4a]" />
					<span>Secure Portal</span>
				</div>
			</div>

			{/* Center Login Box */}
			<main className="max-w-md w-full mx-auto my-auto py-8">
				<div className="rounded-3xl bg-white border border-line shadow-2xl p-6 sm:p-8 space-y-6">
					{/* Header */}
					<div className="text-center space-y-2">
						<div className="w-12 h-12 rounded-2xl bg-[#2f6a4a]/15 border border-[#2f6a4a]/25 flex items-center justify-center text-[#2f6a4a] mx-auto">
							<Leaf className="w-6 h-6 text-[#2f6a4a]" />
						</div>
						<h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#173a40]">
							TEAMEM Admin
						</h1>
						<p className="text-xs text-[#416166] max-w-xs mx-auto font-medium">
							Authorized administrative portal for catalog and order management.
						</p>
					</div>

					{/* Inline Error Alert */}
					{errorMessage && (
						<div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in duration-200">
							<ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
							<span className="leading-snug">{errorMessage}</span>
						</div>
					)}

					{/* Login Form */}
					<form onSubmit={handleLogin} className="space-y-4">
						<div className="space-y-1.5">
							<Label
								htmlFor="username"
								className="text-xs font-bold text-[#173a40] uppercase tracking-wider"
							>
								Username
							</Label>
							<div className="relative">
								<User className="w-4 h-4 text-[#416166] absolute left-3.5 top-1/2 -translate-y-1/2" />
								<Input
									id="username"
									type="text"
									autoComplete="username"
									placeholder="Enter admin username"
									value={username}
									onChange={(e) => setUsername(e.target.value)}
									disabled={isSubmitting}
									className="pl-10 rounded-xl bg-foam border-line text-sm text-[#173a40] focus:bg-white"
								/>
							</div>
						</div>

						<div className="space-y-1.5">
							<Label
								htmlFor="password"
								className="text-xs font-bold text-[#173a40] uppercase tracking-wider"
							>
								Password
							</Label>
							<div className="relative">
								<KeyRound className="w-4 h-4 text-[#416166] absolute left-3.5 top-1/2 -translate-y-1/2" />
								<Input
									id="password"
									type={showPassword ? "text" : "password"}
									autoComplete="current-password"
									placeholder="Enter admin password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									disabled={isSubmitting}
									className="pl-10 pr-10 rounded-xl bg-foam border-line text-sm text-[#173a40] focus:bg-white"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#416166] hover:text-[#173a40] transition-colors"
									aria-label={showPassword ? "Hide password" : "Show password"}
								>
									{showPassword ? (
										<EyeOff className="w-4 h-4" />
									) : (
										<Eye className="w-4 h-4" />
									)}
								</button>
							</div>
						</div>

						<Button
							type="submit"
							disabled={isSubmitting}
							className="w-full bg-[#173a40] hover:bg-[#2f6a4a] text-white font-bold rounded-xl py-5 transition-all shadow-md mt-2 flex items-center justify-center gap-2 cursor-pointer"
						>
							{isSubmitting ? (
								<>
									<Loader2 className="w-4 h-4 animate-spin text-emerald-300" />
									<span>Verifying Access...</span>
								</>
							) : (
								<span>Log In to Dashboard</span>
							)}
						</Button>
					</form>
				</div>
			</main>

			{/* Footer Note */}
			<div className="text-center text-[11px] text-[#416166] py-2 font-medium">
				Protected administrative endpoint for Teamem Nigeria.
			</div>
		</div>
	);
}
