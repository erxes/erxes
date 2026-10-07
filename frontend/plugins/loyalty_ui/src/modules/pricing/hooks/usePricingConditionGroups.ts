import { useQuery } from '@apollo/client';
import { PRICING_PRODUCT_CONDITION_GROUPS } from '@/pricing/graphql/queries';

export interface IPricingConditionGroup {
  _id: string;
  name: string;
  conditions: { _id: string; name: string }[];
}

export const usePricingConditionGroups = () => {
  const { data, loading } = useQuery<{
    productConditionGroups: IPricingConditionGroup[];
  }>(PRICING_PRODUCT_CONDITION_GROUPS);

  return { conditionGroups: data?.productConditionGroups || [], loading };
};

export interface IConditionColumn {
  _id: string;
  name: string;
  groupId: string;
  groupName: string;
}

// The groups the plan's products carry, in their own order, become price columns.
export const usePricingConditionColumns = (groupIds: string[]) => {
  const { conditionGroups } = usePricingConditionGroups();
  const planGroupIds = new Set(groupIds);

  const conditionColumns: IConditionColumn[] = conditionGroups
    .filter(({ _id }) => planGroupIds.has(_id))
    .flatMap((group) =>
      group.conditions.map(({ _id, name }) => ({
        _id,
        name,
        groupId: group._id,
        groupName: group.name,
      })),
    );
  const groupNames = Object.fromEntries(
    conditionGroups.map(({ _id, name }) => [_id, name]),
  );

  return { conditionColumns, groupNames };
};
