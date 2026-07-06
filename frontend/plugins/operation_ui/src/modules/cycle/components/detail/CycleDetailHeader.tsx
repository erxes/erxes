import {
  FavoriteToggleIconButton,
  PageHeader,
  createFavoriteBreadcrumb,
} from 'ui-modules';
import { Breadcrumb, Separator } from 'erxes-ui';
import { useParams } from 'react-router-dom';
import { TeamBreadCrumb } from '@/team/components/breadcrumb/TeamBreadCrumb';
import { AddTaskSheet } from '@/task/components/add-task/AddTaskSheet';
import { CyclesBreadcrumb } from '@/cycle/components/CyclesBreadcrumb';
import { useGetCycle } from '@/cycle/hooks/useGetCycle';
import { useTranslation } from 'react-i18next';

export const CycleDetailHeader = () => {
  const { teamId, cycleId } = useParams<{
    teamId?: string;
    cycleId: string;
  }>();
  const { t } = useTranslation('operation');
  const { cycleDetail } = useGetCycle(cycleId);
  const favoriteBreadcrumb = createFavoriteBreadcrumb(
    t('cycles'),
    cycleDetail?.name,
  );

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
              <FavoriteToggleIconButton breadcrumb={favoriteBreadcrumb} />
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
