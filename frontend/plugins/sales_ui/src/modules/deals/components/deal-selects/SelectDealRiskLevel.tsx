import { useDealsEdit } from '@/deals/cards/hooks/useDeals';
import { SelectRiskLevel } from '@/deals/components/deal-selects/SelectRiskLevel';
import { SelectTriggerVariant } from 'erxes-ui';
import {
  DEFAULT_RISK_LEVEL,
  TRiskLevel,
} from '@/deals/constants/riskLevel';

export const SelectDealRiskLevel = ({
  dealId,
  value,
  variant,
}: {
  dealId: string;
  value?: TRiskLevel;
  variant: `${SelectTriggerVariant}`;
}) => {
  const { editDeals } = useDealsEdit();

  const onChange = (next: TRiskLevel) => {
    editDeals({
      variables: {
        _id: dealId,
        riskLevel: next,
      },
    });
  };

  return (
    <SelectRiskLevel
      variant={variant}
      value={value ?? DEFAULT_RISK_LEVEL}
      onValueChange={onChange}
    />
  );
};
