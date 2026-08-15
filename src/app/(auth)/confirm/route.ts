import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

// Entry point for the magic-link email — the one place a Route Handler
// is the right tool (an external system GETs it).
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");

  const supabase = await createClient();

  // Default email template routes through Supabase's /verify and lands here
  // with ?code= (PKCE). token_hash is the direct flow if we ever customize
  // the email template (requires custom SMTP on Supabase).
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      redirect("/dashboard");
    }
  } else if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      redirect("/dashboard");
    }
  }

  redirect("/login?error=invalid-link");
}
