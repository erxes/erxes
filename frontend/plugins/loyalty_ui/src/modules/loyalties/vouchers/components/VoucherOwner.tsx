import { useQuery } from '@apollo/client';
import { MembersInline } from 'ui-modules';
import { CompaniesInline } from 'ui-modules/modules/contacts/components/CompaniesInline';
import { CustomersInline } from 'ui-modules/modules/contacts/components/CustomersInline';
import { VOUCHER_CP_USER_QUERY } from '@/loyalties/vouchers/graphql/queries/queries';

// Older vouchers may still sit on a client portal user: show its customer.
const CpUserOwner = ({ ownerId }: { ownerId: string }) => {
  const { data, loading } = useQuery(VOUCHER_CP_USER_QUERY, {
    variables: { _id: ownerId },
    skip: !ownerId,
  });

  const cpUser = data?.getClientPortalUser;

  if (cpUser?.erxesCustomerId) {
    return (
      <CustomersInline customerIds={[cpUser.erxesCustomerId]} placeholder="—" />
    );
  }

  if (loading) return <>—</>;

  const name =
    [cpUser?.firstName, cpUser?.lastName].filter(Boolean).join(' ') ||
    cpUser?.email ||
    cpUser?.phone;

  return <>{name || '—'}</>;
};

/** Whoever holds the voucher, by the kind of owner it is. */
export const VoucherOwner = ({
  ownerId,
  ownerType,
}: {
  ownerId?: string;
  ownerType?: string;
}) => {
  if (!ownerId) return <>—</>;
  if (ownerType === 'company')
    return <CompaniesInline companyIds={[ownerId]} placeholder="—" />;
  if (ownerType === 'user')
    return <MembersInline memberIds={[ownerId]} placeholder="—" />;
  if (ownerType === 'cpUser') return <CpUserOwner ownerId={ownerId} />;
  return <CustomersInline customerIds={[ownerId]} placeholder="—" />;
};
