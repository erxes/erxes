import { IconPhotoPlus, IconStar, IconX } from '@tabler/icons-react';
import { Badge, Button, Form, Spinner, useToast } from 'erxes-ui';
import { type ChangeEvent, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { uploadErrorMessage, uploadFile } from '~/lib/files';
import { fileUrl } from '../productImages';
import type { ProductFormValues } from './productFormValues';

const Thumbnail = ({
  id,
  main,
  disabled,
  onMain,
  onRemove,
}: {
  id: string;
  main: boolean;
  disabled: boolean;
  onMain: () => void;
  onRemove: () => void;
}) => {
  const { t } = useTranslation('product');

  return (
    <div className="group relative size-20 overflow-hidden rounded-md border bg-muted">
      <img src={fileUrl(id)} alt="" className="size-full object-cover" />
      {main && (
        <Badge variant="secondary" className="absolute bottom-1 left-1 h-5 px-1 text-[10px]">
          {t('images.main', 'Main')}
        </Badge>
      )}
      {!disabled && (
        <div className="absolute inset-x-1 top-1 flex justify-between opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          {main ? (
            <span />
          ) : (
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="size-6"
              title={t('images.make-main', 'Make main')}
              aria-label={t('images.make-main', 'Make main')}
              onClick={onMain}
            >
              <IconStar />
            </Button>
          )}
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="size-6"
            title={t('images.remove', 'Remove')}
            aria-label={t('images.remove', 'Remove')}
            onClick={onRemove}
          >
            <IconX />
          </Button>
        </div>
      )}
    </div>
  );
};

/** Product images, uploaded to core files; the first one is the main image. */
export const ProductImagesField = ({ disabled }: { disabled: boolean }) => {
  const { t } = useTranslation('product');
  const { control, getValues, setValue } = useFormContext<ProductFormValues>();
  const { toast } = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);

  const set = (ids: string[]) => setValue('imageIds', ids, { shouldDirty: true });

  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = [...(event.target.files ?? [])];

    event.target.value = '';
    setUploading((count) => count + files.length);

    await Promise.all(
      files.map(async (file) => {
        try {
          const stored = await uploadFile(file);

          set([...getValues('imageIds'), stored.id]);
        } catch (error) {
          toast({
            variant: 'destructive',
            title: t('images.upload-failed', 'Could not upload {{name}}', { name: file.name }),
            description: uploadErrorMessage(error),
          });
        } finally {
          setUploading((count) => count - 1);
        }
      }),
    );
  };

  return (
    <Form.Field
      control={control}
      name="imageIds"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('fields.images', 'Images')}</Form.Label>
          <div className="flex flex-wrap gap-2">
            {field.value.map((id, index) => (
              <Thumbnail
                key={id}
                id={id}
                main={index === 0}
                disabled={disabled}
                onMain={() => set([id, ...field.value.filter((other) => other !== id)])}
                onRemove={() => set(field.value.filter((other) => other !== id))}
              />
            ))}
            {!disabled && (
              <Button
                type="button"
                variant="outline"
                onClick={() => input.current?.click()}
                disabled={uploading > 0}
                className="size-20 flex-col border-dashed text-xs text-muted-foreground"
              >
                {uploading > 0 ? <Spinner size="sm" /> : <IconPhotoPlus />}
                {uploading > 0 ? t('images.uploading', 'Uploading') : t('images.add', 'Add')}
              </Button>
            )}
          </div>
          <input
            ref={input}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(event) => void upload(event)}
          />
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};
