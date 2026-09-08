import { ReferenceSettingsPage } from '@/settings/components/ReferenceSettingsPage';
import { referenceConfigs } from '@/settings/constants/referenceConfigs';

export const ContributionProfilesPage = () => (
  <ReferenceSettingsPage config={referenceConfigs.contributionProfiles} />
);
