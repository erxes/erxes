import { Form, Button, Input, useErxesUpload } from 'erxes-ui';
import { readImage } from 'erxes-ui/utils/core';
import { IconPhotoPlus, IconUpload, IconX } from '@tabler/icons-react';
import { UseFormReturn, ControllerRenderProps } from 'react-hook-form';
import { GalleryUploader } from '../../GalleryUploader';
import { DocumentsUploader } from '../../DocumentsUploader';
import { AttachmentsUploader } from '../../AttachmentsUploader';
import { MediaPickerDialog, MediaSelection } from '../../../media/MediaPicker';
import { useEffect, useState } from 'react';

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
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  const uploadProps = useErxesUpload({
    allowedMimeTypes: ['image/*'],
    maxFiles: 1,
    maxFileSize: 20 * 1024 * 1024,
    uploadKind: 'media',
    onFilesAdded: (addedFiles) => {
      const file = addedFiles?.[0];

      if (file?.url) {
        field.onChange({
          url: file.url,
          name: file.name || '',
        });
      }
    },
  });

  useEffect(() => {
    if (uploadProps.files.length > 0 && !uploadProps.loading) {
      uploadProps.onUpload();
    }
  }, [uploadProps.files.length]);

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
        <input {...uploadProps.getInputProps()} />
        <div className="grid flex-1 grid-cols-2 gap-2">
          <Button
            size="sm"
            variant="secondary"
            type="button"
            className="flex items-center justify-center gap-2"
            onClick={uploadProps.open}
            disabled={uploadProps.loading}
          >
            <IconUpload size={16} />
            <span className="text-sm font-medium">
              {uploadProps.loading
                ? 'Uploading...'
                : field.value
                  ? 'Change image'
                  : 'Upload featured image'}
            </span>
          </Button>
          <Button
            size="sm"
            variant="secondary"
            type="button"
            className="flex items-center justify-center gap-2"
            onClick={() => setMediaPickerOpen(true)}
          >
            <IconPhotoPlus size={16} />
            <span className="text-sm font-medium">Media library</span>
          </Button>
        </div>
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
      <MediaPickerDialog
        open={mediaPickerOpen}
        onOpenChange={setMediaPickerOpen}
        fileType="image"
        onSelect={(selection) => {
          const media = selection as MediaSelection;

          field.onChange({
            url: media.url,
            name: media.name,
          });
        }}
      />
    </>
  );
};
