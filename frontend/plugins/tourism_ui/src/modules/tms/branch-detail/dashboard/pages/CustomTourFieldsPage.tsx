import {
  Badge,
  Button,
  Checkbox,
  Input,
  MultipleSelector,
  Select,
  Sheet,
  Spinner,
  Tabs,
  Textarea,
  toast,
  useConfirm,
} from 'erxes-ui';
import {
  IconEdit,
  IconPlus,
  IconTrash,
  IconSettings,
} from '@tabler/icons-react';
import { Controller, useForm } from 'react-hook-form';
import { useEffect, useMemo, useState } from 'react';
import { IBranch } from '@/tms/types/branch';
import {
  useCustomTourFieldGroups,
  useCustomTourTypes,
} from '../custom-fields/hooks';
import {
  CUSTOM_TOUR_FIELD_TYPES,
  ICustomTourField,
  ICustomTourFieldGroup,
  ICustomTourType,
} from '../custom-fields/types';

type Option = { label: string; value: string };

const SYSTEM_SHOW_ON: Option[] = [{ label: 'Tours', value: 'tour' }];

const toCode = (label: string) =>
  label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/(^_|_$)/g, '');

const commandProps = (options: Option[]) => ({
  filter: (value: string, search: string) => {
    const option = options.find((item) => item.value === value);
    const text = `${option?.label || ''} ${value}`.toLowerCase();
    return text.includes(search.toLowerCase().trim()) ? 1 : -1;
  },
});

