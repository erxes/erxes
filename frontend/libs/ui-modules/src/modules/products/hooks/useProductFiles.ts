import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FILES_SHARE_CREATE } from '../../files/graphql/mutations';
import { IFile } from '../../files/types';
import { filesShareUrl } from '../../files/utils/shareUrl';
import { ProductAttachmentItem } from '../components/ProductImageUploads';

export const PRODUCT_FILE_LIMIT = 10;

// A picked file has no url until the product is saved and its link is created.
export type ProductFileItem = ProductAttachmentItem & { fileId?: string };

export const productFileKey = (item: ProductFileItem) =>
  item.url || item.fileId || item.name;

export const useProductFiles = ({
  value,
  onChange,
}: {
  value: ProductFileItem[];
  onChange: (next: ProductFileItem[]) => void;
}) => {
  const { t } = useTranslation('product', { keyPrefix: 'files' });
  const [pickerOpen, setPickerOpen] = useState(false);

  const add = (files: IFile[]) => {
    const picked = new Set(value.map((item) => item.fileId).filter(Boolean));
    const fresh = files.filter((file) => !picked.has(file._id));
    const room = Math.max(PRODUCT_FILE_LIMIT - value.length, 0);

    if (fresh.length > room) {
      toast({
        title: t('limit', { count: PRODUCT_FILE_LIMIT }),
        variant: 'destructive',
      });
    }

    onChange([
      ...value,
      ...fresh.slice(0, room).map((file) => ({
        fileId: file._id,
        name: file.name,
        url: '',
        type: file.mimeType,
        size: file.size,
      })),
    ]);
  };

  return {
    pickerOpen,
    setPickerOpen,
    add,
    canAdd: value.length < PRODUCT_FILE_LIMIT,
    remove: (key: string) =>
      onChange(value.filter((item) => productFileKey(item) !== key)),
  };
};

// Created on save, not on pick: a cancelled form must not leave a public link.
export const useProductFileLinks = () => {
  const { t } = useTranslation('product', { keyPrefix: 'files' });
  const [shareCreate, { loading }] = useMutation<{
    filesShareCreate: { token: string };
  }>(FILES_SHARE_CREATE);

  const linkFiles = async (
    items: ProductFileItem[] = [],
  ): Promise<ProductAttachmentItem[] | null> => {
    try {
      const linked = await Promise.all(
        items.map(async ({ fileId, ...item }) => {
          if (item.url || !fileId) {
            return item;
          }

          // One live link per file, so asking again returns the same URL.
          const { data } = await shareCreate({ variables: { fileId } });

          return {
            ...item,
            url: filesShareUrl(data?.filesShareCreate.token || ''),
          };
        }),
      );

      return linked.filter(
        (item, index) =>
          linked.findIndex((other) => other.url === item.url) === index,
      );
    } catch (e) {
      toast({
        title: t('add-failed'),
        description: (e as Error).message,
        variant: 'destructive',
      });

      return null;
    }
  };

  return { linkFiles, linking: loading };
};
