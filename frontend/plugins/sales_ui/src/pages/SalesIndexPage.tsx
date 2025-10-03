import {
  Breadcrumb,
  Button,
  PageContainer,
  PageSubHeader,
  Separator,
} from 'erxes-ui';
import { IconSandbox, IconSettings } from '@tabler/icons-react';

import { Link } from 'react-router-dom';
import MainActionBar from '@/deals/actionBar/components/MainActionBar';
import { PageHeader } from 'ui-modules';
import { SalesItemDetail } from '@/deals/cards/components/detail/SalesItemDetail';
import { SalesLeftSidebar } from '@/deals/components/SalesLeftSidebar';
import { StagesList } from '@/deals/stage/components/StagesList';

export const SalesIndexPage = () => {
  return (
    <div className="flex h-full overflow-hidden w-full">
      <SalesLeftSidebar />
      <div className="flex flex-col h-full w-full overflow-hidden">
        <PageHeader>
          <PageHeader.Start>
            <Breadcrumb>
              <Breadcrumb.List className="gap-1">
                <Breadcrumb.Item>
                  <Button variant="ghost" asChild>
                    <Link to="/sales">
                      <IconSandbox />
                      Sales
                    </Link>
                  </Button>
                </Breadcrumb.Item>
              </Breadcrumb.List>
            </Breadcrumb>
            <Separator.Inline />
            <PageHeader.FavoriteToggleButton />
          </PageHeader.Start>
          <PageHeader.End>
            <Button variant="outline" asChild>
              <Link to="/settings/deals">
                <IconSettings />
                Go to settings
              </Link>
            </Button>
          </PageHeader.End>
        </PageHeader>
        <PageContainer className="overflow-hidden">
          <PageSubHeader>
            <MainActionBar />
          </PageSubHeader>

          <StagesList />
          <SalesItemDetail />
        </PageContainer>
      </div>
    </div>
  );
};
