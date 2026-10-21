import { useDealsContext } from '@/deals/context/DealContext';
import { ContactsRelationField } from 'ui-modules';

// The deal's customers or companies, kept on the deal itself.
export const DealContactsField = ({
  dealId,
  kind,
  label,
  value,
}: {
  dealId: string;
  kind: 'customer' | 'company';
  label: string;
  value: string[];
}) => {
  const { editDeals } = useDealsContext();
  const field = kind === 'customer' ? 'customerIds' : 'companyIds';

  return (
    <ContactsRelationField
      kind={kind}
      variant="chip"
      label={label}
      value={value}
      scope={`deal-detail.${kind}`}
      onValueChange={(ids) =>
        editDeals({
          variables: { _id: dealId, [field]: ids },
          // Contacts' deal lists change with them.
          update: (cache) =>
            cache.evict({ id: 'ROOT_QUERY', fieldName: 'deals' }),
        })
      }
    />
  );
};
