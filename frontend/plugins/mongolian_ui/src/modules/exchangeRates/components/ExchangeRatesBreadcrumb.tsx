import { IconCurrencyDollar } from '@tabler/icons-react';
import { Button, Separator } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { PageHeader, createFavoriteBreadcrumb } from 'ui-modules';

export const ExchangeRatesBreadcrumb = () => {
  const { t } = useTranslation('mongolian');
  const favoriteBreadcrumb = createFavoriteBreadcrumb(
    t('settings'),
    t('exchange-rates-label'),
  );

  return (
    <>
      <Button variant="ghost" className="font-semibold">
        <IconCurrencyDollar className="w-4 h-4 text-accent-foreground" />
        {t('settings')}
      </Button>
      <Separator.Inline />
      <Button variant="ghost" className="hover:bg-transparent font-semibold">
        {t('exchange-rates-label')}
      </Button>
      <Separator.Inline />
      <PageHeader.FavoriteToggleButton
        breadcrumb={favoriteBreadcrumb}
        icon="IconCurrencyDollar"
      />
    </>
  );
};
