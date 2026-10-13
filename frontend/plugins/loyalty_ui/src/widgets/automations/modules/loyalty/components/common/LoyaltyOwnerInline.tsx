import { CompaniesInline, CustomersInline, MembersInline } from 'ui-modules';

// An automation's loyalty owner by its type; customers when the type is unknown.
export const LoyaltyOwnerInline = ({
  ownerId,
  ownerType,
}: {
  ownerId: string;
  ownerType?: string;
}) => {
  if (ownerType === 'company') {
    return <CompaniesInline companyIds={[ownerId]} placeholder="—" />;
  }

  if (ownerType === 'user') {
    return <MembersInline memberIds={[ownerId]} placeholder="—" />;
  }

  return <CustomersInline customerIds={[ownerId]} placeholder="—" />;
};
