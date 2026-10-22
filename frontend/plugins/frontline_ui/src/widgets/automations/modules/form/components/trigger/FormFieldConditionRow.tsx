import { IconTrash } from '@tabler/icons-react';
import { Button, Form, Input, Select } from 'erxes-ui';
import { Control, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  AUTOMATION_CONDITION_OPERATORS,
  AUTOMATION_UNARY_OPERATORS,
} from 'ui-modules';
import type { TFormTriggerField } from '../../hooks/useFormSubmittedTriggerForm';
import type { TFormSubmittedTriggerForm } from '../../states/formSubmittedTriggerForm';

export const FormFieldConditionRow = ({
  control,
  index,
  fields,
  onRemove,
}: {
  control: Control<TFormSubmittedTriggerForm>;
  index: number;
  fields: TFormTriggerField[];
  onRemove: () => void;
}) => {
  const { t } = useTranslation('frontline');
  const [fieldId, operator] = useWatch({
    control,
    name: [`conditions.${index}.fieldId`, `conditions.${index}.operator`],
  });

  const options = fields.find((field) => field._id === fieldId)?.options || [];
  const isUnary = AUTOMATION_UNARY_OPERATORS.includes(operator);

  return (
    <div className="flex items-start gap-2 rounded-md border p-2">
      <div className="grid flex-1 grid-cols-3 gap-2">
        <Form.Field
          control={control}
          name={`conditions.${index}.fieldId`}
          render={({ field }) => (
            <Form.Item>
              <Select value={field.value} onValueChange={field.onChange}>
                <Form.Control>
                  <Select.Trigger>
                    <Select.Value
                      placeholder={t('form-trigger-field', 'Field')}
                    />
                  </Select.Trigger>
                </Form.Control>
                <Select.Content>
                  {fields.map((formField) => (
                    <Select.Item key={formField._id} value={formField._id}>
                      {formField.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={control}
          name={`conditions.${index}.operator`}
          render={({ field }) => (
            <Form.Item>
              <Select value={field.value} onValueChange={field.onChange}>
                <Form.Control>
                  <Select.Trigger>
                    <Select.Value
                      placeholder={t('form-trigger-operator', 'Operator')}
                    />
                  </Select.Trigger>
                </Form.Control>
                <Select.Content>
                  {AUTOMATION_CONDITION_OPERATORS.map((option) => (
                    <Select.Item key={option.value} value={option.value}>
                      {option.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
              <Form.Message />
            </Form.Item>
          )}
        />
        {!isUnary && (
          <Form.Field
            control={control}
            name={`conditions.${index}.value`}
            render={({ field }) => (
              <Form.Item>
                {options.length ? (
                  <Select
                    value={field.value || undefined}
                    onValueChange={field.onChange}
                  >
                    <Form.Control>
                      <Select.Trigger>
                        <Select.Value
                          placeholder={t('form-trigger-value', 'Value')}
                        />
                      </Select.Trigger>
                    </Form.Control>
                    <Select.Content>
                      {options.map((option) => (
                        <Select.Item key={option} value={option}>
                          {option}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                ) : (
                  <Form.Control>
                    <Input
                      {...field}
                      value={field.value || ''}
                      placeholder={t('form-trigger-value', 'Value')}
                    />
                  </Form.Control>
                )}
                <Form.Message />
              </Form.Item>
            )}
          />
        )}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-destructive"
        onClick={onRemove}
        aria-label={t('form-trigger-remove-condition', 'Remove condition')}
      >
        <IconTrash />
      </Button>
    </div>
  );
};
