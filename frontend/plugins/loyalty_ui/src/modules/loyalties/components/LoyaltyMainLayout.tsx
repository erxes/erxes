import { PageContainer } from 'erxes-ui';
import { Suspense } from 'react';
import { IconAward } from '@tabler/icons-react';
import { PageHeader } from 'ui-modules';
import { LoyaltyMainSidebar } from './LoyaltyMainSidebar';
import {
  LoyaltyHeaderActionProvider,
  useLoyaltyHeaderAction,
} from './LoyaltyHeaderActionContext';

const LoyaltyHeaderEnd = () => {
  const { action } = useLoyaltyHeaderAction();
  return <>{action}</>;
};

export const LoyaltyMainLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <LoyaltyHeaderActionProvider>
      <PageContainer className="flex flex-col h-full">
        <PageHeader className="p-3 mx-0">
          <PageHeader.Start>
            <IconAward className="size-4" />
            <span className="font-medium">Loyalty</span>
          </PageHeader.Start>
          <PageHeader.End>
            <LoyaltyHeaderEnd />
          </PageHeader.End>
        </PageHeader>
        <div className="flex flex-row h-full overflow-hidden">
          <LoyaltyMainSidebar />
          <div className="flex flex-col flex-auto overflow-hidden">
            <Suspense>{children}</Suspense>
          </div>
        </div>
      </PageContainer>
    </LoyaltyHeaderActionProvider>
  );
};
