import { useMutation, useQuery } from '@apollo/client';
import {
  IconEdit,
  IconPlus,
  IconTrash,
  IconSettings,
} from '@tabler/icons-react';
import {
  Badge,
  Button,
  Form,
  Input,
  MultipleSelector,
  PageSubHeader,
  Select,
  Sheet,
  Spinner,
  Switch,
  Table,
  Tabs,
  Textarea,
  toast,
  useConfirm,
} from 'erxes-ui';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { IBranch } from '@/tms/types/branch';
import {
  TOUR_CUSTOM_FIELD_GROUPS,
  TOUR_CUSTOM_FIELD_GROUP_ADD,
  TOUR_CUSTOM_FIELD_GROUP_EDIT,
  TOUR_CUSTOM_FIELD_GROUP_REMOVE,
  TOUR_CUSTOM_TYPE_ADD,
  TOUR_CUSTOM_TYPE_EDIT,
  TOUR_CUSTOM_TYPE_REMOVE,
  TOUR_CUSTOM_TYPES,
} from '../tours/graphql/customFields';
import type {
  ITourCustomField,
  ITourCustomFieldGroup,
  ITourCustomPostType,
} from '../tours/hooks/useTourCustomFields';

type TourTypeForm = {
  label: string;
  pluralLabel: string;
  code: string;
  description?: string;
  isActive?: boolean;
};

type FieldGroupForm = {
  label: string;
  code?: string;
  customTourTypeIds: string[];
};

type FieldForm = {
  label: string;
  code?: string;
  type: string;
  description?: string;
  isRequired?: boolean;
  options?: string;
};

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'select', label: 'Select' },
  { value: 'multiSelect', label: 'Multi select' },
  { value: 'radio', label: 'Radio' },
  { value: 'image', label: 'Image' },
  { value: 'file', label: 'File' },
];

const SYSTEM_TOUR_TYPE: ITourCustomPostType = {
  _id: 'tour',
  code: 'tour',
  name: 'tour',
  label: 'Tour',
  pluralLabel: 'Tours',
  isActive: true,
};

const generateCode = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/(^_|_$)/g, '');

const parseOptions = (value?: string) =>
  value
    ? value
        .split(',')
        .map((option) => option.trim())
        .filter(Boolean)
    : [];

const buildFieldFormValues = (field?: ITourCustomField | null): FieldForm => ({
  label: field?.label || '',
  code: field?.code || '',
  type: field?.type || 'text',
  description: field?.description || '',
  isRequired: field?.isRequired || false,
  options: (field?.options || []).join(', '),
});

