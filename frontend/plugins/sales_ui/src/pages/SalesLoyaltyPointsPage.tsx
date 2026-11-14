import { IconCoins, IconSandbox } from '@tabler/icons-react';
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
import { useOpenRecordPanelFromQuery } from '~/widgets/record-panel/useOpenRecordPanelFromQuery';
import { DealLoyaltyFilter } from '@/deals/loyaltyRules/components/DealLoyaltyFilter';
import { DealLoyaltyInsights } from '@/deals/loyaltyRules/components/DealLoyaltyInsights';
import { DealScoreLogsTable } from '@/deals/loyaltyRules/components/DealScoreLogsTable';

/** Point movements of every deal the user may see, across pipelines. */
export const SalesLoyaltyPointsPage = () => {
  const { t } = useTranslation('sales');
  useOpenRecordPanelFromQuery('salesItemId', 'sales:deal');

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
                      <Link to="/sales/deals">
                        <IconSandbox />
                        {t('sales-pipeline', 'Sales Pipeline')}
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
              <DealLoyaltyFilter />
            </PageSubHeader>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <DealLoyaltyInsights scope="all" />
            </div>
            <LoyaltyDrillSheet>
              <DealScoreLogsTable scope="all" />
            </LoyaltyDrillSheet>
          </PageContainer>
        </div>
      </div>
    </LoyaltyDrillProvider>
  );
};
