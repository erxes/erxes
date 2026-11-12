import { useState } from 'react';
import { z } from 'zod';
import { useToast } from 'erxes-ui/hooks/use-toast';
import type { GalleryImage } from 'erxes-ui/modules/blocks/utils/galleryImages';

type UploadFile = (file: File) => Promise<unknown>;

// BlockNote's uploadFile resolves to a url, or to a block whose props hold the url.
const uploadedUrl = z.union([
  z.string().min(1),
  z.object({ props: z.object({ url: z.string().min(1) }) }).transform(({ props }) => props.url),
]);

const uploadOne = async (uploadFile: UploadFile, file: File) => {
  try {
    const parsed = uploadedUrl.safeParse(await uploadFile(file));

    return { file, url: parsed.success ? parsed.data : null };
  } catch {
    return { file, url: null };
  }
};

/** Uploads picked files and hands the uploaded ones to `onUploaded`; failures show one toast. */
export const useGalleryUpload = ({
  uploadFile,
  onUploaded,
}: {
  uploadFile: UploadFile | undefined;
  onUploaded: (images: GalleryImage[]) => void;
}) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const upload = async (fileList: FileList | null) => {
    if (!fileList?.length || !uploadFile) return;

    setUploading(true);

    try {
      const results = await Promise.all(
        Array.from(fileList, (file) => uploadOne(uploadFile, file)),
      );

      const uploaded = results.flatMap(({ url }) => (url ? [{ url }] : []));

      if (uploaded.length) onUploaded(uploaded);

      const failedNames = results.filter(({ url }) => !url).map(({ file }) => file.name);

      if (failedNames.length) {
        toast({
          title: 'Failed to upload gallery images',
          description: failedNames.join(', '),
          variant: 'destructive',
        });
      }
    } finally {
      setUploading(false);
    }
  };

  return { uploading, upload };
};
