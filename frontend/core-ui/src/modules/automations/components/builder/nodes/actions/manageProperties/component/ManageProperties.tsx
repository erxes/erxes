import { IconTrash } from '@tabler/icons-react';
import { Button, Form, Label, Select } from 'erxes-ui';
import { useEffect } from 'react';
import {
  IActionProps,
  PlaceHolderInput,
  IField as UIModuleField,
} from 'ui-modules';
import { useManagePropertyRule } from '../hooks/useManagePropertyRule';
import { useManagePropertySidebarContent } from '../hooks/useManagePropertySidebarContent';

interface IField extends Partial<UIModuleField> {
  group?: string;
  groupDetail?: {
    name: string;
  };
}

interface IOperator {
  value: string;
  label: string;
  noInput?: boolean;
}

interface IRule {
  field: string;
  operator: string;
  value?: any;
}

interface IConfig {
  module?: string;
  rules: IRule[];
}

interface RuleProps {
  rule: IRule;
  propertyType: string;
  selectedField?: IField;
  remove: () => void;
  handleChange: (name: string, value: any) => void;
  groups: Record<string, IField[]>;
  operatorOptions: IOperator[];
}

const Rule = ({
  rule,
  remove,
  handleChange,
  groups,
  selectedField,
  operatorOptions,
  propertyType,
}: RuleProps) => {
  return (
    <div className="border rounded p-4  mb-2 relative group">
      <div className="flex flex-row gap-4 mb-4  items-end">
        <div className="w-3/5">
          <Label>Field</Label>

          <Select
            value={rule.field}
            onValueChange={(value) => handleChange('field', value)}
          >
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
        </div>

        <div className="w-2/5 ">
          <Label>Operator</Label>

          <Select
            value={rule.operator}
            onValueChange={(value) => handleChange('operator', value)}
          >
            <Select.Trigger>
              <Select.Value placeholder="Select an operator" />
            </Select.Trigger>
            <Select.Content>
              {operatorOptions.map(({ value, label }) => (
                <Select.Item key={value} value={value}>
                  {label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>
        <Button
          variant="destructive"
          size="icon"
          className="flex-shrink-0 opacity-0 absolute -top-6 right-1 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-in-out"
          onClick={remove}
        >
          <IconTrash size={16} />
        </Button>
      </div>
      <div className="mb-4">
        <div>
          <Label>Value</Label>

          <PlaceHolderInput
            propertyType={propertyType}
            isDisabled={operatorOptions.some(
              (op) => op.value === rule.operator && op.noInput,
            )}
            fieldType={selectedField?.type}
            value={rule.value}
            onChange={(value) => handleChange('value', value)}
          />
        </div>
      </div>
    </div>
  );
};

const SideBarContent = ({
  currentActionIndex,
  currentAction,
}: IActionProps) => {
  const {
    setValue,
    propertyTypes,
    propertyType,
    fieldName,
    control,
    addRule,
    rules,
    fields,
    groups,
    module,
  } = useManagePropertySidebarContent(currentActionIndex, currentAction);

  useEffect(() => {
    if (module && module !== propertyType) {
      setValue(`${fieldName}.module`, propertyType);
    }
  }, [module, propertyType]);

  return (
    <div className="w-[500px] p-4">
      <Form.Field
        control={control}
        name={`${fieldName}.module`}
        render={({ field }) => (
          <Form.Item>
            <Label>Property Type</Label>
            <Select
              value={field.value || propertyType}
              onValueChange={field.onChange}
            >
              <Select.Trigger>
                <Select.Value placeholder="Select a property type" />
              </Select.Trigger>
              <Select.Content>
                {propertyTypes.map(({ value, description }) => (
                  <Select.Item key={value} value={value}>
                    {description}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </Form.Item>
        )}
      />

      <div className="py-4">
        <Label className="pb-4">Rules</Label>

        {rules.map((rule, index) => {
          const { handleChange, handleRemove, selectedField, operators } =
            useManagePropertyRule(
              rules,
              index,
              fieldName,
              setValue,
              fields,
              rule,
            );

          const updatedProps = {
            rule,
            handleChange,
            remove: handleRemove,
            groups,
            propertyType,
            selectedField,
            operatorOptions: operators,
          };

          return <Rule key={index} {...updatedProps} />;
        })}

        <Button className="w-full" variant="secondary" onClick={addRule}>
          <Label>Add Rule</Label>
        </Button>
      </div>
    </div>
  );
};

export const NodeContent = ({ config }: any) => {
  const { module, rules = [] } = config || {};
  return (
    <>
      <div className="flex text-slate-600 text-xs ">
        <span className="font-mono">Content Type: </span>
        <span className="font-mono capitalize">{`${
          (module || '').split(':')[1]
        }`}</span>
      </div>
      {rules
        .filter(({ field, value }: any) => field && value)
        .map(({ field, value }: any, index: number) => (
          <div
            key={index}
            className="flex justify-between text-slate-600 text-xs w-max"
          >
            <span className="font-mono">{field}:</span>
            <span className="font-mono">{value}</span>
          </div>
        ))}
    </>
  );
};

export const ManageProperties = {
  SideBarContent,
  NodeContent,
};
