import { IconCurrencyDollar } from '@tabler/icons-react';
import { Button, Separator, useIsMatchingLocation } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PaymentAddSheet } from '@/settings/payment/components/PaymentAddSheet';

export const PaymentSettingsBreadcrumb = () => {
  const { t } = useTranslation('payment');
  const isMatchingLocation = useIsMatchingLocation('/payment/settings');

  return (
    <>
      <Link to="/payment/settings">
        <Button variant="ghost">
          <IconCurrencyDollar />
          {t('payment')}
        </Button>
      </Link>

      {isMatchingLocation('/methods') && (
        <>
          <Separator.Inline />
          <Button variant="ghost">{t('methods')}</Button>
          <span className="ml-auto">
            <PaymentAddSheet />
          </span>
        </>
      )}

      {isMatchingLocation('/corporate-gateway') && (
        <>
          <Separator.Inline />
          <Button variant="ghost">{t('corporate-gateway')}</Button>
        </>
      )}
    </>
  );
};
