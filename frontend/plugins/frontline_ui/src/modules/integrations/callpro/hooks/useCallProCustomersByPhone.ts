import { QueryHookOptions, useQuery } from '@apollo/client';
import { isDefined } from 'erxes-ui';
import { ICustomer } from 'ui-modules';
import { CALL_PRO_CUSTOMERS_BY_PHONE } from '@/integrations/callpro/graphql/queries/callProQueries';
import { ICallProCustomerByPhone } from '@/integrations/callpro/types/callProTypes';
import type {
  CallProCustomersByPhoneQuery,
  CallProCustomersByPhoneQueryVariables,
} from '~/gql/graphql';

const toCustomer = ({
  _id,
  firstName,
  lastName,
  middleName,
  primaryEmail,
  primaryPhone,
  avatar,
}: ICallProCustomerByPhone): ICustomer[] =>
  _id
    ? [
        {
          _id,
          firstName: firstName ?? undefined,
          lastName: lastName ?? undefined,
          middleName: middleName ?? undefined,
          primaryEmail: primaryEmail ?? undefined,
          primaryPhone: primaryPhone ?? undefined,
          avatar: avatar ?? undefined,
        },
      ]
    : [];

export const useCallProCustomersByPhone = (
  options?: QueryHookOptions<
    CallProCustomersByPhoneQuery,
    CallProCustomersByPhoneQueryVariables
  >,
) => {
  const { data, loading, error } = useQuery(CALL_PRO_CUSTOMERS_BY_PHONE, {
    ...options,
    skip: !options?.variables?.phone || options?.skip,
  });

  const callProCustomersByPhone = data?.callProCustomersByPhone
    ?.filter(isDefined)
    .flatMap(toCustomer);

  return { callProCustomersByPhone, loading, error };
};
