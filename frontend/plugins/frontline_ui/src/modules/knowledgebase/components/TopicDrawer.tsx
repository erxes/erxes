import { ApolloError, useMutation } from '@apollo/client';
import {
  Button,
  FocusSheet,
  Form,
  Input,
  ScrollArea,
  Sheet,
  Textarea,
  toast,
  useQueryState,
} from 'erxes-ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SheetNavSidebar } from 'ui-modules';
import {
  TopicBackgroundImageField,
  TopicColorField,
} from '@/knowledgebase/components/TopicAppearanceFields';
import { TopicEmbedTab } from '@/knowledgebase/components/TopicEmbedTab';
import { TOPIC_FIELD_TAB } from '@/knowledgebase/constants';
import {
  ITopic,
  ITopicFormData,
  TOPIC_CREATE_TABS,
  TOPIC_TABS,
  TTopicTab,
} from '@/knowledgebase/types';
import { ADD_TOPIC, EDIT_TOPIC } from '../graphql/mutations';
import { TOPICS } from '../graphql/queries';

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
  const [selectedTab, setSelectedTab] = useQueryState<string>('tab');

  const tabs = isEditing ? TOPIC_TABS : TOPIC_CREATE_TABS;
  const activeTab: TTopicTab = tabs.includes(selectedTab as TTopicTab)
    ? (selectedTab as TTopicTab)
    : 'general';

  const form = useForm<ITopicFormData>({
    defaultValues: EMPTY_TOPIC_FORM,
    mode: 'onChange',
  });

  const handleClose = () => {
    setSelectedTab(null);
    onClose();
  };

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
    handleClose();
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

  const onSubmit = (data: ITopicFormData) => {
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
  };

  const onInvalid = (errors: Record<string, unknown>) => {
    const firstField = Object.keys(errors)[0] as
      | keyof ITopicFormData
      | undefined;

    if (firstField && TOPIC_FIELD_TAB[firstField] !== activeTab) {
      setSelectedTab(TOPIC_FIELD_TAB[firstField]);
    }
  };

  const submit = form.handleSubmit(onSubmit, onInvalid);

  const busy = adding || editing;

  const idleLabel = isEditing
    ? t('kb-save-changes', 'Save Changes')
    : t('kb-create-topic', 'Create Topic');
  const busyLabel = isEditing
    ? t('saving', 'Saving…')
    : t('kb-creating', 'Creating...');

  return (
    <FocusSheet
      modal
      open={isOpen}
      onOpenChange={(open: boolean) => !open && handleClose()}
    >
      <FocusSheet.View className="lg:w-3/4">
        <FocusSheet.Header
          title={isEditing ? t('kb-edit-topic') : t('kb-new-topic')}
        />
        <FocusSheet.Content className="flex-1 min-h-0">
          <FocusSheet.SideBar>
            <SheetNavSidebar
              tabs={[...tabs]}
              groupLabel={t('kb-topics', 'Topics')}
            />
          </FocusSheet.SideBar>

          <Form {...form}>
            <form
              onSubmit={submit}
              className="flex overflow-hidden flex-col flex-1 min-w-0"
            >
              <ScrollArea className="flex-1" viewportClassName="p-4">
                <div
                  className={activeTab === 'general' ? 'grid gap-4' : 'hidden'}
                >
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
                </div>

                <div
                  className={
                    activeTab === 'appearance' ? 'grid gap-4' : 'hidden'
                  }
                >
                  <TopicColorField control={form.control} name="color" t={t} />

                  <TopicBackgroundImageField
                    control={form.control}
                    name="backgroundImage"
                    t={t}
                  />
                </div>

                {isEditing && topic && (
                  <div className={activeTab === 'embed' ? '' : 'hidden'}>
                    <TopicEmbedTab topicId={topic._id} t={t} />
                  </div>
                )}
              </ScrollArea>
            </form>
          </Form>
        </FocusSheet.Content>

        <Sheet.Footer className="flex gap-1 justify-end border-t shrink-0 bg-background p-2.5">
          <Button
            type="button"
            onClick={handleClose}
            variant="outline"
            disabled={busy}
          >
            {t('cancel', 'Cancel')}
          </Button>
          <Button type="submit" disabled={busy} onClick={submit}>
            {busy ? busyLabel : idleLabel}
          </Button>
        </Sheet.Footer>
      </FocusSheet.View>
    </FocusSheet>
  );
}
