import { Form } from 'erxes-ui';
import { UseFormReturn, Controller } from 'react-hook-form';
import {
  CustomFieldInput,
  CustomFieldValue,
  FieldDefinition,
} from '../../posts/CustomFieldInput';
import { ReorderableCustomFields } from '../../custom-fields/components/ReorderableCustomFields';
import { IPageFormData } from '../types/pageTypes';

interface CustomFieldDataItem {
  field: string;
  value: CustomFieldValue;
}

type CustomFieldsData = CustomFieldDataItem[];

export interface FieldGroup {
  _id: string;
  label: string;
  code?: string;
  clientPortalId?: string;
  customPostTypeIds?: string[];
  customPostTypes?: Array<{
    _id: string;
    code: string;
    label: string;
    pluralLabel: string;
  }>;
  fields?: FieldDefinition[];
}

interface PageCustomFieldsSectionProps {
  fieldGroups: FieldGroup[];
  websiteId?: string;
  form: UseFormReturn<IPageFormData>;
}

const updateCustomFieldsData = (
  currentData: CustomFieldsData,
  fieldId: string,
  value: CustomFieldValue,
): CustomFieldsData => {
  const existingIndex = currentData.findIndex(
    (item: CustomFieldDataItem) => item.field === fieldId,
  );

  if (existingIndex >= 0) {
    const updated = [...currentData];
    updated[existingIndex] = {
      field: fieldId,
      value,
    };
    return updated;
  } else {
    return [...currentData, { field: fieldId, value }];
  }
};

const getFieldValue = (
  currentData: CustomFieldsData,
  fieldId: string,
): CustomFieldValue | undefined => {
  return currentData.find((item: CustomFieldDataItem) => item.field === fieldId)
    ?.value;
};

interface CustomFieldControllerProps {
  field: FieldDefinition;
  fieldValue: CustomFieldValue | undefined;
  form: UseFormReturn<IPageFormData>;
}

const CustomFieldController = ({
  field,
  fieldValue,
  form,
}: CustomFieldControllerProps) => (
  <Controller
    control={form.control}
    name={`customFieldsData`}
    render={({ field: controllerField }) => (
      <CustomFieldInput
        field={field}
        value={fieldValue}
        onChange={(value) => {
          const currentData: CustomFieldsData = controllerField.value || [];
          const updated = updateCustomFieldsData(currentData, field._id, value);
          controllerField.onChange(updated);
        }}
      />
    )}
  />
);

export const PageCustomFieldsSection = ({
  fieldGroups,
  websiteId,
  form,
}: PageCustomFieldsSectionProps) => (
  <ReorderableCustomFields
    fieldGroups={fieldGroups}
    websiteId={websiteId}
    renderField={(field) => (
      <Form.Field
        control={form.control}
        name={`customFieldsData`}
        render={({ field: formField }) => {
          const currentData: CustomFieldsData = formField.value || [];
          const fieldValue = getFieldValue(currentData, field._id);

          return (
            <div className="flex flex-col gap-2">
              <Form.Label
                className="text-sm font-medium"
                htmlFor={`custom-field-${field._id}`}
              >
                {field.label}
                {field.isRequired && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </Form.Label>
              <CustomFieldController
                field={field}
                fieldValue={fieldValue}
                form={form}
              />
              <Form.Message />
            </div>
          );
        }}
      />
    )}
  />
);
