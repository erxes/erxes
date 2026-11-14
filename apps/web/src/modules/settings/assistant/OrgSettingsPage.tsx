import { orpc } from '@erxes/core-contract/client';
import { skipToken, useQuery } from '@tanstack/react-query';
import { PageContainer, PageHeader, ScrollArea } from 'erxes-ui';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { AppBreadcrumb, type Crumb } from '~/components/AppBreadcrumb';
import { paths } from '~/lib/paths';
import { useCan } from '~/modules/auth/session';

const useOrgSettings = (canManage: boolean) =>
  useQuery(orpc.assistant.settings.queryOptions({ input: canManage ? undefined : skipToken }));

export const OrgSettingsPage = ({
  crumb,
  children,
}: {
  crumb: Crumb;
  children: (settings: ReturnType<typeof useOrgSettings>) => ReactNode;
}) => {
  const canManage = useCan()('assistant.manage');
  const settings = useOrgSettings(canManage);

  if (!canManage) return <Navigate to={paths.settings.root} replace />;

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb items={[crumb]} />
        </PageHeader.Start>
      </PageHeader>
      <ScrollArea className="flex-1">{children(settings)}</ScrollArea>
    </PageContainer>
  );
};
