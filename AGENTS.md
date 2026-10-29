<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Risk engine lives in src/lib/cashgraph.ts as pure functions with tests beside it, so rules stay testable and swappable for real data later.
- Pilot data (uploaded portfolio, analyst decisions, outcomes) is browser-only via src/lib/portfolio-store.ts; move to a real database before real lender data is used.
- Signed-in pages live under src/routes/_authenticated (gate also requires a completed profile → /onboarding); landing, /auth, /pricing stay public.
