import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { GET_CUSTOMERS_SHARING_EMAIL } from '../graphql/queries/getCustomersSharingEmail';

export type TCustomerSharingEmail = {
  _id: string;
  name: string;
};

const sameEmail = (a?: string | null, b?: string | null) =>
  !!a && !!b && a.trim().toLowerCase() === b.trim().toLowerCase();

/** Other customers holding exactly this email, as a primary or listed one. */
export const useCustomersSharingEmail = (
  email?: string,
  customerId?: string,
): { others: TCustomerSharingEmail[]; loading: boolean } => {
  const { data, loading } = useQuery(GET_CUSTOMERS_SHARING_EMAIL, {
    variables: { searchValue: email },
    skip: !email || !customerId,
    fetchPolicy: 'cache-and-network',
  });

  const others = useMemo(
    () =>
      (data?.customers?.list ?? [])
        .filter(
          (customer): customer is NonNullable<typeof customer> & {
            _id: string;
          } =>
            !!customer?._id &&
            customer._id !== customerId &&
            (sameEmail(customer.primaryEmail, email) ||
              (customer.emails ?? []).some((item) => sameEmail(item, email))),
        )
        .map((customer) => ({
          _id: customer._id,
          name:
            [customer.firstName, customer.lastName]
              .filter(Boolean)
              .join(' ')
              .trim() || 'Unnamed customer',
        })),
    [data, email, customerId],
  );

  return { others, loading };
};
