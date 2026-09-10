import { DocumentNode, useMutation, useQuery } from '@apollo/client';
import { useEffect } from 'react';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { MAIL_PIPELINE_INTEGRATION_QUERY } from '../graphql/queries/mailPipelineQueries';
import {
  MAIL_PIPELINE_CONNECT_MUTATION,
  MAIL_PIPELINE_DISCONNECT_MUTATION,
  MAIL_PIPELINE_FORWARD_VERIFIED_MUTATION,
  MAIL_PIPELINE_UPDATE_MUTATION,
} from '../graphql/mutations/mailPipelineMutations';

const AWAITING_POLL_INTERVAL_MS = 10000;

export interface IMailForwardVerification {
  from?: string | null;
  subject?: string | null;
  code?: string | null;
  link?: string | null;
  excerpt?: string | null;
  receivedAt?: string | null;
}

export interface IMailPipelineIntegration {
  _id: string;
  pipelineId: string;
  name?: string | null;
  address: string;
  senderName?: string | null;
  forwardFrom?: string | null;
  forwardPendingAt?: string | null;
  awaitingForwardVerification?: boolean | null;
  forwardVerification?: IMailForwardVerification | null;
  healthStatus?: string | null;
  error?: string | null;
}

export interface IMailPipelineSettings {
  senderName?: string;
  forwardFrom?: string;
}

const refetchIntegration = (pipelineId: string) => [
  { query: MAIL_PIPELINE_INTEGRATION_QUERY, variables: { pipelineId } },
];

export const isWaitingForForwardVerification = (
  integration: IMailPipelineIntegration | null,
) =>
  Boolean(
    integration?.awaitingForwardVerification && !integration.forwardVerification,
  );

export const useMailPipelineIntegration = (pipelineId?: string) => {
  const { data, loading, error, startPolling, stopPolling } = useQuery<{
    mailPipelineIntegration: IMailPipelineIntegration | null;
  }>(MAIL_PIPELINE_INTEGRATION_QUERY, {
    variables: { pipelineId },
    skip: !pipelineId,
    fetchPolicy: 'cache-and-network',
  });

  const integration = data?.mailPipelineIntegration ?? null;
  const waiting = isWaitingForForwardVerification(integration);

  useEffect(() => {
    if (waiting) {
      startPolling(AWAITING_POLL_INTERVAL_MS);
      return () => stopPolling();
    }

    stopPolling();
  }, [waiting, startPolling, stopPolling]);

  return {
    integration,
    waitingForForwardVerification: waiting,
    loading,
    error,
  };
};

const useToastedMutation = (
  document: DocumentNode,
  successKey: string,
  fallback: string,
) => {
  const { t } = useTranslation('frontline');
  const [mutate, { loading }] = useMutation(document);

  const run = (pipelineId: string, settings?: IMailPipelineSettings) =>
    mutate({
      variables: { pipelineId, ...settings },
      refetchQueries: refetchIntegration(pipelineId),
      awaitRefetchQueries: true,
      onCompleted: () => toast({ title: t(successKey, fallback) }),
      onError: (mutationError) =>
        toast({ title: mutationError.message, variant: 'destructive' }),
    });

  return { run, loading };
};

export const useMailPipelineConnect = () => {
  const { run, loading } = useToastedMutation(
    MAIL_PIPELINE_CONNECT_MUTATION,
    'pipeline-mail-connected',
    'This pipeline now has its own mail address',
  );

  return { connectPipelineMail: run, loading };
};

export const useMailPipelineUpdate = () => {
  const { run, loading } = useToastedMutation(
    MAIL_PIPELINE_UPDATE_MUTATION,
    'pipeline-mail-updated',
    'Mail settings saved',
  );

  return { updatePipelineMail: run, loading };
};

export const useMailPipelineForwardVerified = () => {
  const { run, loading } = useToastedMutation(
    MAIL_PIPELINE_FORWARD_VERIFIED_MUTATION,
    'pipeline-mail-forward-verified',
    'Forwarding is set up, incoming mail now opens tickets',
  );

  return { markForwardVerified: run, loading };
};

export const useMailPipelineDisconnect = () => {
  const { run, loading } = useToastedMutation(
    MAIL_PIPELINE_DISCONNECT_MUTATION,
    'pipeline-mail-disconnected',
    'This pipeline no longer receives mail',
  );

  return { disconnectPipelineMail: run, loading };
};
