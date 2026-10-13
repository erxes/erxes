import { UseFormReturn, useWatch } from 'react-hook-form';
import { LoyaltyScoreFormValues } from '../../constants/formSchema';
import { useCampaignAutomationSeeds } from './useCampaignAutomationSeeds';

export const useEarnRowAutomation = (
  form: UseFormReturn<LoyaltyScoreFormValues>,
  index: number,
) => {
  const [key, kind, valueType] = useWatch({
    control: form.control,
    name: [
      `add.table.rows.${index}.key`,
      `add.table.rows.${index}.kind`,
      `add.table.rows.${index}.valueType`,
    ],
  });
  const { isSaved, createPointAutomation } = useCampaignAutomationSeeds(form);

  return {
    // A bonus multiplying the base gives nothing on its own.
    visible: !(kind === 'bonus' && valueType === 'multiplier'),
    // A row gets its key when the campaign is saved; the action points at it.
    ready: isSaved && !!key,
    create: () => key && createPointAutomation(key),
  };
};
