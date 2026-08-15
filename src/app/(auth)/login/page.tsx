"use client";

import { useActionState } from "react";
import { sendMagicLink, type LoginState } from "./actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    sendMagicLink,
    null,
  );

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-2xl font-semibold">Sign in</h1>
        <form action={action} className="flex flex-col gap-3">
          <input
            type="email"
            name="email"
            required
            placeholder="you@company.com"
            className="rounded-md border border-neutral-300 px-3 py-2"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-neutral-900 px-3 py-2 text-white disabled:opacity-50"
          >
            {pending ? "Sending..." : "Send magic link"}
          </button>
        </form>
        {state && (
          <p
            className={`mt-4 text-sm ${state.ok ? "text-green-700" : "text-red-600"}`}
          >
            {state.message}
          </p>
        )}
      </div>
    </main>
  );
}
