import CustomerSidebar from '../components/CustomerSidebarList';
import { useQuery, gql } from '@apollo/client';
import { queries } from '../graphql';

const CustomerSection = ({ id }: { id: string }) => {
  const { data, loading, error } = useQuery(
    gql(queries.msdCustomerRelations),
    {
      variables: { customerId: id },
      skip: !id,
    }
  );

  if (error) {
    return (
      <div className="text-sm text-destructive p-4">
        Failed to load customer relations
      </div>
    );
  }

  return (
    <CustomerSidebar
      loading={loading}
      relations={data?.msdCustomerRelations || []}
    />
  );
};

export default CustomerSection;