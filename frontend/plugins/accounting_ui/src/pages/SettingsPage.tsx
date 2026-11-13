import { PageContainer } from 'erxes-ui';
import { MainSettingsForm } from '@/settings/components/MainSettingsForm';

export const SettingsPage = () => {
  return (
    <PageContainer>
      <div className="flex-auto min-h-0 overflow-y-auto">
        <MainSettingsForm />
      </div>
    </PageContainer>
  );
};
