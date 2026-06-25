import { Form, Upload, Button, Input } from 'erxes-ui';
import { readImage } from 'erxes-ui/utils/core';
import { IconUpload, IconX } from '@tabler/icons-react';
import type {
  ControllerRenderProps,
  FieldPath,
  FieldValues,
  UseFormReturn,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { GalleryUploader } from '../../GalleryUploader';
import { DocumentsUploader } from '../../DocumentsUploader';
import { AttachmentsUploader } from '../../AttachmentsUploader';

interface MediaFormData extends FieldValues {
  thumbnail?: string | { url: string; name?: string; type?: string } | null;
  gallery?: string[];
  videoUrl?: string;
  documents?: string[];
  attachments?: string[];
}

interface MediaSectionProps<TFormData extends MediaFormData> {
  form: UseFormReturn<TFormData>;
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

interface ThumbnailUploaderProps<TFormData extends MediaFormData> {
  field: ControllerRenderProps<TFormData, FieldPath<TFormData>>;
  form: UseFormReturn<TFormData>;
}

export const MediaSection = <TFormData extends MediaFormData>({
  form,
}: MediaSectionProps<TFormData>) => {
  const { t } = useTranslation('content');
  const thumbnailField = 'thumbnail' as FieldPath<TFormData>;
  const galleryField = 'gallery' as FieldPath<TFormData>;
  const videoUrlField = 'videoUrl' as FieldPath<TFormData>;
  const documentsField = 'documents' as FieldPath<TFormData>;
  const attachmentsField = 'attachments' as FieldPath<TFormData>;

  return (
  <div>
    <div className="mt-1 space-y-4">
      <div className="text-sm font-medium">{t('media')}</div>

      <Form.Field
        control={form.control}
        name={thumbnailField}
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
        name={galleryField}
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
        name={videoUrlField}
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
        name={documentsField}
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
        name={attachmentsField}
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

const ThumbnailUploader = <TFormData extends MediaFormData>({
  field,
  form,
}: ThumbnailUploaderProps<TFormData>) => {
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
      {form.watch('thumbnail' as FieldPath<TFormData>) && (
        <div className="mt-2 relative">
          <div className="relative">
            <img
              src={readImage(
                (() => {
                  const thumbnail = form.watch(
                    'thumbnail' as FieldPath<TFormData>,
                  );
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
