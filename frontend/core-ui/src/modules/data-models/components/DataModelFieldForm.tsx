import { zodResolver } from '@hookform/resolvers/zod';
import { IconArchive, IconChevronRight } from '@tabler/icons-react';
import {
  Button,
  Collapsible,
  Form,
  Input,
  Sheet,
  Switch,
  Textarea,
} from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { DataModelRelationSettings } from './DataModelRelationSettings';
import { dataModelErrorMessage } from '../errorMessage';
import { relationMembers } from '../relationGroups';
import { useDataModelFields } from '../hooks';
import { useQuery } from '@apollo/client';
import { useEffect, useMemo, useState } from 'react';
import {
  dataModelFieldFormSchema,
  dataModelFieldOptions,
  relationApiName,
} from '../validation';
import { DataModelFieldOptions } from './DataModelFieldOptions';
import { dataModelFieldLabel } from './DataModelVisuals';
import { DataModelFieldIcon } from './DataModelVisuals';
import { useDataModelEditorClose } from '../useDataModelEditorClose';
import {
  DATA_MODEL_FIELD_PRESETS,
  FIELD_TYPE_DESCRIPTIONS,
} from '../fieldPresets';
import {
  DATA_MODEL_FIELD_CREATE,
  DATA_MODEL_FIELD_UPDATE,
  DATA_MODEL_LIST,
} from '../graphql';
import { useDataModelMutation } from '../hooks';
import {
  DATA_MODEL_FIELD_TYPES,
  type DataModel,
  type ModelField,
} from '../types';

export type DataModelFieldFormValues = z.infer<
  ReturnType<typeof dataModelFieldFormSchema>
>;

