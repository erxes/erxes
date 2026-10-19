import { useQuery } from '@apollo/client';
import { MAIL_SENDING_READINESS_QUERY } from '../graphql/queries/mailSendingQueries';
import type { MailSendingReadinessQuery } from '~/gql/graphql';

export type IMailSendingReadiness = NonNullable<
  MailSendingReadinessQuery['mailSendingReadiness']
>;

export const useMailSendingReadiness = () => {
  const { data, loading } = useQuery(MAIL_SENDING_READINESS_QUERY, {
    fetchPolicy: 'cache-and-network',
  });

  return { readiness: data?.mailSendingReadiness ?? null, loading };
};
