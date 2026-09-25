import { IAttachment, useErxesUpload, useToast } from 'erxes-ui';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export const FACEBOOK_POST_MAX_IMAGES = 10;

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

const ACCEPTED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
];

const STORABLE_KEY = /^[a-zA-Z0-9/_\-., ()\p{L}\p{M}]+$/u;

export const useFacebookPostImages = () => {
  const { t } = useTranslation('frontline');
  const { toast } = useToast();

  const [images, setImages] = useState<IAttachment[]>([]);
  const [unstorableNames, setUnstorableNames] = useState<string[]>([]);

  const onFilesAdded = useCallback((added: IAttachment[]) => {
    const usable = added.filter((file) => STORABLE_KEY.test(file.url));
    const unusable = added.filter((file) => !STORABLE_KEY.test(file.url));

    if (unusable.length) {
      setUnstorableNames((prev) => [
        ...prev,
        ...unusable.map((file) => file.name),
      ]);
    }

    if (usable.length) {
      setImages((prev) =>
        [...prev, ...usable].slice(0, FACEBOOK_POST_MAX_IMAGES),
      );
    }
  }, []);

  const upload = useErxesUpload({
    allowedMimeTypes: ACCEPTED_IMAGE_TYPES,
    maxFileSize: MAX_IMAGE_BYTES,
    maxFiles: FACEBOOK_POST_MAX_IMAGES,
    onFilesAdded,
  });

  useEffect(() => {
    if (upload.files.length > 0 && !upload.loading) {
      upload.onUpload().catch(() =>
        toast({
          title: t('post-images-upload-failed'),
          variant: 'destructive',
        }),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upload.files.length]);

  const failedNames = new Set(upload.errors.map((error) => error.name));

  const pendingCount = upload.files.filter(
    (file) => !file.errors?.length && !failedNames.has(file.name),
  ).length;

  const dismissUnstorable = (name: string) => {
    setUnstorableNames((prev) => prev.filter((item) => item !== name));
  };

  return {
    upload,
    images,
    setImages,
    unstorableNames,
    keys: images.map((image) => image.url),
    isUploading: upload.loading || pendingCount > 0,
    isFull: images.length >= FACEBOOK_POST_MAX_IMAGES,
    dismissUnstorable,
    clear: () => setImages([]),
  };
};

export type TFacebookPostImages = ReturnType<typeof useFacebookPostImages>;
