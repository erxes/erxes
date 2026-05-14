import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { Button, Form, Input, Select } from 'erxes-ui';
import { FIELDS_COMBINED_BY_CONTENT_TYPE } from 'ui-modules';
import { useQuery } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { IconPlus, IconTrash } from '@tabler/icons-react';

type CombinedField = {
  name: string;
  label: string;
  type?: string;
  selectOptions?: { label: string; value: string }[];
  options?: { label: string; value: string }[];
};

const STRING_OPERATORS = [
  { value: 'is', label: 'is' },
  { value: 'isNot', label: 'is not' },
  { value: 'startsWith', label: 'starts with' },
  { value: 'endsWith', label: 'ends with' },
  { value: 'contains', label: 'contains' },
  { value: 'doesNotContain', label: 'does not contain' },
  { value: 'isUnknown', label: 'is unknown' },
  { value: 'hasAnyValue', label: 'has any value' },
];

const NUMBER_OPERATORS = [
  { value: 'greaterThan', label: 'greater than' },
  { value: 'lessThan', label: 'less than' },
  { value: 'is', label: 'is' },
  { value: 'isNot', label: 'is not' },
  { value: 'isUnknown', label: 'is unknown' },
  { value: 'hasAnyValue', label: 'has any value' },
];

const DATE_OPERATORS = [
  { value: 'dateGreaterThan', label: 'greater than' },
  { value: 'dateLessThan', label: 'less than' },
];

const getOperators = (fieldType?: string) => {
  if (fieldType === 'number') return NUMBER_OPERATORS;
  if (fieldType === 'date') return DATE_OPERATORS;
  return STRING_OPERATORS;
};

const LogicValueInput = ({
  field,
  value,
  onChange,
}: {
  field?: CombinedField;
  value: string;
  onChange: (v: string) => void;
}) => {
  const opts = field?.selectOptions || field?.options;

  if (field?.type === 'select' && opts?.length) {
    return (
      <Select value={value} onValueChange={onChange}>
        <Select.Trigger>
          <Select.Value placeholder="Select value" />
        </Select.Trigger>
        <Select.Content>
          {opts.map((opt) => (
            <Select.Item key={opt.value} value={opt.value}>
              {opt.label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    );
  }

  if (field?.type === 'date') {
    return (
      <Input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Value"
    />
  );
};

export const PropertyFormLogicFields = ({
  form,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
}) => {
  const { type: contentType } = useParams<{ type: string }>();

  const { data } = useQuery<{ fieldsCombinedByContentType: CombinedField[] }>(
    FIELDS_COMBINED_BY_CONTENT_TYPE,
    {
      variables: { contentType },
      skip: !contentType,
    },
  );

  const availableFields: CombinedField[] =
    data?.fieldsCombinedByContentType || [];

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'logics',
  });

  const isEnabled = fields.length > 0;

  const handleEnable = () => {
    append({ field: '', operator: '', value: '', action: 'show' });
  };

  const handleDisable = () => {
    form.setValue('logics', []);
  };

  if (!isEnabled) {
    return (
      <Button type="button" variant="outline" size="sm" onClick={handleEnable}>
        Enable Logic
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-3 border rounded-md p-3">
      <div className="flex items-center justify-between">
        <Form.Label className="text-sm font-medium">Field Logic</Form.Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground text-xs"
          onClick={handleDisable}
        >
          Disable
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {fields.map((logicField, index) => {
          const watchedField = form.watch(`logics.${index}.field`);
          const referencedField = availableFields.find(
            (f) => f.name === watchedField,
          );
          const operators = getOperators(referencedField?.type);

          return (
            <div
              key={logicField.id}
              className="grid grid-cols-2 gap-2 items-start border rounded p-2"
            >
              <Form.Field
                name={`logics.${index}.field`}
                render={({ field }) => (
                  <Form.Item className="col-span-1">
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue(`logics.${index}.operator`, '');
                        form.setValue(`logics.${index}.value`, '');
                      }}
                    >
                      <Form.Control>
                        <Select.Trigger>
                          <Select.Value placeholder="Select field" />
                        </Select.Trigger>
                      </Form.Control>
                      <Select.Content>
                        {availableFields.map((f) => (
                          <Select.Item key={f.name} value={f.name}>
                            {f.label || f.name}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  </Form.Item>
                )}
              />

              <Form.Field
                name={`logics.${index}.operator`}
                render={({ field }) => (
                  <Form.Item className="col-span-1">
                    <Select value={field.value} onValueChange={field.onChange}>
                      <Form.Control>
                        <Select.Trigger>
                          <Select.Value placeholder="Operator" />
                        </Select.Trigger>
                      </Form.Control>
                      <Select.Content>
                        {operators.map((op) => (
                          <Select.Item key={op.value} value={op.value}>
                            {op.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  </Form.Item>
                )}
              />

              <Form.Field
                name={`logics.${index}.value`}
                render={({ field }) => (
                  <Form.Item className="col-span-1">
                    <Form.Control>
                      <LogicValueInput
                        field={referencedField}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </Form.Control>
                  </Form.Item>
                )}
              />

              <Form.Field
                name={`logics.${index}.action`}
                render={({ field }) => (
                  <Form.Item className="col-span-1">
                    <Select value={field.value} onValueChange={field.onChange}>
                      <Form.Control>
                        <Select.Trigger>
                          <Select.Value placeholder="Action" />
                        </Select.Trigger>
                      </Form.Control>
                      <Select.Content>
                        <Select.Item value="show">Show</Select.Item>
                        <Select.Item value="hide">Hide</Select.Item>
                      </Select.Content>
                    </Select>
                  </Form.Item>
                )}
              />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="col-span-2 ml-auto hover:text-destructive"
                onClick={() => remove(index)}
              >
                <IconTrash size={14} />
              </Button>
            </div>
          );
        })}

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={() =>
            append({ field: '', operator: '', value: '', action: 'show' })
          }
        >
          <IconPlus size={14} />
          Add Logic Rule
        </Button>
      </div>
    </div>
  );
};
