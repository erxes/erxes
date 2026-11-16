import type { ReactNode } from 'react';
import type { KeyDraft } from './keyDraft';

export interface DraftProps {
  draft: KeyDraft;
  onChange: (draft: KeyDraft) => void;
}

/** One block of the key page: a title, an optional line, its fields. */
export const Section = ({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) => (
  <section className="space-y-4 rounded-lg border bg-background p-5">
    <div className="space-y-1">
      <h2 className="text-sm font-semibold">{title}</h2>
      {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
    </div>
    {children}
  </section>
);

/** A choice tile's title and the line under it. */
export const Choice = ({ title, text }: { title: string; text: string }) => (
  <span className="flex flex-col gap-1">
    <span className="text-sm font-semibold">{title}</span>
    <span className="text-xs font-normal">{text}</span>
  </span>
);
