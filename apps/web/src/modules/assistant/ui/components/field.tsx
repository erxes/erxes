import { cn, Label } from 'erxes-ui';
import { weighted } from './children';

export const Problems = ({
  id,
  messages,
}: {
  id: string;
  messages: readonly string[] | undefined;
}) =>
  messages?.length ? (
    <p id={id} className="text-xs text-destructive-text">
      {messages.join(' ')}
    </p>
  ) : null;

export const Field = ({
  label,
  htmlFor,
  weight,
  children,
}: {
  label: string | undefined;
  htmlFor?: string;
  weight?: number;
  children: React.ReactNode;
}) => (
  <div
    style={{ '--weight': weight }}
    className={cn('flex min-w-0 flex-col gap-1.5', weighted(weight))}
  >
    {label && <Label htmlFor={htmlFor}>{label}</Label>}
    {children}
  </div>
);
