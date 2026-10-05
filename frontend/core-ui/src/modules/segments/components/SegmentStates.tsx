import {
  IconAlertTriangle,
  IconChartPie,
  IconRefresh,
} from '@tabler/icons-react';
import { Button, cn, Empty } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const SegmentEmptyState = ({
  className,
}: {
  className?: string;
}): JSX.Element => {
  const { t } = useTranslation('segment');

  return (
    <Empty className={cn('m-3 min-h-[20rem]', className)}>
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconChartPie />
        </Empty.Media>
        <Empty.Title>{t('empty-title')}</Empty.Title>
        <Empty.Description>{t('empty-description')}</Empty.Description>
      </Empty.Header>
    </Empty>
  );
};

export const SegmentErrorState = ({
  error,
  onRetry,
}: {
  error: Error;
  onRetry: () => void;
}): JSX.Element => {
  const { t } = useTranslation('segment');

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
