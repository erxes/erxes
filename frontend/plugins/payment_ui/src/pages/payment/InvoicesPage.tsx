import { IconCurrencyDollar, IconInvoice } from '@tabler/icons-react';
import { Breadcrumb, Button, Separator } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PageHeader } from 'ui-modules';
import { InvoiceRecordTable } from '~/modules/payment/components/InvoiceRecordTable';

export const InvoicesPage = () => {
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
                  <Link to="/settings/payment/invoices">
                    <IconInvoice />
                    {t('invoices')}
                  </Link>
                </Button>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
        </PageHeader.Start>

        <PageHeader.End>
          <></>
        </PageHeader.End>
      </PageHeader>

      <div className="flex h-full overflow-hidden">
        <div className="flex flex-col h-full overflow-hidden flex-auto">
          <InvoiceRecordTable />
        </div>
      </div>
    </div>
  );
};
