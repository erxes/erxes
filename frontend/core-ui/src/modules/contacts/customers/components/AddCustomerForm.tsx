import { recordTableCursorAtomFamily, useQueryState } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { AddCustomerForm as AddCustomerFormBase } from 'ui-modules';
import { useIsCustomerLeadSessionKey } from '../hooks/useCustomerLeadSessionKey';

export function AddCustomerForm({
  onOpenChange,
}: {
  onOpenChange?: (open: boolean) => void;
}) {
  const { isLead, sessionKey } = useIsCustomerLeadSessionKey();
  const setCursor = useSetAtom(recordTableCursorAtomFamily(sessionKey));
  const [, setCustomerId] = useQueryState('contactId');

  return (
    <AddCustomerFormBase
      onOpenChange={(open: boolean) => onOpenChange?.(open)}
      state={isLead ? 'lead' : 'customer'}
      onSuccess={(id: string) => {
        setCursor('');
        setCustomerId(id);
      }}
    />
  );
}
