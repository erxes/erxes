import type { IDealFilter, SalesDealListQueryVariables } from '~/gql/graphql';

const toList = (
  value: string | (string | null | undefined)[] | null | undefined,
) => (typeof value === 'string' ? [value] : value);

export const toDealSubscriptionFilter = (
  variables?: SalesDealListQueryVariables,
): IDealFilter | undefined =>
  variables
    ? {
        ...variables,
        _ids: toList(variables._ids),
        assignedUserIds: toList(variables.assignedUserIds),
        branchIds: toList(variables.branchIds),
        departmentIds: toList(variables.departmentIds),
        labelIds: toList(variables.labelIds),
        priority: toList(variables.priority),
        productIds: toList(variables.productIds),
        tagIds: toList(variables.tagIds),
        userIds: toList(variables.userIds),
      }
    : undefined;
