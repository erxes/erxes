import {
  Breadcrumb,
  Button,
  PageContainer,
  PageSubHeader,
  Separator,
} from 'erxes-ui';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { AddDealSheet } from '@/deals/components/AddDealSheet';
import { CommonDealSearch } from '@/deals/components/commonSearch';
import { DealsView } from '@/deals/actionBar/components/DealViewControl';
import { IconSandbox, IconSettings } from '@tabler/icons-react';
import MainActionBar from '@/deals/actionBar/components/MainActionBar';
import { PageHeader } from 'ui-modules';
import { SalesBreadCrumb } from '@/deals/components/breadcrumb/SalesBreadCrumb';
import { SalesItemDetail } from '@/deals/cards/components/detail/SalesItemDetail';
import { useEnsureSalesBoardSelection } from '@/deals/boards/hooks/useEnsureSalesBoardSelection';

export const SalesIndexPage = () => {
  const { t } = useTranslation('sales');
  const [searchParams] = useSearchParams();
  const boardId = searchParams.get('boardId');
  const pipelineId = searchParams.get('pipelineId');
  const settingsSearchParams = new URLSearchParams();

  if (boardId) settingsSearchParams.set('activeBoardId', boardId);
  if (pipelineId) settingsSearchParams.set('pipelineId', pipelineId);

  useEnsureSalesBoardSelection();

  return (
    <div className="flex h-full overflow-hidden w-full">
      <div className="flex flex-col h-full w-full overflow-hidden">
        <PageHeader>
          <PageHeader.Start className="flex-1 min-w-0">
            <Breadcrumb className="min-w-0">
              <Breadcrumb.List className="gap-1 flex-nowrap min-w-0">
                <Breadcrumb.Item className="shrink-0">
                  <Button variant="ghost" asChild>
                    <Link to="/sales/deal">
                      <IconSandbox />
                      {t('sales-pipeline', 'Sales Pipeline')}
                    </Link>
                  </Button>
                </Breadcrumb.Item>
                <Separator.Inline />
                {boardId && (
                  <SalesBreadCrumb boardId={boardId} pipelineId={pipelineId} />
                )}
              </Breadcrumb.List>
            </Breadcrumb>
          </PageHeader.Start>
          <PageHeader.End className="flex-none">
            <CommonDealSearch />
            <Button variant="ghost" asChild>
              <Link
                to={`/settings/sales/deals?${settingsSearchParams.toString()}`}
              >
                <IconSettings />
                {t('go-to-settings', 'Go to Settings')}
              </Link>
            </Button>
          </PageHeader.End>
          <AddDealSheet />
        </PageHeader>

        <PageContainer className="overflow-hidden">
          <PageSubHeader>
            <MainActionBar />
          </PageSubHeader>

          <DealsView />
          <SalesItemDetail />
        </PageContainer>
      </div>
    </div>
  );
};
