import type { ReactNode } from 'react';
import { Alert, cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

interface SectionCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  loading?: boolean;
  skeletonHeight?: string;
  /** Controls shown beside the title, such as an export button. */
  actions?: ReactNode;
  /** A failed query, so the card reports it instead of reading as empty. */
  error?: { message: string };

  accentClass?: string;
}

export function SectionCard({
  title,
  description,
  children,
  className,
  loading,
  skeletonHeight = 'h-40',
  actions,
  error,
  accentClass = 'bg-[var(--primary)]',
}: SectionCardProps) {
  const { t } = useTranslation('frontline');

  return (
    <div
      className={cn('rounded-xl border bg-card p-5', className)}
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className={cn('h-4 w-1 rounded-full', accentClass)} />
            <h3 className="text-sm font-semibold leading-tight">{title}</h3>
          </div>
          {description && (
            <p className="mt-0.5 ml-3 text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>

      {loading ? (
        <div
          className={cn(
            'rounded-lg bg-muted/30 animate-pulse w-full',
            skeletonHeight,
          )}
        />
      ) : error ? (
        <Alert variant="destructive">
          <Alert.Title>{t('error-loading-data')}</Alert.Title>
          <Alert.Description>{error.message}</Alert.Description>
        </Alert>
      ) : (
        children
      )}
    </div>
  );
}
