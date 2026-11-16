import { SelectPriority } from '@/deals/components/deal-selects/SelectPriority';
import { useDealsEdit } from '@/deals/cards/hooks/useDeals';
import {
  rejectOnMutationError,
  useOptimisticField,
} from '@/deals/components/deal-selects/hooks/useOptimisticField';
import { getPriorityLevel, getPriorityName } from '@/deals/utils/dealPriority';

export enum SelectTriggerVariant {
  TABLE = 'table',
  CARD = 'card',
  DETAIL = 'detail',
  FORM = 'form',
  FILTER = 'filter',
  ICON = 'icon',
}

export const SelectDealPriority = ({
  dealId,
  value,
  variant,
  badge,
}: {
  dealId: string;
  value: string;
  variant: `${SelectTriggerVariant}`;
  badge?: boolean;
}) => {
  const { editDeals } = useDealsEdit();
  const priority = useOptimisticField({
    value: getPriorityLevel(value),
    resetKey: dealId,
    onCommit: (nextValue) =>
      rejectOnMutationError(
        editDeals({
          variables: {
            _id: dealId,
            priority: getPriorityName(nextValue),
          },
        }),
      ),
  });

  return (
    <SelectPriority
      variant={variant}
      badge={badge}
      value={priority.value}
      onValueChange={priority.setValue}
    />
  );
};
