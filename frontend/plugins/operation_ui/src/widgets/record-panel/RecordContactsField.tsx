import { ContactsRelationField } from 'ui-modules';

// A task's / triage's one customer or company: kept on the record itself
// and saved with its own update mutation.
export const RecordContactsField = ({
  kind,
  value,
  scope,
  onValueChange,
}: {
  kind: 'customer' | 'company';
  value?: string | null;
  scope: string;
  onValueChange: (id: string | null) => void;
}) => (
  <ContactsRelationField
    kind={kind}
    value={value}
    scope={scope}
    onValueChange={onValueChange}
  />
);
