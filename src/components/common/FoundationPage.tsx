import type { ReactNode } from "react";
import "./foundation-page.css";

interface FoundationPageProps {
  surface: "popup" | "options";
  children: ReactNode;
}

export function FoundationPage({ surface, children }: FoundationPageProps) {
  return (
    <main className={`foundation-page foundation-page--${surface}`}>
      <header className="foundation-page__header">
        <span className="foundation-page__mark" aria-hidden="true">TS</span>
        <div>
          <p className="foundation-page__eyebrow">TreeSpace</p>
          <h1>Extension foundation</h1>
        </div>
      </header>
      <section className="foundation-page__content">{children}</section>
    </main>
  );
}
