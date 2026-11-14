import { ASSISTANT_FILES_MAX, type AssistantAttachment } from '@erxes/core-contract';
import { useToast } from 'erxes-ui';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { uploadErrorMessage, uploadFile } from '~/lib/files';
import { checkFile, isImage } from './attachments';

interface UploadBase {
  key: string;
  name: string;
  contentType: string;
  size: number;
  preview: string | null;
}

export type Upload = UploadBase &
  (
    | { status: 'uploading'; progress: number }
    | { status: 'ready'; file: AssistantAttachment }
    | { status: 'failed'; error: string }
  );

const uploadKey = () => crypto.randomUUID();

export const useAttachments = () => {
  const { t } = useTranslation('assistant');
  const { toast } = useToast();
  const [items, setItems] = useState<Upload[]>([]);
  const uploads = useRef(new Map<string, AbortController>());
  const previews = useRef(new Set<string>());

  useEffect(() => {
    const open = uploads.current;
    const urls = previews.current;

    return () => {
      open.forEach((upload) => upload.abort());
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const update = (key: string, next: (item: UploadBase) => Upload) =>
    setItems((current) => current.map((item) => (item.key === key ? next(item) : item)));

  const start = (file: File) => {
    const key = uploadKey();
    const preview = isImage(file.type) ? URL.createObjectURL(file) : null;
    const controller = new AbortController();

    if (preview) previews.current.add(preview);
    uploads.current.set(key, controller);

    const base = { key, name: file.name, contentType: file.type, size: file.size, preview };

    setItems((current) => [...current, { ...base, status: 'uploading', progress: 0 }]);

    uploadFile(file, {
      signal: controller.signal,
      onProgress: (progress) => update(key, (item) => ({ ...item, status: 'uploading', progress })),
    })
      .then((stored) =>
        update(key, (item) => ({
          ...item,
          status: 'ready',
          file: { id: stored.id, name: stored.name, contentType: file.type, size: file.size },
        })),
      )
      .catch((error: unknown) => {
        if (!controller.signal.aborted)
          update(key, (item) => ({ ...item, status: 'failed', error: uploadErrorMessage(error) }));
      })
      .finally(() => uploads.current.delete(key));
  };

  const refuse = (title: string) => toast({ variant: 'destructive', title });

  const add = async (files: File[]) => {
    const room = ASSISTANT_FILES_MAX - items.length;

    if (files.length > room)
      refuse(t('attach.max', 'Attach up to {{max}} files', { max: ASSISTANT_FILES_MAX }));

    for (const file of files.slice(0, Math.max(0, room))) {
      const check = await checkFile(file);

      if (check.ok) start(check.file);
      else if (check.reason === 'type')
        refuse(t('attach.type', "{{name}} can't be attached", { name: file.name }));
      else
        refuse(
          t('attach.size', '{{name}} is over {{max}} MB', {
            name: file.name,
            max: check.maxSizeMb,
          }),
        );
    }
  };

  const remove = (key: string) => {
    uploads.current.get(key)?.abort();
    setItems((current) => current.filter((item) => item.key !== key));
  };

  return {
    items,
    add: (files: File[]) => void add(files),
    remove,
    full: items.length >= ASSISTANT_FILES_MAX,
    uploading: items.some((item) => item.status === 'uploading'),
    files: items.flatMap((item) => (item.status === 'ready' ? [item.file] : [])),
    clear: () => setItems([]),
  };
};

export type Attachments = ReturnType<typeof useAttachments>;
