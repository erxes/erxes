import {
  Breadcrumb,
  Button,
  PageContainer,
  PageSubHeader,
  Separator,
} from 'erxes-ui';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { CommonDealSearch } from '@/deals/components/commonSearch';
import { DealsView } from '@/deals/actionBar/components/DealViewControl';
import { IconSandbox, IconSettings } from '@tabler/icons-react';
import MainActionBar from '@/deals/actionBar/components/MainActionBar';
import { PageHeader } from 'ui-modules';
import { SalesBreadCrumb } from '@/deals/components/breadcrumb/SalesBreadCrumb';
import { useOpenRecordPanelFromQuery } from '~/widgets/record-panel/useOpenRecordPanelFromQuery';

export const SalesIndexPage = () => {
  const { t } = useTranslation('sales');
  const [searchParams] = useSearchParams();
  useOpenRecordPanelFromQuery('salesItemId', 'sales:deal');
  const boardId = searchParams.get('boardId');
  const pipelineId = searchParams.get('pipelineId');
  const boardSearchParams = new URLSearchParams();
  const settingsSearchParams = new URLSearchParams();

  if (boardId) {
    boardSearchParams.set('boardId', boardId);
    settingsSearchParams.set('activeBoardId', boardId);
  }
  if (pipelineId) {
    boardSearchParams.set('pipelineId', pipelineId);
    settingsSearchParams.set('pipelineId', pipelineId);
  }

  return (
    <div className="flex h-full overflow-hidden w-full">
      <div className="flex flex-col h-full w-full overflow-hidden">
        <PageHeader>
          <PageHeader.Start className="flex-auto min-w-0">
            <Breadcrumb className="min-w-0">
              <Breadcrumb.List className="gap-1 flex-nowrap min-w-0">
                <Breadcrumb.Item className="shrink-0">
                  <Button variant="ghost" asChild>
                    <Link to={`/sales/deals?${boardSearchParams.toString()}`}>
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
          <PageHeader.End>
            <CommonDealSearch />
            <Button variant="ghost" asChild>
              <Link
                to={`/sales/settings/deals?${settingsSearchParams.toString()}`}
              >
                <IconSettings />
                {t('go-to-settings', 'Go to Settings')}
              </Link>
            </Button>
          </PageHeader.End>
        </PageHeader>

        <PageContainer className="overflow-hidden">
          <PageSubHeader>
            <MainActionBar />
          </PageSubHeader>

          <DealsView />
        </PageContainer>
      </div>
    </div>
  );
};
