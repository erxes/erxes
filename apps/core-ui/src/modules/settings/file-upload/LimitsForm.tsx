import type { FileSettings } from '@erxes/core-contract';
import { IconDeviceFloppy } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Input,
  Label,
  MultipleSelector,
  type MultiSelectOption,
  Spinner,
  useToast,
} from 'erxes-ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { messageOf, orpc } from '~/lib/api';

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

export const fileSettingsQuery = () => orpc.files.settings.queryOptions({ staleTime: 60_000 });

const useSaveLimits = (onSaved: () => void) => {
  const { t } = useTranslation('settings', { keyPrefix: 'file-upload' });
  const client = useQueryClient();
  const { toast } = useToast();

  return useMutation(
    orpc.files.updateSettings.mutationOptions({
      onSuccess: (next) => {
        client.setQueryData(fileSettingsQuery().queryKey, next);
        onSaved();
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

const useSizeError = (maxSizeMb: string, limitMb: number) => {
  const { t } = useTranslation('settings', { keyPrefix: 'file-upload' });
  const size = Number(maxSizeMb);

  if (!Number.isInteger(size) || size < 1) return t('size-invalid', 'Enter a whole number of MB');

  return size > limitMb
    ? t('size-over-limit', {
        limit: limitMb,
        defaultValue: `This server accepts up to ${limitMb} MB`,
      })
    : null;
};

/** Upload limits: largest file and which types are accepted. */
export const LimitsForm = ({ settings, canEdit }: { settings: FileSettings; canEdit: boolean }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'file-upload' });
  const sizeId = useId();
  const typesId = useId();
  // Unsaved edits; the rest shows the saved settings.
  const [draft, setDraft] = useState<{ maxSizeMb?: string; types?: MultiSelectOption[] }>({});
  const maxSizeMb = draft.maxSizeMb ?? String(settings.maxSizeMb);
  const types = draft.types ?? settings.allowedTypes.map(optionOf);
  const save = useSaveLimits(() => setDraft({}));
  const sizeError = useSizeError(maxSizeMb, settings.limitMb);
  const badType = types.find((option) => !VALID_TYPE.test(option.value.trim().toLowerCase()));

  return (
    <section className="space-y-5 rounded-lg border bg-background p-5">
      <div>
        <h2 className="text-base font-semibold">{t('limits', 'Upload limits')}</h2>
        <p className="text-sm text-muted-foreground">
          {t(
            'limits-description',
            'Apply to every upload in this organisation: team members, plugins and forms.',
          )}
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor={sizeId}>{t('max-size', 'Largest file (MB)')}</Label>
        <Input
          id={sizeId}
          type="number"
          min={1}
          max={settings.limitMb}
          className="w-40"
          value={maxSizeMb}
          disabled={!canEdit}
          onChange={(event) => setDraft({ ...draft, maxSizeMb: event.target.value })}
        />
        <p className={sizeError ? 'text-sm text-destructive' : 'text-xs text-muted-foreground'}>
          {sizeError ??
            t('server-limit', {
              limit: settings.limitMb,
              defaultValue: `This server allows up to ${settings.limitMb} MB.`,
            })}
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor={typesId}>{t('allowed-types', 'Allowed file types')}</Label>
        <MultipleSelector
          inputProps={{ id: typesId }}
          value={types}
          onChange={(next) => setDraft({ ...draft, types: next })}
          defaultOptions={TYPE_OPTIONS}
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
        <p className={badType ? 'text-sm text-destructive' : 'text-xs text-muted-foreground'}>
          {badType
            ? t('type-invalid', {
                value: badType.value,
                defaultValue: `"${badType.value}" is not a MIME type, type/* or .ext`,
              })
            : t(
                'types-help',
                'Leave empty to accept any type. Programs (.exe, .bat, .msi …) are never accepted.',
              )}
        </p>
      </div>
      {canEdit && (
        <Button
          disabled={Boolean(sizeError) || Boolean(badType) || save.isPending}
          onClick={() =>
            save.mutate({
              maxSizeMb: Number(maxSizeMb),
              allowedTypes: types.map((option) => option.value.trim().toLowerCase()),
            })
          }
        >
          {save.isPending ? <Spinner size="sm" /> : <IconDeviceFloppy />}
          {t('save', 'Save')}
        </Button>
      )}
    </section>
  );
};
