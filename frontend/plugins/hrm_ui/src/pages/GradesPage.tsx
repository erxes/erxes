import { ReferenceSettingsPage } from '@/settings/components/ReferenceSettingsPage';
import { referenceConfigs } from '@/settings/constants/referenceConfigs';

export const GradesPage = () => (
  <ReferenceSettingsPage config={referenceConfigs.grades} />
);
