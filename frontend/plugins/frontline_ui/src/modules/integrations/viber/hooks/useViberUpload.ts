import { useTranslation } from 'react-i18next';
import { REACT_APP_API_URL, toast } from 'erxes-ui';
import { useCallback, useRef, useState } from 'react';
import { uploadViberFile } from '../upload';
import type { ViberAttachment } from '../types';

export const useViberUpload = (): {
  upload: (
    files: FileList | readonly File[],
    existingCount: number,
  ) => Promise<ViberAttachment[]>;
  loading: boolean;
} => {
  const { t } = useTranslation('frontline');
  const [loading, setLoading] = useState(false);
  const active = useRef(false);
  const upload = useCallback(
    async (
      files: FileList | readonly File[],
      existingCount: number,
    ): Promise<ViberAttachment[]> => {
      if (active.current) return [];
      if (existingCount + files.length > 10) {
        toast({
          title: t('viber-file-count-limit', {
            defaultValue: 'Attach up to 10 files per message',
          }),
          variant: 'destructive',
        });
        return [];
      }
      active.current = true;
      setLoading(true);
      const attachments: ViberAttachment[] = [];
      try {
        for (const file of Array.from(files)) {
          try {
            attachments.push(await uploadViberFile(file, REACT_APP_API_URL, t));
          } catch (error) {
            toast({
              title: t('viber-upload-failed', {
                defaultValue: `Could not upload ${file.name}`,
                fileName: file.name,
              }),
              description:
                error instanceof Error
                  ? error.message
                  : t('upload-failed', { defaultValue: 'Upload failed' }),
              variant: 'destructive',
            });
          }
        }
      } finally {
        active.current = false;
        setLoading(false);
      }
      return attachments;
    },
    [t],
  );
  return { upload, loading };
};
