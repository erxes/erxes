import { useLazyQuery, useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import {
  MAIL_CLOUDFLARE_CONNECTION_QUERY,
  MAIL_CLOUDFLARE_SENDING_QUOTA_QUERY,
  MAIL_CLOUDFLARE_ZONES_QUERY,
} from '../graphql/queries/mailCloudflareQueries';
import {
  MAIL_CLOUDFLARE_CONNECT_MUTATION,
  MAIL_CLOUDFLARE_DISCONNECT_MUTATION,
  MAIL_CLOUDFLARE_PROVISION_MUTATION,
} from '../graphql/mutations/mailCloudflareMutations';

export interface IMailCloudflareZone {
  id: string;
  name: string;
  status: string;
  accountName?: string | null;
  eligible?: boolean | null;
  reason?: string | null;
}

interface IZonesResponse {
  mailCloudflareZones: IMailCloudflareZone[];
}

const onError = (error: { message: string }) =>
  toast({ title: error.message, variant: 'destructive' });

export const useMailCloudflareSetup = () => {
  const [loadZones, { data: zoneData, loading: loadingZones }] =
    useLazyQuery<IZonesResponse>(MAIL_CLOUDFLARE_ZONES_QUERY, {
      fetchPolicy: 'no-cache',
      onError,
    });

  const [connect, { loading: connecting }] = useMutation(
    MAIL_CLOUDFLARE_CONNECT_MUTATION,
    {
      refetchQueries: [
        MAIL_CLOUDFLARE_CONNECTION_QUERY,
        MAIL_CLOUDFLARE_SENDING_QUOTA_QUERY,
      ],
      awaitRefetchQueries: true,
      onError,
    },
  );

  const [provision, { loading: provisioning }] = useMutation(
    MAIL_CLOUDFLARE_PROVISION_MUTATION,
    {
      refetchQueries: [
        MAIL_CLOUDFLARE_CONNECTION_QUERY,
        MAIL_CLOUDFLARE_SENDING_QUOTA_QUERY,
      ],
      awaitRefetchQueries: true,
      onError,
    },
  );

  const [disconnect, { loading: disconnecting }] = useMutation(
    MAIL_CLOUDFLARE_DISCONNECT_MUTATION,
    {
      refetchQueries: [MAIL_CLOUDFLARE_CONNECTION_QUERY],
      awaitRefetchQueries: true,
      onError,
    },
  );

  return {
    loadZones,
    zones: zoneData?.mailCloudflareZones ?? [],
    loadingZones,
    connect,
    connecting,
    provision,
    provisioning,
    disconnect,
    disconnecting,
  };
};
