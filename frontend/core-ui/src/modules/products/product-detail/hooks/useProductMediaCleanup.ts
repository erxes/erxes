import { toast, useRemoveFile } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { toProductAttachmentList } from 'ui-modules';

export interface ProductMediaValues {
  attachment?: unknown;
  attachmentMore?: unknown;
  videos?: unknown;
  files?: unknown;
}

const getMedia = (values: ProductMediaValues) => [
  ...toProductAttachmentList([values.attachment]),
  ...toProductAttachmentList(values.attachmentMore),
  ...toProductAttachmentList(values.videos),
];

/** Removes persisted media only after the edited product has been saved successfully. */
export const useProductMediaCleanup = () => {
  const { removeFile } = useRemoveFile();
  const { t } = useTranslation('product', { keyPrefix: 'detail' });

  return async (previous: ProductMediaValues, saved: ProductMediaValues) => {
    const retained = [
      ...getMedia(saved),
      ...toProductAttachmentList(saved.files),
    ];
    const removed = getMedia(previous).filter(
      (item) =>
        item.type !== 'embed' &&
        !retained.some(
          (current) => current.url === item.url || current.name === item.name,
        ),
    );
    const failures = await Promise.all(
      Array.from(new Set(removed.map((item) => item.name)), async (name) => {
        let failed = false;
        try {
          await removeFile(name, (status) => {
            failed = status !== 'ok';
          });
        } catch {
          failed = true;
        }
        return failed ? name : null;
      }),
    );
    const failed = failures.filter((name): name is string => name !== null);
    if (failed.length) {
      toast({
        title: t(
          'media-cleanup-error',
          'Product saved, but some removed media could not be deleted',
        ),
        description: failed.join(', '),
        variant: 'destructive',
      });
    }
  };
};
