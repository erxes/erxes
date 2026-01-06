import {
  Button,
  Sheet,
  Input,
  toast,
  Dialog,
  Select,
  Checkbox,
  MultipleSelector,
} from 'erxes-ui';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconSettings,
  IconChevronRight,
} from '@tabler/icons-react';
import { useState } from 'react';
import { CmsLayout } from './CmsLayout';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { useForm, Controller } from 'react-hook-form';
import {
  CMS_CUSTOM_FIELD_GROUPS,
  CMS_CUSTOM_FIELD_GROUP_ADD,
  CMS_CUSTOM_FIELD_GROUP_EDIT,
  CMS_CUSTOM_FIELD_GROUP_REMOVE,
  CMS_CUSTOM_POST_TYPES,
} from '../../graphql/queries';

type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'email'
  | 'url'
  | 'date'
  | 'checkbox'
  | 'select'
  | 'radio'
  | 'file'
  | 'image';

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'number', label: 'Number' },
  { value: 'email', label: 'Email' },
  { value: 'url', label: 'URL' },
  { value: 'date', label: 'Date' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'select', label: 'Select' },
  { value: 'radio', label: 'Radio' },
  { value: 'file', label: 'File' },
  { value: 'image', label: 'Image' },
];

export function CustomFields() {
  const { websiteId } = useParams();
  const [isGroupDrawerOpen, setIsGroupDrawerOpen] = useState(false);
  const [isFieldDrawerOpen, setIsFieldDrawerOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [editingGroup, setEditingGroup] = useState<any>(null);
  const [editingField, setEditingField] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'group' | 'field';
    id: string;
  } | null>(null);

  const { data, loading, refetch } = useQuery(CMS_CUSTOM_FIELD_GROUPS, {
    variables: { clientPortalId: websiteId },
    skip: !websiteId,
  });

  const { data: customTypesData } = useQuery(CMS_CUSTOM_POST_TYPES, {
    variables: { clientPortalId: websiteId },
    skip: !websiteId,
  });

  const [addGroup] = useMutation(CMS_CUSTOM_FIELD_GROUP_ADD, {
    onCompleted: () => {
      toast({ title: 'Success', description: 'Field group created!' });
      groupForm.reset();
      refetch();
      setIsGroupDrawerOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const [editGroup] = useMutation(CMS_CUSTOM_FIELD_GROUP_EDIT, {
    onCompleted: () => {
      toast({ title: 'Success', description: 'Field group updated!' });
      groupForm.reset();
      refetch();
      setIsGroupDrawerOpen(false);
      setEditingGroup(null);
      if (selectedGroup) {
        setSelectedGroup(null);
        setTimeout(() => refetch(), 100);
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const [removeGroup] = useMutation(CMS_CUSTOM_FIELD_GROUP_REMOVE, {
    onCompleted: () => {
      toast({ title: 'Success', description: 'Field group deleted!' });
      refetch();
      setDeleteConfirm(null);
      if (selectedGroup?._id === deleteConfirm?.id) {
        setSelectedGroup(null);
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const groupForm = useForm({
    defaultValues: {
      label: '',
      code: '',
      customPostTypeIds: [] as string[],
    },
  });

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

  const handleGroupSubmit = (data: any) => {
    const input = {
      label: data.label,
      code: data.code,
      clientPortalId: websiteId,
      customPostTypeIds: data.customPostTypeIds || [],
      fields: editingGroup?.fields || [],
    };

    if (editingGroup) {
      editGroup({
        variables: {
          _id: editingGroup._id,
          input,
        },
      });
    } else {
      addGroup({
        variables: {
          input,
        },
      });
    }
  };

  const handleFieldSubmit = (data: any) => {
    if (!selectedGroup) return;

    const newField = {
      _id: editingField?._id || `field_${Date.now()}`,
      label: data.label,
      code: data.code,
      type: data.type,
      description: data.description,
      isRequired: data.isRequired,
      options: data.options
        ? data.options.split(',').map((o: string) => o.trim())
        : [],
    };

    const currentFields = Array.isArray(selectedGroup.fields)
      ? selectedGroup.fields
      : [];
    let updatedFields;

    if (editingField) {
      updatedFields = currentFields.map((f: any) =>
        f._id === editingField._id ? newField : f,
      );
    } else {
      updatedFields = [...currentFields, newField];
    }

    editGroup({
      variables: {
        _id: selectedGroup._id,
        input: {
          label: selectedGroup.label,
          code: selectedGroup.code,
          clientPortalId: websiteId,
          customPostTypeIds: selectedGroup.customPostTypeIds || [],
          fields: updatedFields,
        },
      },
      onCompleted: () => {
        toast({
          title: 'Success',
          description: editingField ? 'Field updated!' : 'Field created!',
        });
        fieldForm.reset();
        setIsFieldDrawerOpen(false);
        setEditingField(null);

        const updatedGroup = { ...selectedGroup, fields: updatedFields };
        setSelectedGroup(updatedGroup);
      },
    });
  };

  const handleEditGroup = (group: any) => {
    setEditingGroup(group);
    groupForm.reset({
      label: group.label,
      code: group.code || '',
      customPostTypeIds: group.customPostTypeIds || [],
    });
    setIsGroupDrawerOpen(true);
  };

  const handleEditField = (field: any) => {
    setEditingField(field);
    fieldForm.reset({
      label: field.label,
      code: field.code,
      type: field.type,
      description: field.description || '',
      isRequired: field.isRequired || false,
      options: field.options ? field.options.join(', ') : '',
    });
    setIsFieldDrawerOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!deleteConfirm) return;

    if (deleteConfirm.type === 'group') {
      removeGroup({ variables: { _id: deleteConfirm.id } });
    } else {
      if (!selectedGroup) return;

      const currentFields = Array.isArray(selectedGroup.fields)
        ? selectedGroup.fields
        : [];
      const updatedFields = currentFields.filter(
        (f: any) => f._id !== deleteConfirm.id,
      );

      editGroup({
        variables: {
          _id: selectedGroup._id,
          input: {
            label: selectedGroup.label,
            code: selectedGroup.code,
            clientPortalId: websiteId,
            customPostTypeIds: selectedGroup.customPostTypeIds || [],
            fields: updatedFields,
          },
        },
        onCompleted: () => {
          toast({ title: 'Success', description: 'Field deleted!' });
          setDeleteConfirm(null);

          const updatedGroup = { ...selectedGroup, fields: updatedFields };
          setSelectedGroup(updatedGroup);
        },
      });
    }
  };

  const groups = data?.cmsCustomFieldGroupList?.list || [];
  const customTypes = customTypesData?.cmsCustomPostTypes || [];
  const fields = Array.isArray(selectedGroup?.fields)
    ? selectedGroup.fields
    : [];

  const selectedFieldType = fieldForm.watch('type');
  const needsOptions = ['select', 'radio'].includes(selectedFieldType);

  return (
    <CmsLayout>
      <div className="flex h-full">
        {/* Left Sidebar - Groups List */}
        <div className="w-80 border-r bg-gray-50 flex flex-col">
          <div className="p-4 border-b bg-white">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">Field Groups</h2>
              <Button
                size="sm"
                onClick={() => {
                  setEditingGroup(null);
                  groupForm.reset({
                    label: '',
                    code: '',
                    customPostTypeIds: [],
                  });
                  setIsGroupDrawerOpen(true);
                }}
              >
                <IconPlus className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500">Manage custom field groups</p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-sm text-gray-500">
                Loading...
              </div>
            ) : groups.length === 0 ? (
              <div className="p-4 text-center">
                <IconSettings className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500 mb-3">No groups yet</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingGroup(null);
                    groupForm.reset({
                      label: '',
                      code: '',
                      customPostTypeIds: [],
                    });
                    setIsGroupDrawerOpen(true);
                  }}
                >
                  <IconPlus className="w-3 h-3 mr-1" />
                  Create Group
                </Button>
              </div>
            ) : (
              <div className="p-2">
                {groups.map((group: any) => (
                  <div
                    key={group._id}
                    className={`group flex items-center justify-between p-3 mb-1 rounded-lg cursor-pointer transition-colors ${
                      selectedGroup?._id === group._id
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-white border border-transparent'
                    }`}
                    onClick={() => setSelectedGroup(group)}
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">
                        {group.label}
                      </h3>
                      {group.code && (
                        <p className="text-xs text-gray-500 truncate">
                          {group.code}
                        </p>
                      )}
                      {group.customPostTypes &&
                        group.customPostTypes.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {group.customPostTypes.map((type: any) => (
                              <span
                                key={type._id}
                                className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded"
                              >
                                {type.label}
                              </span>
                            ))}
                          </div>
                        )}
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditGroup(group);
                        }}
                      >
                        <IconEdit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="opacity-0 group-hover:opacity-100 text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm({ type: 'group', id: group._id });
                        }}
                      >
                        <IconTrash className="w-3 h-3" />
                      </Button>
                      <IconChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Content - Fields List */}
        <div className="flex-1 flex flex-col">
          {selectedGroup ? (
            <>
              <div className="p-6 border-b bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-semibold">
                      {selectedGroup.label}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                      Manage fields in this group
                    </p>
                    {selectedGroup.customPostTypes &&
                      selectedGroup.customPostTypes.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="text-xs text-gray-500">
                            Applied to:
                          </span>
                          {selectedGroup.customPostTypes.map((type: any) => (
                            <span
                              key={type._id}
                              className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded"
                            >
                              {type.label}
                            </span>
                          ))}
                        </div>
                      )}
                  </div>
                  <Button
                    onClick={() => {
                      setEditingField(null);
                      fieldForm.reset({
                        label: '',
                        code: '',
                        type: 'text',
                        description: '',
                        isRequired: false,
                        options: '',
                      });
                      setIsFieldDrawerOpen(true);
                    }}
                  >
                    <IconPlus className="w-4 h-4 mr-2" />
                    Add Field
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {fields.length === 0 ? (
                  <div className="bg-white rounded-lg border p-8 text-center">
                    <IconPlus className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No fields yet</h3>
                    <p className="text-gray-500 mb-4">
                      Add custom fields to collect additional data
                    </p>
                    <Button
                      onClick={() => {
                        setEditingField(null);
                        fieldForm.reset({
                          label: '',
                          code: '',
                          type: 'text',
                          description: '',
                          isRequired: false,
                          options: '',
                        });
                        setIsFieldDrawerOpen(true);
                      }}
                    >
                      <IconPlus className="w-4 h-4 mr-2" />
                      Add First Field
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {fields.map((field: any) => (
                      <div
                        key={field._id}
                        className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{field.label}</h3>
                              <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">
                                {field.type}
                              </span>
                              {field.isRequired && (
                                <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded">
                                  Required
                                </span>
                              )}
                            </div>
                            {field.code && (
                              <p className="text-sm text-gray-500 mb-1">
                                Code:{' '}
                                <code className="bg-gray-100 px-1 rounded">
                                  {field.code}
                                </code>
                              </p>
                            )}
                            {field.description && (
                              <p className="text-sm text-gray-600 mb-2">
                                {field.description}
                              </p>
                            )}
                            {field.options && field.options.length > 0 && (
                              <div className="text-sm">
                                <span className="text-gray-500">Options: </span>
                                <span className="text-gray-700">
                                  {field.options.join(', ')}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditField(field)}
                            >
                              <IconEdit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:bg-red-50"
                              onClick={() =>
                                setDeleteConfirm({
                                  type: 'field',
                                  id: field._id,
                                })
                              }
                            >
                              <IconTrash className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md">
                <IconSettings className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  Select a field group
                </h3>
                <p className="text-gray-500">
                  Choose a field group from the left sidebar to view and manage
                  its fields
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Group Form Drawer */}
      <Sheet
        open={isGroupDrawerOpen}
        onOpenChange={(open) => {
          setIsGroupDrawerOpen(open);
          if (!open) {
            groupForm.reset();
            setEditingGroup(null);
          }
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
              onSubmit={groupForm.handleSubmit(handleGroupSubmit)}
              className="space-y-4 p-6"
            >
              <div>
                <label className="block text-sm font-medium mb-2">
                  Label *
                </label>
                <Input
                  {...groupForm.register('label', {
                    required: 'Label is required',
                  })}
                  placeholder="Enter label"
                />
                {groupForm.formState.errors.label && (
                  <p className="text-sm text-red-500 mt-1">
                    {groupForm.formState.errors.label.message}
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
                    No custom types available. Create custom types first to
                    assign them to field groups.
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
                      Select which custom post types this field group applies
                      to. Leave empty to apply to all types.
                    </p>
                  </>
                )}
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsGroupDrawerOpen(false)}
                >
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

      {/* Field Form Drawer */}
      <Sheet
        open={isFieldDrawerOpen}
        onOpenChange={(open) => {
          setIsFieldDrawerOpen(open);
          if (!open) {
            fieldForm.reset();
            setEditingField(null);
          }
        }}
      >
        <Sheet.View className="sm:max-w-lg p-0">
          <Sheet.Header>
            <Sheet.Title>
              {editingField ? 'Edit Field' : 'Add Field'}
            </Sheet.Title>
            <Sheet.Close />
          </Sheet.Header>
          <Sheet.Content className="overflow-y-auto">
            <form
              onSubmit={fieldForm.handleSubmit(handleFieldSubmit)}
              className="space-y-4 p-6"
            >
              <div>
                <label className="block text-sm font-medium mb-2">
                  Label *
                </label>
                <Input
                  {...fieldForm.register('label', {
                    required: 'Label is required',
                  })}
                  placeholder="Enter field label"
                />
                {fieldForm.formState.errors.label && (
                  <p className="text-sm text-red-500 mt-1">
                    {fieldForm.formState.errors.label.message}
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
                    {fieldForm.formState.errors.type.message}
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
                      {fieldForm.formState.errors.options.message}
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsFieldDrawerOpen(false)}
                >
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
      >
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Confirm Delete</Dialog.Title>
          </Dialog.Header>
          <div className="py-4">
            <p>
              Are you sure you want to delete this {deleteConfirm?.type}?
              {deleteConfirm?.type === 'group' && (
                <span className="block mt-2 text-sm text-red-600">
                  Warning: All fields in this group will also be deleted.
                </span>
              )}
            </p>
          </div>
          <Dialog.Footer>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </CmsLayout>
  );
}
