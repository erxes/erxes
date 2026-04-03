import { TAiAgentConfigForm } from '@/automations/components/builder/nodes/actions/aiAgent/states/aiAgentForm';
import { IconTrash } from '@tabler/icons-react';
import { Button, Form, Input, Select, Separator, Textarea } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
export const AiAgentObjectFieldBuilder = ({
  isLastElement,
  index,
  handleRemove,
}: {
  isLastElement: boolean;
  index: number;

  handleRemove: () => void;
}) => {
  const { control } = useFormContext<TAiAgentConfigForm>();

  return (
    <>
      <div className="mb-1 flex flex-col gap-2 p-2 ">
        <div className="grid grid-cols-12 items-center gap-2">
          <Form.Field
            control={control}
            name={`objectFields.${index}.fieldName`}
            render={({ field }) => (
              <Form.Item className="col-span-5">
                <Input {...field} placeholder="Enter field name" />
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            control={control}
            name={`objectFields.${index}.dataType`}
            render={({ field }) => (
              <Form.Item className="col-span-2">
                <Select {...field} onValueChange={field.onChange}>
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="string">String</Select.Item>
                    <Select.Item value="number">Number</Select.Item>
                    <Select.Item value="boolean">Boolean</Select.Item>
                    <Select.Item value="object">Object</Select.Item>
                    <Select.Item value="array">Array</Select.Item>
                  </Select.Content>
                </Select>
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            control={control}
            name={`objectFields.${index}.validation`}
            render={({ field }) => (
              <Form.Item className="col-span-4">
                <Input placeholder="Enter field validation" {...field} />
                <Form.Message />
              </Form.Item>
            )}
          />

          <div className="col-span-1 flex justify-end">
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={handleRemove}
            >
              <IconTrash />
            </Button>
          </div>
        </div>
        <Form.Field
          control={control}
          name={`objectFields.${index}.prompt`}
          render={({ field }) => (
            <Form.Item>
              <Textarea placeholder="Enter prompt" {...field} />
              <Form.Message />
            </Form.Item>
          )}
        />
      </div>
      {!isLastElement && <Separator />}
    </>
  );
};
