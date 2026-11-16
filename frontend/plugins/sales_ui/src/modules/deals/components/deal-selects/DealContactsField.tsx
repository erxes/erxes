import { evictContactDealLists } from '@/deals/utils/dealCache';
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
          update: (cache) => evictContactDealLists(cache),
        })
      }
    />
  );
};
