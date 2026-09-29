import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from 'erxes-ui';
import { useEffect } from 'react';
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
  isOpen,
  onClose,
  onSaved,
}: {
  topic?: ITopic;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}) => {
  const { t } = useTranslation('frontline');
  const isEditing = !!topic;
  const { saveTopic, loading } = useSaveTopic();

  const form = useForm<TTopicForm>({
    resolver: zodResolver(topicSchema),
    defaultValues: EMPTY_TOPIC,
  });

  useEffect(() => {
    form.reset(topic ? topicToForm(topic) : EMPTY_TOPIC);
  }, [topic, form]);

  const submit = form.handleSubmit(async (values) => {
    const saved = await saveTopic(values, topic?._id);

    if (!saved) return;

    onSaved?.();
    onClose();
    form.reset(EMPTY_TOPIC);
  });

  return (
    <KbFormSheet
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEditing
          ? t('kb-edit-topic', 'Edit Topic')
          : t('kb-new-topic', 'New Topic')
      }
      submitLabel={
        isEditing
          ? t('kb-save-changes', 'Save Changes')
          : t('kb-create-topic', 'Create Topic')
      }
      loading={loading}
      onSubmit={submit}
    >
      <Form {...form}>
        <form onSubmit={submit} className="grid gap-4 p-4">
          <TopicFormFields form={form} t={t} />
        </form>
      </Form>
    </KbFormSheet>
  );
};
