import {
  IconBolt,
  IconBox,
  IconSettings,
} from '@tabler/icons-react';
import { UseFormReturn } from 'react-hook-form';
import { SectionedSheetForm } from '../../../../components/SectionedSheetForm';
import { LoyaltyScoreFormValues } from '../../constants/formSchema';
import {
  SCORE_CAMPAIGN_SECTIONS,
  useScoreCampaignSections,
} from '../hooks/useScoreCampaignSections';
import { ScoreCampaignProvider } from '../contexts/ScoreCampaignContext';
import { ScoreCampaignAutomations } from './ScoreCampaignAutomations';
import { ScoreCampaignGeneralSection } from './ScoreCampaignGeneralSection';
import { ScoreCampaignProductsSection } from './ScoreCampaignProductsSection';

const SECTIONS = {
  general: {
    labelKey: 'score-campaign-section-general',
    icon: IconSettings,
    Content: ScoreCampaignGeneralSection,
  },
  products: {
    labelKey: 'score-campaign-section-products',
    icon: IconBox,
    Content: ScoreCampaignProductsSection,
  },
  // Needs a saved campaign; rendered with its id below.
  automations: {
    labelKey: 'score-campaign-section-automations',
    icon: IconBolt,
    Content: null,
  },
};

// Shared by the create and edit sheets: one form, split into sections.
export const ScoreCampaignFormLayout = ({
  form,
  campaignId,
}: {
  form: UseFormReturn<LoyaltyScoreFormValues>;
  campaignId?: string;
}) => {
  const { active, setActive, withErrors } = useScoreCampaignSections(form);
  const { Content } = SECTIONS[active];

  return (
    <ScoreCampaignProvider campaignId={campaignId}>
      <SectionedSheetForm
        sections={SCORE_CAMPAIGN_SECTIONS.filter(
          (key) => key !== 'automations' || !!campaignId,
        ).map((key) => ({
          key,
          labelKey: SECTIONS[key].labelKey,
          icon: SECTIONS[key].icon,
          hasError: withErrors.has(key),
        }))}
        active={active}
        onSelect={setActive}
      >
        {Content ? (
          <Content form={form} />
        ) : (
          campaignId && (
            <ScoreCampaignAutomations form={form} campaignId={campaignId} />
          )
        )}
      </SectionedSheetForm>
    </ScoreCampaignProvider>
  );
};
