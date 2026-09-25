import { SettingsInlineNameField } from '@/settings/components/SettingsInlineNameField';
import { SettingsRecordTableAddRow } from '@/settings/components/SettingsRecordTableAddRow';
import { useCreateClientPortal } from '@/client-portal/hooks/useCreateClientPortal';
import { addingClientPortalAtom } from '@/client-portal/states/addingClientPortalAtom';
import { SettingsHotKeyScope } from '@/types/SettingsHotKeyScope';
import { usePreviousHotkeyScope, useToast } from 'erxes-ui';
import { useSetAtom } from 'jotai';

export const ClientPortalAddRow = () => {
  const { toast } = useToast();
  const { goBackToPreviousHotkeyScope } = usePreviousHotkeyScope();
  const setAddingClientPortal = useSetAtom(addingClientPortalAtom);
  const { clientPortalAdd } = useCreateClientPortal();

  const handleSave = (name: string) => {
    setAddingClientPortal(false);
    clientPortalAdd({
      variables: { name },
      refetchQueries: ['getClientPortals'],
      onCompleted: () => {
        toast({
          title: 'Success!',
          variant: 'success',
          description: 'Client portal created successfully',
        });
      },
    });
    goBackToPreviousHotkeyScope();
  };

  return (
    <SettingsRecordTableAddRow>
      <SettingsInlineNameField
        name=""
        placeholder="Client portal name"
        scope={SettingsHotKeyScope.AddRowInput}
        defaultOpen
        isForm
        onSave={handleSave}
        onEscape={() => {
          setAddingClientPortal(false);
          goBackToPreviousHotkeyScope();
        }}
      />
    </SettingsRecordTableAddRow>
  );
};
