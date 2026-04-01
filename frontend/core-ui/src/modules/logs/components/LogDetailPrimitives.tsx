import { IconInfoCircle } from '@tabler/icons-react';
import { cn } from 'erxes-ui';
import type { ComponentType, ReactNode } from 'react';
import ReactJson from 'react-json-view';

type LogDetailJsonSource =
  | Record<string, unknown>
  | unknown[]
  | { value: string }
  | null;

type LogDetailIconProps = {
  size?: number;
  className?: string;
};

const normalizeJsonSource = (value: unknown): LogDetailJsonSource => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  if (typeof value === 'string') {
    return { value };
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'object') {
    return value as Record<string, unknown>;
  }

  return { value: String(value) };
};

export const LogDetailSection = ({
  title,
  description,
  icon: Icon = IconInfoCircle,
  children,
  className,
}: {
  title: string;
  description?: string;
  icon?: ComponentType<LogDetailIconProps>;
  children: ReactNode;
  className?: string;
}) => {
  return (
    <section className={cn('rounded-3xl border bg-background p-5', className)}>
      <div className="mb-4 flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <Icon size={18} />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
};

export const LogDetailPanel = ({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn('rounded-2xl border bg-muted/20 p-4', className)}>
      <div className="mb-3 min-w-0">
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="min-h-[160px] overflow-auto rounded-xl bg-background p-3">
        {children}
      </div>
    </div>
  );
};

export const LogDetailJsonPanel = ({
  title,
  description,
  src,
  emptyMessage = 'No data captured for this section.',
  className,
}: {
  title: string;
  description?: string;
  src: unknown;
  emptyMessage?: string;
  className?: string;
}) => {
  const normalized = normalizeJsonSource(src);

  return (
    <LogDetailPanel
      title={title}
      description={description}
      className={className}
    >
      {normalized ? (
        <ReactJson
          src={normalized}
          collapsed={1}
          name={false}
          displayDataTypes={false}
          enableClipboard={false}
        />
      ) : (
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      )}
    </LogDetailPanel>
  );
};

export const LogDetailMetricCard = ({
  title,
  value,
  icon: Icon = IconInfoCircle,
  className,
}: {
  title: string;
  value?: ReactNode;
  icon?: ComponentType<LogDetailIconProps>;
  className?: string;
}) => {
  return (
    <div className={cn('rounded-2xl border bg-muted/20 p-4', className)}>
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background text-muted-foreground">
          <Icon size={18} />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {title}
          </p>
          <div className="mt-1 break-words text-sm font-medium text-foreground">
            {value || 'Unknown'}
          </div>
        </div>
      </div>
    </div>
  );
};
