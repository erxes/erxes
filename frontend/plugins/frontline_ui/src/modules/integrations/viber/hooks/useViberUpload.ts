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
          title: 'A Viber reply can contain at most 10 attachments',
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
            attachments.push(await uploadViberFile(file, REACT_APP_API_URL));
          } catch (error) {
            toast({
              title: `Could not upload ${file.name}`,
              description:
                error instanceof Error ? error.message : 'Upload failed',
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
    [],
  );
  return { upload, loading };
};
