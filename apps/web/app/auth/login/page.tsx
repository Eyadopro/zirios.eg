"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "../../../store/auth.store";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, isLoading } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      router.push("/account");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center pt-20">
      <div className="w-full max-w-md px-gutter">
        <div className="glass rounded-xl2 p-8">
          <h1 className="mb-2 font-display text-3xl">Login</h1>
          <p className="mb-8 text-sm text-zirios-gray-300">Welcome back to ZIRIOS</p>

          {error && (
            <div className="mb-6 rounded-lg bg-zirios-red/10 p-4 text-sm text-zirios-red">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-zirios-gray-500">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-transparent px-4 py-3 text-sm text-zirios-white placeholder:text-zirios-gray-500 focus:border-zirios-red focus:outline-none"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-zirios-gray-500">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-transparent px-4 py-3 text-sm text-zirios-white placeholder:text-zirios-gray-500 focus:border-zirios-red focus:outline-none"
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full">
              {isLoading ? "Loading..." : "Login"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zirios-gray-300">
            Don&apos;t have an account?{" "}
            <a href="/auth/register" className="text-zirios-red hover:underline">
              Register
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
