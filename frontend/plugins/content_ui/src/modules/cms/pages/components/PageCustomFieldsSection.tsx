import { Form, Button, Collapsible } from 'erxes-ui';
import { UseFormReturn, Controller } from 'react-hook-form';
import {
  CustomFieldInput,
  CustomFieldValue,
  FieldDefinition,
} from '../../posts/CustomFieldInput';
import { IPageFormData } from '../types/pageTypes';

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
  form: UseFormReturn<IPageFormData>;
}

export const PageCustomFieldsSection = ({
  fieldGroups,
  form,
}: PageCustomFieldsSectionProps) => (
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
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {(group.fields || []).map((field) => (
              <Form.Field
                key={field._id}
                control={form.control}
                name={`customFieldsData`}
                render={({ field: formField }) => {
                  const currentData = formField.value || [];
                  const fieldValue = currentData.find(
                    (item: any) => item?.field === field._id,
                  )?.value;

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
                      <Controller
                        control={form.control}
                        name={`customFieldsData`}
                        render={({ field: controllerField }) => (
                          <CustomFieldInput
                            field={field}
                            value={fieldValue}
                            onChange={(value) => {
                              const currentData = controllerField.value || [];
                              const existingIndex = currentData.findIndex(
                                (item: any) => item.field === field._id,
                              );

                              let updated;
                              if (existingIndex >= 0) {
                                updated = [...currentData];
                                updated[existingIndex] = {
                                  field: field._id,
                                  value,
                                };
                              } else {
                                updated = [
                                  ...currentData,
                                  { field: field._id, value },
                                ];
                              }

                              controllerField.onChange(updated);
                            }}
                          />
                        )}
                      />
                      <Form.Message />
                    </div>
                  );
                }}
              />
            ))}
          </div>
        </Collapsible.Content>
      </Collapsible>
    ))}
  </div>
);
