import { DocumentNode, useMutation, useQuery } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { MAIL_PIPELINE_INTEGRATION_QUERY } from '../graphql/queries/mailPipelineQueries';
import {
  MAIL_PIPELINE_CONNECT_MUTATION,
  MAIL_PIPELINE_DISCONNECT_MUTATION,
  MAIL_PIPELINE_UPDATE_MUTATION,
} from '../graphql/mutations/mailPipelineMutations';

export interface IMailPipelineIntegration {
  _id: string;
  pipelineId: string;
  name?: string | null;
  address: string;
  senderName?: string | null;
  healthStatus?: string | null;
  error?: string | null;
}

export interface IMailPipelineSettings {
  senderName?: string;
}

const refetchIntegration = (pipelineId: string) => [
  { query: MAIL_PIPELINE_INTEGRATION_QUERY, variables: { pipelineId } },
];

export const useMailPipelineIntegration = (pipelineId?: string) => {
  const { data, loading, error } = useQuery<{
    mailPipelineIntegration: IMailPipelineIntegration | null;
  }>(MAIL_PIPELINE_INTEGRATION_QUERY, {
    variables: { pipelineId },
    skip: !pipelineId,
    fetchPolicy: 'cache-and-network',
  });

  return {
    integration: data?.mailPipelineIntegration ?? null,
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

export const useMailPipelineDisconnect = () => {
  const { run, loading } = useToastedMutation(
    MAIL_PIPELINE_DISCONNECT_MUTATION,
    'pipeline-mail-disconnected',
    'This pipeline no longer receives mail',
  );

  return { disconnectPipelineMail: run, loading };
};
