import { useTranslation } from 'react-i18next';
import { IconChartPie2 } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { Link } from 'react-router-dom';

export function StructureSettingsBreadcrumb() {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  return (
    <>
      <Button variant="ghost" asChild>
        <Link to="/settings/structures">
          <IconChartPie2 />
          {t('structure')}
        </Link>
      </Button>
    </>
  );
}
