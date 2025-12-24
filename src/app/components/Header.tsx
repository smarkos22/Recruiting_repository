export function Header() {
  return (
    <header className="border-b border-[var(--border)] bg-[var(--paper)]">
      <div className="mx-auto flex max-w-6xl items-center justify-start px-6 py-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-muted)]">
            Athletic Department Registry
          </p>
          <h1 className="text-2xl font-serif text-[var(--ink)] leading-tight">
            Compliance, recruiting, and NIL ledger
          </h1>
          <p className="text-sm text-[var(--ink-muted)]">
            Built for athletic directors, compliance officers, and finance teams who value auditability.
          </p>
        </div>
      </div>
    </header>
  );
}
