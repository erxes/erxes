import { useQuery } from '@apollo/client';
import { MAIL_SENDING_READINESS_QUERY } from '../graphql/queries/mailSendingQueries';

export interface IMailSendingReadiness {
  ready: boolean;
  cloudflare: {
    ready: boolean;
    domain?: string | null;
    reason?: string | null;
  };
  platform: {
    ready: boolean;
    domain?: string | null;
  };
}

interface IMailSendingReadinessResponse {
  mailSendingReadiness: IMailSendingReadiness | null;
}

export const useMailSendingReadiness = () => {
  const { data, loading } = useQuery<IMailSendingReadinessResponse>(
    MAIL_SENDING_READINESS_QUERY,
    { fetchPolicy: 'cache-and-network' },
  );

  return { readiness: data?.mailSendingReadiness ?? null, loading };
};
