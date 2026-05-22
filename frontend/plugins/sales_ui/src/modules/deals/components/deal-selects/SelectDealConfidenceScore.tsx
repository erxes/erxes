import { SelectConfidenceScore } from '@/deals/components/deal-selects/SelectConfidenceScore';
import { SelectTriggerVariant } from 'erxes-ui';
import { useDealsEdit } from '@/deals/cards/hooks/useDeals';

export const SelectDealConfidenceScore = ({
  dealId,
  value,
  variant,
}: {
  dealId: string;
  value: number;
  variant: `${SelectTriggerVariant}`;
}) => {
  const { editDeals } = useDealsEdit();

  return (
    <SelectConfidenceScore
      variant={variant}
      value={value ?? 0}
      onValueChange={(confidenceScore) =>
        editDeals({ variables: { _id: dealId, confidenceScore } })
      }
    />
  );
};
