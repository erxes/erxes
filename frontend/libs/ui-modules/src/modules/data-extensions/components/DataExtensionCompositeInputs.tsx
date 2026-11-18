import {
  IconFile,
  IconPlus,
  IconStar,
  IconStarFilled,
  IconUpload,
  IconX,
} from '@tabler/icons-react';
import {
  Button,
  cn,
  Input,
  readImage,
  Select,
  Spinner,
  Textarea,
  useUpload,
} from 'erxes-ui';
import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SelectMember } from '../../team-members/components/SelectMember';
import {
  DATA_EXTENSION_ADDRESS_PARTS,
  DATA_EXTENSION_CURRENCIES,
  DataExtensionValue,
  IDataExtensionCurrencyValue,
  IDataExtensionField,
  IDataExtensionFileValue,
  IDataExtensionLinkValue,
} from '../types';

interface ICompositeInputProps {
  field: IDataExtensionField;
  id: string;
  value: DataExtensionValue;
  onChange: (value: DataExtensionValue) => void;
  compact?: boolean;
  inputClassName?: string;
}

const asObject = <T extends object>(value: DataExtensionValue): Partial<T> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Partial<T>)
    : {};

const asList = <T,>(value: DataExtensionValue): T[] =>
  Array.isArray(value) ? (value as T[]) : [];

/** Drops empty parts; an object with no parts left clears the value. */
const compactParts = (parts: Record<string, string | undefined>) => {
  const kept = Object.fromEntries(
    Object.entries(parts).filter(([, part]) => part && part.trim()),
  );

  return Object.keys(kept).length ? kept : null;
};

