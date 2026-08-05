import { ReactNode } from 'react';

type PipelineSectionProps = {
  children: ReactNode;
  description?: string;
  title: string;
};

export const PipelineSection = ({
  children,
  description,
  title,
}: PipelineSectionProps) => (
  <section className="flex flex-col gap-3 py-5 first:pt-0 last:pb-0">
    <div className="flex flex-col gap-1">
      <h2 className="font-mono text-xs font-medium uppercase text-accent-foreground">
        {title}
      </h2>
      {!!description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
    {children}
  </section>
);
