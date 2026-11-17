import type { GetProjectsQuery } from '~/gql/graphql';
import { prependContactRecord } from './contactConnection';

export const PROJECT_CONNECTION_CONTENT_TYPE = 'operation:projectConnection';
export const CONTACT_PROJECT_RECORDS_LIMIT = 50;

type ProjectListItem = NonNullable<
  NonNullable<NonNullable<GetProjectsQuery['getProjects']>['list']>[number]
>;

export const withConnectedProject = (
  previous: GetProjectsQuery | null,
  project: ProjectListItem,
  incrementCount = true,
): GetProjectsQuery | null => {
  const page = previous?.getProjects;
  return page
    ? {
        ...previous,
        getProjects: prependContactRecord(page, project, incrementCount),
      }
    : null;
};
