import { Button, Collapsible, Form, Select } from 'erxes-ui';
import { Control } from 'react-hook-form';
import { TourFormValues } from '../constants/formSchema';
import type {
  ITourCustomFieldGroup,
  ITourCustomPostType,
} from '../hooks/useTourCustomFields';
import type { CustomFieldValue } from '../utils/customFields';
import { TourCustomFieldInput } from './TourCustomFieldInput';

export const TourTypeField = ({
  control,
  customTypes,
}: {
  control: Control<TourFormValues>;
  customTypes: ITourCustomPostType[];
}) => {
  if (!customTypes.length) {
    return null;
  }

  return (
    <Form.Field
      control={control}
      name="customTourTypeId"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Tour Type</Form.Label>
          <Form.Control>
            <Select
              value={field.value || ''}
              onValueChange={(value) => field.onChange(value)}
            >
              <Select.Trigger className="w-full">
                <Select.Value placeholder="Select tour type" />
              </Select.Trigger>
              <Select.Content>
                {customTypes.map((type) => (
                  <Select.Item key={type._id} value={type._id}>
                    {type.label || type.code || 'Unnamed type'}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const TourCustomFieldsSection = ({
  fieldGroups,
  getCustomFieldValue,
  updateCustomFieldValue,
}: {
  fieldGroups: ITourCustomFieldGroup[];
  getCustomFieldValue: (fieldId: string) => CustomFieldValue;
  updateCustomFieldValue: (
    fieldId: string,
    value: string | boolean | string[],
  ) => void;
}) => {
  if (!fieldGroups.length) {
    return null;
  }

  return (
    <div className="pt-6 mt-2 space-y-3 border-t">
      <div className="text-sm font-semibold text-foreground">Custom Fields</div>
      {fieldGroups.map((group) => (
        <Collapsible key={group._id} defaultOpen className="group">
          <Collapsible.Trigger asChild>
            <Button variant="secondary" className="justify-start w-full">
              <Collapsible.TriggerIcon />
              {group.label}
            </Button>
          </Collapsible.Trigger>
          <Collapsible.Content className="pt-4">
            <div className="grid grid-cols-1 gap-4">
              {(group.fields || []).map((field) => {
                const fieldId = field._id || field.code;

                if (!fieldId) return null;

                return (
                  <div key={fieldId} className="flex flex-col gap-2">
                    <Form.Label
                      className="text-sm font-medium"
                      htmlFor={`tour-custom-field-${fieldId}`}
                    >
                      {field.label}
                      {field.isRequired && (
                        <span className="ml-1 text-destructive">*</span>
                      )}
                    </Form.Label>
                    <TourCustomFieldInput
                      field={{ ...field, _id: fieldId }}
                      value={getCustomFieldValue(fieldId)}
                      onChange={(value) =>
                        updateCustomFieldValue(fieldId, value)
                      }
                    />
                  </div>
                );
              })}
            </div>
          </Collapsible.Content>
        </Collapsible>
      ))}
    </div>
  );
};
