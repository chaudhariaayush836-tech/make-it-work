import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — CashGraph" },
      { name: "description", content: "Sign in to CashGraph to monitor your SME loan portfolio." },
      { property: "og:title", content: "Sign in — CashGraph" },
      { property: "og:description", content: "Sign in to CashGraph to monitor your SME loan portfolio." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

const input = "mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";

function AuthPage() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    if (mode === "up") {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: window.location.origin + "/onboarding", data: { full_name: name } },
      });
      if (error) setMsg(error.message);
      else if (!data.session) setMsg("Check your email to confirm your account, then sign in.");
      else nav({ to: "/onboarding" });
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg(error.message);
      else nav({ to: "/dashboard" });
    }
    setBusy(false);
  }

  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (r.error) return setMsg(String(r.error.message ?? r.error));
    if (r.redirected) return;
    nav({ to: "/dashboard" });
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <aside className="hidden flex-col justify-between bg-primary p-10 text-primary-foreground md:flex">
        <Link to="/" className="font-mono text-sm tracking-[0.2em]">CASHGRAPH</Link>
        <div>
          <p className="font-serif text-4xl leading-tight">Spot borrower stress months before default.</p>
          <p className="mt-4 text-primary-foreground/70">Early-warning intelligence for SME lenders, NBFCs and credit teams.</p>
        </div>
        <div className="font-mono text-xs text-primary-foreground/60">Bank-grade · Explainable · Analyst in control</div>
      </aside>
      <main className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <h1 className="font-serif text-3xl">{mode === "in" ? "Welcome back" : "Create your account"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{mode === "in" ? "Sign in to your credit workspace." : "Start monitoring your portfolio."}</p>
          <Button variant="outline" className="mt-6 w-full" onClick={google}>Continue with Google</Button>
          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
          <form onSubmit={submit} className="space-y-4">
            {mode === "up" && (
              <label className="block text-sm">Full name<input className={input} required value={name} onChange={(e) => setName(e.target.value)} /></label>
            )}
            <label className="block text-sm">Work email<input type="email" className={input} required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
            <label className="block text-sm">Password<input type="password" minLength={6} className={input} required value={password} onChange={(e) => setPassword(e.target.value)} /></label>
            {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
            <Button type="submit" className="w-full" disabled={busy}>{mode === "in" ? "Sign in" : "Create account"}</Button>
          </form>
          <button className="mt-4 text-sm text-muted-foreground hover:text-foreground" onClick={() => setMode(mode === "in" ? "up" : "in")}>
            {mode === "in" ? "New here? Create an account" : "Already have an account? Sign in"}
          </button>
        </div>
      </main>
    </div>
  );
}
