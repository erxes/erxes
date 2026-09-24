import {
  ApolloCache,
  ApolloError,
  useMutation,
  useQuery,
  useSubscription,
} from '@apollo/client';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  MAIL_CONVERSATION_DRAFTS_QUERY,
  MAIL_DRAFT_CHANGED_SUBSCRIPTION,
} from '../graphql/queries/mailQueries';
import {
  MAIL_DRAFT_APPROVE_MUTATION,
  MAIL_DRAFT_REMOVE_MUTATION,
  MAIL_DRAFT_SAVE_MUTATION,
} from '../graphql/mutations/mailMutations';
import {
  MailDeliveryOutcome,
  useDeliveryToast,
} from './useMailConversationDetail';

export type MailDraftStatus = 'pending' | 'sending' | 'sent';

export interface MailDraft {
  _id: string;
  sourceMessageId?: string;
  to?: string[];
  subject?: string;
  body?: string;
  senderMismatch?: boolean;
  status: MailDraftStatus;
  createdAt?: string;
}

export interface MailDraftEdit {
  subject?: string;
  body: string;
}

interface MailConversationDraftsResponse {
  mailConversationDrafts: MailDraft[] | null;
}

const evictDraft = (cache: ApolloCache<unknown>, _id: string) => {
  cache.evict({ id: cache.identify({ __typename: 'MailDraft', _id }) });
  cache.gc();
};

export const useMailDrafts = (conversationId?: string) => {
  const { t } = useTranslation('frontline');
  const showDeliveryOutcome = useDeliveryToast();

  const { data, loading, error, refetch } =
    useQuery<MailConversationDraftsResponse>(MAIL_CONVERSATION_DRAFTS_QUERY, {
      variables: { conversationId },
      skip: !conversationId,
      fetchPolicy: 'cache-and-network',
    });

  useSubscription(MAIL_DRAFT_CHANGED_SUBSCRIPTION, {
    variables: { conversationId },
    skip: !conversationId,
    onData: () => refetch(),
  });

  const [saveMutation] = useMutation(MAIL_DRAFT_SAVE_MUTATION);
  const [approveMutation] = useMutation<{
    mailDraftApprove: MailDeliveryOutcome | null;
  }>(MAIL_DRAFT_APPROVE_MUTATION);
  const [removeMutation] = useMutation(MAIL_DRAFT_REMOVE_MUTATION);

  const onError = (error: ApolloError) =>
    toast({ title: error.message, variant: 'destructive' });

  const saveDraft = (_id: string, edit: MailDraftEdit, onSaved: () => void) =>
    saveMutation({
      variables: { _id, ...edit },
      onCompleted: () => {
        toast({ title: t('mail-draft-saved', 'Draft saved') });
        onSaved();
      },
      onError,
    });

  const approveDraft = (_id: string) =>
    approveMutation({
      variables: { _id },
      onCompleted: (result) => showDeliveryOutcome(result?.mailDraftApprove),
      onError,
      update: (cache) => evictDraft(cache, _id),
      refetchQueries: ['mailConversationDetail', 'Conversations'],
    });

  const removeDraft = (_id: string) =>
    removeMutation({
      variables: { _id },
      onCompleted: () =>
        toast({ title: t('mail-draft-deleted', 'Draft deleted') }),
      onError,
      update: (cache) => evictDraft(cache, _id),
    });

  return {
    drafts: data?.mailConversationDrafts ?? [],
    loading,
    error,
    saveDraft,
    approveDraft,
    removeDraft,
  };
};
