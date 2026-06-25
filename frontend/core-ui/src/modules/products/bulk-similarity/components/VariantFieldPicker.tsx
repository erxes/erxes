import {
  Badge,
  Button,
  Collapsible,
  IconComponent,
  Sheet,
  Table,
  toast,
  Tooltip,
} from 'erxes-ui';
import { IconArrowLeft, IconPlus, IconX } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFields, useFieldGroups } from 'ui-modules';
import { PropertyForm } from '@/properties/components/PropertyForm';
import { FIELD_TYPES_OBJECT } from '@/properties/constants/fieldTypes';
import { useAddProperty } from '@/properties/hooks/useAddProperty';
import { IPropertyForm } from '@/properties/types/Properties';
import { useVariantFields } from '../hooks/useVariantFields';

const CONTENT_TYPE = 'core:product';
const FIELDS_LIMIT = 100;

type VariantField = ReturnType<typeof useFields>['fields'][number];

export const VariantFieldAddButton = () => {
  const { fieldIds, handleToggleFieldValue } = useVariantFields();

  const { fields, loading, refetch } = useFields({
    contentType: CONTENT_TYPE,
    limit: FIELDS_LIMIT,
  });
  const optionFields = fields.filter((f) => (f.options || []).length > 0);

  return (
    <AddFieldSheet
      fields={optionFields}
      activeFieldIds={fieldIds}
      loading={loading}
      refetchFields={refetch}
      onPick={(fieldId, value) => handleToggleFieldValue(fieldId, value)}
    />
  );
};

export const VariantFieldPicker = () => {
  const { t } = useTranslation('product', { keyPrefix: 'bulk-similarity' });
  const { properties, fieldIds, handleToggleFieldValue, handleRemoveField } =
    useVariantFields();

  const { fields } = useFields({
    contentType: CONTENT_TYPE,
    limit: FIELDS_LIMIT,
  });

  const optionFields = fields.filter((f) => (f.options || []).length > 0);

  return (
    <div className="flex flex-col gap-3">
      {fieldIds.length === 0 && (
        <div className="flex justify-center items-center px-4 py-6 border border-dashed rounded-lg text-muted-foreground text-sm">
          {t('no-fields-added', 'No fields added yet.')}
        </div>
      )}

      {properties.map((property) => {
        const fieldId = property.fieldId;
        const field = optionFields.find((f) => f._id === fieldId);
        if (!field) return null;
        const options = field.options || [];
        const selected = property.values || [];

        return (
          <div
            key={fieldId}
            className="flex items-center gap-3 bg-foreground/5 p-2 rounded-lg"
          >
            <div className="w-32 shrink-0">
              <div className="font-medium text-sm truncate" title={field.name}>
                {field.name}
              </div>
            </div>
            <div className="flex flex-wrap flex-auto gap-1">
              {options.map((option) => {
                const isOn = selected.includes(option.value);
                return (
                  <Badge
                    key={option.value}
                    variant={isOn ? 'default' : 'secondary'}
                    className="cursor-pointer"
                    onClick={() =>
                      handleToggleFieldValue(fieldId, option.value)
                    }
                  >
                    {option.label}
                  </Badge>
                );
              })}
            </div>
            <Tooltip.Provider>
              <Tooltip>
                <Tooltip.Trigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 shrink-0"
                    onClick={() => handleRemoveField(fieldId)}
                  >
                    <IconX size={14} />
                  </Button>
                </Tooltip.Trigger>
                <Tooltip.Content>{t('remove-field', 'Remove field')}</Tooltip.Content>
              </Tooltip>
            </Tooltip.Provider>
          </div>
        );
      })}
    </div>
  );
};

