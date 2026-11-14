import type { Product } from '@erxes/core-contract';
import { IconPackage, IconPhotoPlus, IconStar, IconX } from '@tabler/icons-react';
import { Badge, Button, cn, Spinner, useToast } from 'erxes-ui';
import { type ChangeEvent, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { uploadErrorMessage, uploadFile } from '~/lib/files';
import { fileUrl } from '../productImages';
import { useCanManageProducts } from '../useProducts';
import { useProductEdit } from './useProductEdit';

/** The product's main image, or a package icon when it has none. */
export const ProductAvatar = ({ product, className }: { product: Product; className?: string }) => {
  const [main] = product.imageIds;

  return main ? (
    <img
      src={fileUrl(main)}
      alt=""
      className={cn('size-7 flex-none rounded object-cover', className)}
    />
  ) : (
    <span
      className={cn(
        'flex size-7 flex-none items-center justify-center rounded bg-muted text-muted-foreground',
        className,
      )}
    >
      <IconPackage className="size-4" />
    </span>
  );
};

const Thumbnail = ({
  id,
  main,
  editable,
  onMain,
  onRemove,
}: {
  id: string;
  main: boolean;
  editable: boolean;
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
      {editable && (
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

/** Uploads the chosen files to core files, then adds those that made it to the product at once. */
const useImageUpload = (product: Product) => {
  const { t } = useTranslation('product');
  const { toast } = useToast();
  const edit = useProductEdit();
  const [uploading, setUploading] = useState(false);

  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = [...(event.target.files ?? [])];

    event.target.value = '';

    if (!files.length) return;

    setUploading(true);

    const results = await Promise.allSettled(files.map((file) => uploadFile(file)));
    const ids: string[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        ids.push(result.value.id);

        return;
      }

      toast({
        variant: 'destructive',
        title: t('images.upload-failed', 'Could not upload {{name}}', { name: files[index]?.name }),
        description: uploadErrorMessage(result.reason),
      });
    });

    if (ids.length) {
      await edit
        .mutateAsync({ id: product.id, imageIds: [...product.imageIds, ...ids] })
        .catch(() => undefined);
    }

    setUploading(false);
  };

  return { upload, uploading: uploading || edit.isPending, edit };
};

/** Product images, the first one the main image: add, make main, remove, each saved at once. */
export const ProductPanelImages = ({ product }: { product: Product }) => {
  const { t } = useTranslation('product');
  const manage = useCanManageProducts();
  const input = useRef<HTMLInputElement>(null);
  const { upload, uploading, edit } = useImageUpload(product);
  const { imageIds } = product;

  const save = (next: string[]) => edit.mutate({ id: product.id, imageIds: next });

  if (!manage && !imageIds.length) {
    return <p className="text-xs text-muted-foreground">{t('images.none', 'No images')}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {imageIds.map((id, index) => (
        <Thumbnail
          key={id}
          id={id}
          main={index === 0}
          editable={manage}
          onMain={() => save([id, ...imageIds.filter((other) => other !== id)])}
          onRemove={() => save(imageIds.filter((other) => other !== id))}
        />
      ))}
      {manage && (
        <Button
          type="button"
          variant="dashed"
          onClick={() => input.current?.click()}
          disabled={uploading}
          className="size-20 flex-col"
        >
          {uploading ? <Spinner size="sm" /> : <IconPhotoPlus />}
          <span className="text-xs">
            {uploading ? t('images.uploading', 'Uploading') : t('images.add', 'Add')}
          </span>
        </Button>
      )}
      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(event) => void upload(event)}
      />
    </div>
  );
};
