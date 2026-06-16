import { cloneElement, isValidElement, useId } from 'react';
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

/**
 * Labeled form control with an optional hint line. A single element child is
 * bound to the label: it gets an auto-generated id (its own id wins when set)
 * and the label's htmlFor points at it, so screen readers and label clicks
 * reach the control.
 */
export const Field = ({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) => {
  const autoId = useId();
  let control = children;
  let htmlFor: string | undefined;
  if (isValidElement<{ id?: string }>(children)) {
    htmlFor = children.props.id ?? autoId;
    control = cloneElement(children, { id: htmlFor });
  }
  return (
    <div className="space-y-1.5">
      <Label className="font-medium" htmlFor={htmlFor}>
        {label}
      </Label>
      {control}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
};
