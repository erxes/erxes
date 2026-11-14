import { IconTrash, IconUpload } from '@tabler/icons-react';
import {
  Button,
  ColorPicker,
  Dropzone,
  Form,
  readImage,
  Spinner,
  useErxesUpload,
  useToast,
} from 'erxes-ui';
import { TFunction } from 'i18next';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Control, FieldValues, Path } from 'react-hook-form';
import { ColorDefaultAction } from '@/knowledgebase/shared/components/ColorDefaultAction';
import { KbFormItem } from './KbFormLayout';

export function KbColorInput({
  value,
  onChange,
}: Readonly<{ value: string; onChange: (value: string) => void }>) {
  return (
    <ColorPicker
      className="w-full h-8"
      value={value}
      onValueChange={(next: string) => onChange(next)}
    />
  );
}

export function KbImageUpload({
  value,
  onChange,
  buttonLabel,
  captureChange,
  invalidateChange,
  disabled = false,
  removable = true,
}: Readonly<{
  value: string;
  onChange: (url: string, file?: File) => void;
  buttonLabel: string;
  captureChange?: () => (url?: string, file?: File) => void;
  invalidateChange?: () => void;
  disabled?: boolean;
  removable?: boolean;
}>) {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.inbox' });
  const { toast } = useToast();
  const maximumBytes =
    Number.parseInt(
      localStorage.getItem('erxes_env_REACT_APP_FILE_UPLOAD_MAX_SIZE') || '',
      10,
    ) || 20 * 1024 * 1024;
  const upload = useErxesUpload({ maxFiles: 1, maxFileSize: maximumBytes });
  const { files, setFiles, uploadFile, open } = upload;
  const attempted = useRef(new WeakSet<File>());
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (disabled) return;
    for (const file of files) {
      if (attempted.current.has(file)) continue;
      attempted.current.add(file);
      const remove = () =>
        setFiles((current) => current.filter((item) => item !== file));
      if (file.errors.length || file.size > maximumBytes) {
        toast({
          title: t('upload-failed'),
          description:
            file.errors[0]?.message ||
            t('attachment-too-large', {
              name: file.name,
              size: maximumBytes / 1024 / 1024,
            }),
          variant: 'destructive',
        });
        remove();
        continue;
      }
      const complete = captureChange?.();
      setUploading(true);
      void uploadFile(file)
        .then((result) => {
          if (!result.url || result.message !== undefined)
            throw new Error(result.message || t('upload-failed'));
          if (complete) complete(result.url, file);
          else onChange(result.url, file);
        })
        .catch((error: unknown) => {
          complete?.();
          toast({
            title: t('upload-failed'),
            description: error instanceof Error ? error.message : undefined,
            variant: 'destructive',
          });
        })
        .finally(() => {
          setUploading(false);
          remove();
        });
    }
  }, [
    files,
    setFiles,
    uploadFile,
    captureChange,
    onChange,
    disabled,
    maximumBytes,
    toast,
    t,
  ]);
  useEffect(
    () => () => {
      files.forEach((file) => {
        if (file.preview) URL.revokeObjectURL(file.preview);
      });
    },
    [files],
  );

  return (
    <Dropzone
      {...upload}
      className={`flex items-center gap-2 p-0 shadow-none bg-transparent text-left ${
        disabled || uploading ? 'pointer-events-none opacity-50' : ''
      }`}
    >
      {value && (
        <img
          src={readImage(value)}
          alt={buttonLabel}
          className="size-16 shrink-0 rounded object-cover"
        />
      )}
      <div className="flex flex-col gap-2">
        <Button
          size="sm"
          variant="outline"
          type="button"
          disabled={disabled || uploading}
          onClick={open}
        >
          {uploading ? (
            <Spinner size="sm" />
          ) : (
            <IconUpload className="mr-2 w-4 h-4" />
          )}
          {buttonLabel}
        </Button>
        {removable && value && (
          <Button
            size="sm"
            variant="outline"
            type="button"
            disabled={disabled || uploading}
            aria-label={t('remove', { keyPrefix: '' })}
            onClick={() => {
              invalidateChange?.();
              onChange('');
            }}
          >
            <IconTrash />
          </Button>
        )}
      </div>
    </Dropzone>
  );
}

type TTopicFieldProps<T extends FieldValues> = Readonly<{
  control: Control<T>;
  name: Path<T>;
  t: TFunction;
}>;

function KbControlField<T extends FieldValues>({
  control,
  name,
  label,
  required,
  renderLabelAction,
  renderControl,
}: Readonly<{
  control: Control<T>;
  name: Path<T>;
  label: string;
  required?: string;
  renderLabelAction?: (
    value: string,
    onChange: (value: string) => void,
  ) => ReactNode;
  renderControl: (
    value: string,
    onChange: (value: string) => void,
  ) => ReactNode;
}>) {
  return (
    <Form.Field
      control={control}
      name={name}
      rules={required ? { required } : undefined}
      render={({ field }) => (
        <KbFormItem
          label={label}
          wide
          labelAction={renderLabelAction?.(
            typeof field.value === 'string' ? field.value : '',
            field.onChange,
          )}
        >
          <Form.Control>
            {renderControl(
              typeof field.value === 'string' ? field.value : '',
              field.onChange,
            )}
          </Form.Control>
          <Form.Message />
        </KbFormItem>
      )}
    />
  );
}

export const TopicColorField = <T extends FieldValues>({
  control,
  name,
  t,
  defaultValue,
}: TTopicFieldProps<T> & Readonly<{ defaultValue?: string }>) => (
  <KbControlField
    control={control}
    name={name}
    label={t('kb-color-required')}
    required="Color is required"
    renderLabelAction={(value, onChange) => (
      <ColorDefaultAction
        value={value}
        defaultValue={defaultValue}
        onReset={onChange}
        t={t}
      />
    )}
    renderControl={(value, onChange) => (
      <KbColorInput value={value} onChange={onChange} />
    )}
  />
);

export const TopicBackgroundImageField = <T extends FieldValues>({
  control,
  name,
  t,
  captureChange,
  invalidateChange,
  disabled,
}: TTopicFieldProps<T> & {
  captureChange?: () => (url?: string) => void;
  invalidateChange?: () => void;
  disabled?: boolean;
}) => (
  <KbControlField
    control={control}
    name={name}
    label={t('kb-background-image')}
    renderControl={(value, onChange) => (
      <KbImageUpload
        value={value}
        onChange={onChange}
        buttonLabel={t('kb-upload-image')}
        captureChange={captureChange}
        invalidateChange={invalidateChange}
        disabled={disabled}
      />
    )}
  />
);
