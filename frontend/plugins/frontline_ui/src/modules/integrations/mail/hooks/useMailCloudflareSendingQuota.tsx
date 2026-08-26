import { useQuery } from '@apollo/client';
import { MAIL_CLOUDFLARE_SENDING_QUOTA_QUERY } from '../graphql/queries/mailCloudflareQueries';

export interface IMailCloudflareSendingQuota {
  value: number;
  unit: string;
}

interface IMailCloudflareSendingQuotaResponse {
  mailCloudflareSendingQuota: IMailCloudflareSendingQuota | null;
}

export const useMailCloudflareSendingQuota = (skip: boolean) => {
  const { data, loading } = useQuery<IMailCloudflareSendingQuotaResponse>(
    MAIL_CLOUDFLARE_SENDING_QUOTA_QUERY,
    { skip, fetchPolicy: 'cache-and-network' },
  );

  return { quota: data?.mailCloudflareSendingQuota ?? null, loading };
};
