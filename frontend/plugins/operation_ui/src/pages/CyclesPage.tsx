import { Breadcrumb } from 'erxes-ui';
import { useParams } from 'react-router-dom';
import { FavoriteToggleIconButton, PageHeader } from 'ui-modules';
import { Separator } from 'erxes-ui';
import { CyclesRecordTable } from '@/cycle/components/CyclesRecordTable';
import { AddCycleSheet } from '@/cycle/components/add-cycle/AddCycle';
import { TeamBreadCrumb } from '@/team/components/breadcrumb/TeamBreadCrumb';
import { CyclesBreadcrumb } from '@/cycle/components/CyclesBreadcrumb';

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
              <Separator.Inline />
              <FavoriteToggleIconButton />
            </Breadcrumb.List>
          </Breadcrumb>
        </PageHeader.Start>
        <AddCycleSheet />
      </PageHeader>
      <CyclesRecordTable />
    </>
  );
};
