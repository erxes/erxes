import type { FileSettings } from '@erxes/core-contract';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Form, Input, MultipleSelector, type MultiSelectOption, useToast } from 'erxes-ui';
import type { TFunction } from 'i18next';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { messageOf, orpc } from '@erxes/core-contract/client';

/** Common choices; any MIME type, `type/*` or `.ext` can be typed in. */
const TYPE_OPTIONS: MultiSelectOption[] = [
  { value: 'image/*', label: 'Images (image/*)' },
  { value: 'video/*', label: 'Videos (video/*)' },
  { value: 'audio/*', label: 'Audio (audio/*)' },
  { value: 'application/pdf', label: 'PDF' },
  { value: 'text/plain', label: 'Text' },
  { value: 'text/csv', label: 'CSV' },
  { value: '.doc', label: 'Word (.doc)' },
  { value: '.docx', label: 'Word (.docx)' },
  { value: '.xls', label: 'Excel (.xls)' },
  { value: '.xlsx', label: 'Excel (.xlsx)' },
  { value: '.ppt', label: 'PowerPoint (.ppt)' },
  { value: '.pptx', label: 'PowerPoint (.pptx)' },
  { value: '.zip', label: 'ZIP archive' },
];

const optionOf = (value: string): MultiSelectOption =>
  TYPE_OPTIONS.find((option) => option.value === value) ?? { value, label: value };

const VALID_TYPE = /^(\.[a-z0-9]{1,15}|[a-z0-9][a-z0-9.+-]*\/(\*|[a-z0-9][a-z0-9.+-]*))$/;

const typeOf = (option: MultiSelectOption) => option.value.trim().toLowerCase();

export const fileSettingsQuery = () => orpc.files.settings.queryOptions({ staleTime: 60_000 });

type Translate = TFunction<'settings', 'file-upload'>;

/** A whole number of MB up to the server's limit, and types that are MIME types or extensions. */
const limitsSchema = (t: Translate, limitMb: number) =>
  z.object({
    maxSizeMb: z
      .string()
      .regex(/^\d+$/, t('size-invalid', 'Enter a whole number of MB'))
      .refine((text) => Number(text) >= 1, t('size-invalid', 'Enter a whole number of MB'))
      .refine(
        (text) => Number(text) <= limitMb,
        t('size-over-limit', {
          limit: limitMb,
          defaultValue: `This server accepts up to ${limitMb} MB`,
        }),
      ),
    types: z.array(z.object({ value: z.string(), label: z.string() })).superRefine((types, ctx) => {
      const bad = types.find((option) => !VALID_TYPE.test(typeOf(option)));

      if (bad) {
        ctx.addIssue({
          code: 'custom',
          message: t('type-invalid', {
            value: bad.value,
            defaultValue: `"${bad.value}" is not a MIME type, type/* or .ext`,
          }),
        });
      }
    }),
  });

type LimitsValues = z.infer<ReturnType<typeof limitsSchema>>;

const valuesOf = (settings: FileSettings): LimitsValues => ({
  maxSizeMb: String(settings.maxSizeMb),
  types: settings.allowedTypes.map(optionOf),
});

const useSaveLimits = (onSaved: (settings: FileSettings) => void) => {
  const { t } = useTranslation('settings', { keyPrefix: 'file-upload' });
  const client = useQueryClient();
  const { toast } = useToast();

  return useMutation(
    orpc.files.updateSettings.mutationOptions({
      onSuccess: (next) => {
        client.setQueryData(fileSettingsQuery().queryKey, next);
        onSaved(next);
        toast({ title: t('saved', 'Upload settings saved') });
      },
      onError: (error) =>
        toast({
          variant: 'destructive',
          title: t('save-failed', 'Could not save'),
          description: messageOf(error),
        }),
    }),
  );
};

/** Upload limits: largest file and which types are accepted, saved by the bar under them. */
export const LimitsForm = ({ settings, canEdit }: { settings: FileSettings; canEdit: boolean }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'file-upload' });

  const form = useForm<LimitsValues>({
    resolver: zodResolver(limitsSchema(t, settings.limitMb)),
    defaultValues: valuesOf(settings),
  });

  const save = useSaveLimits((next) => form.reset(valuesOf(next)));

  const submit = form.handleSubmit((values) =>
    save.mutate({ maxSizeMb: Number(values.maxSizeMb), allowedTypes: values.types.map(typeOf) }),
  );

  return (
    <Form {...form}>
      <form className="flex flex-col gap-4" noValidate onSubmit={(event) => void submit(event)}>
        <Form.Section
          title={t('limits', 'Upload limits')}
          description={t(
            'limits-description',
            'Apply to every upload in this organisation: team members, plugins and forms.',
          )}
        >
          <Form.Field
            control={form.control}
            name="maxSizeMb"
            render={({ field }) => (
              <Form.Item>
                <Form.Label required>{t('max-size', 'Largest file (MB)')}</Form.Label>
                <Form.Control>
                  <Input {...field} inputMode="numeric" className="w-40" disabled={!canEdit} />
                </Form.Control>
                <Form.Description>
                  {t('server-limit', {
                    limit: settings.limitMb,
                    defaultValue: `This server allows up to ${settings.limitMb} MB.`,
                  })}
                </Form.Description>
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            control={form.control}
            name="types"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('allowed-types', 'Allowed file types')}</Form.Label>
                <Form.Control>
                  <MultipleSelector
                    value={field.value}
                    onChange={field.onChange}
                    options={TYPE_OPTIONS}
                    creatable
                    disabled={!canEdit}
                    placeholder={t(
                      'allowed-types-placeholder',
                      'Any type: choose or type image/*, application/pdf, .docx …',
                    )}
                    hidePlaceholderWhenSelected
                    emptyIndicator={
                      <p className="py-2 text-center text-sm text-muted-foreground">
                        {t('type-hint', 'Type a MIME type or .ext')}
                      </p>
                    }
                  />
                </Form.Control>
                <Form.Description>
                  {t(
                    'types-help',
                    'Leave empty to accept any type. Programs (.exe, .bat, .msi …) are never accepted.',
                  )}
                </Form.Description>
                <Form.Message />
              </Form.Item>
            )}
          />
        </Form.Section>
        {canEdit && <Form.SaveBar saving={save.isPending} />}
      </form>
    </Form>
  );
};
