import { IconChartPie2, IconShoppingCartFilled } from '@tabler/icons-react';
import { Button, Separator } from 'erxes-ui';

export function ProductSettingsBreadcrumb() {
  return (
    <>
      <Button variant="ghost" className="font-semibold">
        <IconShoppingCartFilled className="w-4 h-4 text-accent-foreground" />
        Products
      </Button>
      <Separator.Inline />
    </>
  );
}
