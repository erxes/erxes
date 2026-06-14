import {
  Input,
  Textarea,
  Select,
  MultipleSelector,
  Switch,
  DatePicker,
  Button,
  useErxesUpload,
  readImage,
  Editor,
} from 'erxes-ui';
import { REACT_APP_API_URL } from 'erxes-ui/utils';
import { IconUpload, IconX, IconPaperclip } from '@tabler/icons-react';
import { SpreadsheetInput } from './SpreadsheetInput';
import { GalleryUploader } from './GalleryUploader';
import { useAutoUpload } from './hooks/useAutoUpload';

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
  const urls = Array.isArray(value) ? value : [];

  const uploadProps = useErxesUpload({
    allowedMimeTypes: [],
    maxFiles: 1,
    maxFileSize: 20 * 1024 * 1024,
    onFilesAdded: (added) => {
      const url = added[0]?.url;
      if (url) onChange([url]);
    },
  });
  useAutoUpload(uploadProps);

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
          {uploadProps.loading && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded">
              <span className="text-sm text-gray-500">Uploading...</span>
            </div>
          )}
        </div>
      )}
      <div>
        <input {...uploadProps.getInputProps()} />
        <Button
          variant="outline"
          className={buttonClassName}
          type="button"
          onClick={uploadProps.open}
          disabled={uploadProps.loading}
        >
          <IconUpload size={16} className="mr-2" />
          {uploadProps.loading ? 'Uploading...' : buttonLabel}
        </Button>
        <p className="text-xs text-muted-foreground mt-1">Max 20MB</p>
      </div>
      {Boolean(uploadProps.errors.length) && (
        <p className="text-xs text-destructive">
          {uploadProps.errors[0]?.message || 'Upload failed'}
        </p>
      )}
    </div>
  );
}

export const CustomFieldInput = ({
  field,
  value,
  onChange,
}: CustomFieldInputProps) => {
  const renderInput = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'url':
        return (
          <Input
            type={field.type === 'text' ? 'text' : field.type}
            placeholder={
              field.placeholder || `Enter ${field.label.toLowerCase()}`
            }
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full"
          />
        );

      case 'textarea':
        return (
          <Textarea
            placeholder={
              field.placeholder || `Enter ${field.label.toLowerCase()}`
            }
            rows={10}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full resize-none"
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            placeholder={
              field.placeholder || `Enter ${field.label.toLowerCase()}`
            }
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full"
          />
        );

      case 'date':
        return (
          <DatePicker
            value={value ? new Date(value) : undefined}
            onChange={(date) =>
              onChange(date ? (date as Date).toISOString() : '')
            }
            placeholder={field.placeholder || 'Select date'}
          />
        );

      case 'checkbox':
      case 'boolean':
        return (
          <Switch
            checked={!!value}
            onCheckedChange={(checked) => onChange(checked)}
          />
        );

      case 'select':
        if (!field.options?.length) return null;
        return (
          <Select value={value || ''} onValueChange={onChange}>
            <Select.Trigger className="w-full">
              <Select.Value
                placeholder={
                  field.placeholder || `Select ${field.label.toLowerCase()}`
                }
              />
            </Select.Trigger>
            <Select.Content>
              {field.options.map((option: string, idx: number) => (
                <Select.Item key={idx} value={option}>
                  {option}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        );

      case 'radio':
        if (!field.options?.length) return null;
        return (
          <div className="flex flex-col gap-2">
            {field.options.map((option: string, idx: number) => (
              <label
                key={idx}
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
        );

      case 'spreadsheet':
        return (
          <SpreadsheetInput
            value={typeof value === 'string' ? value : ''}
            onChange={onChange}
            placeholder={field.placeholder}
          />
        );

      case 'multiSelect': {
        if (!field.options?.length) return null;
        const selectedValues = Array.isArray(value) ? value : [];
        const multiOptions = field.options.map((opt: string) => ({
          label: opt,
          value: opt,
        }));
        return (
          <MultipleSelector
            value={multiOptions.filter((o: { value: string }) =>
              selectedValues.includes(o.value),
            )}
            options={multiOptions}
            placeholder={
              field.placeholder || `Select ${field.label.toLowerCase()}`
            }
            hidePlaceholderWhenSelected
            emptyIndicator="No options"
            onChange={(opts: { value: string }[]) =>
              onChange(opts.map((o) => o.value))
            }
          />
        );
      }

      case 'image':
        return (
          <GalleryUploader
            value={
              Array.isArray(value)
                ? value
                : typeof value === 'string' && value
                  ? [value]
                  : []
            }
            onChange={(urls) => onChange(urls)}
          />
        );

      case 'file':
        return (
          <FileFieldInput value={value} onChange={(urls) => onChange(urls)} />
        );

      case 'richText':
        return (
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
        );

      default:
        return (
          <Input
            placeholder={
              field.placeholder || `Enter ${field.label.toLowerCase()}`
            }
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full"
          />
        );
    }
  };

  return renderInput();
};
