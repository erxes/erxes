import { useTranslation } from 'react-i18next';
import {
  AiAgentRow,
  AiAgentRowList,
} from '@/automations/components/builder/nodes/actions/aiAgent/components/AiAgentRowList';
import { AiAgentToolMemorizeFields } from '@/automations/components/builder/nodes/actions/aiAgent/components/AiAgentToolMemorizeFields';
import { useAiAgentRowList } from '@/automations/components/builder/nodes/actions/aiAgent/hooks/useAiAgentRowList';
import {
  TAiAgentConfigForm,
  TAiAgentToolFormValue,
} from '@/automations/components/builder/nodes/actions/aiAgent/states/aiAgentForm';
import { Badge, Form, Input, Select, Textarea } from 'erxes-ui';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { generateAutomationElementId } from 'ui-modules';

const getToolLabel = (tool?: TAiAgentToolFormValue) => tool?.name || '';

export const AiAgentToolBuilder = () => {
  const { t } = useTranslation('automations');
  const { control } = useFormContext<TAiAgentConfigForm>();
  const { fields, append, remove } = useFieldArray({ control, name: 'tools' });
  const tools: TAiAgentToolFormValue[] =
    useWatch({ control, name: 'tools' }) || [];
  const list = useAiAgentRowList({
    name: 'tools',
    fields,
    values: tools,
    getLabel: getToolLabel,
  });

  const handleAdd = () => {
    const id = generateAutomationElementId();
    append({
      id,
      name: `tool_${fields.length + 1}`,
      description: '',
      kind: 'helper',
      memorizeFields: [],
    });
    list.openRow(id);
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        {t('ai-agent-tools-description')}
      </p>
      <AiAgentRowList
        openId={list.openId}
        onOpenChange={list.setOpenId}
        search={list.search}
        onSearchChange={list.setSearch}
        showSearch={list.showSearch}
        hasNoMatch={list.hasNoMatch}
        isEmpty={!fields.length}
        errorMessage={list.listErrorMessage}
        addLabel={t('ai-agent-add-tool')}
        onAdd={handleAdd}
      >
        {fields.map((field, index) => {
          const { id } = list.items[index];
          const tool = tools[index];

          if (!list.isVisible(id)) {
            return null;
          }

          return (
            <AiAgentRow
              key={field.id}
              value={id}
              title={tool?.name || ''}
              badges={
                <>
                  <Badge variant="secondary" className="shrink-0">
                    {tool?.kind === 'handoff'
                      ? t('ai-agent-tool-kind-handoff')
                      : t('ai-agent-tool-kind-helper')}
                  </Badge>
                  {!tool?.description && (
                    <Badge variant="warning" className="shrink-0">
                      {t('ai-agent-tool-no-description')}
                    </Badge>
                  )}
                </>
              }
              preview={tool?.description}
              hasError={list.hasError(id)}
              onRemove={() => remove(index)}
            >
              <AiAgentToolFields index={index} />
              {tool?.id && (
                <AiAgentToolMemorizeFields index={index} toolId={tool.id} />
              )}
            </AiAgentRow>
          );
        })}
      </AiAgentRowList>
    </div>
  );
};

const AiAgentToolFields = ({ index }: { index: number }) => {
  const { t } = useTranslation('automations');
  const { control } = useFormContext<TAiAgentConfigForm>();

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        <Form.Field
          control={control}
          name={`tools.${index}.name`}
          render={({ field }) => (
            <Form.Item className="col-span-2">
              <Form.Label>{t('ai-agent-tool-name-placeholder')}</Form.Label>
              <Input
                {...field}
                placeholder={t('ai-agent-tool-name-placeholder')}
              />
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={control}
          name={`tools.${index}.kind`}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('ai-agent-tool-kind')}</Form.Label>
              <Select value={field.value} onValueChange={field.onChange}>
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="helper">
                    {t('ai-agent-tool-kind-helper')}
                  </Select.Item>
                  <Select.Item value="handoff">
                    {t('ai-agent-tool-kind-handoff')}
                  </Select.Item>
                </Select.Content>
              </Select>
              <Form.Message />
            </Form.Item>
          )}
        />
      </div>
      <Form.Field
        control={control}
        name={`tools.${index}.description`}
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('ai-agent-tool-description')}</Form.Label>
            <Textarea
              {...field}
              placeholder={t('ai-agent-tool-description-placeholder')}
            />
            <Form.Description>
              {t('ai-agent-tool-description-hint')}
            </Form.Description>
            <Form.Message />
          </Form.Item>
        )}
      />
    </>
  );
};
