import { useAiAgentRowList } from '@/automations/components/builder/nodes/actions/aiAgent/hooks/useAiAgentRowList';
import { TAiAgentConfigForm } from '@/automations/components/builder/nodes/actions/aiAgent/states/aiAgentForm';
import { useCallback } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { generateAutomationElementId } from 'ui-modules';

type TAiAgentTopic = Extract<
  TAiAgentConfigForm,
  { goalType: 'splitTopic' }
>['topics'][number];

const topicLabelOf = (topic?: TAiAgentTopic) => topic?.topicName || '';

/** The split topics as rows: only those the search shows, ready to draw. */
export const useAiAgentTopicBuilder = () => {
  const { t } = useTranslation('automations');
  const { control } = useFormContext<TAiAgentConfigForm>();
  const { fields, append, remove } = useFieldArray({ control, name: 'topics' });
  const topics: TAiAgentTopic[] = useWatch({ control, name: 'topics' }) || [];
  const list = useAiAgentRowList({
    name: 'topics',
    fields,
    values: topics,
    getLabel: topicLabelOf,
  });

  const rows = fields.flatMap((field, index) => {
    const { id } = list.items[index];
    const topic = topics[index];

    return list.isVisible(id)
      ? [
          {
            key: field.id,
            index,
            id,
            title: topicLabelOf(topic),
            preview: topic?.prompt,
            hasError: list.hasError(id),
          },
        ]
      : [];
  });

  const handleAdd = useCallback(() => {
    const id = generateAutomationElementId();

    append({
      id,
      topicName: t('ai-agent-topic-default-name', {
        number: fields.length + 1,
      }),
      prompt: '',
    });
    list.openRow(id);
  }, [append, fields.length, list, t]);

  return { control, list, isEmpty: !fields.length, rows, handleAdd, remove };
};
