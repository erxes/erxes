import {
  IconAffiliate,
  IconChartPie2,
  IconShoppingCartFilled,
} from '@tabler/icons-react';
import { Button, Separator } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export function AutomationSettingsBreadcrumb() {
  const { t } = useTranslation('automations');
  return (
    <>
      <Button variant="ghost" className="font-semibold">
        <IconAffiliate className="w-4 h-4 text-accent-foreground" />
        {t('automations')}
      </Button>
      <Separator.Inline />
    </>
  );
}
