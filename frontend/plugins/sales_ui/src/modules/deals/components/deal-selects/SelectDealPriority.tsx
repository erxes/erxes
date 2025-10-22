import { SelectPriority } from '@/deals/components/deal-selects/SelectPriority';
import { useDealsEdit } from '@/deals/cards/hooks/useDeals';

export enum SelectTriggerVariant {
  TABLE = 'table',
  CARD = 'card',
  DETAIL = 'detail',
  FORM = 'form',
  FILTER = 'filter',
  ICON = 'icon',
}

const PRIORITY_MAP: Record<string, number> = {
  'No Priority': 0,
  Minor: 1,
  Medium: 2,
  High: 3,
  Critical: 4,
};

function getPriorityString(value: number) {
  return (Object.keys(PRIORITY_MAP) as Array<keyof typeof PRIORITY_MAP>).find(
    (key) => PRIORITY_MAP[key] === value,
  );
}

export const SelectDealPriority = ({
  dealId,
  value,
  variant,
}: {
  dealId: string;
  value: string;
  variant: `${SelectTriggerVariant}`;
}) => {
  const { editDeals } = useDealsEdit();

  const onChange = (value: number) => {
    editDeals({
      variables: {
        _id: dealId,
        priority: getPriorityString(value),
      },
    });
  };

  return (
    <SelectPriority
      variant={variant}
      value={PRIORITY_MAP[value] ?? 0}
      onValueChange={onChange}
    />
  );
};
