"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "../../../store/auth.store";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { register, isLoading } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await register(name, email, password);
      router.push("/account");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center pt-20">
      <div className="w-full max-w-md px-gutter">
        <div className="glass rounded-xl2 p-8">
          <h1 className="mb-2 font-display text-3xl">Create Account</h1>
          <p className="mb-8 text-sm text-zirios-gray-300">Join the ZIRIOS experience</p>

          {error && (
            <div className="mb-6 rounded-lg bg-zirios-red/10 p-4 text-sm text-zirios-red">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-zirios-gray-500">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-transparent px-4 py-3 text-sm text-zirios-white placeholder:text-zirios-gray-500 focus:border-zirios-red focus:outline-none"
                placeholder="John Doe"
                required
              />
            </div>

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
                placeholder="Min. 8 characters"
                required
                minLength={8}
              />
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full">
              {isLoading ? "Loading..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zirios-gray-300">
            Already have an account?{" "}
            <a href="/auth/login" className="text-zirios-red hover:underline">
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
