import { TAiAgentFieldsGroupName } from '@/automations/components/builder/nodes/actions/aiAgent/components/AiAgentObjectFieldBuilder';
import { TAiAgentConfigForm } from '@/automations/components/builder/nodes/actions/aiAgent/states/aiAgentForm';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Button, Form, Input, Label, Textarea } from 'erxes-ui';
import {
  get,
  useFieldArray,
  useFormContext,
  useFormState,
} from 'react-hook-form';

export const AiAgentFieldOptionsBuilder = ({
  name,
  index,
}: {
  name: TAiAgentFieldsGroupName;
  index: number;
}) => {
  const { control } = useFormContext<TAiAgentConfigForm>();
  // Same path-type reuse as AiAgentObjectFieldBuilder: captureFields items
  // share the objectFields shape.
  const optionsPath =
    `${name}.${index}.options` as `objectFields.${number}.options`;
  const { fields, append, remove } = useFieldArray({
    control,
    name: optionsPath,
  });
  const { errors } = useFormState({ control, name: optionsPath });
  const optionsError = get(errors, optionsPath);
  const optionsErrorMessage =
    optionsError?.root?.message || optionsError?.message;

  return (
    <div className="flex flex-col gap-2 rounded-md border p-2">
      <div className="grid grid-cols-12 gap-2">
        <Label className="col-span-3">Value</Label>
        <Label className="col-span-8">When (rule)</Label>
      </div>

      {fields.map((option, optionIndex) => (
        <div key={option.id} className="grid grid-cols-12 items-start gap-2">
          <Form.Field
            control={control}
            name={`${optionsPath}.${optionIndex}.value`}
            render={({ field }) => (
              <Form.Item className="col-span-3">
                <Input {...field} placeholder="1" />
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            control={control}
            name={`${optionsPath}.${optionIndex}.prompt`}
            render={({ field }) => (
              <Form.Item className="col-span-8">
                <Textarea
                  {...field}
                  placeholder="Service is fully down or payments are failing"
                />
                <Form.Message />
              </Form.Item>
            )}
          />
          <div className="col-span-1 flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Remove value"
              onClick={() => remove(optionIndex)}
            >
              <IconTrash />
            </Button>
          </div>
        </div>
      ))}

      {optionsErrorMessage && (
        <p className="text-sm text-destructive">{optionsErrorMessage}</p>
      )}

      <Button
        type="button"
        variant="secondary"
        className="self-start"
        onClick={() => append({ value: '', prompt: '' })}
      >
        <IconPlus />
        Add value
      </Button>
    </div>
  );
};
