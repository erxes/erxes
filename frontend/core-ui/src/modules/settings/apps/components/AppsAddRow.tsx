import { SettingsInlineNameField } from '@/settings/components/SettingsInlineNameField';
import { SettingsRecordTableAddRow } from '@/settings/components/SettingsRecordTableAddRow';
import { useAppsAdd } from '@/settings/apps/hooks/useAppsAdd';
import { addingAppAtom } from '@/settings/apps/state';
import { SettingsHotKeyScope } from '@/types/SettingsHotKeyScope';
import { usePreviousHotkeyScope, useToast } from 'erxes-ui';
import { useSetAtom } from 'jotai';

export const AppsAddRow = () => {
  const { toast } = useToast();
  const { goBackToPreviousHotkeyScope } = usePreviousHotkeyScope();
  const setAddingApp = useSetAtom(addingAppAtom);
  const { appsAdd } = useAppsAdd();

  const handleSave = (name: string) => {
    setAddingApp(false);
    appsAdd({
      variables: { name },
      optimisticResponse: {
        appsAdd: {
          __typename: 'App',
          _id: `new-app-${Date.now()}`,
          name,
          token: '',
          status: 'active',
          lastUsedAt: null,
          createdAt: new Date().toISOString(),
        },
      },
      onCompleted: () => {
        toast({
          variant: 'success',
          title: 'App created successfully',
        });
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
    goBackToPreviousHotkeyScope();
  };

  return (
    <SettingsRecordTableAddRow>
      <SettingsInlineNameField
        name=""
        placeholder="App Name"
        scope={SettingsHotKeyScope.AddRowInput}
        defaultOpen
        isForm
        onSave={handleSave}
        onEscape={() => {
          setAddingApp(false);
          goBackToPreviousHotkeyScope();
        }}
      />
    </SettingsRecordTableAddRow>
  );
};
