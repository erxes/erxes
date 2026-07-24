import { REACT_APP_API_URL } from 'erxes-ui/utils';
import { useCallback, useRef, useState } from 'react';

/**
 * Chunked upload client for large files (e.g. videos routed to Cloudflare
 * Stream). Mirrors the backend flow in `core-api` fileRoutes:
 *   POST /upload-chunked/init  -> { uploadId }
 *   POST /upload-chunked/chunk -> (repeated, multipart field `chunk`)
 *   GET  /upload-chunked/status/:uploadId -> poll until completed/failed
 *
 * The resolved `url` is whatever the backend uploader returns — for Cloudflare
 * Stream this is the HLS playback URL.
 */

const CHUNK_SIZE = 5 * 1024 * 1024; // 5 MB — below the backend 20 MB chunk cap
const STATUS_POLL_INTERVAL = 1000; // ms
const STATUS_POLL_MAX_ATTEMPTS = 600; // ~10 min ceiling for provider processing

export type ChunkedUploadResult = {
  name: string;
  url: string;
  type: string;
  size: number;
};

type ChunkStatus = {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  key?: string;
  error?: string;
};

export const useUploadChunked = () => {
  const [progress, setProgress] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const cancelledRef = useRef<boolean>(false);

  const pollStatus = useCallback(async (uploadId: string): Promise<string> => {
    for (let attempt = 0; attempt < STATUS_POLL_MAX_ATTEMPTS; attempt++) {
      if (cancelledRef.current) {
        throw new Error('Upload cancelled');
      }

      const response = await fetch(
        `${REACT_APP_API_URL}/upload-chunked/status/${uploadId}`,
        { credentials: 'include' },
      );

      if (!response.ok) {
        throw new Error('Failed to check upload status');
      }

      const data = (await response.json()) as ChunkStatus;

      if (typeof data.progress === 'number') {
        setProgress((prev) => Math.max(prev, data.progress ?? prev));
      }

      if (data.status === 'completed') {
        if (!data.key) {
          throw new Error('Upload completed but no file key was returned');
        }
        return data.key;
      }

      if (data.status === 'failed') {
        throw new Error(data.error || 'Upload processing failed');
      }

      await new Promise((resolve) => setTimeout(resolve, STATUS_POLL_INTERVAL));
    }

    throw new Error('Upload timed out while waiting for processing');
  }, []);

  const upload = useCallback(
    async (file: File): Promise<ChunkedUploadResult | null> => {
      setLoading(true);
      setError(null);
      setProgress(0);
      cancelledRef.current = false;

      try {
        const totalChunks = Math.max(1, Math.ceil(file.size / CHUNK_SIZE));

        const initResponse = await fetch(
          `${REACT_APP_API_URL}/upload-chunked/init`,
          {
            method: 'post',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileName: file.name,
              fileSize: file.size,
              totalChunks,
            }),
          },
        );

        if (!initResponse.ok) {
          throw new Error(
            (await initResponse.text()) || 'Failed to start upload',
          );
        }

        const { uploadId } = (await initResponse.json()) as {
          uploadId?: string;
        };

        if (!uploadId) {
          throw new Error('Upload session did not return an id');
        }

        for (let index = 0; index < totalChunks; index++) {
          if (cancelledRef.current) {
            throw new Error('Upload cancelled');
          }

          const start = index * CHUNK_SIZE;
          const blob = file.slice(start, start + CHUNK_SIZE);

          const formData = new FormData();
          formData.append('chunk', blob, `${file.name}.part${index}`);
          formData.append('uploadId', uploadId);
          formData.append('chunkIndex', String(index));

          const chunkResponse = await fetch(
            `${REACT_APP_API_URL}/upload-chunked/chunk`,
            {
              method: 'post',
              credentials: 'include',
              body: formData,
            },
          );

          if (!chunkResponse.ok) {
            throw new Error(
              (await chunkResponse.text()) || `Failed to upload chunk ${index}`,
            );
          }

          // Chunk transfer accounts for up to 70%, matching the backend's
          // status scale; merge/provider upload fills the remaining 70->100.
          setProgress(Math.round(((index + 1) / totalChunks) * 70));
        }

        const key = await pollStatus(uploadId);
        setProgress(100);

        return {
          name: file.name,
          url: key,
          type: file.type,
          size: file.size,
        };
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Upload failed';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [pollStatus],
  );

  const cancel = useCallback(() => {
    cancelledRef.current = true;
  }, []);

  return { upload, cancel, progress, loading, error };
};
