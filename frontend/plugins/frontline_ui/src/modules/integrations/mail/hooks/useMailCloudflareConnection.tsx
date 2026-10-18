import { useQuery } from '@apollo/client';
import { MAIL_CLOUDFLARE_CONNECTION_QUERY } from '../graphql/queries/mailCloudflareQueries';
import type { MailCloudflareConnectionQuery } from '~/gql/graphql';

export type TMailProvisionState = 'pending' | 'ok' | 'failed';

export type IMailCloudflareConnection = NonNullable<
  MailCloudflareConnectionQuery['mailCloudflareConnection']
>;

export type IMailProvisionStep = NonNullable<
  NonNullable<IMailCloudflareConnection['steps']>[number]
>;

export const useMailCloudflareConnection = () => {
  const { data, loading, refetch } = useQuery(
    MAIL_CLOUDFLARE_CONNECTION_QUERY,
    { fetchPolicy: 'cache-and-network' },
  );

  return {
    connection: data?.mailCloudflareConnection ?? null,
    loading,
    refetch,
  };
};
