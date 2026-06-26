import { gql, useQuery } from '@apollo/client';
import { CustomersInline } from 'ui-modules/modules/contacts/components/CustomersInline';
import { CompaniesInline } from 'ui-modules/modules/contacts/components/CompaniesInline';
import { MembersInline } from 'ui-modules';

const CP_USER_QUERY = gql`
  query LoyaltyOwnerCpUser($_id: String!) {
    getClientPortalUser(_id: $_id) {
      _id
      firstName
      lastName
      email
      phone
      erxesCustomerId
    }
  }
`;

const CpUserOwner = ({ ownerId }: { ownerId: string }) => {
  const { data, loading } = useQuery(CP_USER_QUERY, {
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

export const LoyaltyOwner = ({
  ownerId,
  ownerType,
}: {
  ownerId?: string;
  ownerType?: string;
}) => {
  if (!ownerId) return <></>;
  if (ownerType === 'company')
    return <CompaniesInline companyIds={[ownerId]} placeholder="" />;
  if (ownerType === 'user')
    return <MembersInline memberIds={[ownerId]} placeholder="" />;
  if (ownerType === 'cpUser') return <CpUserOwner ownerId={ownerId} />;
  return <CustomersInline customerIds={[ownerId]} placeholder="" />;
};
