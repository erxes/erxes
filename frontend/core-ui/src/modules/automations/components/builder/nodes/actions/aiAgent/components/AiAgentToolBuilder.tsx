import { useTranslation } from 'react-i18next';
import {
  TAiAgentConfigForm,
  TAiAgentToolFormValue,
} from '@/automations/components/builder/nodes/actions/aiAgent/states/aiAgentForm';
import { IconTrash } from '@tabler/icons-react';
import { Button, Form, Input, Select, Textarea } from 'erxes-ui';
import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch,
} from 'react-hook-form';
import { generateAutomationElementId } from 'ui-modules';

export const AiAgentToolBuilder = () => {
  const { t } = useTranslation('automations');
  const { control } = useFormContext<TAiAgentConfigForm>();
  const { fields, append, remove } = useFieldArray({ control, name: 'tools' });
  const tools: TAiAgentToolFormValue[] =
    useWatch({ control, name: 'tools' }) || [];

  return (
    <Form.Item>
      <Form.Label>{t('ai-agent-tools')}</Form.Label>
      <Form.Description>{t('ai-agent-tools-description')}</Form.Description>

      <div className="flex flex-col gap-3 py-2">
        {fields.map((field, index) => (
          <AiAgentToolRow
            key={field.id}
            index={index}
            tool={tools[index]}
            onRemove={remove}
          />
        ))}
      </div>

      <Button
        type="button"
        onClick={() =>
          append({
            id: generateAutomationElementId(),
            name: `tool_${fields.length + 1}`,
            description: '',
            kind: 'helper',
          })
        }
      >
        {t('ai-agent-add-tool')}
      </Button>
    </Form.Item>
  );
};

const AiAgentToolRow = ({
  index,
  tool,
  onRemove,
}: {
  index: number;
  tool?: TAiAgentToolFormValue;
  onRemove: (index: number) => void;
}) => {
  const { t } = useTranslation('automations');
  const { control } = useFormContext<TAiAgentConfigForm>();

  return (
    <div className="flex flex-col gap-2 rounded-md border p-2">
      <div className="flex flex-row gap-2">
        <Controller
          name={`tools.${index}.name`}
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              placeholder={t('ai-agent-tool-name-placeholder')}
            />
          )}
        />
        <Controller
          name={`tools.${index}.kind`}
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <Select.Trigger className="w-32 shrink-0">
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
          )}
        />
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="ml-auto shrink-0"
          onClick={() => onRemove(index)}
        >
          <IconTrash />
        </Button>
      </div>

      <Controller
        name={`tools.${index}.description`}
        control={control}
        render={({ field }) => (
          <Textarea
            {...field}
            placeholder={t('ai-agent-tool-description-placeholder')}
          />
        )}
      />

      {!tool?.description && (
        <p className="text-xs text-muted-foreground">
          {t('ai-agent-tool-description-hint')}
        </p>
      )}
    </div>
  );
};
