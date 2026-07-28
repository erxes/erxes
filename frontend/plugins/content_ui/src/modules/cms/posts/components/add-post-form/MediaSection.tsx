import { Form, Upload, Button, Input } from 'erxes-ui';
import { readImage } from 'erxes-ui/utils/core';
import { IconUpload, IconX } from '@tabler/icons-react';
import { UseFormReturn, ControllerRenderProps } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
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

export const MediaSection = ({ form }: MediaSectionProps) => {
  const { t } = useTranslation('content');
  return (
  <div>
    <div className="mt-1 space-y-4">
      <div className="text-sm font-medium">{t('media')}</div>

      <Form.Field
        control={form.control}
        name="thumbnail"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('featured-image')}</Form.Label>
            <Form.Description>
              {t('featured-image-desc')}
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
            <Form.Label>{t('image-gallery')}</Form.Label>
            <Form.Description>
              {t('image-gallery-desc')}
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
            <Form.Label>{t('video-url')}</Form.Label>
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
            <Form.Label>{t('documents')}</Form.Label>
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
            <Form.Label>{t('attachments')}</Form.Label>
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
};

const ThumbnailUploader = ({ field, form }: ThumbnailUploaderProps) => {
  const { t } = useTranslation('content');
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
                {field.value ? t('change-image') : t('upload-featured-image')}
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
