import { useDealsContext } from '@/deals/context/DealContext';
import { ContactsRelationField } from 'ui-modules';

// The deal's customer or company, kept on the deal itself.
export const DealContactsField = ({
  dealId,
  kind,
  label,
  value,
  variant = 'chip',
}: {
  dealId: string;
  kind: 'customer' | 'company';
  label: string;
  value?: string | null;
  variant?: 'inline' | 'chip';
}) => {
  const { editDeals } = useDealsContext();
  const field = kind === 'customer' ? 'customerId' : 'companyId';

  return (
    <ContactsRelationField
      kind={kind}
      variant={variant}
      label={label}
      value={value}
      scope={`deal-detail.${kind}`}
      onValueChange={(id) =>
        editDeals({
          variables: { _id: dealId, [field]: id },
          // Contacts' deal lists change with them.
          update: (cache) =>
            cache.modify({
              id: 'ROOT_QUERY',
              fields: {
                deals: (existing, { DELETE, storeFieldName }) =>
                  /"(customerId|companyId)":/.test(storeFieldName)
                    ? DELETE
                    : existing,
              },
            }),
        })
      }
    />
  );
};
