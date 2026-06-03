import { IconCurrencyDollar } from '@tabler/icons-react';
import { Button, Separator } from 'erxes-ui';

export const ExchangeRatesBreadcrumb = () => {
  return (
    <>
      <Button variant="ghost" className="font-semibold">
        <IconCurrencyDollar className="w-4 h-4 text-accent-foreground" />
        Settings
      </Button>
      <Separator.Inline />
      <Button variant="ghost" className="hover:bg-transparent font-semibold">
        Exchange Rates
      </Button>
    </>
  );
};
