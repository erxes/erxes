import { useRef, useState } from 'react';
import { errorMessage, storeFile } from '../utils/file-storage';

type ChunkedUploadResult = {
  name: string;
  url: string;
  type: string;
  size: number;
};

/**
 * Uploads one large file (a video) to the host's file storage with progress.
 * The storage decides how the bytes travel, so this hook no longer splits files.
 */
export const useUploadChunked = () => {
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controller = useRef<AbortController | null>(null);

  const upload = async (file: File): Promise<ChunkedUploadResult | null> => {
    controller.current = new AbortController();
    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      const url = await storeFile(file, {
        onProgress: setProgress,
        signal: controller.current.signal,
      });

      setProgress(100);

      return { name: file.name, url, type: file.type, size: file.size };
    } catch (e) {
      setError(errorMessage(e, 'Upload failed'));

      return null;
    } finally {
      setLoading(false);
    }
  };

  const cancel = () => controller.current?.abort();

  return { upload, cancel, progress, loading, error };
};