export const CustomFieldsPage = ({ branch }: { branch: IBranch }) => {
  const { confirm } = useConfirm();
  const [typeDrawerOpen, setTypeDrawerOpen] = useState(false);
  const [groupDrawerOpen, setGroupDrawerOpen] = useState(false);
  const [fieldDrawerOpen, setFieldDrawerOpen] = useState(false);
  const [editingType, setEditingType] = useState<ITourCustomPostType | null>(
    null,
  );
  const [editingGroup, setEditingGroup] =
    useState<ITourCustomFieldGroup | null>(null);
  const [selectedGroup, setSelectedGroup] =
    useState<ITourCustomFieldGroup | null>(null);
  const [editingField, setEditingField] = useState<ITourCustomField | null>(
    null,
  );

  const {
    data: typesData,
    loading: typesLoading,
    refetch: refetchTypes,
  } = useQuery<{ bmsCustomTourTypes: ITourCustomPostType[] }>(
    TOUR_CUSTOM_TYPES,
    {
      variables: { branchId: branch._id },
      fetchPolicy: 'cache-and-network',
    },
  );

  const {
    data: groupsData,
    loading: groupsLoading,
    refetch: refetchGroups,
  } = useQuery<{
    bmsCustomTourGroupList: {
      list: ITourCustomFieldGroup[];
      totalCount: number;
    };
  }>(TOUR_CUSTOM_FIELD_GROUPS, {
    variables: { branchId: branch._id },
    fetchPolicy: 'cache-and-network',
  });

  const customTypes = typesData?.bmsCustomTourTypes || [];
  const typeOptions = useMemo(
    () => [SYSTEM_TOUR_TYPE, ...customTypes],
    [customTypes],
  );
  const groups = groupsData?.bmsCustomTourGroupList?.list || [];

  useEffect(() => {
    if (groupsLoading) return;

    if (!groups.length) {
      if (selectedGroup) {
        setSelectedGroup(null);
      }
      return;
    }

    const latestSelectedGroup = selectedGroup
      ? groups.find((group) => group._id === selectedGroup._id)
      : null;
    const nextSelectedGroup = latestSelectedGroup || groups[0];

    if (selectedGroup !== nextSelectedGroup) {
      setSelectedGroup(nextSelectedGroup);
    }
  }, [groups, groupsLoading, selectedGroup]);

  const refetchAll = () => {
    refetchTypes();
    refetchGroups();
  };

  const [addType] = useMutation(TOUR_CUSTOM_TYPE_ADD, {
    onCompleted: () => {
      toast({ title: 'Success', description: 'Tour type created' });
      refetchTypes();
    },
    onError: (error) =>
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      }),
  });

  const [editType] = useMutation(TOUR_CUSTOM_TYPE_EDIT, {
    onCompleted: () => {
      toast({ title: 'Success', description: 'Tour type updated' });
      refetchTypes();
    },
    onError: (error) =>
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      }),
  });

  const [removeType] = useMutation(TOUR_CUSTOM_TYPE_REMOVE, {
    onCompleted: () => {
      toast({ title: 'Success', description: 'Tour type removed' });
      refetchTypes();
      refetchGroups();
    },
    onError: (error) =>
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      }),
  });

  const [addGroup] = useMutation(TOUR_CUSTOM_FIELD_GROUP_ADD, {
    onCompleted: () => {
      toast({ title: 'Success', description: 'Field group created' });
      refetchGroups();
    },
    onError: (error) =>
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      }),
  });

  const [editGroup] = useMutation(TOUR_CUSTOM_FIELD_GROUP_EDIT, {
    onCompleted: () => {
      toast({ title: 'Success', description: 'Field group updated' });
      refetchGroups();
    },
    onError: (error) =>
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      }),
  });

  const [removeGroup] = useMutation(TOUR_CUSTOM_FIELD_GROUP_REMOVE, {
    onCompleted: () => {
      toast({ title: 'Success', description: 'Field group removed' });
      setSelectedGroup(null);
      refetchGroups();
    },
    onError: (error) =>
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      }),
  });

  const handleRemoveType = (type: ITourCustomPostType) => {
    confirm({
      message: `Delete "${type.label}" tour type?`,
    }).then(() => removeType({ variables: { _id: type._id } }));
  };

  const handleRemoveGroup = (group: ITourCustomFieldGroup) => {
    confirm({
      message: `Delete "${group.label}" field group and all its fields?`,
    }).then(() => removeGroup({ variables: { _id: group._id } }));
  };

  const upsertGroupFields = (
    group: ITourCustomFieldGroup,
    fields: ITourCustomField[],
  ) => {
    editGroup({
      variables: {
        _id: group._id,
        input: {
          branchId: branch._id,
          label: group.label,
          code: group.code,
          parentId: group.parentId,
          order: group.order,
          customTourTypeIds: group.customTourTypeIds || [],
          enabledTourIds: group.enabledTourIds || [],
          fields,
        },
      },
      onCompleted: async () => {
        const result = await refetchGroups();
        const latestGroup = result.data?.bmsCustomTourGroupList?.list?.find(
          (item: ITourCustomFieldGroup) => item._id === group._id,
        );
        if (latestGroup) {
          setSelectedGroup(latestGroup);
        }
      },
    });
  };

  const handleRemoveField = (
    group: ITourCustomFieldGroup,
    field: ITourCustomField,
  ) => {
    confirm({
      message: `Delete "${field.label}" field?`,
    }).then(() => {
      const fields = (group.fields || []).filter(
        (item) => item._id !== field._id,
      );
      upsertGroupFields(group, fields);
    });
  };

  return (
    <div className="flex flex-col h-full">
      <PageSubHeader>
        <div className="flex items-center gap-2 text-sm font-medium">
          <IconSettings size={16} />
          Custom Fields
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingType(null);
              setTypeDrawerOpen(true);
            }}
          >
            <IconPlus size={16} />
            Tour Type
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setEditingGroup(null);
              setGroupDrawerOpen(true);
            }}
          >
            <IconPlus size={16} />
            Field Group
          </Button>
        </div>
      </PageSubHeader>

      <div className="flex-auto min-h-0 p-4 overflow-auto">
        <Tabs defaultValue="groups" className="flex flex-col gap-4">
          <Tabs.List className="w-fit">
            <Tabs.Trigger value="groups">Field Groups</Tabs.Trigger>
            <Tabs.Trigger value="types">Tour Types</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="groups" className="min-h-0">
            <FieldGroupsView
              groups={groups}
              typeOptions={typeOptions}
              loading={groupsLoading}
              selectedGroup={selectedGroup}
              onSelectGroup={setSelectedGroup}
              onEditGroup={(group) => {
                setEditingGroup(group);
                setGroupDrawerOpen(true);
              }}
              onRemoveGroup={handleRemoveGroup}
              onAddField={(group) => {
                setSelectedGroup(group);
                setEditingField(null);
                setFieldDrawerOpen(true);
              }}
              onEditField={(group, field) => {
                setSelectedGroup(group);
                setEditingField(field);
                setFieldDrawerOpen(true);
              }}
              onRemoveField={handleRemoveField}
            />
          </Tabs.Content>

          <Tabs.Content value="types" className="min-h-0">
            <TourTypesView
              customTypes={customTypes}
              loading={typesLoading}
              onEditType={(type) => {
                setEditingType(type);
                setTypeDrawerOpen(true);
              }}
              onRemoveType={handleRemoveType}
            />
          </Tabs.Content>
        </Tabs>
      </div>

      <TourTypeDrawer
        open={typeDrawerOpen}
        branchId={branch._id}
        editingType={editingType}
        onOpenChange={(open) => {
          setTypeDrawerOpen(open);
          if (!open) setEditingType(null);
        }}
        onSubmit={(values) => {
          const input = {
            branchId: branch._id,
            label: values.label,
            pluralLabel: values.pluralLabel,
            code: values.code,
            description: values.description,
            isActive: values.isActive,
          };

          if (editingType?._id) {
            editType({ variables: { _id: editingType._id, input } });
          } else {
            addType({ variables: { input } });
          }
          setTypeDrawerOpen(false);
          setEditingType(null);
        }}
      />

      <FieldGroupDrawer
        open={groupDrawerOpen}
        branchId={branch._id}
        typeOptions={typeOptions}
        editingGroup={editingGroup}
        onOpenChange={(open) => {
          setGroupDrawerOpen(open);
          if (!open) setEditingGroup(null);
        }}
        onSubmit={(values) => {
          const input = {
            branchId: branch._id,
            label: values.label,
            code: values.code,
            customTourTypeIds: values.customTourTypeIds || [],
            enabledTourIds: editingGroup?.enabledTourIds || [],
            fields: editingGroup?.fields || [],
          };

          if (editingGroup?._id) {
            editGroup({ variables: { _id: editingGroup._id, input } });
          } else {
            addGroup({ variables: { input } });
          }
          setGroupDrawerOpen(false);
          setEditingGroup(null);
        }}
      />

      <FieldDrawer
        open={fieldDrawerOpen}
        editingField={editingField}
        onOpenChange={(open) => {
          setFieldDrawerOpen(open);
          if (!open) setEditingField(null);
        }}
        onSubmit={(values) => {
          if (!selectedGroup) return;

          const currentFields = selectedGroup.fields || [];
          const nextField: ITourCustomField = {
            ...(editingField?._id ? { _id: editingField._id } : {}),
            label: values.label,
            code: values.code || generateCode(values.label),
            type: values.type,
            description: values.description,
            isRequired: values.isRequired,
            options: parseOptions(values.options),
          };
          const nextFields = editingField
            ? currentFields.map((field) =>
                field._id === editingField._id ? nextField : field,
              )
            : [...currentFields, nextField];

          upsertGroupFields(selectedGroup, nextFields);
          setFieldDrawerOpen(false);
          setEditingField(null);
        }}
      />
    </div>
  );
};

