import { useQuery } from '@apollo/client';
import { CALL_CUSTOMER_DETAIL } from '@/integrations/call/graphql/queries/callConfigQueries';

export const useCustomerDetail = ({ phoneNumber }: { phoneNumber: string }) => {
  const { data, loading } = useQuery(CALL_CUSTOMER_DETAIL, {
    variables: { customerPhone: phoneNumber },
    skip: !phoneNumber,
  });

  return {
    customerDetail: data?.callsCustomerDetail,
    loading,
  };
};
