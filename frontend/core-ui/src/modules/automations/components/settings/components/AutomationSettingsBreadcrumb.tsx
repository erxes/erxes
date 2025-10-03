import {
  IconAffiliate,
  IconChartPie2,
  IconShoppingCartFilled,
} from '@tabler/icons-react';
import { Button, Separator } from 'erxes-ui';

export function AutomationSettingsBreadcrumb() {
  return (
    <>
      <Button variant="ghost" className="font-semibold">
        <IconAffiliate className="w-4 h-4 text-accent-foreground" />
        Automations
      </Button>
      <Separator.Inline />
    </>
  );
}
