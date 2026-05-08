import { Upload } from 'erxes-ui';
import { ComponentType } from 'react';
import { CmsAttachment } from '../types/settingsTypes';

type UploadValue = Partial<CmsAttachment> & {
  fileInfo?: Partial<CmsAttachment>;
};

const buildAttachment = (value: unknown): CmsAttachment | null => {
  if (!value || typeof value === 'string') {
    return null;
  }

  const uploadValue = value as UploadValue;
  const fileInfo = uploadValue.fileInfo || {};
  const url = uploadValue.url || '';

  if (!url) {
    return null;
  }

  return {
    url,
    name:
      uploadValue.name ||
      fileInfo.name ||
      url.split('/').filter(Boolean).pop() ||
      'image',
    type: uploadValue.type || fileInfo.type,
    size: uploadValue.size || fileInfo.size,
    duration: uploadValue.duration || fileInfo.duration,
  };
};

export const Uploader = ({
  icon: Icon,
  label,
  hint,
  value,
  onChange,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  hint: string;
  value: CmsAttachment | null;
  onChange: (value: CmsAttachment | null) => void;
}) => (
  <div className="flex items-center gap-3 rounded-lg border border-dashed bg-muted/30 p-3">
    <div className="flex size-11 flex-none items-center justify-center rounded-md bg-muted text-muted-foreground">
      <Icon className="size-5" />
    </div>
    <div className="min-w-0 flex-1">
      <div className="text-sm font-semibold">{label}</div>
      <div className="text-xs text-muted-foreground">{hint}</div>
    </div>
    <Upload.Root
      value={value?.url || ''}
      onChange={(uploadValue) => onChange(buildAttachment(uploadValue))}
    >
      <Upload.Preview />
      <div className="flex flex-col gap-2">
        <Upload.Button type="button" variant="secondary" size="sm">
          {value ? 'Change' : 'Upload'}
        </Upload.Button>
        {value ? (
          <Upload.RemoveButton type="button" variant="ghost" size="sm">
            Remove
          </Upload.RemoveButton>
        ) : null}
      </div>
    </Upload.Root>
  </div>
);
