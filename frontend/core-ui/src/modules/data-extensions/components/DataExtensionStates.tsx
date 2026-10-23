import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';
import { Button, cn, Empty } from 'erxes-ui';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

export const DataExtensionEmptyState = ({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) => (
  <Empty className={cn('m-3 min-h-[20rem]', className)}>
    <Empty.Header>
      <Empty.Media variant="icon">{icon}</Empty.Media>
      <Empty.Title>{title}</Empty.Title>
      <Empty.Description>{description}</Empty.Description>
    </Empty.Header>
    {action && <Empty.Content>{action}</Empty.Content>}
  </Empty>
);

export const DataExtensionErrorState = ({
  error,
  onRetry,
}: {
  error: Error;
  onRetry: () => void;
}) => {
  const { t } = useTranslation('dataExtensions');

  return (
    <Empty className="m-3 min-h-[20rem] bg-accent/30" role="alert">
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconAlertTriangle className="text-destructive" />
        </Empty.Media>
        <Empty.Title>{t('error-title')}</Empty.Title>
        <Empty.Description className="break-words">
          {error.message || t('error-description')}
        </Empty.Description>
      </Empty.Header>
      <Empty.Content>
        <Button variant="outline" onClick={onRetry}>
          <IconRefresh />
          {t('retry')}
        </Button>
      </Empty.Content>
    </Empty>
  );
};
