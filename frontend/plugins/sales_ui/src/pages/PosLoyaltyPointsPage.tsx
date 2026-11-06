import { IconCashRegister, IconCoins } from '@tabler/icons-react';
import {
  Breadcrumb,
  Button,
  PageContainer,
  PageSubHeader,
  Separator,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PageHeader } from 'ui-modules';
import {
  LoyaltyDrillProvider,
  LoyaltyDrillSheet,
} from '@/loyalty-points/drill';
import { PosOrderSheet } from '@/pos/orders/components/PosOrderSheet';
import { PosLoyaltyFilter } from '@/pos/loyalty-points/components/PosLoyaltyFilter';
import { PosLoyaltyInsights } from '@/pos/loyalty-points/components/PosLoyaltyInsights';
import { PosScoreLogsTable } from '@/pos/loyalty-points/components/PosScoreLogsTable';

/** Point movements of every POS order, across POSes. */
export const PosLoyaltyPointsPage = () => {
  const { t } = useTranslation('sales');

  return (
    <LoyaltyDrillProvider>
      <div className="flex h-full overflow-hidden w-full">
        <div className="flex flex-col h-full w-full overflow-hidden">
          <PageHeader>
            <PageHeader.Start className="flex-auto min-w-0">
              <Breadcrumb className="min-w-0">
                <Breadcrumb.List className="gap-1 flex-nowrap min-w-0">
                  <Breadcrumb.Item className="shrink-0">
                    <Button variant="ghost" asChild>
                      <Link to="/sales/pos">
                        <IconCashRegister />
                        {t('pos')}
                      </Link>
                    </Button>
                  </Breadcrumb.Item>
                  <Separator.Inline />
                  <Breadcrumb.Item className="shrink-0">
                    <Button variant="ghost">
                      <IconCoins />
                      {t('loyalty-deal-points')}
                    </Button>
                  </Breadcrumb.Item>
                </Breadcrumb.List>
              </Breadcrumb>
            </PageHeader.Start>
          </PageHeader>

          <PageContainer className="overflow-hidden">
            <PageSubHeader>
              <PosLoyaltyFilter />
            </PageSubHeader>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <PosLoyaltyInsights />
            </div>
            <LoyaltyDrillSheet>
              <PosScoreLogsTable />
            </LoyaltyDrillSheet>
            <PosOrderSheet />
          </PageContainer>
        </div>
      </div>
    </LoyaltyDrillProvider>
  );
};
