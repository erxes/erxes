import { zodResolver } from '@hookform/resolvers/zod';
import { IconPlus, IconTrash, IconVariable } from '@tabler/icons-react';
import {
  Button,
  ChoiceboxGroup,
  Form,
  Input,
  ScrollArea,
  Select,
  Sheet,
  Spinner,
  Textarea,
  toast,
} from 'erxes-ui';
import { useEffect, useMemo, useRef } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useDataExtensionFieldMutations } from '../hooks/useDataExtensionFieldMutations';
import {
  DATA_EXTENSION_FIELD_TYPES,
  DATA_EXTENSION_RELATION_CREATE_KINDS,
  DataExtensionRelationCreateKind,
  hasFieldOptions,
  IDataExtensionField,
  IDataExtensionRecordType,
  useDataExtensionRecordTypes,
} from 'ui-modules';
import { FIELD_TYPE_GRAPHQL, FieldTypeIcon } from './fieldTypeIcons';

const KEY_PATTERN = /^[a-z][a-zA-Z0-9]{0,62}$/;

const buildSchema = (t: (key: string) => string, isEdit: boolean) =>
  z
    .object({
      label: z
        .string()
        .trim()
        .min(1, t('validation.label-required'))
        .max(120, t('validation.label-too-long')),
      key: z.string().regex(KEY_PATTERN, t('validation.key-format')),
      type: z.enum(DATA_EXTENSION_FIELD_TYPES),
      description: z.string().max(500, t('validation.description-too-long')),
      options: z.array(
        z.object({
          value: z
            .string()
            .trim()
            .min(1, t('validation.option-value-required'))
            .max(100, t('validation.option-value-too-long')),
          label: z.string().trim().max(120, t('validation.label-too-long')),
        }),
      ),
      targetRecordType: z.string(),
      kind: z.enum(DATA_EXTENSION_RELATION_CREATE_KINDS),
      inverseLabel: z.string().trim().max(120, t('validation.label-too-long')),
      inverseKey: z.string(),
    })
    .superRefine((values, ctx) => {
      if (values.type === 'relation' && !isEdit) {
        if (!values.targetRecordType) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['targetRecordType'],
            message: t('validation.target-required'),
          });
        }

        if (!values.inverseLabel) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['inverseLabel'],
            message: t('validation.label-required'),
          });
        }

        if (!KEY_PATTERN.test(values.inverseKey)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['inverseKey'],
            message: t('validation.key-format'),
          });
        }
      }

      if (!hasFieldOptions(values.type)) {
        return;
      }

      if (!values.options.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['options'],
          message: t('validation.options-required'),
        });
      }

      const seen = new Set<string>();

      values.options.forEach((option, index) => {
        if (seen.has(option.value)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['options', index, 'value'],
            message: t('validation.option-duplicate'),
          });
        }

        seen.add(option.value);
      });
    });

type FormValues = z.infer<ReturnType<typeof buildSchema>>;

const relationDefaults = {
  targetRecordType: '',
  kind: 'manyToOne' as const,
  inverseLabel: '',
  inverseKey: '',
};

/** Suggests a key from an English-ish label; other scripts need a typed key. */
const suggestKey = (label: string) => {
  const words = label
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const key = words
    .map((word, index) =>
      index === 0
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    )
    .join('')
    .replace(/^[0-9]+/, '');

  return key.slice(0, 63);
};

const emptyValues = (): FormValues => ({
  label: '',
  key: '',
  type: 'text',
  description: '',
  options: [],
  ...relationDefaults,
});

const valuesFromField = (field: IDataExtensionField): FormValues => ({
  label: field.label,
  key: field.key,
  type: field.type,
  description: field.description || '',
  options: (field.options || []).map(({ value, label }) => ({ value, label })),
  ...relationDefaults,
  ...(field.relation
    ? {
        targetRecordType: field.relation.targetRecordType,
        kind: field.relation.kind,
      }
    : {}),
});