const CustomTourTypeDrawer = ({
  open,
  branchId,
  customType,
  onClose,
  onSubmit,
}: {
  open: boolean;
  branchId: string;
  customType: ICustomTourType | null;
  onClose: () => void;
  onSubmit: (values: any) => void;
}) => {
  const form = useForm({
    defaultValues: {
      label: '',
      pluralLabel: '',
      code: '',
      description: '',
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      label: customType?.label || '',
      pluralLabel: customType?.pluralLabel || '',
      code: customType?.code || '',
      description: customType?.description || '',
    });
  }, [customType, form, open]);

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Sheet.View className="sm:max-w-lg p-0">
        <Sheet.Header>
          <Sheet.Title>
            {customType ? 'Edit Custom Tour Type' : 'Add Custom Tour Type'}
          </Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content>
          <form
            className="space-y-4 p-6"
            onSubmit={form.handleSubmit((values) =>
              onSubmit({ ...values, branchId }),
            )}
          >
            <div className="space-y-2">
              <label className="text-sm font-medium">Label</label>
              <Input
                {...form.register('label', { required: true })}
                onChange={(event) => {
                  form.setValue('label', event.target.value);
                  if (!customType) {
                    form.setValue('code', toCode(event.target.value));
                    form.setValue('pluralLabel', event.target.value);
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Plural Label</label>
              <Input {...form.register('pluralLabel', { required: true })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Code</label>
              <Input {...form.register('code', { required: true })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea {...form.register('description')} />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">{customType ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};

const CustomTourGroupDrawer = ({
  open,
  branchId,
  group,
  customTypes,
  onClose,
  onSubmit,
}: {
  open: boolean;
  branchId: string;
  group: ICustomTourFieldGroup | null;
  customTypes: ICustomTourType[];
  onClose: () => void;
  onSubmit: (values: any) => void;
}) => {
  const form = useForm({
    defaultValues: {
      label: '',
      code: '',
      customTourTypeIds: [] as string[],
    },
  });

  const showOnOptions = useMemo(
    () => [
      ...SYSTEM_SHOW_ON,
      ...customTypes.map((type) => ({
        label: `${type.label} (${type.code})`,
        value: type._id,
      })),
    ],
    [customTypes],
  );

  useEffect(() => {
    if (!open) return;
    form.reset({
      label: group?.label || '',
      code: group?.code || '',
      customTourTypeIds: group?.customTourTypeIds || [],
    });
  }, [form, group, open]);

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Sheet.View className="sm:max-w-lg p-0">
        <Sheet.Header>
          <Sheet.Title>
            {group ? 'Edit Field Group' : 'Add Field Group'}
          </Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content>
          <form
            className="space-y-4 p-6"
            onSubmit={form.handleSubmit((values) =>
              onSubmit({
                ...values,
                branchId,
                fields: group?.fields || [],
              }),
            )}
          >
            <div className="space-y-2">
              <label className="text-sm font-medium">Label</label>
              <Input
                {...form.register('label', { required: true })}
                onChange={(event) => {
                  form.setValue('label', event.target.value);
                  if (!group) form.setValue('code', toCode(event.target.value));
                }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Code</label>
              <Input {...form.register('code')} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Show on</label>
              <Controller
                control={form.control}
                name="customTourTypeIds"
                render={({ field }) => {
                  const selected = showOnOptions.filter((option) =>
                    (field.value || []).includes(option.value),
                  );

                  return (
                    <MultipleSelector
                      value={selected as any}
                      options={showOnOptions as any}
                      placeholder="Tours or custom tour types"
                      emptyIndicator="No options"
                      commandProps={commandProps(showOnOptions)}
                      onChange={(items: any[]) =>
                        field.onChange(items.map((item) => item.value))
                      }
                    />
                  );
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">{group ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};

const CustomTourFieldDrawer = ({
  open,
  field,
  onClose,
  onSubmit,
}: {
  open: boolean;
  field: ICustomTourField | null;
  onClose: () => void;
  onSubmit: (values: any) => void;
}) => {
  const form = useForm({
    defaultValues: {
      label: '',
      code: '',
      type: 'text',
      description: '',
      isRequired: false,
      options: '',
    },
  });

  const selectedType = form.watch('type');
  const needsOptions = selectedType === 'select' || selectedType === 'radio';

  useEffect(() => {
    if (!open) return;
    form.reset({
      label: field?.label || '',
      code: field?.code || '',
      type: field?.type || 'text',
      description: field?.description || '',
      isRequired: field?.isRequired || false,
      options: field?.options?.join(', ') || '',
    });
  }, [field, form, open]);

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Sheet.View className="sm:max-w-lg p-0">
        <Sheet.Header>
          <Sheet.Title>{field ? 'Edit Field' : 'Add Field'}</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content>
          <form
            className="space-y-4 p-6"
            onSubmit={form.handleSubmit((values) =>
              onSubmit({
                ...values,
                options: values.options
                  ? values.options.split(',').map((option) => option.trim())
                  : [],
              }),
            )}
          >
            <div className="space-y-2">
              <label className="text-sm font-medium">Label</label>
              <Input
                {...form.register('label', { required: true })}
                onChange={(event) => {
                  form.setValue('label', event.target.value);
                  if (!field) form.setValue('code', toCode(event.target.value));
                }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Code</label>
              <Input {...form.register('code')} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Controller
                control={form.control}
                name="type"
                render={({ field: typeField }) => (
                  <Select
                    value={typeField.value}
                    onValueChange={typeField.onChange}
                  >
                    <Select.Trigger>
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Content>
                      {CUSTOM_TOUR_FIELD_TYPES.map((type) => (
                        <Select.Item key={type.value} value={type.value}>
                          {type.label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input {...form.register('description')} />
            </div>
            {needsOptions && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Options</label>
                <Input
                  {...form.register('options', { required: needsOptions })}
                  placeholder="Option 1, Option 2"
                />
              </div>
            )}
            <div className="flex items-center gap-2">
              <Controller
                control={form.control}
                name="isRequired"
                render={({ field: requiredField }) => (
                  <Checkbox
                    checked={requiredField.value}
                    onCheckedChange={requiredField.onChange}
                  />
                )}
              />
              <span className="text-sm">Required field</span>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">{field ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};

export const CustomTourFieldsPage = ({ branch }: { branch: IBranch }) => {
  const { confirm } = useConfirm();
  const [typeDrawerOpen, setTypeDrawerOpen] = useState(false);
  const [groupDrawerOpen, setGroupDrawerOpen] = useState(false);
  const [fieldDrawerOpen, setFieldDrawerOpen] = useState(false);
  const [editingType, setEditingType] = useState<ICustomTourType | null>(null);
  const [editingGroup, setEditingGroup] =
    useState<ICustomTourFieldGroup | null>(null);
  const [selectedGroup, setSelectedGroup] =
    useState<ICustomTourFieldGroup | null>(null);
  const [editingField, setEditingField] = useState<ICustomTourField | null>(
    null,
  );

  const {
    customTypes,
    loading: typesLoading,
    addType,
    editType,
    removeType,
  } = useCustomTourTypes(branch._id);
  const {
    groups,
    loading: groupsLoading,
    refetch,
    addGroup,
    editGroup,
    removeGroup,
  } = useCustomTourFieldGroups(branch._id);

  const latestSelectedGroup =
    groups.find((group) => group._id === selectedGroup?._id) || selectedGroup;

  const submitType = (values: any) => {
    if (editingType) {
      editType({ variables: { _id: editingType._id, input: values } });
    } else {
      addType({ variables: { input: values } });
    }
    setTypeDrawerOpen(false);
    setEditingType(null);
  };

  const submitGroup = (values: any) => {
    if (editingGroup) {
      editGroup({ variables: { _id: editingGroup._id, input: values } });
    } else {
      addGroup({ variables: { input: values } });
    }
    setGroupDrawerOpen(false);
    setEditingGroup(null);
  };

  const submitField = (values: any) => {
    if (!latestSelectedGroup) return;

    const newField = {
      _id: editingField?._id || `field_${Date.now()}`,
      label: values.label,
      code: values.code,
      type: values.type,
      description: values.description,
      isRequired: values.isRequired,
      options: values.options || [],
    };

    const currentFields = Array.isArray(latestSelectedGroup.fields)
      ? latestSelectedGroup.fields
      : [];

    const fields = editingField
      ? currentFields.map((field) =>
          field._id === editingField._id ? newField : field,
        )
      : [...currentFields, newField];

    editGroup({
      variables: {
        _id: latestSelectedGroup._id,
        input: {
          label: latestSelectedGroup.label,
          code: latestSelectedGroup.code,
          branchId: branch._id,
          customTourTypeIds: latestSelectedGroup.customTourTypeIds || [],
          fields,
        },
      },
      onCompleted: async () => {
        toast({
          title: 'Success',
          description: editingField ? 'Field updated' : 'Field created',
        });
        setFieldDrawerOpen(false);
        setEditingField(null);
        await refetch();
      },
    });
  };

  const deleteField = (fieldId: string) => {
    if (!latestSelectedGroup) return;

    confirm({ message: 'Are you sure you want to delete this field?' }).then(
      () => {
        editGroup({
          variables: {
            _id: latestSelectedGroup._id,
            input: {
              label: latestSelectedGroup.label,
              code: latestSelectedGroup.code,
              branchId: branch._id,
              customTourTypeIds: latestSelectedGroup.customTourTypeIds || [],
              fields: (latestSelectedGroup.fields || []).filter(
                (field) => field._id !== fieldId,
              ),
            },
          },
        });
      },
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 border-b px-3 py-2">
        <IconSettings size={16} />
        <div className="font-medium">Custom tour fields</div>
      </div>
      <div className="overflow-y-auto p-4">
        <Tabs defaultValue="groups">
          <div className="flex items-center justify-between gap-3">
            <Tabs.List>
              <Tabs.Trigger value="groups">Field groups</Tabs.Trigger>
              <Tabs.Trigger value="types">Tour types</Tabs.Trigger>
            </Tabs.List>
          </div>

          <Tabs.Content value="groups" className="pt-4">
            <div className="mb-3 flex justify-end">
              <Button
                onClick={() => {
                  setEditingGroup(null);
                  setGroupDrawerOpen(true);
                }}
              >
                <IconPlus size={16} />
                Add Group
              </Button>
            </div>

            {groupsLoading ? (
              <div className="flex justify-center py-10">
                <Spinner />
              </div>
            ) : groups.length === 0 ? (
              <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                No custom tour field groups yet.
              </div>
            ) : (
              <div className="space-y-3">
                {groups.map((group) => (
                  <div key={group._id} className="rounded-md border">
                    <div className="flex items-start justify-between gap-3 p-4">
                      <div className="space-y-2">
                        <div className="font-medium">{group.label}</div>
                        <div className="flex flex-wrap gap-2">
                          {group.code && (
                            <Badge variant="secondary">{group.code}</Badge>
                          )}
                          {(group.customTourTypes || []).map((type) => (
                            <Badge key={type._id} variant="outline">
                              {type.label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedGroup(group);
                            setEditingField(null);
                            setFieldDrawerOpen(true);
                          }}
                        >
                          <IconPlus size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingGroup(group);
                            setGroupDrawerOpen(true);
                          }}
                        >
                          <IconEdit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            confirm({
                              message:
                                'Are you sure you want to delete this field group?',
                            }).then(() =>
                              removeGroup({ variables: { _id: group._id } }),
                            )
                          }
                        >
                          <IconTrash size={16} />
                        </Button>
                      </div>
                    </div>
                    <div className="border-t p-3">
                      {(group.fields || []).length === 0 ? (
                        <div className="text-sm text-muted-foreground">
                          No fields in this group.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {(group.fields || []).map((field) => (
                            <div
                              key={field._id}
                              className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2"
                            >
                              <div>
                                <span className="font-medium">
                                  {field.label}
                                </span>
                                <span className="ml-2 text-xs text-muted-foreground">
                                  {field.code || field._id} · {field.type}
                                </span>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setSelectedGroup(group);
                                    setEditingField(field);
                                    setFieldDrawerOpen(true);
                                  }}
                                >
                                  <IconEdit size={15} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setSelectedGroup(group);
                                    deleteField(field._id);
                                  }}
                                >
                                  <IconTrash size={15} />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Tabs.Content>

          <Tabs.Content value="types" className="pt-4">
            <div className="mb-3 flex justify-end">
              <Button
                onClick={() => {
                  setEditingType(null);
                  setTypeDrawerOpen(true);
                }}
              >
                <IconPlus size={16} />
                Add Type
              </Button>
            </div>

            {typesLoading ? (
              <div className="flex justify-center py-10">
                <Spinner />
              </div>
            ) : customTypes.length === 0 ? (
              <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                No custom tour types yet.
              </div>
            ) : (
              <div className="divide-y rounded-md border">
                {customTypes.map((type) => (
                  <div
                    key={type._id}
                    className="flex items-center justify-between gap-3 p-4"
                  >
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {type.code}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingType(type);
                          setTypeDrawerOpen(true);
                        }}
                      >
                        <IconEdit size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          confirm({
                            message:
                              'Are you sure you want to delete this custom tour type?',
                          }).then(() =>
                            removeType({ variables: { _id: type._id } }),
                          )
                        }
                      >
                        <IconTrash size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Tabs.Content>
        </Tabs>
      </div>

      <CustomTourTypeDrawer
        open={typeDrawerOpen}
        branchId={branch._id}
        customType={editingType}
        onClose={() => {
          setTypeDrawerOpen(false);
          setEditingType(null);
        }}
        onSubmit={submitType}
      />
      <CustomTourGroupDrawer
        open={groupDrawerOpen}
        branchId={branch._id}
        group={editingGroup}
        customTypes={customTypes}
        onClose={() => {
          setGroupDrawerOpen(false);
          setEditingGroup(null);
        }}
        onSubmit={submitGroup}
      />
      <CustomTourFieldDrawer
        open={fieldDrawerOpen}
        field={editingField}
        onClose={() => {
          setFieldDrawerOpen(false);
          setEditingField(null);
        }}
        onSubmit={submitField}
      />
    </div>
  );
};
