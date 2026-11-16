import { Button, cn } from 'erxes-ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

// One consistent two-line row for operation records in contact/relation lists.
export const RelationRecordRow = ({
  name,
  leading,
  leadingClassName,
  trailing,
  onClick,
  children,
}: {
  name?: string | null;
  leading: ReactNode;
  leadingClassName?: string;
  trailing?: ReactNode;
  onClick: () => void;
  children: ReactNode;
}) => {
  const { t } = useTranslation('operation');
  const title = name || t('untitled', 'Untitled');
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className="h-auto w-full min-w-0 items-center justify-start gap-2.5 rounded-sm p-2 text-left"
    >
      <span
        className={cn(
          'flex size-7 shrink-0 items-center justify-center rounded bg-accent text-muted-foreground',
          leadingClassName,
        )}
      >
        {leading}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="min-w-0 truncate text-sm" title={title}>
          {title}
        </span>
        <span className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs font-normal text-muted-foreground">
          {children}
        </span>
      </span>
      {trailing}
    </Button>
  );
};
