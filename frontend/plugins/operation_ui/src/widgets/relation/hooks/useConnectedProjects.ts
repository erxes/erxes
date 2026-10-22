import { compactList } from '@/operation/utils/cursorList';
import { GET_PROJECTS } from '@/project/graphql/queries/getProjects';
import { useQuery } from '@apollo/client';
import { useWidgetRelations } from './useWidgetRelations';

export const useConnectedProjects = ({
  contentId,
  contentType,
}: {
  contentId: string;
  contentType: string;
}) => {
  const relations = useWidgetRelations({
    contentId,
    contentType,
    relatedContentType: 'operation:project',
  });
  const projectIds = relations.ids;
  const hasProjects = projectIds.length > 0;
  const projectsQuery = useQuery(GET_PROJECTS, {
    variables: { filter: { _ids: projectIds, limit: projectIds.length || 1 } },
    skip: !hasProjects,
  });

  return {
    projectIds,
    projects: hasProjects
      ? compactList(projectsQuery.data?.getProjects?.list)
      : [],
    loading: relations.loading || (hasProjects && projectsQuery.loading),
    error: relations.error || (hasProjects ? projectsQuery.error : undefined),
    retry: relations.error ? relations.refetch : projectsQuery.refetch,
  };
};
