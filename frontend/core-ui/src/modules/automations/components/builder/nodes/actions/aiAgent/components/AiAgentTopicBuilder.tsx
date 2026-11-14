import { useTranslation } from 'react-i18next';
import {
  AiAgentRow,
  AiAgentRowList,
} from '@/automations/components/builder/nodes/actions/aiAgent/components/AiAgentRowList';
import { useAiAgentTopicBuilder } from '@/automations/components/builder/nodes/actions/aiAgent/hooks/useAiAgentTopicBuilder';
import { Form, Input, Textarea } from 'erxes-ui';

export const AiAgentTopicBuilder = () => {
  const { t } = useTranslation('automations');
  const { control, list, isEmpty, rows, handleAdd, remove } =
    useAiAgentTopicBuilder();

  return (
    <AiAgentRowList
      openId={list.openId}
      onOpenChange={list.setOpenId}
      search={list.search}
      onSearchChange={list.setSearch}
      showSearch={list.showSearch}
      hasNoMatch={list.hasNoMatch}
      isEmpty={isEmpty}
      errorMessage={list.listErrorMessage}
      addLabel={t('ai-agent-add-topic')}
      onAdd={handleAdd}
    >
      {rows.map((row) => (
        <AiAgentRow
          key={row.key}
          value={row.id}
          title={row.title}
          preview={row.preview}
          hasError={row.hasError}
          onRemove={() => remove(row.index)}
        >
          <Form.Field
            control={control}
            name={`topics.${row.index}.topicName`}
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
            name={`topics.${row.index}.prompt`}
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
      ))}
    </AiAgentRowList>
  );
};
