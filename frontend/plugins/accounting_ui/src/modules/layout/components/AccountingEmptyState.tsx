import {
  IconAlertCircle,
  IconDatabaseOff,
  type Icon,
} from '@tabler/icons-react';
import { cn, Empty } from 'erxes-ui';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

// Overlay mode sits on top of a mounted RecordTable (whose provider must be
// `relative`): it lets clicks reach the header and column selector, and only
// the action area takes pointer events.
const OVERLAY_CLASS_NAME =
  'pointer-events-none absolute inset-0 z-10 pt-16 **:data-[slot=empty-content]:pointer-events-auto';
const STANDALONE_CLASS_NAME = 'm-3 rounded-lg bg-sidebar';

export interface AccountingEmptyStateProps {
  icon?: Icon;
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  error?: Pick<Error, 'message'>;
  overlay?: boolean;
  className?: string;
}

export const AccountingEmptyState = ({
  icon: EmptyIcon = IconDatabaseOff,
  title,
  description,
  action,
  error,
  overlay,
  className,
}: AccountingEmptyStateProps) => {
  const { t } = useTranslation('accounting');
  const StateIcon = error ? IconAlertCircle : EmptyIcon;
  const stateTitle = error ? t('error') : title ?? t('no-results-found');
  const stateDescription = error ? error.message : description;
  const showAction = Boolean(action) && !error;

  return (
    <Empty
      className={cn(
        overlay ? OVERLAY_CLASS_NAME : STANDALONE_CLASS_NAME,
        className,
      )}
    >
      <Empty.Header>
        <Empty.Media
          variant="icon"
          className={cn(
            'size-14 rounded-xl [&>svg]:size-8',
            error && 'text-destructive',
          )}
        >
          <StateIcon />
        </Empty.Media>
        <Empty.Title>{stateTitle}</Empty.Title>
        {stateDescription ? (
          <Empty.Description>{stateDescription}</Empty.Description>
        ) : null}
      </Empty.Header>
      {showAction ? <Empty.Content>{action}</Empty.Content> : null}
    </Empty>
  );
};
