import { useKbPanelFormDraft } from '@/knowledgebase/shared/hooks/useKbPanelFormDraft';
import { topicPanelDraftsState } from '@/knowledgebase/shared/states/panelFormDraftsState';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { KbFormSheet } from '@/knowledgebase/shared/components/KbFormSheet';
import {
  EMPTY_TOPIC,
  TopicFormFields,
  topicSchema,
  topicToForm,
  TTopicForm,
} from '@/knowledgebase/topics/components/TopicFormFields';
import { useSaveTopic } from '@/knowledgebase/topics/hooks/useTopicMutations';
import { ITopic } from '@/knowledgebase/types';

export const TopicDrawer = ({
  topic,
  onClose,
  onSaved,
}: {
  topic?: ITopic;
  onClose: () => void;
  onSaved?: () => void;
}) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.knowledgebase',
  });
  const { saveTopic, loading } = useSaveTopic();

  const form = useForm<TTopicForm>({
    resolver: zodResolver(topicSchema),
    defaultValues: EMPTY_TOPIC,
  });

  const { dirtyFields } = form.formState;
  const {
    clearDraft,
    markSaved,
    isActive,
    save,
    saving,
    uploading,
    createdId,
    captureUpdate,
    invalidateUpdates,
  } = useKbPanelFormDraft({
    form,
    kind: 'topic',
    recordId: topic?._id,
    context: [],
    onDeleted: onClose,
    values: topic ? topicToForm(topic) : EMPTY_TOPIC,
    draftsState: topicPanelDraftsState,
    discardMessage: t(
      'discard-unsaved-changes',
      'Discard your unsaved changes?',
    ),
  });

  const isEditing = Boolean(topic || createdId);

  const cancel = () => {
    clearDraft();
    onClose();
  };

  const submit = form.handleSubmit(async (values) => {
    const submittedValues = structuredClone(form.getValues());
    const submittedDirtyFields = structuredClone(dirtyFields);
    const saved = await save((recordId) =>
      saveTopic(values, recordId, recordId ? submittedDirtyFields : undefined),
    );

    if (!saved) return;

    if (!markSaved(values, submittedValues)) return;
    onSaved?.();
    if (isActive()) onClose();
  });

  return (
    <KbFormSheet
      onClose={cancel}
      submitLabel={
        isEditing
          ? t('kb-save-changes', 'Save Changes')
          : t('kb-create-topic', 'Create Topic')
      }
      loading={loading || saving}
      uploading={uploading}
      onSubmit={submit}
    >
      <Form {...form}>
        <div className="grid gap-2">
          <TopicFormFields
            form={form}
            t={t}
            uploadingDisabled={loading || saving}
            invalidateBackgroundChange={() =>
              invalidateUpdates('backgroundImage')
            }
            captureBackgroundChange={() => {
              const update = captureUpdate('backgroundImage');
              return (backgroundImage) =>
                update((latest) =>
                  backgroundImage ? { ...latest, backgroundImage } : latest,
                );
            }}
          />
        </div>
      </Form>
    </KbFormSheet>
  );
};
