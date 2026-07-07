import { IconCurrencyDollar } from '@tabler/icons-react';
import { Button, Separator, useIsMatchingLocation } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PaymentAddSheet } from '@/settings/payment/components/PaymentAddSheet';

/** Breadcrumb for payment settings pages with page-specific actions. */
export const PaymentSettingsBreadcrumb = () => {
  const { t } = useTranslation('payment');
  const isMatchingLocation = useIsMatchingLocation('/settings/payment');

  return (
    <>
      <Link to="/settings/payment">
        <Button variant="ghost" className="font-semibold">
          <IconCurrencyDollar className="w-4 h-4 text-accent-foreground" />
          {t('payment')}
        </Button>
      </Link>

      {isMatchingLocation('/methods') && (
        <>
          <Separator.Inline />
          <Button variant="ghost" className="font-semibold">
            {t('methods')}
          </Button>
          <span className="ml-auto">
            <PaymentAddSheet />
          </span>
        </>
      )}

      {isMatchingLocation('/invoices') && (
        <>
          <Separator.Inline />
          <Button variant="ghost" className="font-semibold">
            {t('invoices')}
          </Button>
        </>
      )}

      {isMatchingLocation('/corporate-gateway') && (
        <>
          <Separator.Inline />
          <Button variant="ghost" className="font-semibold">
            {t('corporate-gateway')}
          </Button>
        </>
      )}
    </>
  );
};
