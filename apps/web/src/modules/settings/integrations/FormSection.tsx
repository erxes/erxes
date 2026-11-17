import type { ReactNode } from 'react';

/** A settings group: what it is on the left, its fields on the right. */
export const FormSection = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) => (
  <section className="grid gap-4 border-b pb-6 md:grid-cols-3">
    <div className="space-y-1">
      <h3 className="text-sm font-medium">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
    <div className="space-y-3 md:col-span-2">{children}</div>
  </section>
);
