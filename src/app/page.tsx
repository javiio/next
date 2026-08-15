import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// No marketing site yet: the root just routes you to the right place.
export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  redirect(user ? "/dashboard" : "/login");
}
