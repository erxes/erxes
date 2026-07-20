import { CyclesBreadcrumb } from '@/cycle/components/CyclesBreadcrumb';
import { CyclesRecordTable } from '@/cycle/components/CyclesRecordTable';
import { AddCycleSheet } from '@/cycle/components/add-cycle/AddCycle';
import { TeamBreadCrumb } from '@/team/components/breadcrumb/TeamBreadCrumb';
import { Breadcrumb, Separator, Skeleton } from 'erxes-ui';
import { useParams } from 'react-router-dom';
import { FavoriteToggleIconButton, PageHeader } from 'ui-modules';
import { useTranslation } from 'react-i18next';
import { useTeamFavoriteBreadcrumb } from '@/team/hooks/useTeamFavoriteBreadcrumb';

export const CyclesPage = () => {
  const { teamId } = useParams();
  const { t } = useTranslation('operation');
  const link = `/operation/team/${teamId}/cycles`;
  const { breadcrumb: favoriteBreadcrumb, loading: favoriteLoading } =
    useTeamFavoriteBreadcrumb(teamId, t('cycles'));

  return (
    <>
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <TeamBreadCrumb />
              <Separator.Inline />
              <CyclesBreadcrumb link={link} />
              <Breadcrumb.Item className="ml-1">
                {favoriteLoading ? (
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
        <AddCycleSheet />
      </PageHeader>
      <CyclesRecordTable />
    </>
  );
};
