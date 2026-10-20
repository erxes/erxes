import { useTranslation } from 'react-i18next';
import {
  AiAgentRow,
  AiAgentRowList,
} from '@/automations/components/builder/nodes/actions/aiAgent/components/AiAgentRowList';
import { useAiAgentRowList } from '@/automations/components/builder/nodes/actions/aiAgent/hooks/useAiAgentRowList';
import { TAiAgentConfigForm } from '@/automations/components/builder/nodes/actions/aiAgent/states/aiAgentForm';
import { Form, Input, Textarea } from 'erxes-ui';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { generateAutomationElementId } from 'ui-modules';

type TAiAgentTopic = Extract<
  TAiAgentConfigForm,
  { goalType: 'splitTopic' }
>['topics'][number];

const getTopicLabel = (topic?: TAiAgentTopic) => topic?.topicName || '';

export const AiAgentTopicBuilder = () => {
  const { t } = useTranslation('automations');
  const { control } = useFormContext<TAiAgentConfigForm>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'topics',
  });
  const topics: TAiAgentTopic[] = useWatch({ control, name: 'topics' }) || [];
  const list = useAiAgentRowList({
    name: 'topics',
    fields,
    values: topics,
    getLabel: getTopicLabel,
  });

  const handleAdd = () => {
    const id = generateAutomationElementId();
    append({
      id,
      topicName: t('ai-agent-topic-default-name', {
        number: fields.length + 1,
      }),
      prompt: '',
    });
    list.openRow(id);
  };

  return (
    <AiAgentRowList
      openId={list.openId}
      onOpenChange={list.setOpenId}
      search={list.search}
      onSearchChange={list.setSearch}
      showSearch={list.showSearch}
      hasNoMatch={list.hasNoMatch}
      isEmpty={!fields.length}
      errorMessage={list.listErrorMessage}
      addLabel={t('ai-agent-add-topic')}
      onAdd={handleAdd}
    >
      {fields.map((field, index) => {
        const { id } = list.items[index];
        const topic = topics[index];

        if (!list.isVisible(id)) {
          return null;
        }

        return (
          <AiAgentRow
            key={field.id}
            value={id}
            title={topic?.topicName || ''}
            preview={topic?.prompt}
            hasError={list.hasError(id)}
            onRemove={() => remove(index)}
          >
            <Form.Field
              control={control}
              name={`topics.${index}.topicName`}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('ai-agent-topic-name')}</Form.Label>
                  <Input
                    {...field}
                    placeholder={t('ai-agent-topic-label-placeholder')}
                  />
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={control}
              name={`topics.${index}.prompt`}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('ai-agent-topic-when')}</Form.Label>
                  <Textarea
                    {...field}
                    placeholder={t('ai-agent-topic-prompt-placeholder')}
                  />
                  <Form.Message />
                </Form.Item>
              )}
            />
          </AiAgentRow>
        );
      })}
    </AiAgentRowList>
  );
};
