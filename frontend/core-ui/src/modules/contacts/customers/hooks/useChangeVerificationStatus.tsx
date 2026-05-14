import { useMutation } from '@apollo/client';
import { CUSTOMERS_CHANGE_VERIFICATION_STATUS } from '@/contacts/customers/graphql/mutations/changeVerificationStatus';

export const useChangeVerificationStatus = () => {
  const [_changeVerificationStatus, { loading }] = useMutation(
    CUSTOMERS_CHANGE_VERIFICATION_STATUS,
  );

  const changeVerificationStatus = async (
    customerIds: string[],
    status: string,
    options?: object,
  ) => {
    await _changeVerificationStatus({
      ...options,
      variables: { customerIds, type: 'email', status },
    });
  };

  return { changeVerificationStatus, loading };
};
