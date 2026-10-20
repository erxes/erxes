import {
  IconAlertCircle,
  IconDatabaseOff,
  type Icon,
} from '@tabler/icons-react';
import { cn, Empty } from 'erxes-ui';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

export const AccountingEmptyState = ({
  icon: EmptyIcon = IconDatabaseOff,
  title,
  description,
  error,
  className,
}: {
  icon?: Icon;
  title?: ReactNode;
  description?: ReactNode;
  error?: { message: string };
  className?: string;
}) => {
  const { t } = useTranslation('accounting');
  const StateIcon = error ? IconAlertCircle : EmptyIcon;
  const stateDescription = error ? error.message : description;

  return (
    <Empty className={cn('m-3 rounded-lg bg-sidebar', className)}>
      <Empty.Header>
        <Empty.Media variant="icon" className={cn(error && 'text-destructive')}>
          <StateIcon />
        </Empty.Media>
        <Empty.Title>
          {error ? t('error') : title ?? t('no-results-found')}
        </Empty.Title>
        {stateDescription ? (
          <Empty.Description>{stateDescription}</Empty.Description>
        ) : null}
      </Empty.Header>
    </Empty>
  );
};
