import { PageContainer } from 'erxes-ui';
import { CmsSidebar } from '../shared/CmsSidebar';
import { SettingsForm } from './components/SettingsForm';
import { SettingsHeader } from './components/SettingsHeader';
import { useSettingsForm } from './hooks/useSettingsForm';

export const Settings = () => {
  const {
    canSave,
    clientPortals,
    cms,
    isDeleting,
    isSaving,
    settings,
    updateSetting,
    handleDelete,
    handleSave,
  } = useSettingsForm();

  return (
    <PageContainer className="flex-row">
      <CmsSidebar />
      <div className="flex min-w-0 flex-auto flex-col overflow-hidden">
        <SettingsHeader
          disabled={!canSave}
          saving={isSaving}
          onSave={handleSave}
        />
        <div className="min-w-0 flex-1 overflow-auto bg-muted/20">
          <SettingsForm
            cms={cms}
            isDeleting={isDeleting}
            settings={settings}
            clientPortals={clientPortals}
            updateSetting={updateSetting}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </PageContainer>
  );
};

export default Settings;
