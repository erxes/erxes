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
      onClose={onClose}
      submitLabel={
        isEditing
          ? t('kb-save-changes', 'Save Changes')
          : t('kb-create-topic', 'Create Topic')
      }
      loading={loading}
      onSubmit={submit}
    >
      <Form {...form}>
        <div className="grid gap-2">
          <TopicFormFields form={form} t={t} />
        </div>
      </Form>
    </KbFormSheet>
  );
};
