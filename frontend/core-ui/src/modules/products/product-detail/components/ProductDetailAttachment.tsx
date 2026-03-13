import { IconX } from '@tabler/icons-react';
import {
  Button,
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
  IAttachment,
  InfoCard,
  readImage,
  useErxesUpload,
  useRemoveFile,
} from 'erxes-ui';
import { useCallback, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ProductFormValues } from '@/products/constants/ProductFormSchema';

function toAttachmentItem(
  x: IAttachment | null | undefined,
): IAttachment | null {
  if (!x || typeof x !== 'object' || !('url' in x)) return null;
  const url = (x as IAttachment).url;
  const name = (x as IAttachment).name ?? url;
  return { ...(x as IAttachment), name: name || url };
}

function toAttachmentList(
  arr: IAttachment[] | null | undefined,
): IAttachment[] {
  const list = Array.isArray(arr) ? arr : [];
  return list
    .filter(
      (x): x is IAttachment => x != null && typeof x === 'object' && 'url' in x,
    )
    .map((x) => ({
      ...x,
      name: x.name ?? x.url,
    }));
}

export const ProductDetailAttachment = ({
  attachment,
  attachmentMore = [],
}: {
  attachment?: IAttachment | null;
  attachmentMore?: IAttachment[];
}) => {
  const { t } = useTranslation('product', { keyPrefix: 'detail' });
  const { removeFile, isLoading } = useRemoveFile();

  const form = useFormContext<ProductFormValues>();
  const [featured, setFeatured] = useState<IAttachment | null>(() =>
    toAttachmentItem(attachment),
  );
  const [secondary, setSecondary] = useState<IAttachment[]>(() =>
    toAttachmentList(attachmentMore),
  );

  useEffect(() => {
    setFeatured(toAttachmentItem(attachment));
  }, [attachment]);

  useEffect(() => {
    setSecondary(toAttachmentList(attachmentMore));
  }, [attachmentMore]);

  useEffect(() => {
    form.setValue('attachment', featured ?? undefined);
  }, [featured]);

  useEffect(() => {
    form.setValue('attachmentMore', secondary);
  }, [secondary]);

  const featuredUpload = useErxesUpload({
    allowedMimeTypes: ['image/*'],
    maxFiles: 1,
    maxFileSize: 20 * 1024 * 1024,
    onFilesAdded: (added) => {
      const first = added[0];
      if (first) {
        setFeatured({
          name: first.name ?? first.url,
          url: first.url,
          type: first.type,
          size: first.size,
        });
      }
    },
  });

  const secondaryUpload = useErxesUpload({
    allowedMimeTypes: ['image/*'],
    maxFiles: 10,
    maxFileSize: 20 * 1024 * 1024,
    onFilesAdded: (added) => {
      setSecondary((prev) => [
        ...prev.filter(
          (f) => !added.some((a) => (a.name ?? a.url) === (f.name ?? f.url)),
        ),
        ...added.map((f) => ({
          name: f.name ?? f.url,
          url: f.url,
          type: f.type,
          size: f.size,
        })),
      ]);
    },
  });

  const removeFeatured = useCallback(() => {
    if (!featured) return;
    removeFile(featured.name, (status) => {
      if (status === 'ok') setFeatured(null);
    });
  }, [featured, removeFile]);

  const removeSecondary = useCallback(
    (item: IAttachment) => {
      removeFile(item.name, (status) => {
        if (status === 'ok') {
          setSecondary((prev) => prev.filter((f) => f.name !== item.name));
        }
      });
    },
    [removeFile],
  );

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="md:col-span-1">
        <InfoCard title={t('featured-image')}>
          <InfoCard.Content>
            <div className="flex flex-wrap gap-4">
              {featured && (
                <div className="overflow-hidden relative w-32 rounded-md aspect-square shadow-xs">
                  <img
                    src={readImage(featured.url)}
                    alt={featured.name}
                    className="object-contain w-full h-full"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-0 right-0"
                    disabled={isLoading}
                    onClick={removeFeatured}
                  >
                    <IconX size={12} />
                  </Button>
                </div>
              )}
            </div>
            <Dropzone {...featuredUpload}>
              <DropzoneEmptyState />
              <DropzoneContent />
            </Dropzone>
          </InfoCard.Content>
        </InfoCard>
      </div>
      <div className="md:col-span-2">
        <InfoCard title={t('secondary-images')}>
          <InfoCard.Content>
            <div className="flex flex-wrap gap-4">
              {secondary.map((item) => (
                <div
                  key={item.url}
                  className="overflow-hidden relative w-32 rounded-md aspect-square shadow-xs"
                >
                  <img
                    src={readImage(item.url)}
                    alt={item.name}
                    className="object-contain w-full h-full"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-0 right-0"
                    disabled={isLoading}
                    onClick={() => removeSecondary(item)}
                  >
                    <IconX size={12} />
                  </Button>
                </div>
              ))}
            </div>
            <Dropzone {...secondaryUpload}>
              <DropzoneEmptyState />
              <DropzoneContent />
            </Dropzone>
          </InfoCard.Content>
        </InfoCard>
      </div>
    </div>
  );
};
