import { Badge, Button, cn } from 'erxes-ui';
import { ReactNode, useState } from 'react';
import { IAutomationHistoryAction } from '../../types/automationTypes';

export type TActionResultStatus = NonNullable<
  IAutomationHistoryAction['status']
>;

const STATUS_CLASS: Record<TActionResultStatus, string> = {
  success: 'text-success',
  error: 'text-destructive',
  waiting: 'text-warning',
};

export const ActionResultLayout = ({ children }: { children: ReactNode }) => (
  <div className="min-w-0 space-y-3 text-sm">{children}</div>
);

export const ActionResultStatus = ({
  status = 'success',
  children,
}: {
  status?: TActionResultStatus;
  children: ReactNode;
}) => (
  <p
    className={cn(
      'min-w-0 break-words rounded-md bg-muted/50 px-3 py-2 font-medium',
      STATUS_CLASS[status],
    )}
  >
    {children}
  </p>
);

export const ActionResultFields = ({ children }: { children: ReactNode }) => (
  <dl className="grid grid-cols-[minmax(64px,auto)_minmax(0,1fr)] gap-x-3 gap-y-1.5">
    {children}
  </dl>
);

export const ActionResultField = ({
  label,
  value,
  badge,
}: {
  label: string;
  value?: ReactNode;
  badge?: 'success' | 'destructive' | 'secondary';
}) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  return (
    <>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-all text-xs">
        {badge ? (
          <Badge
            variant={badge}
            className="max-w-full whitespace-normal break-all"
          >
            {value}
          </Badge>
        ) : (
          value
        )}
      </dd>
    </>
  );
};

/**
 * Long content (email bodies, payloads, raw responses). It opens as a short
 * teaser so a large body cannot bury the rest of the result, and expands in
 * place — the result panel scrolls, so nothing has to move into a dialog.
 */
export const ActionResultBody = ({
  title,
  html,
  children,
}: {
  title: string;
  html?: string;
  children?: ReactNode;
}) => {
  const [isExpanded, setExpanded] = useState(false);

  if (!html && !children) {
    return null;
  }

  return (
    <section className="min-w-0 space-y-1.5">
      <h4 className="text-xs font-medium text-muted-foreground">{title}</h4>
      <div className="relative min-w-0 overflow-hidden rounded-md border bg-muted/30">
        <div
          className={cn(
            'min-w-0 overflow-auto p-3',
            isExpanded ? 'max-h-96' : 'max-h-32',
          )}
        >
          {html ? (
            <div
              className="prose prose-sm max-w-none break-words [&_*]:max-w-full [&_img]:h-auto"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            children
          )}
        </div>
        {!isExpanded && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-background to-transparent" />
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 px-0 text-xs text-primary"
        onClick={() => setExpanded((value) => !value)}
      >
        {isExpanded ? 'Show less' : 'Show more'}
      </Button>
    </section>
  );
};

export const ActionResultJson = ({ value }: { value: unknown }) => (
  <pre className="max-h-72 min-w-0 overflow-auto whitespace-pre-wrap break-all rounded-md bg-muted/30 p-3 font-mono text-xs">
    {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
  </pre>
);
