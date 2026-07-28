import { TAiAgentConfigForm } from '@/automations/components/builder/nodes/actions/aiAgent/states/aiAgentForm';
import { IconTrash } from '@tabler/icons-react';
import { Button, Form, Input, Select, Separator, Textarea } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';

export type TAiAgentFieldsGroupName = 'objectFields' | 'captureFields';

type TAiAgentFieldSuffix = 'fieldName' | 'prompt' | 'validation' | 'dataType';

export const AiAgentObjectFieldBuilder = ({
  isLastElement,
  index,
  handleRemove,
  name = 'objectFields',
}: {
  isLastElement: boolean;
  index: number;
  handleRemove: () => void;
  name?: TAiAgentFieldsGroupName;
}) => {
  const { control } = useFormContext<TAiAgentConfigForm>();
  // captureFields items share the exact shape of objectFields items, so the
  // objectFields path type is reused while the runtime path stays correct.
  const fieldPath = <S extends TAiAgentFieldSuffix>(suffix: S) =>
    `${name}.${index}.${suffix}` as `objectFields.${number}.${S}`;

  return (
    <>
      <div className="mb-1 flex flex-col gap-2 p-2 ">
        <div className="grid grid-cols-12 items-center gap-2">
          <Form.Field
            control={control}
            name={fieldPath('fieldName')}
            render={({ field }) => (
              <Form.Item className="col-span-5">
                <Input {...field} placeholder="productName" />
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            control={control}
            name={fieldPath('dataType')}
            render={({ field }) => (
              <Form.Item className="col-span-2">
                <Select value={field.value} onValueChange={field.onChange}>
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
            name={fieldPath('validation')}
            render={({ field }) => (
              <Form.Item className="col-span-4">
                <Input
                  placeholder="Optional validation or enum hints"
                  {...field}
                />
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
          name={fieldPath('prompt')}
          render={({ field }) => (
            <Form.Item>
              <Textarea
                placeholder="Describe what this field should extract from the input"
                {...field}
              />
              <Form.Message />
            </Form.Item>
          )}
        />
      </div>
      {!isLastElement && <Separator />}
    </>
  );
};
