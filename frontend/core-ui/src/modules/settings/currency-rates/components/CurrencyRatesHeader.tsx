import { IconArrowsExchange, IconPlus } from '@tabler/icons-react';
import { Breadcrumb, Button } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Can, PageHeader, PageHeaderEnd, PageHeaderStart } from 'ui-modules';
import { currencyRateSheetAtom } from '../state';

export const CurrencyRatesHeader = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'currency-rates' });
  const setSheet = useSetAtom(currencyRateSheetAtom);

  return (
    <PageHeader>
      <PageHeaderStart>
        <Breadcrumb>
          <Breadcrumb.List className="gap-1">
            <Breadcrumb.Item>
              <Button variant="ghost" asChild>
                <Link to="/settings/exchange-rates">
                  <IconArrowsExchange />
                  {t('title', 'Exchange rates')}
                </Link>
              </Button>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>
      </PageHeaderStart>
      <PageHeaderEnd>
        <Can action="exchangeRatesManage">
          <Button onClick={() => setSheet('new')}>
            <IconPlus />
            {t('add-rate', 'Add rate')}
          </Button>
        </Can>
      </PageHeaderEnd>
    </PageHeader>
  );
};
