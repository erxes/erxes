import { useEffect } from 'react';
import {
  Button,
  DatePicker,
  Input,
  MultipleSelector,
  Select,
  Switch,
  Textarea,
  readImage,
  useErxesUpload,
} from 'erxes-ui';
import { IconPaperclip, IconUpload, IconX } from '@tabler/icons-react';
import type { CustomFieldValue } from '../utils/customFields';

export interface TourCustomFieldDefinition {
  _id: string;
  type: string;
  label: string;
  placeholder?: string;
  options?: string[];
  isRequired?: boolean;
}

interface TourCustomFieldInputProps {
  field: TourCustomFieldDefinition;
  value: CustomFieldValue;
  onChange: (value: string | boolean | string[]) => void;
}

const ImageFieldInput = ({
  value,
  onChange,
}: {
  value: CustomFieldValue;
  onChange: (value: string) => void;
}) => {
  const url = typeof value === 'string' ? value : '';

  const uploadProps = useErxesUpload({
    allowedMimeTypes: ['image/*'],
    maxFiles: 1,
    maxFileSize: 20 * 1024 * 1024,
    onFilesAdded: (added) => {
      if (added[0]?.url) onChange(added[0].url);
    },
  });

  useEffect(() => {
    if (uploadProps.files.length > 0 && !uploadProps.loading) {
      uploadProps.onUpload();
    }
  }, [uploadProps.files.length, uploadProps.loading]);

  return (
    <div className="space-y-2">
      {url && (
        <div className="relative w-full overflow-hidden border rounded-md group aspect-[3/1] bg-muted">
          <img
            src={readImage(url)}
            alt="uploaded"
            className="object-contain w-full h-full"
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute p-1 text-white transition rounded-md opacity-0 top-2 right-2 bg-destructive group-hover:opacity-100"
          >
            <IconX size={14} />
          </button>
        </div>
      )}
      <input {...uploadProps.getInputProps()} />
      <Button
        variant="outline"
        type="button"
        onClick={uploadProps.open}
        disabled={uploadProps.loading}
      >
        <IconUpload size={16} />
        {uploadProps.loading
          ? 'Uploading...'
          : url
          ? 'Change image'
          : 'Upload image'}
      </Button>
      {!!uploadProps.errors.length && (
        <p className="text-xs text-destructive">
          {uploadProps.errors[0]?.message || 'Upload failed'}
        </p>
      )}
    </div>
  );
};

const FileFieldInput = ({
  value,
  onChange,
}: {
  value: CustomFieldValue;
  onChange: (value: string[]) => void;
}) => {
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

  useEffect(() => {
    if (uploadProps.files.length > 0 && !uploadProps.loading) {
      uploadProps.onUpload();
    }
  }, [uploadProps.files.length, uploadProps.loading]);

  return (
    <div className="space-y-2">
      {urls.map((url) => (
        <div
          key={url}
          className="flex items-center gap-2 p-2 border rounded bg-muted"
        >
          <IconPaperclip size={16} className="shrink-0 text-muted-foreground" />
          <span className="flex-1 text-sm truncate">{url}</span>
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={() => onChange(urls.filter((item) => item !== url))}
          >
            <IconX size={16} />
          </Button>
        </div>
      ))}
      <input {...uploadProps.getInputProps()} />
      <Button
        variant="outline"
        type="button"
        onClick={uploadProps.open}
        disabled={uploadProps.loading}
      >
        <IconUpload size={16} />
        {uploadProps.loading ? 'Uploading...' : 'Upload file'}
      </Button>
      {!!uploadProps.errors.length && (
        <p className="text-xs text-destructive">
          {uploadProps.errors[0]?.message || 'Upload failed'}
        </p>
      )}
    </div>
  );
};

export const TourCustomFieldInput = ({
  field,
  value,
  onChange,
}: TourCustomFieldInputProps) => {
  switch (field.type) {
    case 'text':
    case 'email':
    case 'url':
      return (
        <Input
          type={field.type === 'text' ? 'text' : field.type}
          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case 'textarea':
      return (
        <Textarea
          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
          rows={6}
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          className="resize-none"
        />
      );

    case 'number':
      return (
        <Input
          type="number"
          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case 'date':
      return (
        <DatePicker
          value={value ? new Date(value as string) : undefined}
          onChange={(date) =>
            onChange(date ? (date as Date).toISOString() : '')
          }
          placeholder={field.placeholder || 'Select date'}
        />
      );

    case 'checkbox':
    case 'boolean':
      return <Switch checked={!!value} onCheckedChange={onChange} />;

    case 'select':
      return (
        <Select
          value={typeof value === 'string' ? value : ''}
          onValueChange={onChange}
        >
          <Select.Trigger className="w-full">
            <Select.Value
              placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`}
            />
          </Select.Trigger>
          <Select.Content>
            {(field.options || []).map((option) => (
              <Select.Item key={option} value={option}>
                {option}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      );

    case 'radio':
      return (
        <div className="flex flex-col gap-2">
          {(field.options || []).map((option) => (
            <label
              key={option}
              className="flex items-center gap-2 text-sm cursor-pointer"
            >
              <input
                type="radio"
                name={field._id}
                value={option}
                checked={value === option}
                onChange={(e) => onChange(e.target.value)}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      );

    case 'multiSelect': {
      const selectedValues = Array.isArray(value) ? value : [];
      const options = (field.options || []).map((option) => ({
        label: option,
        value: option,
      }));

      return (
        <MultipleSelector
          value={options.filter((option) =>
            selectedValues.includes(option.value),
          )}
          options={options}
          placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`}
          hidePlaceholderWhenSelected
          emptyIndicator="No options"
          onChange={(options: Array<{ value: string }>) =>
            onChange(options.map((option) => option.value))
          }
        />
      );
    }

    case 'image':
      return <ImageFieldInput value={value} onChange={onChange} />;

    case 'file':
      return <FileFieldInput value={value} onChange={onChange} />;

    default:
      return (
        <Input
          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
};
