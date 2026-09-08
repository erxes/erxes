import { ReferenceSettingsPage } from '@/settings/components/ReferenceSettingsPage';
import { referenceConfigs } from '@/settings/constants/referenceConfigs';

export const SeniorityRulesPage = () => (
  <ReferenceSettingsPage config={referenceConfigs.seniorityRules} />
);
