import {
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
  inboxConversationId?: string;
  sourceMessageId?: string;
  to?: string[];
  subject?: string;
  body?: string;
  shouldResolve?: boolean;
  senderMismatch?: boolean;
  status: MailDraftStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface MailDraftEdit {
  subject?: string;
  body: string;
}

interface MailConversationDraftsResponse {
  mailConversationDrafts: MailDraft[] | null;
}

const DRAFTS_QUERY_NAME = 'mailConversationDrafts';

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
      refetchQueries: [DRAFTS_QUERY_NAME],
    });

  const approveDraft = (_id: string) =>
    approveMutation({
      variables: { _id },
      onCompleted: (result) => showDeliveryOutcome(result?.mailDraftApprove),
      onError,
      refetchQueries: [
        DRAFTS_QUERY_NAME,
        'mailConversationDetail',
        'Conversations',
      ],
    });

  const removeDraft = (_id: string) =>
    removeMutation({
      variables: { _id },
      onCompleted: () =>
        toast({ title: t('mail-draft-deleted', 'Draft deleted') }),
      onError,
      refetchQueries: [DRAFTS_QUERY_NAME],
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
