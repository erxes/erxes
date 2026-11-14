import type { ReactNode } from 'react';

/** A card on the account pages (Profile, Password & security): a title, a line about it, its fields. */
export const Section = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) => (
  <section className="space-y-4 rounded-lg border bg-background p-5">
    <div>
      <h2 className="text-base font-semibold">{title}</h2>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </div>
    {children}
  </section>
);
