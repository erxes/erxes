import { Button, Sheet, Input, MultipleSelector } from 'erxes-ui';
import { useForm, Controller } from 'react-hook-form';
import { useEffect } from 'react';
import { ICustomFieldGroup } from '../../types/customFieldTypes';

interface FieldGroupDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editingGroup: ICustomFieldGroup | null;
  customTypes: any[];
}

export function FieldGroupDrawer({
  isOpen,
  onClose,
  onSubmit,
  editingGroup,
  customTypes,
}: FieldGroupDrawerProps) {
  const groupForm = useForm({
    defaultValues: {
      label: '',
      code: '',
      customPostTypeIds: [] as string[],
    },
  });

  useEffect(() => {
    if (editingGroup) {
      groupForm.reset({
        label: editingGroup.label,
        code: editingGroup.code || '',
        customPostTypeIds: editingGroup.customPostTypeIds || [],
      });
    } else {
      groupForm.reset({
        label: '',
        code: '',
        customPostTypeIds: [],
      });
    }
  }, [editingGroup, groupForm, isOpen]);

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Sheet.View className="sm:max-w-lg p-0">
        <Sheet.Header>
          <Sheet.Title>
            {editingGroup ? 'Edit Field Group' : 'Add Field Group'}
          </Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="overflow-y-auto">
          <form
            onSubmit={groupForm.handleSubmit(onSubmit)}
            className="space-y-4 p-6"
          >
            <div>
              <label className="block text-sm font-medium mb-2">Label *</label>
              <Input
                {...groupForm.register('label', {
                  required: 'Label is required',
                })}
                placeholder="Enter label"
              />
              {groupForm.formState.errors.label && (
                <p className="text-sm text-red-500 mt-1">
                  {groupForm.formState.errors.label.message as string}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Code</label>
              <Input
                {...groupForm.register('code')}
                placeholder="Enter code (e.g., product_info)"
              />
              <p className="text-xs text-gray-500 mt-1">
                Unique identifier for programmatic access
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Custom Post Types
              </label>
              {customTypes.length === 0 ? (
                <div className="text-sm text-gray-500 p-3 border rounded bg-gray-50">
                  No custom types available. Create custom types first to assign
                  them to field groups.
                </div>
              ) : (
                <>
                  <Controller
                    name="customPostTypeIds"
                    control={groupForm.control}
                    render={({ field }) => {
                      const options = customTypes.map((type: any) => ({
                        label: `${type.label} (${type.code})`,
                        value: type._id,
                      }));
                      const selectedOptions = options.filter((opt: any) =>
                        (field.value || []).includes(opt.value),
                      );
                      return (
                        <MultipleSelector
                          value={selectedOptions as any}
                          options={options as any}
                          placeholder="Select custom post types"
                          emptyIndicator="No types found"
                          onChange={(selected: any[]) =>
                            field.onChange(selected.map((s) => s.value))
                          }
                        />
                      );
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Select which custom post types this field group applies to.
                    Leave empty to apply to all types.
                  </p>
                </>
              )}
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {editingGroup ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
}
