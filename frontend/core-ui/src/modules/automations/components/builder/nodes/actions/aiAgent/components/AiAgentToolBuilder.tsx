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
  const { control } = useFormContext<TAiAgentConfigForm>();
  const { fields, append, remove } = useFieldArray({ control, name: 'tools' });
  const tools: TAiAgentToolFormValue[] =
    useWatch({ control, name: 'tools' }) || [];

  return (
    <Form.Item>
      <Form.Label>Tools</Form.Label>
      <Form.Description>
        Every tool appears on the node with a connect handle — wire it to a
        workflow or action on the canvas. Helper tools run the wired workflow
        during generation and feed the result back into the reply; handoff
        tools end the reply and continue execution there.
      </Form.Description>

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
        Add tool
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
  const { control } = useFormContext<TAiAgentConfigForm>();

  return (
    <div className="flex flex-col gap-2 rounded-md border p-2">
      <div className="flex flex-row gap-2">
        <Controller
          name={`tools.${index}.name`}
          control={control}
          render={({ field }) => <Input {...field} placeholder="Tool name" />}
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
                <Select.Item value="helper">Helper</Select.Item>
                <Select.Item value="handoff">Handoff</Select.Item>
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
            placeholder="Describe when the AI should use this tool"
          />
        )}
      />

      {!tool?.description && (
        <p className="text-xs text-muted-foreground">
          A clear description strongly improves when the AI picks this tool.
        </p>
      )}
    </div>
  );
};