export const CurrencyInput = ({
  field,
  id,
  value,
  onChange,
  inputClassName,
}: ICompositeInputProps) => {
  const { t } = useTranslation('dataExtensions');
  const current = asObject<IDataExtensionCurrencyValue>(value);
  const currency = current.currency || field.settings?.currency || 'MNT';
  const codes: string[] = DATA_EXTENSION_CURRENCIES.includes(
    currency as (typeof DATA_EXTENSION_CURRENCIES)[number],
  )
    ? [...DATA_EXTENSION_CURRENCIES]
    : [currency, ...DATA_EXTENSION_CURRENCIES];

  return (
    <div className="flex gap-1.5">
      <Input
        id={id}
        className={cn('flex-1', inputClassName)}
        type="number"
        inputMode="decimal"
        step={field.settings?.precision === 0 ? 1 : 'any'}
        placeholder={field.settings?.placeholder}
        value={typeof current.amount === 'number' ? String(current.amount) : ''}
        onChange={(event) => {
          const next = event.target.value;
          onChange(next === '' ? null : { amount: Number(next), currency });
        }}
      />
      <Select
        value={currency}
        onValueChange={(next) =>
          typeof current.amount === 'number' &&
          onChange({ amount: current.amount, currency: next })
        }
      >
        <Select.Trigger
          className={cn('w-24', inputClassName)}
          aria-label={t('values.currency')}
        >
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          {codes.map((code) => (
            <Select.Item key={code} value={code}>
              {code}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    </div>
  );
};

export const AddressInput = ({
  id,
  value,
  onChange,
  inputClassName,
}: ICompositeInputProps) => {
  const { t } = useTranslation('dataExtensions');
  const current = asObject<Record<string, string>>(value);

  return (
    <div id={id} role="group" className="grid grid-cols-2 gap-1.5">
      {DATA_EXTENSION_ADDRESS_PARTS.map((part) => (
        <Input
          key={part}
          className={cn(
            (part === 'street' || part === 'street2') && 'col-span-2',
            inputClassName,
          )}
          aria-label={t(`values.address.${part}`)}
          placeholder={t(`values.address.${part}`)}
          value={current[part] || ''}
          onChange={(event) =>
            onChange(compactParts({ ...current, [part]: event.target.value }))
          }
        />
      ))}
    </div>
  );
};

export const FullNameInput = ({
  id,
  value,
  onChange,
  inputClassName,
}: ICompositeInputProps) => {
  const { t } = useTranslation('dataExtensions');
  const current = asObject<Record<string, string>>(value);

  return (
    <div id={id} role="group" className="grid grid-cols-2 gap-1.5">
      {(['firstName', 'lastName'] as const).map((part) => (
        <Input
          key={part}
          className={inputClassName}
          aria-label={t(`values.name.${part}`)}
          placeholder={t(`values.name.${part}`)}
          value={current[part] || ''}
          onChange={(event) =>
            onChange(compactParts({ ...current, [part]: event.target.value }))
          }
        />
      ))}
    </div>
  );
};

/** Rows of single inputs with add and remove, for emails and phones. */
export const StringListInput = ({
  field,
  id,
  value,
  onChange,
  inputClassName,
}: ICompositeInputProps) => {
  const { t } = useTranslation('dataExtensions');
  const items = asList<string>(value);
  const rows = items.length ? items : [''];
  const inputType = field.type === 'emails' ? 'email' : 'tel';

  const update = (next: string[]) => {
    const kept = next.filter((item) => item.trim());
    onChange(kept.length ? next : null);
  };

  return (
    <div id={id} role="group" className="flex flex-col gap-1.5">
      {rows.map((item, index) => (
        <div key={index} className="flex gap-1">
          <Input
            className={cn('flex-1', inputClassName)}
            type={inputType}
            aria-label={`${field.label} ${index + 1}`}
            value={item}
            onChange={(event) =>
              update(
                rows.map((row, rowIndex) =>
                  rowIndex === index ? event.target.value : row,
                ),
              )
            }
          />
          {rows.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 shrink-0"
              aria-label={t('values.remove-item')}
              onClick={() => update(rows.filter((_, i) => i !== index))}
            >
              <IconX />
            </Button>
          )}
        </div>
      ))}
      {rows.length < 20 && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="self-start text-muted-foreground"
          onClick={() => onChange([...rows, ''])}
        >
          <IconPlus />
          {t('values.add-item')}
        </Button>
      )}
    </div>
  );
};

export const LinksInput = ({
  field,
  id,
  value,
  onChange,
  inputClassName,
}: ICompositeInputProps) => {
  const { t } = useTranslation('dataExtensions');
  const items = asList<IDataExtensionLinkValue>(value);
  const rows = items.length ? items : [{ url: '' }];

  const update = (next: IDataExtensionLinkValue[]) => {
    const kept = next.filter((link) => link.url.trim());
    onChange(kept.length ? next : null);
  };

  return (
    <div id={id} role="group" className="flex flex-col gap-1.5">
      {rows.map((link, index) => (
        <div key={index} className="flex gap-1">
          <Input
            className={cn('flex-[3]', inputClassName)}
            type="url"
            placeholder="https://"
            aria-label={`${field.label} ${index + 1}`}
            value={link.url}
            onChange={(event) =>
              update(
                rows.map((row, i) =>
                  i === index ? { ...row, url: event.target.value } : row,
                ),
              )
            }
          />
          <Input
            className={cn('flex-[2]', inputClassName)}
            placeholder={t('values.link-label')}
            aria-label={t('values.link-label')}
            value={link.label || ''}
            onChange={(event) =>
              update(
                rows.map((row, i) =>
                  i === index
                    ? { ...row, label: event.target.value || undefined }
                    : row,
                ),
              )
            }
          />
          {rows.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 shrink-0"
              aria-label={t('values.remove-item')}
              onClick={() => update(rows.filter((_, i) => i !== index))}
            >
              <IconX />
            </Button>
          )}
        </div>
      ))}
      {rows.length < 20 && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="self-start text-muted-foreground"
          onClick={() => onChange([...rows, { url: '' }])}
        >
          <IconPlus />
          {t('values.add-item')}
        </Button>
      )}
    </div>
  );
};

