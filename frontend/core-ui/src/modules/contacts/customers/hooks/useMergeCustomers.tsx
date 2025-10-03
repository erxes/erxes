import { OperationVariables, useMutation } from '@apollo/client';
import { CUSTOMERS_MERGE_MUTATION } from '../graphql/mutations/mergeCustomers';
import { ICustomer } from 'ui-modules';
import { useRecordTableCursor } from 'erxes-ui';
import { useIsCustomerLeadSessionKey } from './useCustomerLeadSessionKey';
interface ICustomerMergeData {
  mergeCustomers: ICustomer[];
}

export const useMergeCustomers = () => {
  const { sessionKey } = useIsCustomerLeadSessionKey();
  const { setCursor } = useRecordTableCursor({
    sessionKey,
  });
  const [_mergeCustomers, { loading, error }] = useMutation<ICustomerMergeData>(
    CUSTOMERS_MERGE_MUTATION,
  );

  const mergeCustomers = (options?: OperationVariables) => {
    return _mergeCustomers({
      ...options,
      onCompleted: (data) => {
        options?.onCompleted?.(data);
        setTimeout(() => {
          setCursor('');
        }, 100);
      },
    });
  };

  return { mergeCustomers, loading, error };
};