const TourTypesView = ({
  customTypes,
  loading,
  onEditType,
  onRemoveType,
}: {
  customTypes: ITourCustomPostType[];
  loading: boolean;
  onEditType: (type: ITourCustomPostType) => void;
  onRemoveType: (type: ITourCustomPostType) => void;
}) => {
  if (loading) {
    return <LoadingBlock />;
  }

  return (
    <div className="overflow-hidden border rounded-lg bg-background">
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Head className="w-[45%] px-4">Label</Table.Head>
            <Table.Head className="px-4">Key</Table.Head>
            <Table.Head className="px-4 w-28">Status</Table.Head>
            <Table.Head className="w-20" />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {customTypes.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={4} className="h-24 text-center">
                No custom tour types yet
              </Table.Cell>
            </Table.Row>
          ) : (
            customTypes.map((type) => (
              <Table.Row key={type._id}>
                <Table.Cell className="min-w-0 px-4 py-3 whitespace-normal">
                  <div className="font-medium break-words [overflow-wrap:anywhere]">
                    {type.label}
                  </div>
                  {type.description && (
                    <div className="text-xs text-muted-foreground break-words [overflow-wrap:anywhere]">
                      {type.description}
                    </div>
                  )}
                </Table.Cell>
                <Table.Cell className="px-4 py-3 text-muted-foreground">
                  {type.code}
                </Table.Cell>
                <Table.Cell className="px-4 py-3">
                  <Badge
                    variant={type.isActive === false ? 'secondary' : 'default'}
                  >
                    {type.isActive === false ? 'Inactive' : 'Active'}
                  </Badge>
                </Table.Cell>
                <Table.Cell className="px-2 py-2">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Edit ${type.label}`}
                      onClick={() => onEditType(type)}
                    >
                      <IconEdit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete ${type.label}`}
                      onClick={() => onRemoveType(type)}
                    >
                      <IconTrash size={16} />
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table>
    </div>
  );
};

const FieldGroupsView = ({
  groups,
  typeOptions,
  loading,
  selectedGroup,
  onSelectGroup,
  onEditGroup,
  onRemoveGroup,
  onAddField,
  onEditField,
  onRemoveField,
}: {
  groups: ITourCustomFieldGroup[];
  typeOptions: ITourCustomPostType[];
  loading: boolean;
  selectedGroup: ITourCustomFieldGroup | null;
  onSelectGroup: (group: ITourCustomFieldGroup | null) => void;
  onEditGroup: (group: ITourCustomFieldGroup) => void;
  onRemoveGroup: (group: ITourCustomFieldGroup) => void;
  onAddField: (group: ITourCustomFieldGroup) => void;
  onEditField: (group: ITourCustomFieldGroup, field: ITourCustomField) => void;
  onRemoveField: (
    group: ITourCustomFieldGroup,
    field: ITourCustomField,
  ) => void;
}) => {
  if (loading) {
    return <LoadingBlock />;
  }

  if (!groups.length) {
    return (
      <div className="flex items-center justify-center h-40 border rounded-lg text-muted-foreground">
        No custom field groups yet
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(320px,380px)_1fr] gap-4 min-h-[480px]">
      <div className="overflow-hidden border rounded-lg bg-background">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head className="px-4">Group</Table.Head>
              <Table.Head className="w-20" />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {groups.map((group) => (
              <Table.Row
                key={group._id}
                data-state={
                  selectedGroup?._id === group._id ? 'selected' : undefined
                }
                className="cursor-pointer"
                onClick={() => onSelectGroup(group)}
              >
                <Table.Cell className="min-w-0 px-4 py-3 whitespace-normal">
                  <div className="font-medium leading-5 break-words [overflow-wrap:anywhere]">
                    {group.label || 'Untitled group'}
                  </div>
                  {group.code && (
                    <div className="text-xs text-muted-foreground break-words [overflow-wrap:anywhere]">
                      {group.code}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {(group.customTourTypeIds || []).length === 0 ? (
                      <Badge variant="secondary">All tours</Badge>
                    ) : (
                      (group.customTourTypeIds || []).map((typeId) => (
                        <Badge
                          key={typeId}
                          variant="secondary"
                          className="max-w-full whitespace-normal"
                        >
                          <span className="break-words [overflow-wrap:anywhere]">
                            {typeOptions.find((type) => type._id === typeId)
                              ?.label || typeId}
                          </span>
                        </Badge>
                      ))
                    )}
                  </div>
                </Table.Cell>
                <Table.Cell className="px-2 py-2">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Edit ${group.label || 'field group'}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        onEditGroup(group);
                      }}
                    >
                      <IconEdit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete ${group.label || 'field group'}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        onRemoveGroup(group);
                      }}
                    >
                      <IconTrash size={16} />
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>

      <div className="overflow-hidden border rounded-lg bg-background">
        {selectedGroup ? (
          <FieldList
            group={selectedGroup}
            onAddField={onAddField}
            onEditField={onEditField}
            onRemoveField={onRemoveField}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Select a field group
          </div>
        )}
      </div>
    </div>
  );
};

const FieldList = ({
  group,
  onAddField,
  onEditField,
  onRemoveField,
}: {
  group: ITourCustomFieldGroup;
  onAddField: (group: ITourCustomFieldGroup) => void;
  onEditField: (group: ITourCustomFieldGroup, field: ITourCustomField) => void;
  onRemoveField: (
    group: ITourCustomFieldGroup,
    field: ITourCustomField,
  ) => void;
}) => {
  const fields = group.fields || [];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-4 border-b">
        <div className="min-w-0">
          <div className="font-medium break-words [overflow-wrap:anywhere]">
            {group.label}
          </div>
          <div className="text-xs text-muted-foreground">
            {fields.length} field{fields.length === 1 ? '' : 's'}
          </div>
        </div>
        <Button size="sm" className="ml-auto" onClick={() => onAddField(group)}>
          <IconPlus size={16} />
          Add Field
        </Button>
      </div>
      <div className="overflow-auto">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head className="w-[45%] px-4">Field</Table.Head>
              <Table.Head className="px-4">Type</Table.Head>
              <Table.Head className="w-24 px-4">Required</Table.Head>
              <Table.Head className="w-20" />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {fields.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={4} className="h-24 text-center">
                  No fields in this group
                </Table.Cell>
              </Table.Row>
            ) : (
              fields.map((field) => (
                <Table.Row key={field._id || field.code}>
                  <Table.Cell className="min-w-0 px-4 py-3 whitespace-normal">
                    <div className="font-medium truncate">{field.label}</div>
                    <div className="text-xs text-muted-foreground break-words [overflow-wrap:anywhere]">
                      {field.code}
                    </div>
                  </Table.Cell>
                  <Table.Cell className="px-4 py-3 text-muted-foreground">
                    {field.type}
                  </Table.Cell>
                  <Table.Cell className="px-4 py-3">
                    {field.isRequired ? 'Yes' : 'No'}
                  </Table.Cell>
                  <Table.Cell className="px-2 py-2">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Edit ${field.label}`}
                        onClick={() => onEditField(group, field)}
                      >
                        <IconEdit size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Delete ${field.label}`}
                        onClick={() => onRemoveField(group, field)}
                      >
                        <IconTrash size={16} />
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
};

const TourTypeDrawer = ({
  open,
  editingType,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  branchId: string;
  editingType: ITourCustomPostType | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: TourTypeForm) => void;
}) => {
  const form = useForm<TourTypeForm>({
    defaultValues: {
      label: '',
      pluralLabel: '',
      code: '',
      description: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      label: editingType?.label || '',
      pluralLabel: editingType?.pluralLabel || '',
      code: editingType?.code || '',
      description: editingType?.description || '',
      isActive: editingType?.isActive ?? true,
    });
  }, [editingType, form, open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <Sheet.View className="p-0 sm:max-w-lg">
        <Sheet.Header>
          <Sheet.Title>
            {editingType ? 'Edit Tour Type' : 'New Tour Type'}
          </Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Form {...form}>
          <form
            className="flex flex-col h-full"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <Sheet.Content className="p-4 space-y-4">
              <TextField
                form={form}
                name="label"
                label="Label"
                onChange={(value) => {
                  if (!editingType && !form.getValues('code')) {
                    form.setValue('code', generateCode(value));
                  }
                  if (!editingType && !form.getValues('pluralLabel')) {
                    form.setValue('pluralLabel', `${value}s`);
                  }
                }}
              />
              <TextField form={form} name="pluralLabel" label="Plural Label" />
              <TextField form={form} name="code" label="Key" />
              <TextAreaField
                form={form}
                name="description"
                label="Description"
              />
              <Form.Field
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <Form.Item className="flex items-center gap-2">
                    <Form.Control>
                      <Switch
                        checked={!!field.value}
                        onCheckedChange={field.onChange}
                      />
                    </Form.Control>
                    <Form.Label>Active</Form.Label>
                  </Form.Item>
                )}
              />
            </Sheet.Content>
            <Sheet.Footer>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">{editingType ? 'Save' : 'Create'}</Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};

const FieldGroupDrawer = ({
  open,
  typeOptions,
  editingGroup,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  branchId: string;
  typeOptions: ITourCustomPostType[];
  editingGroup: ITourCustomFieldGroup | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: FieldGroupForm) => void;
}) => {
  const form = useForm<FieldGroupForm>({
    defaultValues: {
      label: '',
      code: '',
      customTourTypeIds: [],
    },
  });
  const typeSelectOptions = useMemo(
    () =>
      typeOptions.map((type) => ({
        label: type.label || type.code || 'Untitled type',
        value: type._id,
      })),
    [typeOptions],
  );

  useEffect(() => {
    if (!open) return;
    form.reset({
      label: editingGroup?.label || '',
      code: editingGroup?.code || '',
      customTourTypeIds: editingGroup?.customTourTypeIds || [],
    });
  }, [editingGroup, form, open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <Sheet.View className="p-0 sm:max-w-lg">
        <Sheet.Header>
          <Sheet.Title>
            {editingGroup ? 'Edit Field Group' : 'New Field Group'}
          </Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Form {...form}>
          <form
            className="flex flex-col h-full"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <Sheet.Content className="p-4 space-y-4">
              <TextField
                form={form}
                name="label"
                label="Label"
                onChange={(value) => {
                  if (!editingGroup && !form.getValues('code')) {
                    form.setValue('code', generateCode(value));
                  }
                }}
              />
              <TextField form={form} name="code" label="Key" />
              <Form.Field
                control={form.control}
                name="customTourTypeIds"
                render={({ field }) => {
                  const selectedValues = field.value || [];

                  return (
                    <Form.Item>
                      <Form.Label>Show On Tour Types</Form.Label>
                      <Form.Control>
                        <MultipleSelector
                          value={typeSelectOptions.filter((option) =>
                            selectedValues.includes(option.value),
                          )}
                          options={typeSelectOptions}
                          placeholder="Select tour types"
                          hidePlaceholderWhenSelected
                          emptyIndicator="No tour types"
                          onChange={(options) =>
                            field.onChange(
                              options.map((option) => option.value),
                            )
                          }
                        />
                      </Form.Control>
                    </Form.Item>
                  );
                }}
              />
            </Sheet.Content>
            <Sheet.Footer>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">{editingGroup ? 'Save' : 'Create'}</Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};

const FieldDrawer = ({
  open,
  editingField,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  editingField: ITourCustomField | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: FieldForm) => void;
}) => {
  const form = useForm<FieldForm>({
    defaultValues: buildFieldFormValues(),
  });
  const type = form.watch('type');
  const needsOptions = ['select', 'multiSelect', 'radio'].includes(type);

  useEffect(() => {
    if (!open) return;
    form.reset(buildFieldFormValues(editingField));
  }, [editingField, form, open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <Sheet.View className="p-0 sm:max-w-lg">
        <Sheet.Header>
          <Sheet.Title>{editingField ? 'Edit Field' : 'New Field'}</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Form {...form}>
          <form
            className="flex flex-col h-full"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <Sheet.Content className="p-4 space-y-4">
              <TextField
                form={form}
                name="label"
                label="Label"
                onChange={(value) => {
                  if (!editingField && !form.getValues('code')) {
                    form.setValue('code', generateCode(value));
                  }
                }}
              />
              <TextField form={form} name="code" label="Key" />
              <Form.Field
                control={form.control}
                name="type"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Field Type</Form.Label>
                    <Form.Control>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <Select.Trigger>
                          <Select.Value placeholder="Select field type" />
                        </Select.Trigger>
                        <Select.Content>
                          {FIELD_TYPES.map((option) => (
                            <Select.Item
                              key={option.value}
                              value={option.value}
                            >
                              {option.label}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select>
                    </Form.Control>
                  </Form.Item>
                )}
              />
              <TextAreaField
                form={form}
                name="description"
                label="Description"
              />
              {needsOptions && (
                <TextField
                  form={form}
                  name="options"
                  label="Options"
                  placeholder="Option A, Option B"
                />
              )}
              <Form.Field
                control={form.control}
                name="isRequired"
                render={({ field }) => (
                  <Form.Item className="flex items-center gap-2">
                    <Form.Control>
                      <Switch
                        checked={!!field.value}
                        onCheckedChange={field.onChange}
                      />
                    </Form.Control>
                    <Form.Label>Required</Form.Label>
                  </Form.Item>
                )}
              />
            </Sheet.Content>
            <Sheet.Footer>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">{editingField ? 'Save' : 'Create'}</Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};

const TextField = ({
  form,
  name,
  label,
  placeholder,
  onChange,
}: {
  form: any;
  name: string;
  label: string;
  placeholder?: string;
  onChange?: (value: string) => void;
}) => (
  <Form.Field
    control={form.control}
    name={name}
    render={({ field }) => (
      <Form.Item>
        <Form.Label>{label}</Form.Label>
        <Form.Control>
          <Input
            {...field}
            placeholder={placeholder || label}
            onChange={(event) => {
              field.onChange(event);
              onChange?.(event.target.value);
            }}
          />
        </Form.Control>
        <Form.Message />
      </Form.Item>
    )}
  />
);

const TextAreaField = ({
  form,
  name,
  label,
}: {
  form: any;
  name: string;
  label: string;
}) => (
  <Form.Field
    control={form.control}
    name={name}
    render={({ field }) => (
      <Form.Item>
        <Form.Label>{label}</Form.Label>
        <Form.Control>
          <Textarea {...field} rows={4} />
        </Form.Control>
        <Form.Message />
      </Form.Item>
    )}
  />
);

const LoadingBlock = () => (
  <div className="flex items-center justify-center h-40">
    <Spinner />
  </div>
);
