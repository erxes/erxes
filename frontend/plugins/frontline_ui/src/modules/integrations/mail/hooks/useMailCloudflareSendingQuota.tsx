import { useQuery } from '@apollo/client';
import { MAIL_CLOUDFLARE_SENDING_QUOTA_QUERY } from '../graphql/queries/mailCloudflareQueries';
import type { MailCloudflareSendingQuotaQuery } from '~/gql/graphql';

export type IMailCloudflareSendingQuota = NonNullable<
  MailCloudflareSendingQuotaQuery['mailCloudflareSendingQuota']
>;

export const useMailCloudflareSendingQuota = (skip: boolean) => {
  const { data, loading } = useQuery(MAIL_CLOUDFLARE_SENDING_QUOTA_QUERY, {
    skip,
    fetchPolicy: 'cache-and-network',
  });

  return { quota: data?.mailCloudflareSendingQuota ?? null, loading };
};
