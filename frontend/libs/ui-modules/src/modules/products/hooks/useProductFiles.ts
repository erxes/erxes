import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FILES_SHARE_CREATE } from '../../files/graphql/mutations';
import { IFile } from '../../files/types';
import { filesShareUrl } from '../../files/utils/shareUrl';
import { ProductAttachmentItem } from '../components/ProductImageUploads';

export const PRODUCT_FILE_LIMIT = 10;

/**
 * Products are read by POS and websites with no erxes login, so a picked file is
 * stored as its public share link, not its Files id.
 */
export const useProductFiles = ({
  value,
  onChange,
}: {
  value: ProductAttachmentItem[];
  onChange: (next: ProductAttachmentItem[]) => void;
}) => {
  const { t } = useTranslation('product', { keyPrefix: 'files' });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [shareCreate, { loading }] = useMutation<{
    filesShareCreate: { token: string };
  }>(FILES_SHARE_CREATE);

  const add = async (files: IFile[]) => {
    const room = PRODUCT_FILE_LIMIT - value.length;

    if (files.length > room) {
      toast({
        title: t('limit', { count: PRODUCT_FILE_LIMIT }),
        variant: 'destructive',
      });
    }

    try {
      // One live link per file, so asking again returns the same URL.
      const added = await Promise.all(
        files.slice(0, Math.max(room, 0)).map(async (file) => {
          const { data } = await shareCreate({
            variables: { fileId: file._id },
          });

          return {
            name: file.name,
            url: filesShareUrl(data?.filesShareCreate.token || ''),
            type: file.mimeType,
            size: file.size,
          };
        }),
      );
      const known = new Set(value.map((item) => item.url));

      onChange([...value, ...added.filter((item) => !known.has(item.url))]);
    } catch (e) {
      toast({
        title: t('add-failed'),
        description: (e as Error).message,
        variant: 'destructive',
      });
    }
  };

  return {
    pickerOpen,
    setPickerOpen,
    add,
    adding: loading,
    canAdd: value.length < PRODUCT_FILE_LIMIT,
    remove: (url: string) => onChange(value.filter((item) => item.url !== url)),
  };
};
