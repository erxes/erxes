import { Card, Label } from 'erxes-ui';

// Shared scaffolding for the plugin's create/edit pages (agents, workflows,
// schedules) so each page lays out fields the same way.

/** Card wrapper for one group of related form fields. */
export const FormSection = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) => (
  <Card className="shadow-none">
    <Card.Header className="pb-3">
      <Card.Title className="text-base">{title}</Card.Title>
      {description && <Card.Description>{description}</Card.Description>}
    </Card.Header>
    <Card.Content className="space-y-4">{children}</Card.Content>
  </Card>
);

/** Labeled form control with an optional hint line. */
export const Field = ({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <Label className="font-medium">{label}</Label>
    {children}
    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
  </div>
);
