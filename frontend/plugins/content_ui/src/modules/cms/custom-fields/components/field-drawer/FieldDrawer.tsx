import { Button, Sheet, Input, Select, Checkbox } from 'erxes-ui';
import { useForm, Controller } from 'react-hook-form';
import { useEffect } from 'react';
import {
  ICustomField,
  FieldType,
  FIELD_TYPES,
} from '../../types/customFieldTypes';

interface FieldDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editingField: ICustomField | null;
}

export function FieldDrawer({
  isOpen,
  onClose,
  onSubmit,
  editingField,
}: FieldDrawerProps) {
  const fieldForm = useForm({
    defaultValues: {
      label: '',
      code: '',
      type: 'text' as FieldType,
      description: '',
      isRequired: false,
      options: '',
    },
  });

  useEffect(() => {
    if (editingField) {
      fieldForm.reset({
        label: editingField.label,
        code: editingField.code,
        type: editingField.type,
        description: editingField.description || '',
        isRequired: editingField.isRequired || false,
        options: editingField.options ? editingField.options.join(', ') : '',
      });
    } else {
      fieldForm.reset({
        label: '',
        code: '',
        type: 'text',
        description: '',
        isRequired: false,
        options: '',
      });
    }
  }, [editingField, fieldForm, isOpen]);

  const selectedFieldType = fieldForm.watch('type');
  const needsOptions = ['select', 'radio'].includes(selectedFieldType);

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Sheet.View className="sm:max-w-lg p-0">
        <Sheet.Header>
          <Sheet.Title>{editingField ? 'Edit Field' : 'Add Field'}</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="overflow-y-auto">
          <form
            onSubmit={fieldForm.handleSubmit(onSubmit)}
            className="space-y-4 p-6"
          >
            <div>
              <label className="block text-sm font-medium mb-2">Label *</label>
              <Input
                {...fieldForm.register('label', {
                  required: 'Label is required',
                })}
                placeholder="Enter field label"
              />
              {fieldForm.formState.errors.label && (
                <p className="text-sm text-red-500 mt-1">
                  {fieldForm.formState.errors.label.message as string}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Code</label>
              <Input
                {...fieldForm.register('code')}
                placeholder="Enter code (e.g., product_price)"
              />
              <p className="text-xs text-gray-500 mt-1">
                Unique identifier for this field
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Field Type *
              </label>
              <Controller
                name="type"
                control={fieldForm.control}
                rules={{ required: 'Type is required' }}
                render={({ field }) => (
                  <Select
                    value={field.value || ''}
                    onValueChange={field.onChange}
                  >
                    <Select.Trigger className="w-full">
                      <Select.Value placeholder="Select field type" />
                    </Select.Trigger>
                    <Select.Content>
                      {FIELD_TYPES.map((type) => (
                        <Select.Item key={type.value} value={type.value}>
                          {type.label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                )}
              />
              {fieldForm.formState.errors.type && (
                <p className="text-sm text-red-500 mt-1">
                  {fieldForm.formState.errors.type.message as string}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <Input
                {...fieldForm.register('description')}
                placeholder="Optional description"
              />
            </div>

            {needsOptions && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Options *
                </label>
                <Input
                  {...fieldForm.register('options', {
                    required: needsOptions
                      ? 'Options are required for this field type'
                      : false,
                  })}
                  placeholder="Option 1, Option 2, Option 3"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Comma-separated list of options
                </p>
                {fieldForm.formState.errors.options && (
                  <p className="text-sm text-red-500 mt-1">
                    {fieldForm.formState.errors.options.message as string}
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center gap-2">
              <Controller
                name="isRequired"
                control={fieldForm.control}
                render={({ field }) => (
                  <Checkbox
                    id="isRequired"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <label
                htmlFor="isRequired"
                className="text-sm font-medium cursor-pointer"
              >
                Required field
              </label>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {editingField ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
}
