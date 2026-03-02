import { Form, Button, Collapsible } from 'erxes-ui';
import { CustomFieldInput } from '../../CustomFieldInput';

interface CustomFieldsSectionProps {
  fieldGroups: any[];
  getCustomFieldValue: (fieldId: string) => any;
  updateCustomFieldValue: (fieldId: string, value: any) => void;
}

export const CustomFieldsSection = ({
  fieldGroups,
  getCustomFieldValue,
  updateCustomFieldValue,
}: CustomFieldsSectionProps) => (
  <div className="space-y-3 mt-6 pt-6 border-t">
    <div className="text-sm font-semibold text-foreground">Custom Fields</div>
    {fieldGroups.map((group: any) => (
      <Collapsible key={group._id} defaultOpen className="group">
        <Collapsible.Trigger asChild>
          <Button variant="secondary" className="w-full justify-start">
            <Collapsible.TriggerIcon />
            {group.label}
          </Button>
        </Collapsible.Trigger>
        <Collapsible.Content className="pt-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {(group.fields || []).map((field: any) => (
              <div key={field._id} className="flex flex-col gap-2">
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
                  onChange={(value: any) =>
                    updateCustomFieldValue(field._id, value)
                  }
                />
              </div>
            ))}
          </div>
        </Collapsible.Content>
      </Collapsible>
    ))}
  </div>
);
