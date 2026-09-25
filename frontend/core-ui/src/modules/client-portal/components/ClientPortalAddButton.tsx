import { SettingsAddRowButton } from '@/settings/components/SettingsAddRowButton';
import { addingClientPortalAtom } from '@/client-portal/states/addingClientPortalAtom';
import { ClientPortalHotKeyScope } from '@/client-portal/types/clientPortal';
import { SettingsHotKeyScope } from '@/types/SettingsHotKeyScope';
import { useAtom } from 'jotai';

export const ClientPortalAddButton = () => {
  const [addingClientPortal, setAddingClientPortal] = useAtom(
    addingClientPortalAtom,
  );

  return (
    <SettingsAddRowButton
      label="Create client portal"
      disabled={addingClientPortal}
      onAdd={() => setAddingClientPortal(true)}
      pageScope={ClientPortalHotKeyScope.ClientPortalSettingsPage}
      formRowScope={SettingsHotKeyScope.AddRowForm}
    />
  );
};