export const DataExtensionFieldSheet = ({
  open,
  onOpenChange,
  recordType,
  field,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recordType: IDataExtensionRecordType;
  field?: IDataExtensionField;
}) => {
  const { t } = useTranslation('dataExtensions');
  const { addField, addRelation, editField, saving } =
    useDataExtensionFieldMutations();
  const { recordTypes } = useDataExtensionRecordTypes();
  const isEdit = Boolean(field);
  const schema = useMemo(() => buildSchema(t, isEdit), [t, isEdit]);
  const keyTouched = useRef(false);
  const inverseKeyTouched = useRef(false);
  const inverseLabelTouched = useRef(false);
  const recordTypeLabel = (value: string) =>
    t(
      `record-types.${value}`,
      recordTypes.find((candidate) => candidate.recordType === value)?.label ||
        value,
    );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: field ? valuesFromField(field) : emptyValues(),
  });

  const options = useFieldArray({ control: form.control, name: 'options' });
  const type = form.watch('type');
  const lockedOptionValues = useMemo(
    () => new Set((field?.options || []).map((option) => option.value)),
    [field],
  );

  const relationPreviewType = () => {
    const kind = form.watch('kind');
    const typeName =
      recordTypes.find(
        (candidate) => candidate.recordType === form.watch('targetRecordType'),
      )?.typeName || 'Record';

    return kind === 'manyToMany' || kind === 'oneToMany'
      ? `[${typeName}!]!`
      : typeName;
  };

  // Record types grouped by the module that owns them, in registry order.
  const recordTypeGroups = useMemo(() => {
    const groups = new Map<string, IDataExtensionRecordType[]>();

    for (const candidate of recordTypes) {
      groups.set(candidate.owner, [
        ...(groups.get(candidate.owner) || []),
        candidate,
      ]);
    }

    return Array.from(groups.entries());
  }, [recordTypes]);

  /**
   * Names the other side after this record type when its side holds a list
   * (belongs-to, many-to-many), until the user types a name themselves.
   */
  const suggestInverse = (kind: DataExtensionRelationCreateKind) => {
    if (inverseKeyTouched.current || inverseLabelTouched.current) {
      return;
    }

    const listOnOtherSide = kind === 'manyToOne' || kind === 'manyToMany';
    const label = listOnOtherSide ? recordTypeLabel(recordType.recordType) : '';

    form.setValue('inverseLabel', label);
    form.setValue(
      'inverseKey',
      listOnOtherSide ? suggestKey(recordType.label) : '',
    );
  };

  useEffect(() => {
    if (open) {
      keyTouched.current = false;
      inverseKeyTouched.current = false;
      inverseLabelTouched.current = false;
      form.reset(field ? valuesFromField(field) : emptyValues());
    }
  }, [open, field, form]);

  const onLabelChange = (label: string) => {
    if (!isEdit && !keyTouched.current) {
      form.setValue('key', suggestKey(label), { shouldValidate: false });
    }
  };

  const onSubmit = async (values: FormValues) => {
    const cleanOptions = hasFieldOptions(values.type)
      ? values.options.map((option) => ({
          value: option.value.trim(),
          label: option.label.trim() || option.value.trim(),
        }))
      : undefined;

    try {
      if (!field && values.type === 'relation') {
        await addRelation({
          recordType: recordType.recordType,
          key: values.key,
          label: values.label,
          description: values.description || undefined,
          targetRecordType: values.targetRecordType,
          kind: values.kind,
          inverseKey: values.inverseKey,
          inverseLabel: values.inverseLabel,
        });
      } else if (field) {
        await editField(field._id, {
          label: values.label,
          description: values.description,
          ...(cleanOptions ? { options: cleanOptions } : {}),
        });
      } else {
        await addField({
          recordType: recordType.recordType,
          key: values.key,
          label: values.label,
          description: values.description || undefined,
          type: values.type,
          options: cleanOptions,
        });
      }

      toast({
        variant: 'success',
        title: t(isEdit ? 'toast.field-updated' : 'toast.field-created', {
          label: values.label,
        }),
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t(isEdit ? 'toast.update-failed' : 'toast.create-failed'),
        description: error instanceof Error ? error.message : undefined,
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <Sheet.View className="p-0 sm:max-w-xl">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col flex-auto overflow-hidden"
          >
            <Sheet.Header className="flex gap-2">
              <IconVariable />
              <Sheet.Title>
                {isEdit ? t('sheet.edit-title') : t('sheet.add-title')}
              </Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>
            <Sheet.Content className="flex-auto overflow-hidden p-0">
              <ScrollArea className="h-full">
                <div className="flex flex-col gap-5 p-5">
                  <p className="text-sm text-muted-foreground">
                    {t('sheet.record-type-hint', {
                      label: t(
                        `record-types.${recordType.recordType}`,
                        recordType.label,
                      ),
                    })}
                  </p>
                  {isEdit ? (
                    <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm">
                      <FieldTypeIcon
                        type={type}
                        className="text-muted-foreground"
                      />
                      <span className="font-medium">
                        {t(`field-types.${type}`)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        · {t('form.type-locked')}
                      </span>
                    </div>
                  ) : (
                    <Form.Field
                      control={form.control}
                      name="type"
                      render={({ field: input }) => (
                        <Form.Item>
                          <Form.Label>{t('form.type')}</Form.Label>
                          <ChoiceboxGroup
                            value={input.value}
                            onValueChange={input.onChange}
                            aria-label={t('form.type')}
                            className="grid grid-cols-2 gap-2 sm:grid-cols-3"
                          >
                            {DATA_EXTENSION_FIELD_TYPES.map((fieldType) => (
                              <ChoiceboxGroup.Item
                                key={fieldType}
                                value={fieldType}
                                className="gap-1 p-2.5"
                              >
                                <span className="flex items-center gap-2">
                                  <FieldTypeIcon type={fieldType} />
                                  {t(`field-types.${fieldType}`)}
                                </span>
                                <span className="text-xs font-normal text-muted-foreground">
                                  {t(`field-type-hints.${fieldType}`)}
                                </span>
                              </ChoiceboxGroup.Item>
                            ))}
                          </ChoiceboxGroup>
                          <Form.Message />
                        </Form.Item>
                      )}
                    />
                  )}
                  <Form.Field
                    control={form.control}
                    name="label"
                    render={({ field: input }) => (
                      <Form.Item>
                        <Form.Label>{t('form.label')}</Form.Label>
                        <Form.Control>
                          <Input
                            {...input}
                            autoFocus
                            placeholder={t('form.label-placeholder')}
                            onChange={(event) => {
                              input.onChange(event);
                              onLabelChange(event.target.value);
                            }}
                          />
                        </Form.Control>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Form.Field
                      control={form.control}
                      name="key"
                      render={({ field: input }) => (
                        <Form.Item>
                          <Form.Label>{t('form.key')}</Form.Label>
                          <Form.Control>
                            <Input
                              {...input}
                              className="font-mono"
                              disabled={isEdit}
                              placeholder="accountReference"
                              onChange={(event) => {
                                keyTouched.current = true;
                                input.onChange(event);
                              }}
                            />
                          </Form.Control>
                          <Form.Description>
                            {isEdit
                              ? t('form.key-locked')
                              : t('form.key-description')}
                          </Form.Description>
                          <Form.Message />
                        </Form.Item>
                      )}
                    />
                    <div className="flex flex-col gap-2">
                      <span className="text-sm font-medium">
                        {t('form.api-preview')}
                      </span>
                      <code className="flex h-8 items-center gap-1 truncate rounded-md border bg-muted/40 px-3 font-mono text-xs">
                        <span>{form.watch('key') || 'key'}</span>
                        <span className="text-muted-foreground">:</span>
                        <span className="text-primary">
                          {type === 'relation'
                            ? relationPreviewType()
                            : FIELD_TYPE_GRAPHQL[type]}
                        </span>
                      </code>
                      <p className="text-xs text-muted-foreground">
                        {t('form.api-preview-hint')}
                      </p>
                    </div>
                  </div>
                  <Form.Field
                    control={form.control}
                    name="description"
                    render={({ field: input }) => (
                      <Form.Item>
                        <Form.Label>{t('form.description')}</Form.Label>
                        <Form.Control>
                          <Textarea
                            {...input}
                            rows={3}
                            placeholder={t('form.description-placeholder')}
                          />
                        </Form.Control>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                  {type === 'relation' && isEdit && field?.relation && (
                    <p className="rounded-md border bg-muted/40 p-3 text-sm">
                      {t(
                        field.relation.side === 'source'
                          ? 'relation.summary-source'
                          : 'relation.summary-inverse',
                        {
                          target: recordTypeLabel(
                            field.relation.targetRecordType,
                          ),
                          kind: t(`relation.kinds.${field.relation.kind}`),
                        },
                      )}
                    </p>
                  )}
                  {type === 'relation' && !isEdit && (
                    <fieldset className="flex flex-col gap-4 rounded-md border p-4">
                      <legend className="px-1 text-sm font-medium">
                        {t('relation.title')}
                      </legend>
                      <Form.Field
                        control={form.control}
                        name="targetRecordType"
                        render={({ field: input }) => (
                          <Form.Item>
                            <Form.Label>{t('relation.target')}</Form.Label>
                            <Select
                              value={input.value}
                              onValueChange={(next) => {
                                input.onChange(next);
                                suggestInverse(form.getValues('kind'));
                              }}
                            >
                              <Form.Control>
                                <Select.Trigger>
                                  <Select.Value
                                    placeholder={t(
                                      'relation.target-placeholder',
                                    )}
                                  />
                                </Select.Trigger>
                              </Form.Control>
                              <Select.Content>
                                {recordTypeGroups.map(([owner, members]) => (
                                  <Select.Group key={owner}>
                                    <Select.Label>
                                      {t(`owners.${owner}`, owner)}
                                    </Select.Label>
                                    {members.map((candidate) => (
                                      <Select.Item
                                        key={candidate.recordType}
                                        value={candidate.recordType}
                                      >
                                        {recordTypeLabel(candidate.recordType)}
                                      </Select.Item>
                                    ))}
                                  </Select.Group>
                                ))}
                              </Select.Content>
                            </Select>
                            <Form.Description>
                              {t('relation.target-hint')}
                            </Form.Description>
                            <Form.Message />
                          </Form.Item>
                        )}
                      />
                      <Form.Field
                        control={form.control}
                        name="kind"
                        render={({ field: input }) => (
                          <Form.Item>
                            <Form.Label>{t('relation.kind')}</Form.Label>
                            <ChoiceboxGroup
                              value={input.value}
                              onValueChange={(next) => {
                                input.onChange(next);
                                suggestInverse(
                                  next as DataExtensionRelationCreateKind,
                                );
                              }}
                              aria-label={t('relation.kind')}
                              className="grid grid-cols-1 gap-2 sm:grid-cols-2"
                            >
                              {DATA_EXTENSION_RELATION_CREATE_KINDS.map(
                                (kind) => (
                                  <ChoiceboxGroup.Item
                                    key={kind}
                                    value={kind}
                                    className="gap-1 p-2.5"
                                  >
                                    <span className="flex items-center justify-between gap-2">
                                      {t(`relation.kinds.${kind}`)}
                                      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                                        {t(`relation.kind-badges.${kind}`)}
                                      </code>
                                    </span>
                                    <span className="text-xs font-normal text-muted-foreground">
                                      {form.watch('targetRecordType')
                                        ? t(`relation.kind-hints.${kind}`, {
                                            source: recordTypeLabel(
                                              recordType.recordType,
                                            ),
                                            target: recordTypeLabel(
                                              form.watch('targetRecordType'),
                                            ),
                                          })
                                        : t(`relation.kind-hints-any.${kind}`)}
                                    </span>
                                  </ChoiceboxGroup.Item>
                                ),
                              )}
                            </ChoiceboxGroup>
                            <Form.Message />
                          </Form.Item>
                        )}
                      />
                      <p className="text-xs text-muted-foreground">
                        {t('relation.inverse-hint', {
                          target: form.watch('targetRecordType')
                            ? recordTypeLabel(form.watch('targetRecordType'))
                            : t('relation.the-target'),
                        })}
                      </p>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Form.Field
                          control={form.control}
                          name="inverseLabel"
                          render={({ field: input }) => (
                            <Form.Item>
                              <Form.Label>
                                {t('relation.inverse-label')}
                              </Form.Label>
                              <Form.Control>
                                <Input
                                  {...input}
                                  placeholder={t(
                                    'relation.inverse-label-placeholder',
                                  )}
                                  onChange={(event) => {
                                    inverseLabelTouched.current = true;
                                    input.onChange(event);

                                    if (!inverseKeyTouched.current) {
                                      form.setValue(
                                        'inverseKey',
                                        suggestKey(event.target.value),
                                      );
                                    }
                                  }}
                                />
                              </Form.Control>
                              <Form.Message />
                            </Form.Item>
                          )}
                        />
                        <Form.Field
                          control={form.control}
                          name="inverseKey"
                          render={({ field: input }) => (
                            <Form.Item>
                              <Form.Label>
                                {t('relation.inverse-key')}
                              </Form.Label>
                              <Form.Control>
                                <Input
                                  {...input}
                                  className="font-mono"
                                  placeholder="tasks"
                                  onChange={(event) => {
                                    inverseKeyTouched.current = true;
                                    input.onChange(event);
                                  }}
                                />
                              </Form.Control>
                              <Form.Message />
                            </Form.Item>
                          )}
                        />
                      </div>
                    </fieldset>
                  )}
                  {hasFieldOptions(type) && (
                    <fieldset className="flex flex-col gap-3">
                      <legend className="mb-1 text-sm font-medium">
                        {t('form.options')}
                      </legend>
                      {options.fields.map((option, index) => {
                        const locked = lockedOptionValues.has(option.value);

                        return (
                          <div
                            key={option.id}
                            className="flex items-start gap-2"
                          >
                            <Form.Field
                              control={form.control}
                              name={`options.${index}.value`}
                              render={({ field: input }) => (
                                <Form.Item className="flex-1">
                                  <Form.Control>
                                    <Input
                                      {...input}
                                      className="font-mono"
                                      disabled={locked}
                                      aria-label={t('form.option-value')}
                                      placeholder={t('form.option-value')}
                                    />
                                  </Form.Control>
                                  <Form.Message />
                                </Form.Item>
                              )}
                            />
                            <Form.Field
                              control={form.control}
                              name={`options.${index}.label`}
                              render={({ field: input }) => (
                                <Form.Item className="flex-1">
                                  <Form.Control>
                                    <Input
                                      {...input}
                                      aria-label={t('form.option-label')}
                                      placeholder={t('form.option-label')}
                                    />
                                  </Form.Control>
                                  <Form.Message />
                                </Form.Item>
                              )}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={locked}
                              title={
                                locked
                                  ? t('form.option-locked')
                                  : t('form.remove-option')
                              }
                              aria-label={t('form.remove-option')}
                              onClick={() => options.remove(index)}
                            >
                              <IconTrash />
                            </Button>
                          </div>
                        );
                      })}
                      <Button
                        type="button"
                        variant="outline"
                        className="self-start"
                        onClick={() => options.append({ value: '', label: '' })}
                      >
                        <IconPlus />
                        {t('form.add-option')}
                      </Button>
                      {form.formState.errors.options?.message && (
                        <p className="text-sm text-destructive" role="alert">
                          {form.formState.errors.options.message}
                        </p>
                      )}
                      {isEdit && (
                        <p className="text-xs text-muted-foreground">
                          {t('form.options-hint')}
                        </p>
                      )}
                    </fieldset>
                  )}
                </div>
              </ScrollArea>
            </Sheet.Content>
            <Sheet.Footer>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Spinner size="sm" />}
                {isEdit ? t('save') : t('create-field')}
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
