import {
  Badge,
  Button,
  Collapsible,
  IconComponent,
  Spinner,
  Table,
  toast,
  Tooltip,
} from 'erxes-ui';
import { IconChevronLeft, IconPlus, IconX } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FIELD_TYPES_OBJECT,
  IPropertyForm,
  PropertyForm,
  useAddProperty,
  useFieldGroups,
  useFields,
} from 'ui-modules';
import { useVariantFields } from '../hooks/useVariantFields';

const CONTENT_TYPE = 'core:product';
const FIELDS_LIMIT = 100;

type VariantField = ReturnType<typeof useFields>['fields'][number];

// Opens `VariantFieldAddView` in place of the field list.
export const VariantFieldAddButton = ({ onClick }: { onClick: () => void }) => {
  const { t } = useTranslation('product', { keyPrefix: 'bulk-similarity' });

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-6 text-accent-foreground"
      title={t('add-variant-field', 'Add variant field')}
      aria-label={t('add-variant-field', 'Add variant field')}
      onClick={onClick}
    >
      <IconPlus className="size-4" />
    </Button>
  );
};

export const VariantFieldPicker = ({
  disabled = false,
}: {
  disabled?: boolean;
}) => {
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
                    className={
                      disabled
                        ? 'pointer-events-none opacity-60'
                        : 'cursor-pointer'
                    }
                    onClick={() =>
                      !disabled && handleToggleFieldValue(fieldId, option.value)
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
                    disabled={disabled}
                    onClick={() => handleRemoveField(fieldId)}
                  >
                    <IconX size={14} />
                  </Button>
                </Tooltip.Trigger>
                <Tooltip.Content>
                  {t('remove-field', 'Remove field')}
                </Tooltip.Content>
              </Tooltip>
            </Tooltip.Provider>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Picks a property to use as a variant axis, or creates one, in place of
 * the field list inside the panel; `onDone` goes back to the list.
 */
export const VariantFieldAddView = ({
  onDone,
  disabled = false,
}: {
  onDone: () => void;
  disabled?: boolean;
}) => {
  const { t } = useTranslation('product', { keyPrefix: 'bulk-similarity' });
  const { t: navT } = useTranslation('common', { keyPrefix: 'navigation' });
  const { fieldIds, handleToggleFieldValue } = useVariantFields();
  const { fields, loading, refetch } = useFields({
    contentType: CONTENT_TYPE,
    limit: FIELDS_LIMIT,
  });
  const [createGroup, setCreateGroup] = useState<string | null>(null);
  const { fieldGroups, loading: groupsLoading } = useFieldGroups({
    contentType: CONTENT_TYPE,
    limit: FIELDS_LIMIT,
  });

  const available = useMemo(
    () =>
      fields.filter(
        (f) => (f.options || []).length > 0 && !fieldIds.includes(f._id),
      ),
    [fields, fieldIds],
  );

  const groups = useMemo(() => {
    const byGroup = new Map<string, VariantField[]>();
    for (const field of available) {
      const key = field.groupId || '';
      byGroup.set(key, [...(byGroup.get(key) || []), field]);
    }

    const ordered = fieldGroups.map((group) => ({
      _id: group._id,
      name: group.name,
      fields: byGroup.get(group._id) || [],
    }));
    // Every group is listed, even with no field left to add: its + creates one.

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

  const pick = (fieldId: string, value: string) => {
    handleToggleFieldValue(fieldId, value);
    onDone();
  };

  const handlePick = (field: VariantField) => {
    if (disabled) return;
    const first = field.options?.[0];
    if (first) pick(field._id, first.value);
  };

  const renderList = () => {
    if ((loading || groupsLoading) && !groups.length) {
      return <Spinner containerClassName="py-6" />;
    }
    if (!groups.length) {
      return (
        <div className="flex justify-center items-center px-4 py-6 border border-dashed rounded-lg text-muted-foreground text-sm">
          {t(
            'no-property-groups',
            'Products have no property groups yet. Add one in Properties settings.',
          )}
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-2">
        {groups.map((group) => (
          <Collapsible
            key={group._id || 'ungrouped'}
            className="group"
            defaultOpen
          >
            <div className="relative">
              <Collapsible.Trigger asChild>
                <Button variant="secondary" className="w-full justify-start">
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
                    const FieldTypeIcon = fieldTypeObject?.icon;

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
                              {FieldTypeIcon && <FieldTypeIcon />}
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
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex h-7 items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          title={navT('back', 'Back')}
          aria-label={navT('back', 'Back')}
          onClick={() => (createGroup ? setCreateGroup(null) : onDone())}
        >
          <IconChevronLeft className="size-4" />
        </Button>
        <h3 className="text-xs font-medium">
          {createGroup
            ? t('new-property', 'New property')
            : t('add-variant-field', 'Add variant field')}
        </h3>
      </div>
      {createGroup ? (
        <CreatePropertyForm
          groupId={createGroup}
          refetchFields={refetch}
          onCreated={pick}
          onCancel={() => setCreateGroup(null)}
        />
      ) : (
        renderList()
      )}
    </div>
  );
};

const CreatePropertyForm = ({
  groupId,
  refetchFields,
  onCreated,
  onCancel,
}: {
  groupId: string;
  refetchFields: () => Promise<unknown>;
  onCreated: (fieldId: string, value: string) => void;
  onCancel: () => void;
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
        // Without an option it is no variant axis: back to the list, where
        // it shows once it has options.
        if (newId && firstValue) onCreated(newId, firstValue);
        else onCancel();
        toast({
          title: t('property-created', 'Property created'),
          variant: 'success',
        });
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
            groupId,
            isSearchable: false,
            isVisible: true,
            isVisibleToCreate: false,
            isRequired: false,
            isVisibleInCard: false,
            description: '',
            code: '',
            options: [],
          }}
          onCancel={onCancel}
          contentType={CONTENT_TYPE}
          layout="record"
        />
      </div>
    </div>
  );
};
