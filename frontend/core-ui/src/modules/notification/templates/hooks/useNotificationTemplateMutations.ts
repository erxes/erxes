import { ApolloError, useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  NOTIFICATION_TEMPLATE_PUBLISH,
  NOTIFICATION_TEMPLATE_REVERT,
  NOTIFICATION_TEMPLATE_SAVE_DRAFT,
  NOTIFICATION_TEMPLATE_SEND_TEST,
} from '../graphql/notificationTemplateMutations';
import {
  NOTIFICATION_TEMPLATE_DETAIL,
  NOTIFICATION_TEMPLATES,
} from '../graphql/notificationTemplateQueries';
import { TNotificationTemplate, TNotificationTemplateInput } from '../types';

const CONFLICT = 'NOTIFICATION_TEMPLATE_CONFLICT';

/** Every write refetches the list and the template, so both show it at once. */
export const useNotificationTemplateMutations = (key: string) => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });
  const { toast } = useToast();
  const [conflict, setConflict] = useState(false);

  const onError = (error: ApolloError) => {
    // someone saved since this was opened: the page offers to reload instead
    if (error.graphQLErrors.some((e) => e.extensions?.code === CONFLICT)) {
      setConflict(true);
      return;
    }

    toast({
      title: t('template-not-saved'),
      description: error.message,
      variant: 'destructive',
    });
  };

  const options = {
    onError,
    refetchQueries: [
      { query: NOTIFICATION_TEMPLATES },
      { query: NOTIFICATION_TEMPLATE_DETAIL, variables: { key } },
    ],
  };

  const [saveDraftMutation, { loading: savingDraft }] = useMutation<{
    notificationTemplateSaveDraft: TNotificationTemplate;
  }>(NOTIFICATION_TEMPLATE_SAVE_DRAFT, options);

  const [publishMutation, { loading: publishing }] = useMutation<{
    notificationTemplatePublish: TNotificationTemplate;
  }>(NOTIFICATION_TEMPLATE_PUBLISH, options);

  const [revertMutation, { loading: reverting }] = useMutation<{
    notificationTemplateRevert: TNotificationTemplate;
  }>(NOTIFICATION_TEMPLATE_REVERT, options);

  const [sendTestMutation, { loading: sendingTest }] = useMutation<{
    notificationTemplateSendTest: string;
  }>(NOTIFICATION_TEMPLATE_SEND_TEST, { onError });

  const saveDraft = async (
    draftRevision: number,
    input: TNotificationTemplateInput,
  ) => {
    const { data } = await saveDraftMutation({
      variables: { key, draftRevision, input },
    });

    if (data) {
      toast({ variant: 'success', title: t('draft-saved') });
    }

    return data?.notificationTemplateSaveDraft;
  };

  const publish = async (
    draftRevision: number,
    input: TNotificationTemplateInput,
  ) => {
    const { data } = await publishMutation({
      variables: { key, draftRevision, input },
    });

    if (data) {
      toast({ variant: 'success', title: t('template-published') });
    }

    return data?.notificationTemplatePublish;
  };

  const revert = async () => {
    const { data } = await revertMutation({ variables: { key } });

    if (data) {
      toast({ variant: 'success', title: t('template-reverted') });
    }

    return data?.notificationTemplateRevert;
  };

  const sendTest = async (input: TNotificationTemplateInput) => {
    const { data } = await sendTestMutation({ variables: { key, input } });

    if (data) {
      toast({
        variant: 'success',
        title: t('test-sent', { email: data.notificationTemplateSendTest }),
      });
    }
  };

  return {
    saveDraft,
    publish,
    revert,
    sendTest,
    conflict,
    clearConflict: () => setConflict(false),
    saving: savingDraft || publishing || reverting,
    sendingTest,
  };
};
