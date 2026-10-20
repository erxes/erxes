import { useTranslation } from 'react-i18next';
import { IconChartPie2 } from '@tabler/icons-react';
import { Button } from 'erxes-ui';

export function StructureSettingsBreadcrumb() {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  return (
    <>
      <Button variant="ghost">
        <IconChartPie2 />
        {t('structure')}
      </Button>
    </>
  );
}
