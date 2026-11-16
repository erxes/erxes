import { useDealsEdit } from '@/deals/cards/hooks/useDeals';
import {
  areIdListsEqual,
  rejectOnMutationError,
  useOptimisticField,
} from '@/deals/components/deal-selects/hooks/useOptimisticField';
import { IDealDetail } from '@/deals/types/deals';
import { isDefined } from 'erxes-ui';

export const toList = (value: string | string[]) =>
  Array.isArray(value) ? value : [value];

export const toSingle = (value: string | string[]) =>
  Array.isArray(value) ? value[0] || '' : value;

export const useDealListField = (
  deal: IDealDetail,
  key: 'assignedUserIds' | 'tagIds' | 'branchIds' | 'departmentIds',
) => {
  const { editDeals } = useDealsEdit();

  return useOptimisticField({
    value: deal[key]?.filter(isDefined) || [],
    resetKey: deal._id,
    isEqual: areIdListsEqual,
    onCommit: (value) =>
      rejectOnMutationError(
        editDeals({ variables: { _id: deal._id, [key]: value } }),
      ),
  });
};
