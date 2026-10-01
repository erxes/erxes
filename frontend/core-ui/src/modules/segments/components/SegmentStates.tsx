import { IconChartPie } from '@tabler/icons-react';
import { cn, Empty } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const SegmentEmptyState = ({ className }: { className?: string }) => {
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
