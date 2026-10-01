import { IconStairs } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { LoyaltyScoreFormValues } from '../../../constants/formSchema';
import { useCampaignAutomationSeeds } from '../../hooks/useCampaignAutomationSeeds';

export const CreateTierAutomationButton = ({
  form,
}: {
  form: UseFormReturn<LoyaltyScoreFormValues>;
}) => {
  const { t } = useTranslation('loyalty');
  const { canCreateTier, createTierAutomation } =
    useCampaignAutomationSeeds(form);

  if (!canCreateTier) {
    return null;
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      className="self-start"
      onClick={createTierAutomation}
    >
      <IconStairs />
      {t('score-campaign-tier-automation-create')}
    </Button>
  );
};
