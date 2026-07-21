import { FavoriteToggleIconButton, PageHeader } from 'ui-modules';
import { Breadcrumb, Separator, Skeleton } from 'erxes-ui';
import { useParams } from 'react-router-dom';
import { TeamBreadCrumb } from '@/team/components/breadcrumb/TeamBreadCrumb';
import { AddTaskSheet } from '@/task/components/add-task/AddTaskSheet';
import { CyclesBreadcrumb } from '@/cycle/components/CyclesBreadcrumb';
import { useGetCycle } from '@/cycle/hooks/useGetCycle';
import { useTeamFavoriteBreadcrumb } from '@/team/hooks/useTeamFavoriteBreadcrumb';

export const CycleDetailHeader = () => {
  const { teamId, cycleId } = useParams<{
    teamId?: string;
    cycleId: string;
  }>();
  const { cycleDetail, loading: cycleLoading } = useGetCycle(cycleId);
  const cycleSegment = cycleId ? cycleDetail?.name || 'Unknown' : undefined;
  const { breadcrumb: favoriteBreadcrumb, loading: teamLoading } =
    useTeamFavoriteBreadcrumb(teamId, cycleSegment);

  return (
    <PageHeader>
      <PageHeader.Start>
        <Breadcrumb>
          <Breadcrumb.List className="gap-1">
            <TeamBreadCrumb />
            <Separator.Inline />
            <CyclesBreadcrumb link={`/operation/team/${teamId}/cycles`} />
            <Separator.Inline />
            <Breadcrumb.Item className="text-sm font-medium px-3 py-1">
              {cycleDetail?.name}
            </Breadcrumb.Item>
            <Breadcrumb.Item className="ml-1">
              {cycleLoading || teamLoading ? (
                <Skeleton className="w-8 h-8" />
              ) : (
                <FavoriteToggleIconButton
                  breadcrumb={favoriteBreadcrumb}
                  icon="IconListCheck"
                />
              )}
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>
      </PageHeader.Start>
      <PageHeader.End>
        {!cycleDetail?.isCompleted && <AddTaskSheet />}
      </PageHeader.End>
    </PageHeader>
  );
};
