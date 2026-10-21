import { compactList } from '@/operation/utils/cursorList';
import { ContactsRelationField } from 'ui-modules';

// A task's / triage's / project's customers or companies: kept on the
// record itself and saved with its own update mutation.
export const RecordContactsField = ({
  kind,
  value,
  scope,
  onValueChange,
}: {
  kind: 'customer' | 'company';
  value?: (string | null)[] | null;
  scope: string;
  onValueChange: (ids: string[]) => void;
}) => (
  <ContactsRelationField
    kind={kind}
    value={compactList(value)}
    scope={scope}
    onValueChange={onValueChange}
  />
);