/** Stars from 1 to the field's scale; picking the current star clears it. */
export const RatingInput = ({ field, id, value, onChange }: ICompositeInputProps) => {
  const { t } = useTranslation('dataExtensions');
  const scale = field.settings?.scale || 5;
  const current = typeof value === 'number' ? value : 0;
  const [hovered, setHovered] = useState(0);
  const shown = hovered || current;

  return (
    <div
      id={id}
      role="radiogroup"
      aria-label={field.label}
      className="flex items-center gap-0.5"
      onMouseLeave={() => setHovered(0)}
    >
      {Array.from({ length: scale }, (_, index) => {
        const star = index + 1;
        const Icon = star <= shown ? IconStarFilled : IconStar;

        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={current === star}
            aria-label={t('values.rating-of', { value: star, scale })}
            className={cn(
              'rounded-sm p-0.5 text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              star <= shown && 'text-warning',
            )}
            onMouseEnter={() => setHovered(star)}
            onClick={() => onChange(current === star ? null : star)}
          >
            <Icon className="size-4" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
};

const toLocalInput = (iso: string) => {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const offset = date.getTimezoneOffset() * 60000;

  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

export const DateTimeInput = ({
  id,
  value,
  onChange,
  inputClassName,
}: ICompositeInputProps) => (
  <Input
    id={id}
    className={inputClassName}
    type="datetime-local"
    value={typeof value === 'string' ? toLocalInput(value) : ''}
    onChange={(event) => {
      const next = event.target.value;
      onChange(next ? new Date(next).toISOString() : null);
    }}
  />
);

export const MemberInput = ({ field, value, onChange }: ICompositeInputProps) => {
  const multiple = Boolean(field.settings?.multiple);

  return (
    <SelectMember
      mode={multiple ? 'multiple' : 'single'}
      size="sm"
      value={
        multiple
          ? asList<string>(value)
          : typeof value === 'string'
          ? value
          : ''
      }
      placeholder={field.settings?.placeholder}
      onValueChange={(next) => {
        if (Array.isArray(next)) {
          onChange(next.length ? next : null);
        } else {
          onChange(next || null);
        }
      }}
    />
  );
};

const formatSize = (size?: number) => {
  if (typeof size !== 'number') {
    return '';
  }

  if (size < 1024) {
    return `${size} B`;
  }

  return size < 1024 * 1024
    ? `${Math.round(size / 1024)} KB`
    : `${(size / 1024 / 1024).toFixed(1)} MB`;
};

/** Uploads through erxes' own file route; values hold the returned key. */
export const FilesInput = ({ field, id, value, onChange }: ICompositeInputProps) => {
  const { t } = useTranslation('dataExtensions');
  const files = asList<IDataExtensionFileValue>(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, isLoading } = useUpload();
  const latest = useRef(files);
  const labelId = useId();

  useEffect(() => {
    latest.current = files;
  }, [files]);

  return (
    <div id={id} role="group" aria-labelledby={labelId} className="flex flex-col gap-1">
      <span id={labelId} className="sr-only">
        {field.label}
      </span>
      {files.map((file) => (
        <div
          key={file.url}
          className="flex items-center gap-1.5 rounded-sm border px-2 py-1 text-xs"
        >
          <IconFile className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <a
            href={readImage(file.url)}
            target="_blank"
            rel="noreferrer noopener"
            className="min-w-0 flex-1 truncate hover:underline"
          >
            {file.name}
          </a>
          <span className="shrink-0 text-muted-foreground">
            {formatSize(file.size)}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-5"
            aria-label={t('values.remove-file', { name: file.name })}
            onClick={() => {
              const next = files.filter((item) => item.url !== file.url);
              onChange(next.length ? next : null);
            }}
          >
            <IconX />
          </Button>
        </div>
      ))}
      <input
        ref={inputRef}
        type="file"
        multiple
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          upload({
            files: event.target.files,
            afterUpload: ({ status, response, fileInfo }) => {
              if (status !== 'ok' || typeof response !== 'string') {
                return;
              }

              const next = [
                ...latest.current,
                {
                  url: response,
                  name: fileInfo.name,
                  type: fileInfo.type || undefined,
                  size: fileInfo.size,
                },
              ].slice(0, 20);

              latest.current = next;
              onChange(next);
            },
          });
          event.target.value = '';
        }}
      />
      {files.length < 20 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start"
          disabled={isLoading}
          onClick={() => inputRef.current?.click()}
        >
          {isLoading ? <Spinner size="sm" /> : <IconUpload />}
          {t('values.upload')}
        </Button>
      )}
    </div>
  );
};

/** Raw JSON; only valid JSON objects or lists are passed on. */
export const JsonInput = ({ id, value, onChange, compact }: ICompositeInputProps) => {
  const { t } = useTranslation('dataExtensions');
  const serialized = value === null || value === undefined ? '' : JSON.stringify(value, null, 2);
  const [text, setText] = useState(serialized);
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    setText(serialized);
    setInvalid(false);
  }, [serialized]);

  return (
    <div className="flex flex-col gap-1">
      <Textarea
        id={id}
        rows={compact ? 3 : 5}
        spellCheck={false}
        aria-invalid={invalid}
        className={cn('font-mono text-xs', invalid && 'border-destructive')}
        value={text}
        onChange={(event) => {
          const next = event.target.value;

          setText(next);

          if (!next.trim()) {
            setInvalid(false);
            onChange(null);
            return;
          }

          try {
            const parsed = JSON.parse(next);
            const valid = parsed !== null && typeof parsed === 'object';

            setInvalid(!valid);

            if (valid) {
              onChange(parsed);
            }
          } catch {
            setInvalid(true);
          }
        }}
      />
      {invalid && (
        <p className="text-xs text-destructive" role="alert">
          {t('values.json-invalid')}
        </p>
      )}
    </div>
  );
};
