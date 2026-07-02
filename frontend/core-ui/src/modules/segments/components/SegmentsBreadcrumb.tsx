import { IconTagsFilled } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const SegmentsBreadcrumb = () => {
  const { t } = useTranslation('segment');
  return (
    <div className="flex gap-1 items-center">
      <Button variant="ghost" className="font-semibold">
        <IconTagsFilled className="size-4 text-accent-foreground" />
        {t('segments', 'Segments')}
      </Button>
    </div>
  );
};
