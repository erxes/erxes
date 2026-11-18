import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  cn,
  Form,
  Input,
  Sheet,
  Spinner,
  Textarea,
  toast,
  useQueryState,
} from 'erxes-ui';
import { useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  DATA_EXTENSION_OBJECT_ICONS,
  DataExtensionObjectIcon as ObjectIconName,
  IDataExtensionObject,
} from 'ui-modules';
import { z } from 'zod';
import { useDataExtensionObjectMutations } from '../hooks/useDataExtensionObjects';
import { DataExtensionObjectIcon, OBJECT_ICONS } from './DataExtensionObjectIcon';

const KEY_PATTERN = /^[a-z][a-zA-Z0-9]{1,39}$/;

/** camelCase key from a label: "Service contract" → "serviceContract". */
const suggestKey = (label: string) => {
  const words = label
    .normalize('NFKD')
    .replace(/[^A-Za-z0-9 ]/g, ' ')
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

  return key.slice(0, 40);
};

const buildSchema = (t: (key: string) => string) =>
  z
    .object({
      singularLabel: z
        .string()
        .trim()
        .min(1, t('objects.validation.singular-required'))
        .max(120),
      pluralLabel: z
        .string()
        .trim()
        .min(1, t('objects.validation.plural-required'))
        .max(120),
      key: z.string().regex(KEY_PATTERN, t('objects.validation.key-format')),
      description: z.string().max(500),
      icon: z.enum(DATA_EXTENSION_OBJECT_ICONS),
    })
    .refine(
      (values) =>
        values.singularLabel.toLowerCase() !== values.pluralLabel.toLowerCase(),
      { path: ['pluralLabel'], message: t('objects.validation.names-differ') },
    );

type FormValues = z.infer<ReturnType<typeof buildSchema>>;

const emptyValues = (): FormValues => ({
  singularLabel: '',
  pluralLabel: '',
  key: '',
  description: '',
  icon: 'box',
});

/** Creates a custom object or edits its names, icon and description. */
export const DataExtensionObjectSheet = ({
  open,
  onOpenChange,
  object,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  object?: IDataExtensionObject;
}) => {
  const { t } = useTranslation('dataExtensions');
  const [, setRecordType] = useQueryState<string>('recordType');
  const [, setTab] = useQueryState<string>('tab');
  const { addObject, editObject, saving } = useDataExtensionObjectMutations();
  const schema = useMemo(() => buildSchema(t), [t]);
  const keyTouched = useRef(false);
  const isEdit = Boolean(object);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues(),
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    keyTouched.current = false;
    form.reset(
      object
        ? {
            singularLabel: object.singularLabel,
            pluralLabel: object.pluralLabel,
            key: object.key,
            description: object.description || '',
            icon: (object.icon as ObjectIconName) || 'box',
          }
        : emptyValues(),
    );
  }, [open, object, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (object) {
        await editObject(object._id, {
          singularLabel: values.singularLabel,
          pluralLabel: values.pluralLabel,
          description: values.description,
          icon: values.icon,
        });
      } else {
        const created = await addObject({
          ...values,
          description: values.description || undefined,
        });

        setRecordType(created.recordType);
        setTab('records');
      }

      toast({
        variant: 'success',
        title: t(isEdit ? 'objects.toast.updated' : 'objects.toast.created', {
          label: values.pluralLabel,
        }),
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t(isEdit ? 'objects.toast.update-failed' : 'objects.toast.create-failed'),
        description: error instanceof Error ? error.message : undefined,
      });
    }
  };

  const icon = form.watch('icon');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <Sheet.View className="p-0 sm:max-w-lg">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex h-full flex-col"
          >
            <Sheet.Header>
              <Sheet.Title className="flex items-center gap-2">
                <DataExtensionObjectIcon icon={icon} />
                {t(isEdit ? 'objects.edit-title' : 'objects.new-title')}
              </Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>
            <Sheet.Content className="flex flex-col gap-5 overflow-y-auto p-5">
              {!isEdit && (
                <p className="text-sm text-muted-foreground">
                  {t('objects.intro')}
                </p>
              )}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Form.Field
                  control={form.control}
                  name="singularLabel"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>{t('objects.singular')}</Form.Label>
                      <Form.Control>
                        <Input
                          {...field}
                          autoFocus
                          placeholder={t('objects.singular-placeholder')}
                          onChange={(event) => {
                            field.onChange(event);

                            if (!isEdit && !keyTouched.current) {
                              form.setValue(
                                'key',
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
                  name="pluralLabel"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>{t('objects.plural')}</Form.Label>
                      <Form.Control>
                        <Input
                          {...field}
                          placeholder={t('objects.plural-placeholder')}
                        />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
              </div>
              <Form.Field
                control={form.control}
                name="key"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('objects.key')}</Form.Label>
                    <Form.Control>
                      <Input
                        {...field}
                        className="font-mono"
                        disabled={isEdit}
                        onChange={(event) => {
                          keyTouched.current = true;
                          field.onChange(event);
                        }}
                      />
                    </Form.Control>
                    <Form.Description>
                      {t(isEdit ? 'objects.key-locked' : 'objects.key-hint')}
                    </Form.Description>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('objects.icon')}</Form.Label>
                    <div
                      role="radiogroup"
                      aria-label={t('objects.icon')}
                      className="grid grid-cols-10 gap-1"
                    >
                      {(Object.keys(OBJECT_ICONS) as ObjectIconName[]).map(
                        (name) => (
                          <button
                            key={name}
                            type="button"
                            role="radio"
                            aria-checked={field.value === name}
                            aria-label={name}
                            title={name}
                            onClick={() => field.onChange(name)}
                            className={cn(
                              'flex aspect-square items-center justify-center rounded-md border text-muted-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                              field.value === name &&
                                'border-primary bg-primary/10 text-primary',
                            )}
                          >
                            <DataExtensionObjectIcon icon={name} />
                          </button>
                        ),
                      )}
                    </div>
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="description"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('form.description')}</Form.Label>
                    <Form.Control>
                      <Textarea
                        {...field}
                        rows={2}
                        placeholder={t('objects.description-placeholder')}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
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
                {isEdit ? t('save') : t('objects.create')}
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
