import {
  Breadcrumb,
  Button,
  PageContainer,
  PageSubHeader,
  Separator,
} from 'erxes-ui';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

import { AddDealSheet } from '@/deals/components/AddDealSheet';
import { CommonDealSearch } from '@/deals/components/commonSearch';
import { DealsView } from '@/deals/actionBar/components/DealViewControl';
import { IconSandbox, IconSettings } from '@tabler/icons-react';
import MainActionBar from '@/deals/actionBar/components/MainActionBar';
import { PageHeader } from 'ui-modules';
import { SalesBreadCrumb } from '@/deals/components/breadcrumb/SalesBreadCrumb';
import { SalesItemDetail } from '@/deals/cards/components/detail/SalesItemDetail';
import { useBoards } from '@/deals/boards/hooks/useBoards';
import { usePipelines } from '@/deals/boards/hooks/usePipelines';

export const SalesIndexPage = () => {
  const { t } = useTranslation('sales');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const boardId = searchParams.get('boardId');
  const pipelineId = searchParams.get('pipelineId');

  const { boards } = useBoards();
  const firstBoardId = boards?.[0]?._id;

  // Use the same pipelines source/order as the sidebar so the default matches
  // the first pipeline shown there (not salesBoards.pipelines, which is ordered
  // differently).
  const { pipelines } = usePipelines({
    variables: { boardId: firstBoardId },
    skip: !firstBoardId || !!boardId || !!pipelineId,
  });

  // Landing on the deals page with nothing selected (e.g. clicking the
  // "Sales pipeline" menu) defaults to the first board and its first pipeline,
  // mirroring how the POS index page redirects to the first POS.
  useEffect(() => {
    if (boardId || pipelineId) return;
    if (!firstBoardId || !pipelines || pipelines.length === 0) return;

    const params = new URLSearchParams();
    params.set('boardId', firstBoardId);
    params.set('pipelineId', pipelines[0]._id);

    navigate(`/sales/deals?${params.toString()}`, { replace: true });
  }, [firstBoardId, pipelines, boardId, pipelineId, navigate]);

  return (
    <div className="flex h-full overflow-hidden w-full">
      <div className="flex flex-col h-full w-full overflow-hidden">
        <PageHeader>
          <PageHeader.Start>
            <Breadcrumb>
              <Breadcrumb.List className="gap-1">
                <Breadcrumb.Item>
                  <Button variant="ghost" asChild>
                    <Link to="/sales/deal">
                      <IconSandbox />
                      {t('sales-pipeline')}
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
              <Link to={`/settings/sales/deals?activeBoardId=${boardId}`}>
                <IconSettings />
                {t('go-to-settings')}
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
