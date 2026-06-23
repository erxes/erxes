import { Form } from 'erxes-ui';
import {
  CustomFieldInput,
  CustomFieldValue,
  FieldDefinition,
} from '../../posts/CustomFieldInput';
import { ReorderableCustomFields } from '../../custom-fields/components/ReorderableCustomFields';
import { UseFormReturn, FieldValues } from 'react-hook-form';

export interface FieldGroup {
  _id: string;
  label: string;
  fields?: FieldDefinition[];
}

interface CategoryCustomFieldsSectionProps<
  T extends FieldValues & { customFieldsData?: any },
> {
  fieldGroups: FieldGroup[];
  websiteId?: string;
  getCustomFieldValue: (fieldId: string) => CustomFieldValue;
  updateCustomFieldValue: (
    fieldId: string,
    value: string | boolean | string[],
  ) => void;
  form: UseFormReturn<T>;
  customFieldErrors?: Record<string, string>;
}

const getCustomFieldsDataError = (
  errors: Record<string, any>,
  fieldId: string,
): string | undefined => {
  const customFieldsDataErrors = errors.customFieldsData;
  const fieldError = customFieldsDataErrors?.[fieldId];

  return typeof fieldError?.message === 'string'
    ? fieldError.message
    : undefined;
};

export const CategoryCustomFieldsSection = <
  T extends FieldValues & { customFieldsData?: any },
>({
  fieldGroups,
  websiteId,
  getCustomFieldValue,
  updateCustomFieldValue,
  form,
  customFieldErrors = {},
}: CategoryCustomFieldsSectionProps<T>) => (
  <ReorderableCustomFields
    fieldGroups={fieldGroups}
    websiteId={websiteId}
    renderField={(field) => {
      const error =
        customFieldErrors[field._id] ||
        getCustomFieldsDataError(
          form.formState.errors as Record<string, any>,
          field._id,
        );

      return (
        <div className="flex flex-col gap-2">
          <Form.Label
            className={`text-sm font-medium ${error ? 'text-destructive' : ''}`}
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
                form.clearErrors(`customFieldsData.${field._id}` as any);
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
    }}
  />
);
