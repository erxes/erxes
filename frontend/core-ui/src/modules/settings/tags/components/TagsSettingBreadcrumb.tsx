import { IconTagsFilled } from '@tabler/icons-react';
import { Button, Skeleton, useMultiQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const TagsSettingBreadcrumb = () => {
  const { t } = useTranslation('settings', {
    keyPrefix: 'tags',
  });

  return (
    <>
      <Button variant="ghost" className="font-semibold">
        <IconTagsFilled className="size-4 text-accent-foreground" />
        {t('_')}
      </Button>
    </>
  );
};
