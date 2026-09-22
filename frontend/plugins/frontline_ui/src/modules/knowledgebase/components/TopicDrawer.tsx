import { ADD_TOPIC, EDIT_TOPIC } from '../graphql/mutations';
import { ApolloError, useMutation } from '@apollo/client';
import { Button, Form, Input, Sheet, Textarea, toast } from 'erxes-ui';
import { ITopic, ITopicFormData } from '@/knowledgebase/types';
import {
  TopicBackgroundImageField,
  TopicColorField,
} from '@/knowledgebase/components/TopicAppearanceFields';
import { useEffect, useState } from 'react';

import { IconCode } from '@tabler/icons-react';
import { TOPICS } from '../graphql/queries';
import { TopicEmbedScriptDialog } from '@/knowledgebase/components/TopicEmbedScriptDialog';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

const EMPTY_TOPIC_FORM: ITopicFormData = {
  title: '',
  description: '',
  color: '#000000',
  backgroundImage: '',
};

interface TopicDrawerProps {
  readonly topic?: ITopic;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSaved?: () => void;
}

export function TopicDrawer({
  topic,
  isOpen,
  onClose,
  onSaved,
}: TopicDrawerProps) {
  const { t } = useTranslation('frontline');
  const isEditing = !!topic;
  const [scriptDialogOpen, setScriptDialogOpen] = useState(false);

  const form = useForm<ITopicFormData>({
    defaultValues: EMPTY_TOPIC_FORM,
    mode: 'onChange',
  });

  useEffect(() => {
    form.reset(
      topic
        ? {
            title: topic.title || '',
            description: topic.description || '',
            color: topic.color || EMPTY_TOPIC_FORM.color,
            backgroundImage: topic.backgroundImage || '',
          }
        : EMPTY_TOPIC_FORM,
    );
  }, [topic, form]);

  const notifyError = (error: ApolloError) =>
    toast({
      title: t('error', 'Error'),
      description: error.message,
      variant: 'destructive',
    });

  const notifySaved = (description: string) => {
    toast({ title: t('success', 'Success!'), description, variant: 'success' });
    onSaved?.();
    onClose();
    form.reset(EMPTY_TOPIC_FORM);
  };

  const [addTopic, { loading: adding }] = useMutation(ADD_TOPIC, {
    refetchQueries: [{ query: TOPICS }],
    awaitRefetchQueries: true,
    onCompleted: () => notifySaved(t('kb-topic-created', 'Topic created')),
    onError: notifyError,
  });

  const [editTopic, { loading: editing }] = useMutation(EDIT_TOPIC, {
    refetchQueries: [{ query: TOPICS }],
    awaitRefetchQueries: true,
    onCompleted: () => notifySaved(t('kb-topic-saved', 'Topic saved')),
    onError: notifyError,
  });

  const submit = form.handleSubmit((data) => {
    const doc: ITopicFormData = {
      ...data,
      title: data.title?.trim(),
      description: data.description?.trim(),
    };

    if (isEditing && topic) {
      editTopic({ variables: { _id: topic._id, doc } });
      return;
    }

    addTopic({ variables: { doc } });
  });

  const busy = adding || editing;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Sheet.View className="p-0 md:w-1/2">
        <Sheet.Header className="border-b p-2.5">
          <Sheet.Title>
            {isEditing ? t('kb-edit-topic') : t('kb-new-topic')}
          </Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>

        <Sheet.Content className="grow p-4">
          <Form {...form}>
            <form onSubmit={submit} className="grid gap-4">
              <Form.Field
                control={form.control}
                name="title"
                rules={{ required: 'Title is required' }}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>
                      {t('kb-title-required')}{' '}
                      <span className="text-destructive">*</span>
                    </Form.Label>
                    <Form.Control>
                      <Input
                        {...field}
                        placeholder={t('kb-enter-topic-title')}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="description"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('description')}</Form.Label>
                    <Form.Control>
                      <Textarea
                        {...field}
                        placeholder={t('kb-enter-topic-description')}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <TopicColorField control={form.control} name="color" t={t} />

              <TopicBackgroundImageField
                control={form.control}
                name="backgroundImage"
                t={t}
              />

              {isEditing && topic && (
                <Button
                  type="button"
                  variant="outline"
                  className="justify-self-start"
                  onClick={() => setScriptDialogOpen(true)}
                >
                  <IconCode className="mr-2 w-4 h-4" />
                  {t('kb-view-script')}
                </Button>
              )}
            </form>
          </Form>
        </Sheet.Content>

        <Sheet.Footer className="flex gap-1 justify-end border-t shrink-0 bg-background p-2.5">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            disabled={busy}
          >
            {t('cancel', 'Cancel')}
          </Button>
          <Button type="submit" disabled={busy} onClick={submit}>
            {busy
              ? isEditing
                ? t('saving', 'Saving…')
                : t('kb-creating', 'Creating...')
              : isEditing
              ? t('kb-save-changes', 'Save Changes')
              : t('kb-create-topic', 'Create Topic')}
          </Button>
        </Sheet.Footer>
      </Sheet.View>

      {isEditing && topic && (
        <TopicEmbedScriptDialog
          topicId={topic._id}
          open={scriptDialogOpen}
          onOpenChange={setScriptDialogOpen}
          t={t}
        />
      )}
    </Sheet>
  );
}
