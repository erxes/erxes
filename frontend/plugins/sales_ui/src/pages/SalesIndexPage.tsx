import {
  Breadcrumb,
  Button,
  PageContainer,
  PageSubHeader,
  Separator,
} from 'erxes-ui';
import { IconSandbox, IconSettings } from '@tabler/icons-react';
import { Link, useSearchParams } from 'react-router-dom';

import { AddDealSheet } from '@/deals/components/AddDealSheet';
import MainActionBar from '@/deals/actionBar/components/MainActionBar';
import { PageHeader } from 'ui-modules';
import { SalesBreadCrumb } from '@/deals/components/breadcrumb/SalesBreadCrumb';
import { SalesItemDetail } from '@/deals/cards/components/detail/SalesItemDetail';
import { lazy } from 'react';

const DealBoard = lazy(() =>
  import('@/deals/components/DealsBoard').then((mod) => ({
    default: mod.DealsBoard,
  })),
);

export const SalesIndexPage = () => {
  const [searchParams] = useSearchParams();
  const boardId = searchParams.get('boardId');
  const pipelineId = searchParams.get('pipelineId');

  return (
    <div className="flex h-full overflow-hidden w-full">
      <div className="flex flex-col h-full w-full overflow-hidden">
        <PageHeader>
          <PageHeader.Start>
            <Breadcrumb>
              <Breadcrumb.List className="gap-1">
                <Breadcrumb.Item>
                  <Button variant="ghost" asChild>
                    <Link to="/sales">
                      <IconSandbox />
                      Sales Pipeline
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
          <AddDealSheet />
          <PageHeader.End>
            <Button variant="outline" asChild>
              <Link to="/settings/deals">
                <IconSettings />
                Go to Sales Pipeline settings
              </Link>
            </Button>
          </PageHeader.End>
        </PageHeader>

        <PageContainer className="overflow-hidden">
          <PageSubHeader>
            <MainActionBar />
          </PageSubHeader>

          <DealBoard />
          <SalesItemDetail />
        </PageContainer>
      </div>
    </div>
  );
};
