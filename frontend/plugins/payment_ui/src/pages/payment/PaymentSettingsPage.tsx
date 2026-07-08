import { IconCurrencyDollar, IconSettings } from '@tabler/icons-react';
import { Breadcrumb, Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PageHeader } from 'ui-modules';
import { PaymentRecordTable } from '~/modules/settings/payment/components/PaymentRecordTable';
import { PaymentAddSheet } from '~/modules/settings/payment/components/PaymentAddSheet';

const PaymentSettingsPage = () => {
  const { t } = useTranslation('payment');
  return (
    <div className="flex flex-col h-full">
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/settings/payment">
                    <IconCurrencyDollar />
                    {t('payment')}
                  </Link>
                </Button>
              </Breadcrumb.Item>

              <Breadcrumb.Separator />

              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/settings/payment/methods">
                    <IconSettings />
                    {t('methods')}
                  </Link>
                </Button>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
        </PageHeader.Start>
        <PageHeader.End>
          <PaymentAddSheet />
        </PageHeader.End>
      </PageHeader>

      <div className="flex h-full overflow-hidden">
        <div className="flex flex-col flex-auto h-full overflow-hidden">
          <PaymentRecordTable />
        </div>
      </div>
    </div>
  );
};

export default PaymentSettingsPage;
