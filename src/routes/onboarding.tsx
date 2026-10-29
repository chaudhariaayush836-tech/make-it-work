import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Set up your profile — CashGraph" },
      { name: "description", content: "Tell CashGraph about your role so we can tailor your workspace." },
      { property: "og:title", content: "Set up your profile — CashGraph" },
      { property: "og:description", content: "Tell CashGraph about your role so we can tailor your workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    const { data: p } = await supabase.from("profiles").select("*").eq("id", data.user.id).maybeSingle();
    return { user: data.user, profile: p };
  },
  component: Onboarding,
});

const occupations = [
  ["Credit analyst", "Review borrowers and flag risk"],
  ["Risk manager", "Oversee portfolio health"],
  ["Loan officer", "Originate and manage SME loans"],
  ["Collections", "Prioritise recoveries"],
  ["Founder / CXO", "Lending business leadership"],
  ["Investor / Other", "Exploring CashGraph"],
] as const;
const experiences = ["0–2 years", "3–5 years", "6–10 years", "10+ years"];
const input = "mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";

function Onboarding() {
  const { user, profile } = Route.useRouteContext();
  const [name, setName] = useState(profile?.full_name ?? "");
  const [occ, setOcc] = useState(profile?.occupation ?? "");
  const [org, setOrg] = useState(profile?.organization ?? "");
  const [exp, setExp] = useState(profile?.experience ?? "");
  const [err, setErr] = useState<string | null>(null);
  const nav = useNavigate();

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!occ) return setErr("Please choose your occupation.");
    const { error } = await supabase.from("profiles").upsert({
      id: user.id, full_name: name, occupation: occ, organization: org, experience: exp, onboarded: true, updated_at: new Date().toISOString(),
    });
    if (error) return setErr(error.message);
    nav({ to: "/dashboard" });
  }

  return (
    <div className="min-h-screen px-6 py-12">
      <form onSubmit={save} className="mx-auto max-w-2xl">
        <div className="font-mono text-xs tracking-[0.2em] text-muted-foreground">STEP 1 OF 1 · PROFILE</div>
        <h1 className="mt-2 font-serif text-4xl">Tell us about your work</h1>
        <p className="mt-2 text-muted-foreground">We'll tailor your credit workspace to your role.</p>

        <label className="mt-8 block text-sm">Full name<input className={input} required value={name} onChange={(e) => setName(e.target.value)} /></label>

        <div className="mt-6 text-sm">Occupation</div>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {occupations.map(([t, d]) => (
            <button type="button" key={t} onClick={() => setOcc(t)}
              className={cn("rounded-md border p-4 text-left transition-colors", occ === t ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-card hover:bg-muted/50")}>
              <div className="font-medium">{t}</div>
              <div className="text-xs text-muted-foreground">{d}</div>
            </button>
          ))}
        </div>

        <label className="mt-6 block text-sm">Organisation (bank, NBFC, fintech…)<input className={input} value={org} onChange={(e) => setOrg(e.target.value)} /></label>

        <div className="mt-6 text-sm">Experience in lending</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {experiences.map((x) => (
            <button type="button" key={x} onClick={() => setExp(x)}
              className={cn("rounded-full border px-4 py-1.5 text-sm", exp === x ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card")}>{x}</button>
          ))}
        </div>

        {err && <p className="mt-4 text-sm text-destructive">{err}</p>}
        <Button type="submit" size="lg" className="mt-8">Enter workspace</Button>
      </form>
    </div>
  );
}
