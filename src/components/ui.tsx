"use client";

import type { ReactNode } from "react";

export function TreeIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22v-7" />
      <path d="M12 3l-6 8h3l-4 5h14l-4-5h3z" />
    </svg>
  );
}

export function BackButton({ onClick, label = "Back" }: { onClick: () => void; label?: string }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className="flex h-11 w-11 items-center justify-center rounded-full text-ink hover:bg-soft">
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M15 5l-7 7 7 7" />
      </svg>
    </button>
  );
}

export function Header({ title, subtitle, onBack }: { title: string; subtitle?: string; onBack?: () => void }) {
  return (
    <header className="flex items-center gap-2 px-4 pb-3 pt-6">
      {onBack && <BackButton onClick={onBack} />}
      <div>
        <h1 className="text-xl font-extrabold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
      </div>
    </header>
  );
}

export function Chip({
  selected,
  onClick,
  children,
  block = false,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  block?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={[
        "h-10 border text-sm font-semibold transition-colors",
        block ? "w-full rounded-xl" : "rounded-full px-3",
        selected ? "border-forest bg-forest text-white" : "border-field bg-white text-ink hover:border-forest",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-14 w-full items-center justify-center rounded-2xl bg-forest text-base font-bold text-white hover:bg-forest-dark disabled:cursor-not-allowed disabled:bg-field disabled:text-muted"
    >
      {children}
    </button>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-3xl border border-line bg-white p-4 ${className}`}>{children}</section>;
}
