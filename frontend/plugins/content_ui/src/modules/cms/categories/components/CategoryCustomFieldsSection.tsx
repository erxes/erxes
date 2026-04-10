import { Form, Button, Collapsible } from 'erxes-ui';
import {
  CustomFieldInput,
  CustomFieldValue,
  FieldDefinition,
} from '../../posts/CustomFieldInput';
import { UseFormReturn, FieldPath, FieldValues } from 'react-hook-form';

export interface FieldGroup {
  _id: string;
  label: string;
  fields?: FieldDefinition[];
}

interface CategoryCustomFieldsSectionProps<
  T extends FieldValues = FieldValues,
> {
  fieldGroups: FieldGroup[];
  getCustomFieldValue: (fieldId: string) => CustomFieldValue;
  updateCustomFieldValue: (
    fieldId: string,
    value: string | boolean | string[],
  ) => void;
  form: UseFormReturn<T>;
  customFieldErrors?: Record<string, string>;
}

export const CategoryCustomFieldsSection = <
  T extends FieldValues = FieldValues,
>({
  fieldGroups,
  getCustomFieldValue,
  updateCustomFieldValue,
  form,
  customFieldErrors = {},
}: CategoryCustomFieldsSectionProps<T>) => (
  <div className="space-y-3 mt-6 pt-6 border-t">
    <div className="text-sm font-semibold text-foreground">Custom Fields</div>
    {fieldGroups.map((group) => (
      <Collapsible key={group._id} defaultOpen className="group">
        <Collapsible.Trigger asChild>
          <Button variant="secondary" className="w-full justify-start">
            <Collapsible.TriggerIcon />
            {group.label}
          </Button>
        </Collapsible.Trigger>
        <Collapsible.Content className="pt-4">
          <div className="grid gap-4 grid-cols-1">
            {(group.fields || []).map((field) => {
              const fieldName = `customFields.${field._id}` as FieldPath<T>;
              const error =
                customFieldErrors[field._id] ||
                (form.formState.errors[fieldName]?.message as string);

              return (
                <div key={field._id} className="flex flex-col gap-2">
                  <Form.Label
                    className={`text-sm font-medium ${
                      error ? 'text-destructive' : ''
                    }`}
                    htmlFor={`custom-field-${field._id}`}
                  >
                    {field.label}
                    {field.isRequired && (
                      <span className="text-destructive ml-1">*</span>
                    )}
                  </Form.Label>
                  <CustomFieldInput
                    field={field}
                    value={getCustomFieldValue(field._id)}
                    onChange={(value) => {
                      updateCustomFieldValue(field._id, value);
                      // Clear error when user starts typing
                      if (error) {
                        form.clearErrors(fieldName);
                      }
                    }}
                  />
                  {error && (
                    <Form.Message className="text-sm font-medium text-destructive">
                      {error}
                    </Form.Message>
                  )}
                </div>
              );
            })}
          </div>
        </Collapsible.Content>
      </Collapsible>
    ))}
  </div>
);
