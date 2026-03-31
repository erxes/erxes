import { CyclesBreadcrumb } from '@/cycle/components/CyclesBreadcrumb';
import { CyclesRecordTable } from '@/cycle/components/CyclesRecordTable';
import { AddCycleSheet } from '@/cycle/components/add-cycle/AddCycle';
import { TeamBreadCrumb } from '@/team/components/breadcrumb/TeamBreadCrumb';
import { Breadcrumb, Separator } from 'erxes-ui';
import { useParams } from 'react-router-dom';
import { PageHeader } from 'ui-modules';

export const CyclesPage = () => {
  const { teamId } = useParams();
  const link = `/operation/team/${teamId}/cycles`;
  return (
    <>
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <TeamBreadCrumb />
              <Separator.Inline />
              <CyclesBreadcrumb link={link} />
            </Breadcrumb.List>
          </Breadcrumb>
        </PageHeader.Start>
        <AddCycleSheet />
      </PageHeader>
      <CyclesRecordTable />
    </>
  );
};
