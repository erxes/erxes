import type { OperationContactTaskCandidatesQuery } from '~/gql/graphql';

export const mergeTaskCandidatePages = (
  previous: OperationContactTaskCandidatesQuery,
  next: OperationContactTaskCandidatesQuery,
  requestedSearch: string,
  activeSearch: string | null | undefined,
): OperationContactTaskCandidatesQuery => {
  if (requestedSearch !== activeSearch || !previous.getTasks || !next.getTasks)
    return previous;

  const tasks = new Map(
    [...(previous.getTasks.list ?? []), ...(next.getTasks.list ?? [])]
      .filter((task) => task !== null)
      .map((task) => [task._id, task]),
  );
  return {
    ...previous,
    getTasks: { ...next.getTasks, list: [...tasks.values()] },
  };
};
