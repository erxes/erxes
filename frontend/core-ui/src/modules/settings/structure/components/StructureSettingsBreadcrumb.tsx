import { IconChartPie2 } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export function StructureSettingsBreadcrumb() {
  const { t } = useTranslation('settings');
  return (
    <>
      <Button variant="ghost" className="font-semibold">
        <IconChartPie2 className="w-4 h-4 text-accent-foreground" />
        {t('structure', 'Structure')}
      </Button>
    </>
  );
}
