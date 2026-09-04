import { ApolloError, useMutation } from '@apollo/client';
import {
  Button,
  FocusSheet,
  Form,
  ScrollArea,
  Sheet,
  toast,
  useQueryState,
} from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SheetNavSidebar } from 'ui-modules';
import { TopicAppearanceTab } from '@/knowledgebase/components/TopicAppearanceTab';
import { TopicEmbedScriptDialog } from '@/knowledgebase/components/TopicEmbedScriptDialog';
import { TopicGeneralTab } from '@/knowledgebase/components/TopicGeneralTab';
import {
  EMPTY_TOPIC_FORM,
  EMPTY_TOPIC_STYLES,
  FIELD_TAB,
} from '@/knowledgebase/topicDrawerConstants';
import {
  Topic,
  TopicFormData,
  TopicStyles,
  TOPIC_TABS,
  TTopicTab,
} from '@/knowledgebase/topicDrawerTypes';
import { ADD_TOPIC, EDIT_TOPIC } from '../graphql/mutations';
import { TOPICS } from '../graphql/queries';

interface TopicDrawerProps {
  readonly topic?: Topic;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSaved?: () => void;
}

const omitTypename = (styles: Topic['styles']): Partial<TopicStyles> => {
  if (!styles) {
    return {};
  }

  const { __typename, ...rest } = styles as Partial<TopicStyles> & {
    __typename?: string;
  };

  return rest;
};

export function TopicDrawer({
  topic,
  isOpen,
  onClose,
  onSaved,
}: TopicDrawerProps) {
  const { t } = useTranslation('frontline');
  const isEditing = !!topic;
  const [scriptDialogOpen, setScriptDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useQueryState<string>('tab');
  const activeTab: TTopicTab = TOPIC_TABS.includes(selectedTab as TTopicTab)
    ? (selectedTab as TTopicTab)
    : 'general';

  // The tab lives in the URL, so it has to be dropped with the drawer or the
  // next one opens on whichever tab was last looked at.
  const handleClose = () => {
    setSelectedTab(null);
    onClose();
  };

  const form = useForm<TopicFormData>({
    defaultValues: EMPTY_TOPIC_FORM,
    mode: 'onChange',
  });

  useEffect(() => {
    if (topic) {
      form.reset({
        title: topic.title || '',
        description: topic.description || '',
        color: topic.color || '',
        backgroundImage: topic.backgroundImage || '',
        notificationSegmentId: topic.notificationSegmentId || '',
        url: topic.url || '',
        kbToggle: topic.kbToggle ?? true,
        kbLabel: topic.kbLabel || '',
        ticketToggle: topic.ticketToggle ?? false,
        ticketLabel: topic.ticketLabel || '',
        ticketChannelId: topic.ticketChannelId || '',
        ticketPipelineId: topic.ticketPipelineId || '',
        ticketStatusId: topic.ticketStatusId || '',
        styles: {
          ...EMPTY_TOPIC_STYLES,
          ...omitTypename(topic.styles),
        },
      });
      return;
    }

    form.reset(EMPTY_TOPIC_FORM);
  }, [topic, form]);

  const notifyError = (error: ApolloError) =>
    toast({
      title: t('error'),
      description: error.message,
      variant: 'destructive',
    });

  const [addTopic, { loading: adding }] = useMutation(ADD_TOPIC, {
    refetchQueries: [{ query: TOPICS }],
    awaitRefetchQueries: true,
    onCompleted: () => {
      toast({
        title: t('success'),
        description: t('kb-topic-created', 'Topic created'),
        variant: 'success',
      });
      onSaved?.();
      handleClose();
      form.reset(EMPTY_TOPIC_FORM);
    },
    onError: notifyError,
  });

  const [editTopic, { loading: editing }] = useMutation(EDIT_TOPIC, {
    refetchQueries: [{ query: TOPICS }],
    awaitRefetchQueries: true,
    onCompleted: () => {
      toast({
        title: t('success'),
        description: t('kb-topic-saved', 'Topic saved'),
        variant: 'success',
      });
      onSaved?.();
      handleClose();
      form.reset(EMPTY_TOPIC_FORM);
    },
    onError: notifyError,
  });

  const onSubmit = (data: TopicFormData) => {
    const doc: TopicFormData = {
      ...data,
      title: data.title?.trim(),
      description: data.description?.trim(),
      url: data.url?.trim(),
      kbLabel: data.kbToggle ? data.kbLabel?.trim() : '',
      ticketLabel: data.ticketToggle ? data.ticketLabel?.trim() : '',
      ticketChannelId: data.ticketToggle ? data.ticketChannelId : '',
      ticketPipelineId: data.ticketToggle ? data.ticketPipelineId : '',
      ticketStatusId: data.ticketToggle ? data.ticketStatusId : '',
    };

    if (isEditing && topic) {
      editTopic({ variables: { _id: topic._id, doc } });
      return;
    }

    addTopic({ variables: { doc } });
  };

  const onInvalid = (errors: Record<string, unknown>) => {
    const firstField = Object.keys(errors)[0] as
      | keyof TopicFormData
      | undefined;

    if (firstField && FIELD_TAB[firstField] !== activeTab) {
      setSelectedTab(FIELD_TAB[firstField]);
    }
  };

  const submit = form.handleSubmit(onSubmit, onInvalid);

  const busy = adding || editing;
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
              tabs={[...TOPIC_TABS]}
              groupLabel={t('kb-topic', 'Help center')}
            />
          </FocusSheet.SideBar>

          <Form {...form}>
            <form
              onSubmit={submit}
              className="flex overflow-hidden flex-col flex-1 min-w-0"
            >
              <ScrollArea className="flex-1" viewportClassName="p-4">
                <div className={activeTab === 'general' ? '' : 'hidden'}>
                  <TopicGeneralTab
                    form={form}
                    topic={topic}
                    isEditing={isEditing}
                    onViewScript={() => setScriptDialogOpen(true)}
                    t={t}
                  />
                </div>

                <div className={activeTab === 'appearance' ? '' : 'hidden'}>
                  <TopicAppearanceTab control={form.control} t={t} />
                </div>
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
            {t('cancel')}
          </Button>
          <Button type="submit" disabled={busy} onClick={submit}>
            {busy
              ? isEditing
                ? t('saving')
                : t('kb-creating')
              : isEditing
              ? t('kb-save-changes')
              : t('kb-create-topic')}
          </Button>
        </Sheet.Footer>
      </FocusSheet.View>

      {isEditing && topic && (
        <TopicEmbedScriptDialog
          topicId={topic._id}
          open={scriptDialogOpen}
          onOpenChange={setScriptDialogOpen}
          t={t}
        />
      )}
    </FocusSheet>
  );
}
