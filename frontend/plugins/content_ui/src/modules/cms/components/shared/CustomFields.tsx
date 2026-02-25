import {
  Button,
  Sheet,
  Input,
  toast,
  Select,
  Checkbox,
  MultipleSelector,
  Collapsible,
  Table,
  DropdownMenu,
  Spinner,
  useConfirm,
} from 'erxes-ui';
import { IconPlus, IconEdit, IconTrash, IconDots } from '@tabler/icons-react';
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
  const { confirm } = useConfirm();

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
      setSelectedGroup(null);
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
        refetch();
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

  const handleDeleteGroup = (groupId: string) => {
    confirm({
      message:
        'Are you sure you want to delete this field group? All fields in this group will also be deleted.',
    }).then(() => {
      removeGroup({ variables: { _id: groupId } });
    });
  };

  const handleDeleteField = (fieldId: string) => {
    if (!selectedGroup) return;
    confirm({
      message: 'Are you sure you want to delete this field?',
    }).then(() => {
      const currentFields = Array.isArray(selectedGroup.fields)
        ? selectedGroup.fields
        : [];
      const updatedFields = currentFields.filter((f: any) => f._id !== fieldId);

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
          const updatedGroup = { ...selectedGroup, fields: updatedFields };
          setSelectedGroup(updatedGroup);
        },
      });
    });
  };

  const groups = data?.cmsCustomFieldGroupList?.list || [];
  const customTypes = customTypesData?.cmsCustomPostTypes || [];

  const selectedFieldType = fieldForm.watch('type');
  const needsOptions = ['select', 'radio'].includes(selectedFieldType);

  return (
    <CmsLayout>
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold">Custom Fields</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage custom field groups and fields
              </p>
            </div>
            <Button
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
              <IconPlus className="w-4 h-4 mr-2" />
              Add Group
            </Button>
          </div>

          {/* Table Header */}
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>Name</Table.Head>
                <Table.Head>Type</Table.Head>
                <Table.Head className="w-12"></Table.Head>
              </Table.Row>
            </Table.Header>
          </Table>

          {/* Groups List */}
          {loading ? (
            <div className="py-12 text-center">
              <Spinner />
            </div>
          ) : groups.length === 0 ? (
            <div className="py-12 text-center border rounded-lg mt-2">
              <p className="text-muted-foreground mb-4">No field groups yet</p>
              <Button
                variant="secondary"
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
                <IconPlus className="w-4 h-4 mr-2" />
                Create First Group
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 mt-2">
              {groups.map((group: any) => (
                <Collapsible
                  key={group._id}
                  className="group"
                  defaultOpen={selectedGroup?._id === group._id}
                  onOpenChange={(open) => open && setSelectedGroup(group)}
                >
                  <div className="relative">
                    <Collapsible.Trigger asChild>
                      <Button
                        variant="secondary"
                        className="w-full justify-start"
                      >
                        <Collapsible.TriggerIcon />
                        <span className="flex-1 text-left">{group.label}</span>
                        {group.code && (
                          <span className="text-xs text-muted-foreground mr-2">
                            {group.code}
                          </span>
                        )}
                      </Button>
                    </Collapsible.Trigger>
                    <DropdownMenu>
                      <DropdownMenu.Trigger asChild>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute right-0.5 top-0.5 size-7"
                        >
                          <IconDots className="w-4 h-4" />
                        </Button>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Content className="min-w-48">
                        <DropdownMenu.Item
                          onClick={() => handleEditGroup(group)}
                        >
                          <IconEdit className="w-4 h-4" />
                          Edit
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          className="text-destructive"
                          onClick={() => handleDeleteGroup(group._id)}
                        >
                          <IconTrash className="w-4 h-4" />
                          Delete
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu>
                  </div>

                  <Collapsible.Content className="pt-2">
                    <Table className="[&_tr_td]:border-b-0 [&_tr_td:first-child]:border-l-0 [&_tr_td]:border-r-0">
                      <Table.Body>
                        {(group.fields || []).length === 0 ? (
                          <Table.Row className="hover:bg-background">
                            <Table.Cell
                              colSpan={3}
                              className="h-auto py-8 text-center text-muted-foreground"
                            >
                              No fields in this group
                            </Table.Cell>
                          </Table.Row>
                        ) : (
                          (group.fields || []).map((field: any) => (
                            <Table.Row
                              key={field._id}
                              className="hover:bg-accent/50"
                            >
                              <Table.Cell className="py-3">
                                <div className="flex items-start gap-3">
                                  <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-base">
                                        {field.label}
                                      </span>
                                      {field.isRequired && (
                                        <span className="text-xs px-2 py-0.5 bg-destructive/10 text-destructive rounded-full font-medium">
                                          Required
                                        </span>
                                      )}
                                    </div>
                                    {field.code && (
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-medium text-muted-foreground">
                                          Code:
                                        </span>
                                        <code className="text-xs px-1.5 py-0.5 bg-muted rounded font-mono">
                                          {field.code}
                                        </code>
                                      </div>
                                    )}
                                    {field.description && (
                                      <p className="text-sm text-muted-foreground leading-relaxed">
                                        {field.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </Table.Cell>
                              <Table.Cell className="py-3">
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary rounded-md">
                                  <span className="text-sm font-medium capitalize">
                                    {field.type}
                                  </span>
                                </div>
                              </Table.Cell>
                              <Table.Cell className="w-8 p-0.5">
                                <DropdownMenu>
                                  <DropdownMenu.Trigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="size-8 text-muted-foreground hover:text-foreground"
                                    >
                                      <IconDots className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenu.Trigger>
                                  <DropdownMenu.Content className="min-w-48">
                                    <DropdownMenu.Item
                                      onClick={() => {
                                        setSelectedGroup(group);
                                        handleEditField(field);
                                      }}
                                    >
                                      <IconEdit className="w-4 h-4" />
                                      Edit field
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Item
                                      className="text-destructive"
                                      onClick={() => {
                                        setSelectedGroup(group);
                                        handleDeleteField(field._id);
                                      }}
                                    >
                                      <IconTrash className="w-4 h-4" />
                                      Delete field
                                    </DropdownMenu.Item>
                                  </DropdownMenu.Content>
                                </DropdownMenu>
                              </Table.Cell>
                            </Table.Row>
                          ))
                        )}
                      </Table.Body>
                    </Table>
                    <div className="flex items-center justify-end mt-2">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setSelectedGroup(group);
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
                        <IconPlus className="w-4 h-4" />
                        Add field
                      </Button>
                    </div>
                  </Collapsible.Content>
                </Collapsible>
              ))}
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
    </CmsLayout>
  );
}
