import { useManagePropertyRule } from '@/automations/components/builder/nodes/actions/manageProperties/hooks/useManagePropertyRule';
import { TManagePropertiesForm } from '@/automations/components/builder/nodes/actions/manageProperties/states/managePropertiesForm';
import { IconTrash } from '@tabler/icons-react';
import { Button, Form, Select } from 'erxes-ui';
import { PlaceHolderInput } from 'ui-modules';

interface LocalRuleProps {
  rule: TManagePropertiesForm['rules'][number];
  index: number;
  propertyType: string;
  additionalAttributes: any[];
}

export const ManagePropertyRule = ({
  rule,
  propertyType,
  index,
  additionalAttributes,
}: LocalRuleProps) => {
  const { control, groups, operators, selectedField, handleRemove } =
    useManagePropertyRule({ propertyType, index, rule });
  return (
    <div className="border rounded p-4  mb-2 relative group">
      <div className="flex flex-row gap-4 mb-4  items-end">
        <Form.Field
          control={control}
          name={`rules.${index}.field`}
          render={({ field }) => (
            <Form.Item className="w-3/5">
              <Form.Label>Field</Form.Label>

              <Select value={field.value} onValueChange={field.onChange}>
                <Select.Trigger>
                  <Select.Value placeholder="Select an field" />
                </Select.Trigger>
                <Select.Content>
                  {Object.entries(groups).map(([key, fields], index) => {
                    const groupName =
                      fields.find(({ group }) => group === key)?.groupDetail
                        ?.name || key;

                    return (
                      <div key={index}>
                        <Select.Group>
                          <Select.Label>{groupName}</Select.Label>
                          {fields.map(({ _id, name, label }) => (
                            <Select.Item key={_id} value={name || ''}>
                              {label}
                            </Select.Item>
                          ))}
                        </Select.Group>
                        <Select.Separator />
                      </div>
                    );
                  })}
                </Select.Content>
              </Select>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={control}
          name={`rules.${index}.operator`}
          render={({ field }) => (
            <Form.Item className="w-2/5 ">
              <Form.Label>Operator</Form.Label>

              <Select value={field.value} onValueChange={field.onChange}>
                <Select.Trigger>
                  <Select.Value placeholder="Select an operator" />
                </Select.Trigger>
                <Select.Content>
                  {operators.map(({ value, label }) => (
                    <Select.Item key={value} value={value}>
                      {label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
              <Form.Message />
            </Form.Item>
          )}
        />

        <Button
          variant="destructive"
          size="icon"
          className="flex-shrink-0 opacity-0 absolute -top-6 right-1 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-in-out"
          onClick={handleRemove}
        >
          <IconTrash size={16} />
        </Button>
      </div>
      <div className="mb-4">
        <Form.Field
          control={control}
          name={`rules.${index}.value`}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Value</Form.Label>

              <PlaceHolderInput
                propertyType={propertyType}
                isDisabled={operators.some((op) => op.value === rule.operator)}
                fieldType={selectedField?.type}
                value={field.value ?? ''}
                onChange={field.onChange}
                additionalAttributes={additionalAttributes}
              />

              <Form.Message />
            </Form.Item>
          )}
        />
      </div>
    </div>
  );
};
