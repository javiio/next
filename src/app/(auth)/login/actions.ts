"use server";

import { createClient } from "@/lib/supabase/server";

export type LoginState = { ok: boolean; message: string } | null;

export async function sendMagicLink(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = formData.get("email");
  if (typeof email !== "string" || !email.includes("@")) {
    return { ok: false, message: "Enter a valid email address." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/confirm`,
    },
  });

  if (error) {
    return { ok: false, message: "Could not send the link. Try again." };
  }
  return { ok: true, message: "Check your email for a sign-in link." };
}
