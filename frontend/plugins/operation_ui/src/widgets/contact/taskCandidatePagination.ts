import { mergeContactCandidatePages } from './contactConnection';
import type { OperationContactTaskCandidatesQuery } from '~/gql/graphql';

export const mergeTaskCandidatePages = (
  previous: OperationContactTaskCandidatesQuery,
  next: OperationContactTaskCandidatesQuery,
  requestedSearch: string,
  activeSearch: string | null | undefined,
): OperationContactTaskCandidatesQuery => {
  if (!previous.getTasks || !next.getTasks) return previous;

  return {
    ...previous,
    getTasks: mergeContactCandidatePages(
      previous.getTasks,
      next.getTasks,
      requestedSearch,
      activeSearch,
    ),
  };
};
