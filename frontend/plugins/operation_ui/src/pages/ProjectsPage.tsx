import { FavoriteToggleIconButton, PageHeader } from 'ui-modules';
import { Breadcrumb, Separator, Skeleton } from 'erxes-ui';
import { AddProjectSheet } from '@/project/components/add-project/AddProjectSheet';
import { useParams } from 'react-router-dom';
import { ProjectBreadCrumb } from '@/project/components/breadcumb/ProjectBreadCrumb';
import { TeamBreadCrumb } from '@/team/components/breadcrumb/TeamBreadCrumb';
import { ProjectsRecordTable } from '@/project/components/ProjectsRecordTable';
import { useTranslation } from 'react-i18next';
import { useTeamFavoriteBreadcrumb } from '@/team/hooks/useTeamFavoriteBreadcrumb';

export const ProjectsPage = () => {
  const { teamId } = useParams();
  const { t } = useTranslation('operation');
  const { breadcrumb: favoriteBreadcrumb, loading: favoriteLoading } =
    useTeamFavoriteBreadcrumb(teamId, t('projects'));

  return (
    <>
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              {teamId && (
                <>
                  <TeamBreadCrumb />
                  <Separator.Inline />
                </>
              )}
              <ProjectBreadCrumb
                link={
                  teamId
                    ? `/operation/team/${teamId}/projects`
                    : `/operation/projects`
                }
              />
              <Breadcrumb.Item className="ml-1">
                {favoriteLoading ? (
                  <Skeleton className="w-8 h-8" />
                ) : (
                  <FavoriteToggleIconButton
                    breadcrumb={favoriteBreadcrumb}
                    icon="IconClipboard"
                  />
                )}
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
        </PageHeader.Start>
        <PageHeader.End>
          <AddProjectSheet />
        </PageHeader.End>
      </PageHeader>

      <ProjectsRecordTable />
    </>
  );
};
