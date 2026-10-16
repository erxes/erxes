import type { DealDetailQuery } from '~/gql/graphql';

type DealDetail = NonNullable<DealDetailQuery['dealDetail']>;

export const resolveDealDetail = (
  current: DealDetail | null | undefined,
  previous: DealDetail | undefined,
  dealId: string | null | undefined,
): DealDetail | undefined => {
  const complete = previous?._id === dealId ? previous : undefined;
  if (current?._id !== dealId) return complete;
  if (current?.pipeline) return current;
  if (!current || !complete) return undefined;

  // Subscription payloads can null computed fields in Apollo's normalized
  // cache. Retain that metadata, but never roll back newer stored field values.
  return {
    ...current,
    pipeline: complete.pipeline,
    pipelineId: current.pipelineId ?? complete.pipelineId,
    boardId: current.boardId ?? complete.boardId,
    stage: current.stage ?? complete.stage,
    assignedUsers: current.assignedUsers ?? complete.assignedUsers,
    branches: current.branches ?? complete.branches,
    companies: current.companies ?? complete.companies,
    customers: current.customers ?? complete.customers,
    departments: current.departments ?? complete.departments,
    isWatched: current.isWatched ?? complete.isWatched,
    labels: current.labels ?? complete.labels,
    products: current.products ?? complete.products,
    relations: current.relations ?? complete.relations,
    tags: current.tags ?? complete.tags,
  };
};
