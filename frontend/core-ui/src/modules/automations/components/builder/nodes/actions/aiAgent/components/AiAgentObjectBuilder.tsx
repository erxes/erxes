import { AiAgentObjectFieldBuilder } from '@/automations/components/builder/nodes/actions/aiAgent/components/AiAgentObjectFieldBuilder';
import { TAiAgentConfigForm } from '@/automations/components/builder/nodes/actions/aiAgent/states/aiAgentForm';
import { Button, Form, Label } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { generateAutomationElementId } from 'ui-modules';

export const AiAgentObjectBuilder = () => {
  const { control } = useFormContext<TAiAgentConfigForm>();

  return (
    <Form.Field
      control={control}
      name="objectFields"
      render={({ field: { value, onChange } }) => {
        const fields = value || [];

        return (
          <Form.Item>
            <div className="flex flex-col gap-2 p-4">
              <div className="grid grid-cols-12 items-center gap-2">
                <Label className="col-span-5">Field Name</Label>
                <Label className="col-span-2">Data Type</Label>
                <Label className="col-span-4">Validation</Label>
                <div className="col-span-1" />
              </div>

              {fields.map((_, index) => (
                <AiAgentObjectFieldBuilder
                  key={index}
                  isLastElement={index + 1 !== fields.length}
                  index={index}
                  handleRemove={() =>
                    onChange(fields.filter((_, i) => i !== index))
                  }
                />
              ))}
            </div>
            <Form.Message />
            <Button
              type="button"
              onClick={() =>
                onChange([
                  ...fields,
                  {
                    id: generateAutomationElementId(),
                    fieldName: '',
                    prompt: '',
                    dataType: 'string',
                    validation: '',
                  },
                ])
              }
            >
              Add Field
            </Button>
          </Form.Item>
        );
      }}
    />
  );
};
