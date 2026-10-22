import { useQuery, type QueryResult } from '@apollo/client';
import {
  IconApps,
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconArrowRight,
} from '@tabler/icons-react';
import {
  Button,
  Collapsible,
  Command,
  Checkbox,
  Form,
  Input,
  Popover,
  Switch,
  Textarea,
} from 'erxes-ui';
import { useEffect, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { DataModel, ModelField, OffsetList } from '../types';
import { DATA_MODEL_FIELDS } from '../graphql';
import { relationApiName } from '../validation';
import type { DataModelFieldFormValues } from './DataModelFieldForm';
import { DataModelIcon } from './DataModelVisuals';

export const DataModelRelationSettings = ({
  model,
  field,
  form,
  loading,
  catalog,
  targets,
  members,
}: {
  model: DataModel;
  field?: ModelField;
  form: UseFormReturn<DataModelFieldFormValues>;
  loading: boolean;
  catalog: QueryResult<{ dataModelList: OffsetList<DataModel> }>;
  targets: DataModel[];
  members: ModelField[];
}) => {
  const [destinationOpen, setDestinationOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const label = form.watch('label');
  const name = form.watch('name');
  const inverseLabel = form.watch('inverseLabel');
  const targetModelIds = form.watch('targetModelIds');
  const selectedIds =
    field?.relation?.morphId && members.length
      ? members.map((entry) => entry.relation?.targetModelId ?? '')
      : targetModelIds;
  const selectedTargets = selectedIds.flatMap((id) => {
    const target = targets.find((entry) => entry._id === id);
    return target ? [target] : [];
  });
  const targetModelId = selectedIds.length === 1 ? selectedIds[0] : '';
  useEffect(() => {
    if (field?.relation?.morphId && members.length)
      form.setValue(
        'targetModelIds',
        members.map((entry) => entry.relation?.targetModelId ?? ''),
      );
  }, [field, members, form]);
  const multiple = form.watch('multiple');
  const target = targets.find((entry) => entry._id === targetModelId);
  const inverseFields = useQuery<{ dataModelFieldList: ModelField[] }>(
    DATA_MODEL_FIELDS,
    {
      variables: {
        dataModelId: field?.relation?.targetModelId ?? '',
        archived: false,
      },
      skip: !field?.relation,
    },
  );
  const destinationFieldLabel = inverseFields.data?.dataModelFieldList.find(
    (entry) => entry._id === field?.relation?.inverseFieldId,
  )?.label;
  const errors = form.formState.errors;
  useEffect(() => {
    if (field) return;
    const forwardName = relationApiName(label);
    if (!form.getFieldState('name').isDirty) {
      const reserved = model.systemFields.some(
        (entry) => entry.code === forwardName,
      );
      form.setValue(
        'name',
        reserved ? `${forwardName.slice(0, 55)}Relation` : forwardName,
      );
    }
    if (!form.getFieldState('inverseName').isDirty) {
      const inverseName = relationApiName(inverseLabel);
      form.setValue(
        'inverseName',
        targetModelId === model._id && inverseName === form.getValues('name')
          ? `${inverseName.slice(0, 56)}Reverse`
          : inverseName,
      );
    }
  }, [
    field,
    form,
    label,
    name,
    inverseLabel,
    model._id,
    model.systemFields,
    targetModelId,
  ]);
  const chooseTarget = (targetId: string) => {
    const next = targetModelIds.includes(targetId)
      ? targetModelIds.filter((id) => id !== targetId)
      : [...targetModelIds, targetId];
    form.setValue('targetModelIds', next, {
      shouldDirty: true,
      shouldValidate: true,
    });
    if (!form.getFieldState('label').isDirty) {
      const selected = targets.find((entry) => entry._id === next[0]);
      if (next.length > 1)
        form.setValue(
          'label',
          multiple ? 'Related records' : 'Related record',
          { shouldValidate: true },
        );
      else if (selected)
        form.setValue(
          'label',
          multiple ? selected.labelPlural : selected.labelSingular,
          { shouldValidate: true },
        );
    }
  };
  const setMultiple = (value: string) => {
    form.setValue('multiple', value === 'many', { shouldDirty: true });
    if (!form.getFieldState('label').isDirty) {
      form.setValue(
        'label',
        selectedIds.length > 1
          ? value === 'many'
            ? 'Related records'
            : 'Related record'
          : target
          ? value === 'many'
            ? target.labelPlural
            : target.labelSingular
          : '',
        { shouldValidate: true },
      );
    }
  };
  return (
    <>
      <section className="space-y-3">
        <div>
          <h3 className="text-base font-semibold tracking-tight">
            What should this connect to?
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose the kind of records your team will select on each{' '}
            {model.labelSingular.toLowerCase()}.
          </p>
        </div>
        <Form.Field
          control={form.control}
          name="targetModelIds"
          render={({ field: control }) => (
            <Form.Item className="space-y-1.5">
              <Form.Label className="font-sans text-xs font-normal normal-case text-muted-foreground">
                Related objects
              </Form.Label>
              <Popover open={destinationOpen} onOpenChange={setDestinationOpen}>
                <Popover.Trigger asChild>
                  <Form.Control>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      aria-expanded={destinationOpen}
                      disabled={loading || Boolean(field)}
                      aria-label="Object destination"
                      className="h-11 w-full justify-start px-3 font-normal"
                    >
                      {selectedIds.length > 1 ? (
                        <IconApps className="size-4 text-muted-foreground" />
                      ) : (
                        target && (
                          <DataModelIcon
                            name={target.name}
                            icon={target.icon}
                          />
                        )
                      )}
                      <span className="min-w-0 flex-1 truncate text-left">
                        {selectedIds.length > 1
                          ? `${selectedIds.length} objects`
                          : target?.labelSingular ??
                            field?.relation?.targetModelLabel ??
                            (catalog.loading
                              ? 'Loading objects…'
                              : 'Choose an object')}
                      </span>
                      <IconChevronDown className="size-3.5 text-muted-foreground" />
                    </Button>
                  </Form.Control>
                </Popover.Trigger>
                <Popover.Content
                  align="start"
                  className="w-[var(--radix-popover-trigger-width)] min-w-56 p-0"
                >
                  <Command>
                    <Command.Input
                      placeholder="Search objects…"
                      aria-label="Search destination objects"
                    />
                    <Command.List>
                      <Command.Empty>
                        {catalog.loading
                          ? 'Loading objects…'
                          : 'No matching objects.'}
                      </Command.Empty>
                      {targets.map((entry) => {
                        const checked = control.value.includes(entry._id);
                        const selfConflict =
                          entry._id === model._id
                            ? control.value.some((id) => id !== model._id)
                            : control.value.includes(model._id);
                        return (
                          <Command.Item
                            key={entry._id}
                            value={`${entry.labelSingular} ${entry.labelPlural} ${entry.name} ${entry._id}`}
                            disabled={
                              selfConflict ||
                              (!checked && control.value.length >= 20)
                            }
                            onSelect={() => chooseTarget(entry._id)}
                          >
                            <Checkbox
                              checked={checked}
                              tabIndex={-1}
                              aria-hidden
                              className="pointer-events-none"
                            />
                            <DataModelIcon
                              name={entry.name}
                              icon={entry.icon}
                            />
                            <span className="flex-1 truncate">
                              {entry.labelSingular}
                            </span>
                            {checked && <IconCheck className="sr-only" />}
                          </Command.Item>
                        );
                      })}
                    </Command.List>
                  </Command>
                  {(catalog.data?.dataModelList.totalCount ?? 0) >
                    (catalog.data?.dataModelList.list.length ?? 0) && (
                    <div className="border-t p-1">
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full"
                        disabled={catalog.loading}
                        onClick={() => {
                          void catalog
                            .fetchMore({
                              variables: {
                                offset:
                                  catalog.data?.dataModelList.list.length ?? 0,
                              },
                              updateQuery: (previous, { fetchMoreResult }) => ({
                                dataModelList: {
                                  ...fetchMoreResult.dataModelList,
                                  list: [
                                    ...previous.dataModelList.list,
                                    ...fetchMoreResult.dataModelList.list,
                                  ],
                                },
                              }),
                            })
                            .catch(() => undefined);
                        }}
                      >
                        Load more objects
                      </Button>
                    </div>
                  )}
                </Popover.Content>
              </Popover>
              <Form.Message />
              <Form.Description>
                Choose one or more object types. You will select the actual
                records later.
              </Form.Description>
            </Form.Item>
          )}
        />
        {!field && selectedIds.includes(model._id) && (
          <p className="text-xs text-muted-foreground">
            You can link records of this same object, but cannot combine it with
            other object types.
          </p>
        )}
        {catalog.error && (
          <div role="alert" className="text-sm text-destructive">
            {catalog.error.message}
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                void catalog.refetch().catch(() => undefined);
              }}
            >
              Try again
            </Button>
          </div>
        )}
      </section>
      <section className="space-y-3">
        <h3 className="text-base font-semibold tracking-tight">
          How many records can be selected?
        </h3>
        <div
          className="grid gap-3 sm:grid-cols-2"
          role="group"
          aria-label="Relation type"
        >
          {[
            {
              value: 'one',
              title: 'One record',
              subtitle: 'Belongs to',
              description: 'For an owner, a location or a primary contact.',
            },
            {
              value: 'many',
              title: 'Multiple records',
              subtitle: 'Has many',
              description:
                'For participants, related assets or shared contacts.',
            },
          ].map((option) => (
            <Button
              key={option.value}
              type="button"
              variant="outline"
              aria-pressed={multiple === (option.value === 'many')}
              disabled={loading || Boolean(field)}
              className={`h-auto items-start justify-start whitespace-normal p-4 text-left ${
                multiple === (option.value === 'many')
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : ''
              }`}
              onClick={() => setMultiple(option.value)}
            >
              <span>
                <span className="block font-medium">{option.title}</span>
                <span className="mt-1 block text-xs font-normal text-muted-foreground">
                  {option.description}
                </span>
                <span className="mt-3 block text-[10px] font-normal text-muted-foreground">
                  {option.subtitle}
                </span>
              </span>
            </Button>
          ))}
        </div>
        {field && (
          <p className="text-xs text-muted-foreground">
            The destinations and selection limit cannot change after creation.
            Create a new relation if you need a different setup.
          </p>
        )}
      </section>
      <Form.Field
        control={form.control}
        name="label"
        render={({ field: control }) => (
          <Form.Item>
            <Form.Label>Relation name</Form.Label>
            <Form.Control>
              <Input
                {...control}
                placeholder="Choose a destination above, or name this link"
                disabled={loading}
              />
            </Form.Control>
            <Form.Description>
              Filled in from your destination. Rename it if a role such as Owner
              is clearer.
            </Form.Description>
            <Form.Message />
          </Form.Item>
        )}
      />
      <section
        className="space-y-4 rounded-lg bg-muted/40 p-5"
        aria-label="Relation preview"
      >
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <DataModelIcon name={model.name} icon={model.icon} />
          <span className="font-medium">{model.labelSingular}</span>
          <IconArrowRight className="size-4 text-muted-foreground" />
          <span>
            {multiple ? 'Several' : 'One'}{' '}
            {selectedTargets.length === 1
              ? (multiple
                  ? selectedTargets[0].labelPlural
                  : selectedTargets[0].labelSingular
                ).toLowerCase()
              : 'linked record' + (multiple ? 's' : '')}
          </span>
        </div>
        {selectedTargets.length > 1 && (
          <p className="text-xs text-muted-foreground">
            From {selectedTargets.map((entry) => entry.labelPlural).join(', ')}.
          </p>
        )}
        <div className="space-y-2 border-t pt-3 text-sm text-muted-foreground">
          <p>
            After saving, open or create a record in {model.labelPlural} and
            choose records in{' '}
            <span className="font-medium text-foreground">
              {label || 'this field'}
            </span>
            . Creating the relation alone does not link any records.
          </p>
          <p className="text-xs">
            Related records automatically show the link back under “
            {field
              ? destinationFieldLabel ?? model.labelPlural
              : inverseLabel || model.labelPlural}
            ”. Click a linked name to open its details.
          </p>
        </div>
      </section>
      <Collapsible
        open={
          advancedOpen ||
          Boolean(
            errors.name ||
              errors.inverseName ||
              errors.inverseLabel ||
              errors.description,
          )
        }
        onOpenChange={setAdvancedOpen}
        className="space-y-4"
      >
        <Collapsible.Trigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="-ml-2 font-normal text-muted-foreground"
          >
            <IconChevronRight
              className={`size-3.5 transition-transform ${
                advancedOpen ? 'rotate-90' : ''
              }`}
            />
            More settings
          </Button>
        </Collapsible.Trigger>
        <Collapsible.Content className="space-y-4">
          {!field && (
            <Form.Field
              control={form.control}
              name="inverseLabel"
              render={({ field: control }) => (
                <Form.Item>
                  <Form.Label>Name on related object</Form.Label>
                  <Form.Control>
                    <Input {...control} disabled={loading} />
                  </Form.Control>
                  <Form.Description>
                    Defaults to {model.labelPlural}. Change it only if your team
                    uses a different name.
                  </Form.Description>
                  <Form.Message />
                </Form.Item>
              )}
            />
          )}
          {(field
            ? (['name'] as const)
            : (['name', 'inverseName'] as const)
          ).map((name) => (
            <Form.Field
              key={name}
              control={form.control}
              name={name}
              render={({ field: control }) => (
                <Form.Item>
                  <Form.Label>
                    {name === 'name' ? 'API name' : 'Related object API name'}
                  </Form.Label>
                  {field ? (
                    <p className="font-mono text-xs">{control.value}</p>
                  ) : (
                    <Form.Control>
                      <Input {...control} disabled={loading} />
                    </Form.Control>
                  )}
                  <Form.Description>
                    Generated automatically for integrations.
                  </Form.Description>
                  <Form.Message />
                </Form.Item>
              )}
            />
          ))}
          <Form.Field
            control={form.control}
            name="description"
            render={({ field: control }) => (
              <Form.Item>
                <Form.Label>Description (optional)</Form.Label>
                <Form.Control>
                  <Textarea {...control} disabled={loading} />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            control={form.control}
            name="required"
            render={({ field: control }) => (
              <Form.Item className="flex items-center justify-between">
                <Form.Label>Required</Form.Label>
                <Form.Control>
                  <Switch
                    checked={control.value}
                    onCheckedChange={control.onChange}
                    disabled={loading}
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
        </Collapsible.Content>
      </Collapsible>
    </>
  );
};
