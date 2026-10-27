import { useUpdateTriage } from '@/triage/hooks/useUpdateTriage';
import { ContactsRelationField } from 'ui-modules';

// The triage's one customer or company, kept on the triage itself.
export const TriageContactsField = ({
  triageId,
  kind,
  label,
  value,
}: {
  triageId: string;
  kind: 'customer' | 'company';
  label: string;
  value?: string | null;
}) => {
  const { updateTriage } = useUpdateTriage();
  const field = kind === 'customer' ? 'customerId' : 'companyId';

  return (
    <ContactsRelationField
      kind={kind}
      variant="chip"
      label={label}
      value={value}
      scope={`triage-detail.${kind}`}
      onValueChange={(id) =>
        updateTriage({
          variables: { _id: triageId, input: { [field]: id } },
          // Contacts' triage lists change with them.
          update: (cache) => {
            cache.evict({
              id: 'ROOT_QUERY',
              fieldName: 'operationGetTriageList',
            });
          },
        })
      }
    />
  );
};
