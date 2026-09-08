import { useQuery } from '@apollo/client';
import { MAIL_CLOUDFLARE_CONNECTION_QUERY } from '../graphql/queries/mailCloudflareQueries';

export type TMailProvisionState = 'pending' | 'ok' | 'failed';

export interface IMailProvisionStep {
  name: string;
  state: TMailProvisionState;
  error?: string | null;
}

export interface IMailCloudflareConnection {
  zoneName: string;
  accountName?: string | null;
  workerOrigin?: string | null;
  scriptVersion?: string | null;
  currentScriptVersion?: string | null;
  sendingEnabled?: boolean | null;
  status: string;
  error?: string | null;
  connectedAt?: string | null;
  steps?: IMailProvisionStep[] | null;
}

interface IMailCloudflareConnectionResponse {
  mailCloudflareConnection: IMailCloudflareConnection | null;
}

export const useMailCloudflareConnection = () => {
  const { data, loading, refetch } =
    useQuery<IMailCloudflareConnectionResponse>(
      MAIL_CLOUDFLARE_CONNECTION_QUERY,
      { fetchPolicy: 'cache-and-network' },
    );

  return {
    connection: data?.mailCloudflareConnection ?? null,
    loading,
    refetch,
  };
};
