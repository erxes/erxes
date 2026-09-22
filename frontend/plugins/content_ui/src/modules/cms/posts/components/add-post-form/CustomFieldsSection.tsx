import { Form } from 'erxes-ui';
import {
  CustomFieldInput,
  CustomFieldValue,
  FieldDefinition,
} from '../../CustomFieldInput';
import { ReorderableCustomFields } from '../../../custom-fields/components/ReorderableCustomFields';

export interface FieldGroup {
  _id: string;
  label: string;
  fields?: FieldDefinition[];
}

interface CustomFieldsSectionProps {
  fieldGroups: FieldGroup[];
  websiteId?: string;
  getCustomFieldValue: (fieldId: string) => CustomFieldValue;
  updateCustomFieldValue: (
    fieldId: string,
    value: string | boolean | string[],
  ) => void;
}

export const CustomFieldsSection = ({
  fieldGroups,
  websiteId,
  getCustomFieldValue,
  updateCustomFieldValue,
}: CustomFieldsSectionProps) => (
  <ReorderableCustomFields
    fieldGroups={fieldGroups}
    websiteId={websiteId}
    renderField={(field) => (
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
        <CustomFieldInput
          field={field}
          value={getCustomFieldValue(field._id)}
          onChange={(value) => updateCustomFieldValue(field._id, value)}
        />
      </div>
    )}
  />
);
