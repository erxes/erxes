import { PagePanelStatus } from '@/side-panel/components/PagePanelStatus';
import {
  createPagePanelPortal as createPortal,
  usePagePanel,
  PagePanelContext,
} from '@/side-panel/hooks/usePagePanel';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@apollo/client';
import { Spinner, Table, cn } from 'erxes-ui';
import { GET_DEPARTMENT_MEMBERS } from '@/settings/structure/graphql';
import { useState } from 'react';
import {
  MembersInline,
  RecordSidePanel,
  SidePanelRecordPathContext,
  IUser,
} from 'ui-modules';
const MemberRow = ({ member }: { member: IUser }) => {
  return (
    <Table.Row className="shadow-xs group">
      <Table.Cell className="font-medium border-none pl-2 w-auto">
        <MembersInline.Provider members={[member]} memberIds={[member._id]}>
          <span className="w-full flex gap-2 items-center">
            <span className="[1lh] flex items-center">
              <MembersInline.Avatar />
            </span>
            <MembersInline.Title />
          </span>
        </MembersInline.Provider>
      </Table.Cell>
      <Table.Cell className="border-none w-8" />
    </Table.Row>
  );
};
export const DepartmentMembersSheet = ({
  departmentId,
  count,
}: {
  departmentId: string;
  count: number;
}) => {
  const { t } = useTranslation('settings', {
    keyPrefix: 'structure',
  });
  const [open, setOpen] = useState(false);
  const { data, loading, error } = useQuery(GET_DEPARTMENT_MEMBERS, {
    variables: {
      id: departmentId,
    },
    skip: !open,
  });
  const members: IUser[] = data?.departmentDetail?.users || [];
  const pagePanel = usePagePanel({
    expandable: false,
    name: `settings/department-members/${departmentId}`,
    open: open,
    onOpenChange: setOpen,
    identity: departmentId || 'new',
  });
  return (
    <PagePanelContext.Provider value={pagePanel}>
      <SidePanelRecordPathContext.Provider value={pagePanel.path}>
        <button
          className="w-full h-full font-medium text-sm hover:underline"
          onClick={pagePanel.onOpen}
        >
          {count}
        </button>
        {createPortal(
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
            {pagePanel.permissionsLoaded && pagePanel.allowed ? (
              <>
                <RecordSidePanel.Header
                  title={
                    <>{data?.departmentDetail?.title || t('department')}</>
                  }
                  {...pagePanel.headerProps}
                />
                <div
                  className={cn(
                    'flex min-h-0 flex-1 flex-col overflow-y-auto',
                    'flex-1 px-4 py-4 overflow-y-auto styled-scroll',
                  )}
                >
                  <DepartmentMembersList
                    loading={loading}
                    error={!!error}
                    members={members}
                  />
                </div>
              </>
            ) : (
              <PagePanelStatus entry={pagePanel} />
            )}
          </div>,
          pagePanel,
        )}
      </SidePanelRecordPathContext.Provider>
    </PagePanelContext.Provider>
  );
};

const DepartmentMembersList = ({
  loading,
  error,
  members,
}: {
  loading: boolean;
  error: boolean;
  members: IUser[];
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  if (loading)
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  if (error)
    return (
      <p className="px-2 py-4 text-destructive text-sm">
        {t('failed-to-load-members')}
      </p>
    );
  if (members.length === 0)
    return (
      <div className="flex flex-col justify-center items-center py-16 text-center">
        <p className="font-medium text-muted-foreground">{t('no-members')}</p>
        <p className="mt-1 text-muted-foreground/70 text-sm">
          {t('no-team-members-in-department')}
        </p>
      </div>
    );
  return (
    <div className="bg-sidebar pr-2 pb-2 pl-1 border border-sidebar border-t-4 border-l-4 rounded-lg">
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Head className="pl-2 w-auto">{t('member')}</Table.Head>
            <Table.Head className="w-8" />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {members.map((member) => (
            <MemberRow key={member._id} member={member} />
          ))}
        </Table.Body>
      </Table>
    </div>
  );
};
