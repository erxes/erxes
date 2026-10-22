import { gql, useQuery, type QueryHookOptions } from '@apollo/client';
import type { ICustomerDetail } from 'ui-modules';
import { useBuiltinModelDocument } from '@/data-models/useBuiltinModelFields';
import { CUSTOMER_RECORD_TABLE_FIELDS } from '../graphql/queries/getCustomers';

const CONTACTS_CUSTOMER_DETAIL = gql`
  query contactsCustomerDetailWithModelFields($_id: String!) {
    customerDetail(_id: $_id) {
      ${CUSTOMER_RECORD_TABLE_FIELDS}
      email
      phone
      sessionCount
      companies { _id avatar primaryName }
    }
  }
`;
const CUSTOMER_DETAIL_PATHS = [['customerDetail']];
export const useCustomerDetailData = (
  options: QueryHookOptions<{ customerDetail: ICustomerDetail }>,
): {
  customerDetail: ICustomerDetail | undefined;
  loading: boolean;
  error: Error | undefined;
} => {
  const metadata = useBuiltinModelDocument(
    CONTACTS_CUSTOMER_DETAIL,
    'customer',
    CUSTOMER_DETAIL_PATHS,
  );
  const { data, loading, error } = useQuery<{
    customerDetail: ICustomerDetail;
  }>(metadata.document, { ...options, skip: options.skip || metadata.loading });
  return {
    customerDetail: data?.customerDetail,
    loading: loading || metadata.loading,
    error: error ?? metadata.error,
  };
};
