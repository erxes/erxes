import { useDealsContext } from '@/deals/context/DealContext';
import { ContactsRelationField } from 'ui-modules';

// The deal's customer or company, kept on the deal itself.
export const DealContactsField = ({
  dealId,
  kind,
  label,
  value,
}: {
  dealId: string;
  kind: 'customer' | 'company';
  label: string;
  value?: string | null;
}) => {
  const { editDeals } = useDealsContext();
  const field = kind === 'customer' ? 'customerId' : 'companyId';

  return (
    <ContactsRelationField
      kind={kind}
      variant="chip"
      label={label}
      value={value}
      scope={`deal-detail.${kind}`}
      onValueChange={(id) =>
        editDeals({
          variables: { _id: dealId, [field]: id },
          // Contacts' deal lists change with them.
          update: (cache) =>
            cache.evict({ id: 'ROOT_QUERY', fieldName: 'deals' }),
        })
      }
    />
  );
};
