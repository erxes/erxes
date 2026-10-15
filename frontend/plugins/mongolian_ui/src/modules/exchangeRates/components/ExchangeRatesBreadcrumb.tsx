import { IconCurrencyDollar } from '@tabler/icons-react';
import { Button, Separator } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const ExchangeRatesBreadcrumb = () => {
  const { t } = useTranslation('mongolian');
  return (
    <>
      <Button variant="ghost">
        <IconCurrencyDollar />
        {t('settings')}
      </Button>
      <Separator.Inline />
      <Button variant="ghost" className="hover:bg-transparent">
        {t('exchange-rates-label')}
      </Button>
    </>
  );
};
