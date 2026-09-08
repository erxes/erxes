import { ReferenceSettingsPage } from '@/settings/components/ReferenceSettingsPage';
import { referenceConfigs } from '@/settings/constants/referenceConfigs';

export const SkillsPage = () => (
  <ReferenceSettingsPage config={referenceConfigs.skills} />
);
