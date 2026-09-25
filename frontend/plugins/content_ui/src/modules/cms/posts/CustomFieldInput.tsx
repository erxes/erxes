import {
  Input,
  Textarea,
  Select,
  MultipleSelector,
  Switch,
  DatePicker,
  Button,
  useUploadChunked,
  readImage,
  Editor,
} from 'erxes-ui';
import { useRef, useState, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { REACT_APP_API_URL } from 'erxes-ui/utils';
import { IconUpload, IconX, IconPaperclip } from '@tabler/icons-react';
import { SelectProduct } from 'ui-modules';
import { SpreadsheetInput } from './SpreadsheetInput';
import { GalleryUploader } from './GalleryUploader';

const MAX_CUSTOM_FIELD_FILE_SIZE = 650 * 1024 * 1024;

export interface FieldDefinition {
  _id: string;
  type: string;
  label: string;
  placeholder?: string;
  options?: string[];
  isRequired?: boolean;
}

export type CustomFieldValue = string | boolean | string[] | null | undefined;

interface CustomFieldInputProps {
  field: FieldDefinition;
  value: CustomFieldValue;
  onChange: (value: string | boolean | string[]) => void;
}

function FileFieldInput({
  value,
  onChange,
  buttonLabel = 'Upload file',
  buttonClassName,
}: {
  value: CustomFieldValue;
  onChange: (value: string[]) => void;
  buttonLabel?: string;
  buttonClassName?: string;
}) {
  const { t } = useTranslation('content');
  const urls = Array.isArray(value) ? value : [];
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, loading, error, progress } = useUploadChunked();
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    if (file.size > MAX_CUSTOM_FIELD_FILE_SIZE) {
      setValidationError(
        t('max-650mb', { defaultValue: 'Maximum file size: 650 MB' }),
      );
      return;
    }

    setValidationError(null);
    const uploaded = await upload(file);
    if (uploaded?.url) onChange([uploaded.url]);
  };

  const handleRemove = (url: string) => {
    onChange(urls.filter((u) => u !== url));
  };

  return (
    <div className="space-y-2">
      {urls.length > 0 && (
        <div className="relative space-y-1">
          {urls.map((url) => (
            <div
              key={url}
              className="flex items-center gap-2 border rounded p-2 bg-muted"
            >
              <IconPaperclip
                size={16}
                className="text-muted-foreground shrink-0"
              />
              <span className="text-sm flex-1 truncate">{url}</span>
              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={() => handleRemove(url)}
              >
                <IconX size={16} />
              </Button>
            </div>
          ))}
          {loading && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded">
              <span className="text-sm text-gray-500">{t('uploading')}</span>
            </div>
          )}
        </div>
      )}
      <div>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          variant="outline"
          className={buttonClassName}
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
        >
          <IconUpload size={16} className="mr-2" />
          {loading ? `${t('uploading')} ${progress}%` : buttonLabel}
        </Button>
        <p className="text-xs text-muted-foreground mt-1">
          {t('max-650mb', { defaultValue: 'Maximum file size: 650 MB' })}
        </p>
      </div>
      {(validationError || error) && (
        <p className="text-xs text-destructive">{validationError || error}</p>
      )}
    </div>
  );
}

export const CustomFieldInput = ({
  field,
  value,
  onChange,
}: CustomFieldInputProps) => {
  const { t } = useTranslation('content');
  const enterPlaceholder =
    field.placeholder || `Enter ${field.label.toLowerCase()}`;
  const selectPlaceholder =
    field.placeholder || `Select ${field.label.toLowerCase()}`;
  const options = field.options || [];
  const selectedValues = Array.isArray(value) ? value : [];
  const multiOptions = options.map((option: string) => ({
    label: option,
    value: option,
  }));
  const imageUrls = Array.isArray(value) ? value : [];

  if (!Array.isArray(value) && typeof value === 'string' && value) {
    imageUrls.push(value);
  }

  const fieldInputs = {
    text: (
      <Input
        type="text"
        placeholder={enterPlaceholder}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full"
      />
    ),
    email: (
      <Input
        type="email"
        placeholder={enterPlaceholder}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full"
      />
    ),
    url: (
      <Input
        type="url"
        placeholder={enterPlaceholder}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full"
      />
    ),
    textarea: (
      <Textarea
        placeholder={enterPlaceholder}
        rows={10}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full resize-none"
      />
    ),
    number: (
      <Input
        type="number"
        placeholder={enterPlaceholder}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full"
      />
    ),
    date: (
      <DatePicker
        value={value ? new Date(value) : undefined}
        onChange={(date) => onChange(date ? (date as Date).toISOString() : '')}
        placeholder={field.placeholder || t('select-date')}
      />
    ),
    checkbox: (
      <Switch
        checked={Boolean(value)}
        onCheckedChange={(checked) => onChange(checked)}
      />
    ),
    boolean: (
      <Switch
        checked={Boolean(value)}
        onCheckedChange={(checked) => onChange(checked)}
      />
    ),
    select: options.length ? (
      <Select value={value || ''} onValueChange={onChange}>
        <Select.Trigger className="w-full">
          <Select.Value placeholder={selectPlaceholder} />
        </Select.Trigger>
        <Select.Content>
          {options.map((option: string) => (
            <Select.Item key={option} value={option}>
              {option}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    ) : null,
    radio: options.length ? (
      <div className="flex flex-col gap-2">
        {options.map((option: string) => (
          <label
            key={option}
            className="flex items-center gap-2 cursor-pointer text-sm"
          >
            <input
              type="radio"
              name={field._id}
              value={option}
              checked={value === option}
              onChange={(e) => onChange(e.target.value)}
              className="h-4 w-4 text-primary border-input focus:ring-primary"
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    ) : null,
    spreadsheet: (
      <SpreadsheetInput
        value={typeof value === 'string' ? value : ''}
        onChange={onChange}
        placeholder={field.placeholder}
      />
    ),
    multiSelect: options.length ? (
      <MultipleSelector
        value={multiOptions.filter((option: { value: string }) =>
          selectedValues.includes(option.value),
        )}
        options={multiOptions}
        placeholder={selectPlaceholder}
        hidePlaceholderWhenSelected
        emptyIndicator={t('no-options')}
        onChange={(selectedOptions: { value: string }[]) =>
          onChange(selectedOptions.map((option) => option.value))
        }
      />
    ) : null,
    image: (
      <GalleryUploader value={imageUrls} onChange={(urls) => onChange(urls)} />
    ),
    file: <FileFieldInput value={value} onChange={(urls) => onChange(urls)} />,
    products: (
      <SelectProduct
        mode="multiple"
        value={selectedValues}
        onValueChange={(val) =>
          onChange(Array.isArray(val) ? val : val ? [val] : [])
        }
        placeholder={selectPlaceholder}
        className="w-full"
      />
    ),
    richText: (
      <Editor
        className="h-64 border"
        key={field._id}
        isHTML
        initialContent={typeof value === 'string' ? value : ''}
        onChange={(content) => onChange(content)}
        uploadFile={async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          const response = await fetch(
            `${REACT_APP_API_URL}/upload-file?kind=main`,
            { method: 'post', body: formData, credentials: 'include' },
          );
          const key = await response.text();
          return readImage(key);
        }}
      />
    ),
  };

  return (
    fieldInputs[field.type as keyof typeof fieldInputs] || (
      <Input
        placeholder={enterPlaceholder}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full"
      />
    )
  );
};
