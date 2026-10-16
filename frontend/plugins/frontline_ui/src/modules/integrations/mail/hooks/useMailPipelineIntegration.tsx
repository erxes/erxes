import { useMutation, useQuery } from '@apollo/client';
import type { ApolloError } from '@apollo/client';
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
import type { MailPipelineIntegrationQuery } from '~/gql/graphql';

const AWAITING_POLL_INTERVAL_MS = 10000;

export type IMailPipelineIntegration = NonNullable<
  MailPipelineIntegrationQuery['mailPipelineIntegration']
>;

export type IMailForwardVerification = NonNullable<
  IMailPipelineIntegration['forwardVerification']
>;

export interface IMailPipelineSettings {
  senderName?: string;
  forwardFrom?: string;
  statusId?: string;
}

const refetchIntegration = (pipelineId: string) => [
  { query: MAIL_PIPELINE_INTEGRATION_QUERY, variables: { pipelineId } },
];

export const isWaitingForForwardVerification = (
  integration: IMailPipelineIntegration | null,
) =>
  Boolean(
    integration?.awaitingForwardVerification &&
      !integration.forwardVerification,
  );

export const useMailPipelineIntegration = (pipelineId?: string) => {
  const { data, loading, error, startPolling, stopPolling } = useQuery(
    MAIL_PIPELINE_INTEGRATION_QUERY,
    {
      variables: pipelineId ? { pipelineId } : undefined,
      skip: !pipelineId,
      fetchPolicy: 'cache-and-network',
    },
  );

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

const usePipelineMailMutationOptions = (
  successKey: string,
  fallback: string,
) => {
  const { t } = useTranslation('frontline');

  return (pipelineId: string) => ({
    refetchQueries: refetchIntegration(pipelineId),
    awaitRefetchQueries: true,
    onCompleted: () => toast({ title: t(successKey, fallback) }),
    onError: (mutationError: ApolloError) =>
      toast({ title: mutationError.message, variant: 'destructive' }),
  });
};

export const useMailPipelineConnect = () => {
  const [mutate, { loading }] = useMutation(MAIL_PIPELINE_CONNECT_MUTATION);
  const mutationOptions = usePipelineMailMutationOptions(
    'pipeline-mail-connected',
    'This pipeline now has its own mail address',
  );

  const connectPipelineMail = (
    pipelineId: string,
    settings?: IMailPipelineSettings,
  ) =>
    mutate({
      ...mutationOptions(pipelineId),
      variables: { pipelineId, ...settings },
    });

  return { connectPipelineMail, loading };
};

export const useMailPipelineUpdate = () => {
  const [mutate, { loading }] = useMutation(MAIL_PIPELINE_UPDATE_MUTATION);
  const mutationOptions = usePipelineMailMutationOptions(
    'pipeline-mail-updated',
    'Mail settings saved',
  );

  const updatePipelineMail = (
    pipelineId: string,
    settings?: IMailPipelineSettings,
  ) =>
    mutate({
      ...mutationOptions(pipelineId),
      variables: { pipelineId, ...settings },
    });

  return { updatePipelineMail, loading };
};

export const useMailPipelineForwardVerified = () => {
  const [mutate, { loading }] = useMutation(
    MAIL_PIPELINE_FORWARD_VERIFIED_MUTATION,
  );
  const mutationOptions = usePipelineMailMutationOptions(
    'pipeline-mail-forward-verified',
    'Forwarding is set up, incoming mail now opens tickets',
  );

  const markForwardVerified = (pipelineId: string) =>
    mutate({
      ...mutationOptions(pipelineId),
      variables: { pipelineId },
    });

  return { markForwardVerified, loading };
};

export const useMailPipelineDisconnect = () => {
  const [mutate, { loading }] = useMutation(MAIL_PIPELINE_DISCONNECT_MUTATION);
  const mutationOptions = usePipelineMailMutationOptions(
    'pipeline-mail-disconnected',
    'This pipeline no longer receives mail',
  );

  const disconnectPipelineMail = (pipelineId: string) =>
    mutate({
      ...mutationOptions(pipelineId),
      variables: { pipelineId },
    });

  return { disconnectPipelineMail, loading };
};
