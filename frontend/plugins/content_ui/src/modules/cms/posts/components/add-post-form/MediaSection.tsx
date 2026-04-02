import { Form, Upload, Button, Input } from 'erxes-ui';
import { readImage } from 'erxes-ui/utils/core';
import { IconUpload, IconX } from '@tabler/icons-react';
import { UseFormReturn, ControllerRenderProps } from 'react-hook-form';
import { GalleryUploader } from '../../GalleryUploader';
import { DocumentsUploader } from '../../DocumentsUploader';
import { AttachmentsUploader } from '../../AttachmentsUploader';

type MediaFormData = {
  thumbnail?: string | { url: string; name: string };
  gallery?: string[];
  videoUrl?: string;
  documents?: string[];
  attachments?: string[];
};

interface MediaSectionProps {
  form: UseFormReturn<MediaFormData>;
}

interface FileInfo {
  name: string;
  size?: number;
  type?: string;
  [key: string]: unknown;
}

interface UploadValue {
  url: string;
  fileInfo: FileInfo;
}

interface ThumbnailUploaderProps {
  field: ControllerRenderProps<MediaFormData, 'thumbnail'>;
  form: UseFormReturn<MediaFormData>;
}

export const MediaSection = ({ form }: MediaSectionProps) => (
  <div>
    <div className="mt-1 space-y-4">
      <div className="text-sm font-medium">Media</div>

      <Form.Field
        control={form.control}
        name="thumbnail"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Featured image</Form.Label>
            <Form.Description>
              Image can be shown on top of the post also in the list view
            </Form.Description>
            <Form.Control>
              <ThumbnailUploader field={field} form={form} />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />

      <Form.Field
        control={form.control}
        name="gallery"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Image gallery</Form.Label>
            <Form.Description>
              Image gallery with maximum of 100 images
            </Form.Description>
            <Form.Control>
              <GalleryUploader
                value={(field.value as string[]) || []}
                onChange={field.onChange}
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />

      <Form.Field
        control={form.control}
        name="videoUrl"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Video URL</Form.Label>
            <Form.Control>
              <Input value={field.value} onChange={field.onChange} />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />

      <Form.Field
        control={form.control}
        name="documents"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Documents</Form.Label>
            <Form.Control>
              <DocumentsUploader
                value={(field.value as string[]) || []}
                onChange={field.onChange}
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />

      <Form.Field
        control={form.control}
        name="attachments"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Attachments</Form.Label>
            <Form.Control>
              <AttachmentsUploader
                value={(field.value as string[]) || []}
                onChange={field.onChange}
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
    </div>
  </div>
);

const ThumbnailUploader = ({ field, form }: ThumbnailUploaderProps) => {
  const handleChange = (value: UploadValue) => {
    if (value?.url) {
      field.onChange({
        url: value.url,
        name: value.fileInfo?.name || '',
      });
    } else {
      field.onChange(null);
    }
  };

  const currentValue = field.value
    ? typeof field.value === 'string'
      ? field.value
      : (field.value as { url: string }).url
    : null;

  let thumbnailUrl: string | null = null;

  if (field.value) {
    if (typeof field.value === 'string') {
      thumbnailUrl = field.value;
    } else {
      thumbnailUrl = (field.value as { url: string }).url;
    }
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <Upload.Root
          value={thumbnailUrl || ''}
          onChange={(value) => handleChange(value as UploadValue)}
        >
          <Upload.Preview />
          <div className="flex flex-col items-stretch gap-2 flex-1">
            <Upload.Button
              size="sm"
              variant="secondary"
              type="button"
              className="flex items-center justify-center gap-2"
            >
              <IconUpload size={16} />
              <span className="text-sm font-medium">
                {field.value ? 'Change image' : 'Upload featured image'}
              </span>
            </Upload.Button>
          </div>
        </Upload.Root>
      </div>
      {form.watch('thumbnail') && (
        <div className="mt-2 relative">
          <div className="relative">
            <img
              src={readImage(
                (() => {
                  const thumbnail = form.watch('thumbnail');
                  return typeof thumbnail === 'string'
                    ? thumbnail
                    : (thumbnail as { url: string })?.url || '';
                })(),
              )}
              alt="Featured preview"
              className="w-full h-32 object-cover rounded border"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-0 right-0"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                field.onChange(null);
              }}
            >
              <IconX size={12} />
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
