import { PageContainer } from 'erxes-ui';
import { CmsSidebar } from '../shared/CmsSidebar';
import { SettingsForm } from './components/SettingsForm';
import { SettingsHeader } from './components/SettingsHeader';
import { useSettingsForm } from './hooks/useSettingsForm';

export const Settings = () => {
  const {
    canSave,
    clientPortals,
    isSaving,
    settings,
    updateSetting,
    handleSave,
  } = useSettingsForm();

  return (
    <PageContainer>
      <SettingsHeader
        disabled={!canSave}
        saving={isSaving}
        onSave={handleSave}
      />

      <div className="flex overflow-hidden flex-auto">
        <CmsSidebar />

        <div className="min-w-0 flex-1 overflow-auto bg-muted/20">
          <SettingsForm
            settings={settings}
            clientPortals={clientPortals}
            updateSetting={updateSetting}
          />
        </div>
      </div>
    </PageContainer>
  );
};

export default Settings;
