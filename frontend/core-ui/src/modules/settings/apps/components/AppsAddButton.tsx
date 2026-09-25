import { SettingsAddRowButton } from '@/settings/components/SettingsAddRowButton';
import { addingAppAtom } from '@/settings/apps/state';
import { SettingsHotKeyScope } from '@/types/SettingsHotKeyScope';
import { useAtom } from 'jotai';

export const AppsAddButton = () => {
  const [addingApp, setAddingApp] = useAtom(addingAppAtom);

  return (
    <SettingsAddRowButton
      label="Create App"
      disabled={addingApp}
      onAdd={() => setAddingApp(true)}
      pageScope={SettingsHotKeyScope.AppTokensPage}
      formRowScope={SettingsHotKeyScope.AddRowForm}
    />
  );
};