export const DataModelFieldForm = ({
  model,
  field,
  initialType = 'text',
  onArchive,
  onClose,
}: {
  model: DataModel;
  field?: ModelField;
  initialType?: 'text' | 'relation';
  onArchive?: () => void;
  onClose: () => void;
}) => {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [choosingType, setChoosingType] = useState(false);
  const form = useForm<DataModelFieldFormValues>({
    resolver: zodResolver(dataModelFieldFormSchema(Boolean(field), model._id)),
    defaultValues: {
      name: field?.relation?.morphName ?? field?.name ?? '',
      label: field?.label ?? '',
      description: field?.description ?? '',
      type: field?.type ?? initialType,
      required: field?.required ?? false,
      options: field?.options ?? [],
      targetModelIds: field?.relation ? [field.relation.targetModelId] : [],
      multiple: field?.relation?.multiple ?? false,
      inverseName: '',
      inverseLabel: field ? '' : model.labelPlural,
    },
  });
  const type = form.watch('type');
  const label = form.watch('label');
  useEffect(() => {
    if (!field && type !== 'relation' && !form.getFieldState('name').isDirty)
      form.setValue('name', relationApiName(label, 'field'));
  }, [field, form, label, type]);
  const existingFields = useDataModelFields(model._id, false);
  const members = useMemo(
    () => (field ? relationMembers(field, existingFields.fields) : []),
    [field, existingFields.fields],
  );
  const noun = type === 'relation' ? 'relation' : 'field';
  const catalog = useQuery<{
    dataModelList: { list: DataModel[]; totalCount: number };
  }>(DATA_MODEL_LIST, {
    variables: { archived: false, limit: 200, offset: 0 },
    skip: type !== 'relation',
  });
  const targets = (catalog.data?.dataModelList.list ?? []).filter(
    (entry) =>
      entry.source === 'CUSTOM' ||
      ['customer', 'company', 'product', 'user'].includes(entry.name),
  );
  const choice = ['select', 'radio', 'multiSelect', 'check'].includes(type);
  const [save, { loading, error }] = useDataModelMutation(
    field ? DATA_MODEL_FIELD_UPDATE : DATA_MODEL_FIELD_CREATE,
    `${type === 'relation' ? 'Relation' : 'Field'} ${
      field ? 'updated' : 'created'
    }`,
  );
  const close = useDataModelEditorClose({
    dirty: form.formState.isDirty,
    loading,
    onClose,
  });
  const submit = form.handleSubmit(
    async ({
      name,
      type: fieldType,
      options: choiceOptions,
      targetModelIds,
      multiple,
      inverseName,
      inverseLabel,
      ...values
    }) => {
      const options = choice ? dataModelFieldOptions(choiceOptions) : [];
      try {
        const result = await save({
          variables: {
            dataModelId: model._id,
            ...(field
              ? { _id: field._id, expectedVersion: field.version }
              : {}),
            input: {
              ...values,
              options,
              ...(field
                ? {}
                : {
                    name,
                    type: fieldType,
                    autoName: !form.getFieldState('name').isDirty,
                  }),
              ...(!field && fieldType === 'relation'
                ? {
                    relation: {
                      targetModelIds,
                      multiple,
                      inverseName,
                      autoInverseName:
                        !form.getFieldState('inverseName').isDirty,
                      inverseLabel,
                    },
                  }
                : {}),
            },
          },
        });
        if (result.data) onClose();
      } catch {
        /* Preserve the form after validation or version conflicts. */
      }
    },
  );
  return (
    <Sheet
      open
      onOpenChange={(open) => {
        if (!open) void close();
      }}
    >
      <Sheet.View className="p-0 sm:max-w-2xl">
        <Form {...form}>
          <form onSubmit={submit} className="flex h-full flex-col">
            <Sheet.Header>
              <Sheet.Title>
                {field ? 'Edit' : 'New'} {noun}
              </Sheet.Title>
              <Sheet.Description className="sr-only">
                Choose a name and the kind of information this field holds.
              </Sheet.Description>
              <Sheet.Close />
            </Sheet.Header>
            <Sheet.Content
              className={`overflow-y-auto ${
                type === 'relation'
                  ? 'space-y-8 px-6 py-6'
                  : 'space-y-5 px-5 py-4'
              }`}
            >
              {type === 'relation' ? (
                <DataModelRelationSettings
                  model={model}
                  field={field}
                  form={form}
                  loading={loading}
                  catalog={catalog}
                  targets={targets}
                  members={members}
                />
              ) : (
                <>
                  {!field && (
                    <section
                      className="space-y-3 rounded-md bg-muted/40 p-4"
                      aria-label="Field suggestions"
                    >
                      <div>
                        <h3 className="text-sm font-medium">
                          Start with a familiar field
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Pick a starting point, or choose your own name and
                          type below.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {DATA_MODEL_FIELD_PRESETS.map((preset) => (
                          <Button
                            key={preset.label}
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={loading}
                            onClick={() => {
                              setChoosingType(false);
                              form.setValue('label', preset.label, {
                                shouldDirty: true,
                                shouldValidate: true,
                              });
                              form.setValue('type', preset.type, {
                                shouldDirty: true,
                              });
                              form.setValue(
                                'options',
                                preset.options.map((label) => ({
                                  label,
                                  value: '',
                                })),
                                { shouldDirty: true, shouldValidate: true },
                              );
                            }}
                          >
                            <DataModelFieldIcon type={preset.type} />
                            {preset.label}
                          </Button>
                        ))}
                      </div>
                    </section>
                  )}
                  <Form.Field
                    control={form.control}
                    name="label"
                    render={({ field: control }) => (
                      <Form.Item>
                        <Form.Label>Field name</Form.Label>
                        <Form.Control>
                          <Input
                            {...control}
                            placeholder="e.g. Delivery date"
                            disabled={loading}
                          />
                        </Form.Control>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                  <Form.Field
                    control={form.control}
                    name="type"
                    render={({ field: control }) => (
                      <Form.Item>
                        <Form.Label>Field type</Form.Label>
                        {field ? (
                          <p className="text-sm">
                            {dataModelFieldLabel(control.value)}
                          </p>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between gap-3 rounded-md border bg-muted/20 p-3">
                              <div className="flex items-center gap-3">
                                <DataModelFieldIcon type={control.value} />
                                <div>
                                  <p className="text-sm font-medium">
                                    {dataModelFieldLabel(control.value)}
                                  </p>
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    {FIELD_TYPE_DESCRIPTIONS[control.value]}
                                  </p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                disabled={loading}
                                onClick={() => setChoosingType(!choosingType)}
                              >
                                {choosingType
                                  ? 'Keep this type'
                                  : 'Change type'}
                              </Button>
                            </div>
                            {choosingType && (
                              <div
                                className="grid grid-cols-1 gap-2 sm:grid-cols-2"
                                role="group"
                                aria-label="Field type"
                              >
                                {DATA_MODEL_FIELD_TYPES.map((entry) => (
                                  <Button
                                    key={entry.value}
                                    type="button"
                                    variant="outline"
                                    aria-pressed={control.value === entry.value}
                                    disabled={loading}
                                    className={`h-auto min-h-16 justify-start gap-3 whitespace-normal px-3 py-3 text-left ${
                                      control.value === entry.value
                                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                        : 'text-muted-foreground'
                                    }`}
                                    onClick={() => {
                                      control.onChange(entry.value);
                                      setChoosingType(false);
                                    }}
                                  >
                                    <DataModelFieldIcon type={entry.value} />
                                    <span>
                                      <span className="block text-sm font-medium text-foreground">
                                        {entry.label}
                                      </span>
                                      <span className="mt-1 block text-xs font-normal">
                                        {FIELD_TYPE_DESCRIPTIONS[entry.value]}
                                      </span>
                                    </span>
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                  <Form.Field
                    control={form.control}
                    name="required"
                    render={({ field: control }) => (
                      <Form.Item className="flex items-center justify-between">
                        <div>
                          <Form.Label>Require a value</Form.Label>
                          <Form.Description>
                            Records must have a value for this field.
                          </Form.Description>
                        </div>
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
                  {choice && (
                    <DataModelFieldOptions
                      form={form}
                      field={field}
                      loading={loading}
                    />
                  )}
                  <Collapsible
                    open={
                      advancedOpen ||
                      Boolean(
                        form.formState.errors.name ||
                          form.formState.errors.description,
                      )
                    }
                    onOpenChange={setAdvancedOpen}
                    className="space-y-4 border-t pt-3"
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
                      <Form.Field
                        control={form.control}
                        name="description"
                        render={({ field: control }) => (
                          <Form.Item>
                            <Form.Label>Description (optional)</Form.Label>
                            <Form.Control>
                              <Textarea
                                {...control}
                                disabled={loading}
                                placeholder="Help your team understand this field."
                              />
                            </Form.Control>
                            <Form.Message />
                          </Form.Item>
                        )}
                      />
                      <Form.Field
                        control={form.control}
                        name="name"
                        render={({ field: control }) => (
                          <Form.Item>
                            <Form.Label>API name</Form.Label>
                            {field ? (
                              <p className="font-mono text-xs">
                                {control.value}
                              </p>
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
                    </Collapsible.Content>
                  </Collapsible>
                </>
              )}
              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {dataModelErrorMessage(error)}
                </p>
              )}
            </Sheet.Content>
            <Sheet.Footer>
              {field && onArchive && !field.relation?.isInverse && (
                <Button
                  type="button"
                  variant="ghost"
                  className="mr-auto text-muted-foreground"
                  onClick={onArchive}
                  disabled={loading}
                >
                  <IconArchive />
                  Archive {noun}
                </Button>
              )}
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  void close();
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving…' : `${field ? 'Save' : 'Create'} ${noun}`}
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
