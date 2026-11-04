// Yorozumon: anonymous player identity (phase 1).
// Publishable credentials only. Never put a secret/service-role key here.
(async () => {
  const PROJECT_URL = "https://wbzcdpnvqepysexkqxxh.supabase.co";
  const PUBLISHABLE_KEY = "sb_publishable_9tOvmX5RjgXgjOMFAUH0rw_cfvekiCD";
  const state = { status: "connecting", userId: null, error: null };
  window.yorozuAuth = state;
  window.dispatchEvent(new CustomEvent("yorozu-auth-status", { detail: { ...state } }));
  const notify = () => window.dispatchEvent(new CustomEvent("yorozu-auth-status", { detail: { ...state } }));
  try {
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const client = createClient(PROJECT_URL, PUBLISHABLE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false }
    });
    // Expose a limited accessor for future game integration; do not expose tokens in UI/logs.
    window.yorozuGetAuth = () => client.auth.getSession();
    const { data: sessionData, error: sessionError } = await client.auth.getSession();
    if (sessionError) throw sessionError;
    let user = sessionData.session?.user;
    if (!user) {
      const { data, error } = await client.auth.signInAnonymously();
      if (error) throw error;
      user = data.user;
    }
    if (!user?.id) throw new Error("No player ID returned");
    state.status = "ready";
    state.userId = user.id;
    notify();
    client.auth.onAuthStateChange((_event, session) => {
      state.userId = session?.user?.id ?? null;
      state.status = state.userId ? "ready" : "disconnected";
      notify();
    });
  } catch (error) {
    state.status = "error";
    state.error = error instanceof Error ? error.message : String(error);
    notify();
    console.warn("Yorozumon anonymous login unavailable:", state.error);
  }
})();