const AddFieldSheet = ({
  fields,
  activeFieldIds,
  loading,
  refetchFields,
  onPick,
}: {
  fields: VariantField[];
  activeFieldIds: string[];
  loading: boolean;
  refetchFields: () => Promise<unknown>;
  onPick: (fieldId: string, value: string) => void;
}) => {
  const { t } = useTranslation('product', { keyPrefix: 'bulk-similarity' });
  const [open, setOpen] = useState(false);
  const [createGroup, setCreateGroup] = useState<string | null>(null);
  const { fieldGroups, loading: groupsLoading } = useFieldGroups({
    contentType: CONTENT_TYPE,
    limit: FIELDS_LIMIT,
  });

  const available = useMemo(
    () => fields.filter((f) => !activeFieldIds.includes(f._id)),
    [fields, activeFieldIds],
  );

  const groups = useMemo(() => {
    const byGroup = new Map<string, VariantField[]>();
    for (const field of available) {
      const key = field.groupId || '';
      byGroup.set(key, [...(byGroup.get(key) || []), field]);
    }

    const ordered = fieldGroups
      .map((group) => ({
        _id: group._id,
        name: group.name,
        fields: byGroup.get(group._id) || [],
      }))
      .filter((group) => group.fields.length);

    const ungrouped = [...byGroup.entries()]
      .filter(([key]) => !fieldGroups.some((group) => group._id === key))
      .flatMap(([, list]) => list);

    if (ungrouped.length) {
      ordered.push({
        _id: '',
        name: t('ungrouped', 'Ungrouped'),
        fields: ungrouped,
      });
    }

    return ordered;
  }, [available, fieldGroups, t]);

  const handlePick = (field: VariantField) => {
    const first = field.options?.[0];
    if (!first) return;
    onPick(field._id, first.value);
    setOpen(false);
  };

  const handleCreated = (fieldId: string, value: string) => {
    onPick(fieldId, value);
    setCreateGroup(null);
    setOpen(false);
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setCreateGroup(null);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <Sheet.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-6 text-accent-foreground"
        >
          <IconPlus className="size-4" />
        </Button>
      </Sheet.Trigger>
      <Sheet.View className="flex flex-col p-0 sm:max-w-md">
        <Sheet.Header className="gap-3">
          {createGroup && (
            <Button
              variant="ghost"
              size="icon"
              className="-ml-2 size-7"
              onClick={() => setCreateGroup(null)}
            >
              <IconArrowLeft className="size-4" />
            </Button>
          )}
          <Sheet.Title>
            {createGroup
              ? t('new-property', 'New property')
              : t('add-variant-field', 'Add variant field')}
          </Sheet.Title>
          <Sheet.Close />
          <Sheet.Description className="sr-only">
            {t(
              'add-field-description',
              'Pick a property to use as a variant axis, or create a new one.',
            )}
          </Sheet.Description>
        </Sheet.Header>

        {createGroup ? (
          <CreatePropertyForm
            groupId={createGroup}
            refetchFields={refetchFields}
            onCreated={handleCreated}
          />
        ) : (
          <Sheet.Content className="flex-auto p-5 overflow-auto">
            <div className="flex flex-col gap-2">
              {groups.map((group) => (
                <Collapsible
                  key={group._id || 'ungrouped'}
                  className="group"
                  defaultOpen
                >
                  <div className="relative">
                    <Collapsible.Trigger asChild>
                      <Button
                        variant="secondary"
                        className="w-full justify-start"
                      >
                        <Collapsible.TriggerIcon />
                        {group.name}
                      </Button>
                    </Collapsible.Trigger>
                    {group._id && (
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute right-0.5 top-0.5 size-6 px-0"
                        onClick={() => setCreateGroup(group._id)}
                      >
                        <IconPlus />
                      </Button>
                    )}
                  </div>

                  <Collapsible.Content className="pt-2">
                    <Table className="[&_tr_td]:border-b-0 [&_tr_td:first-child]:border-l-0 [&_tr_td]:border-r-0">
                      <Table.Body>
                        {group.fields.map((field) => {
                          const fieldTypeObject =
                            FIELD_TYPES_OBJECT[field.type || ''];

                          return (
                            <Table.Row
                              key={field._id}
                              className="hover:bg-sidebar cursor-pointer"
                              onClick={() => handlePick(field)}
                            >
                              <Table.Cell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-full w-full justify-start hover:bg-transparent"
                                  asChild
                                >
                                  <div>
                                    <IconComponent name={field.icon} />
                                    {field.name}
                                  </div>
                                </Button>
                              </Table.Cell>
                              <Table.Cell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-full w-full justify-end hover:bg-transparent text-muted-foreground"
                                  asChild
                                >
                                  <div>
                                    {fieldTypeObject?.icon}
                                    {fieldTypeObject?.label}
                                  </div>
                                </Button>
                              </Table.Cell>
                            </Table.Row>
                          );
                        })}
                      </Table.Body>
                    </Table>
                  </Collapsible.Content>
                </Collapsible>
              ))}
            </div>
          </Sheet.Content>
        )}
      </Sheet.View>
    </Sheet>
  );
};

const CreatePropertyForm = ({
  groupId,
  refetchFields,
  onCreated,
}: {
  groupId: string;
  refetchFields: () => Promise<unknown>;
  onCreated: (fieldId: string, value: string) => void;
}) => {
  const { t } = useTranslation('product', { keyPrefix: 'bulk-similarity' });
  const { addProperty, loading } = useAddProperty();

  const handleSubmit = (data: IPropertyForm) => {
    addProperty({
      variables: {
        ...data,
        groupId: groupId || undefined,
        contentType: CONTENT_TYPE,
      },
      onCompleted: async (res) => {
        await refetchFields();
        const newId = res?.fieldAdd?._id;
        const firstValue = data.options?.[0]?.value;
        if (newId && firstValue) onCreated(newId, firstValue);
        toast({ title: t('property-created', 'Property created'), variant: 'success' });
      },
      onError: (error) =>
        toast({
          title: t('error', 'Error'),
          variant: 'destructive',
          description: error.message,
        }),
    });
  };

  return (
    <Sheet.Content className="flex-auto p-5 overflow-auto">
      <div className="flex flex-col gap-5">
        <div onSubmit={(e) => e.stopPropagation()}>
          <PropertyForm
            onSubmit={handleSubmit}
            loading={loading}
            disableType
            defaultValues={{
              icon: '123',
              name: '',
              type: 'multiSelect',
              isSearchable: false,
              description: '',
              code: '',
              validation: '',
              options: [],
            }}
          />
        </div>
      </div>
    </Sheet.Content>
  );
};
